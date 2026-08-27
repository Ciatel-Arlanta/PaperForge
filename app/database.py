import sqlite3
import json
import os
import re
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime

DB_PATH = "papers.db"

def get_db_connection(db_path: str = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def extract_code_urls(text: str) -> Tuple[Optional[str], Optional[str]]:
    """Extract GitHub and HuggingFace URLs from arbitrary text (abstract, conclusion, footnotes, etc.)."""
    if not text:
        return None, None

    # Clean common LaTeX and broken PDF spacing
    normalized = re.sub(r'\\(texttt|textsc|url)\{([^}]+)\}', r'\2', text)
    normalized = re.sub(r'github\.\s+io', 'github.io', normalized)
    normalized = re.sub(r'github\.com/\s+', 'github.com/', normalized)
    normalized = re.sub(r'huggingface\.co/\s+', 'huggingface.co/', normalized)
        
    github_url = None
    hf_url = None

    # 1. Matches github.com/user/repo (with optional https://)
    gh_match = re.search(r'(?:https?://)?(?:www\.)?github\.com/([A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+)', normalized, re.IGNORECASE)
    if gh_match:
        repo_path = gh_match.group(1).rstrip('.,;:)\\}')
        github_url = f"https://github.com/{repo_path}"
    else:
        # 2. Matches github.io project pages (e.g. jadee-dao.github.io/direct)
        io_match = re.search(r'(?:https?://)?([A-Za-z0-9_.-]+\.github\.io(?:/[A-Za-z0-9_.-]+)*)', normalized, re.IGNORECASE)
        if io_match:
            io_path = io_match.group(1).rstrip('.,;:)\\}')
            github_url = f"https://{io_path}"

    # Matches huggingface.co/models/... or huggingface.co/user/repo
    hf_match = re.search(r'(?:https?://)?(?:www\.)?huggingface\.co/([A-Za-z0-9_.-]+(?:/[A-Za-z0-9_.-]+)?)', normalized, re.IGNORECASE)
    if hf_match:
        hf_path = hf_match.group(1).rstrip('.,;:)\\}')
        if not hf_path.lower().startswith(('docs', 'spaces', 'blog')):
            hf_url = f"https://huggingface.co/{hf_path}"

    return github_url, hf_url

def init_db(db_path: str = DB_PATH):
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS papers (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        authors TEXT NOT NULL,
        abstract TEXT NOT NULL,
        url TEXT NOT NULL,
        pdf_path TEXT,
        conclusion TEXT DEFAULT 'Not found.',
        limitations TEXT DEFAULT 'Not found.',
        category TEXT DEFAULT 'General AI',
        published_date TEXT,
        is_bookmarked INTEGER DEFAULT 0,
        tags TEXT DEFAULT '[]',
        notes TEXT DEFAULT '',
        github_url TEXT,
        hf_url TEXT,
        created_at TEXT NOT NULL
    );
    """)
    
    # Safe column migrations for existing databases
    cursor.execute("PRAGMA table_info(papers);")
    columns = [col[1] for col in cursor.fetchall()]
    if "github_url" not in columns:
        cursor.execute("ALTER TABLE papers ADD COLUMN github_url TEXT;")
    if "hf_url" not in columns:
        cursor.execute("ALTER TABLE papers ADD COLUMN hf_url TEXT;")

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_papers_category ON papers(category);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_papers_bookmarked ON papers(is_bookmarked);")
    conn.commit()
    conn.close()
    
    # Automatically backfill code URLs from text
    backfill_code_urls(db_path)

def backfill_code_urls(db_path: str = DB_PATH):
    """Scan existing papers and extract GitHub and HuggingFace links from abstract, conclusion, and limitations."""
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, abstract, conclusion, limitations, github_url, hf_url FROM papers")
    rows = cursor.fetchall()
    
    for row in rows:
        combined_text = f"{row['abstract'] or ''} {row['conclusion'] or ''} {row['limitations'] or ''}"
        gh, hf = extract_code_urls(combined_text)
        
        updates = []
        params = []
        if gh and not row['github_url']:
            updates.append("github_url = ?")
            params.append(gh)
        if hf and not row['hf_url']:
            updates.append("hf_url = ?")
            params.append(hf)
            
        if updates:
            params.append(row['id'])
            cursor.execute(f"UPDATE papers SET {', '.join(updates)} WHERE id = ?", params)
            
    conn.commit()
    conn.close()

def parse_markdown_insights(file_path: str) -> List[Dict[str, Any]]:
    if not os.path.exists(file_path):
        return []
    
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    papers = []
    current_category = "General AI"
    
    lines = content.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        if line.startswith("## ") and not line.startswith("### "):
            current_category = line[3:].strip()
            i += 1
            continue
            
        if line.startswith("### ["):
            match = re.match(r'###\s*\[(.*?)\]\((https?://arxiv\.org/abs/([^)]+)|[^\)]+)\)', line)
            if match:
                title = match.group(1).strip()
                url = match.group(2).strip()
                paper_id = match.group(3).strip() if match.group(3) else url.split("/")[-1]
            else:
                title = line.replace("###", "").strip()
                url = ""
                paper_id = ""

            authors = []
            pdf_path = None
            abstract = ""
            conclusion = "Not found."
            limitations = "Not found."
            
            i += 1
            current_field = None
            field_lines = []

            def flush_field(field_name, flines):
                nonlocal authors, pdf_path, abstract, conclusion, limitations
                text_val = "\n".join(flines).strip()
                if field_name == "authors":
                    authors = [a.strip() for a in text_val.split(",") if a.strip()]
                elif field_name == "pdf":
                    pdf_path = text_val.strip("` ")
                elif field_name == "abstract":
                    abstract = text_val
                elif field_name == "conclusion":
                    conclusion = text_val
                elif field_name == "limitations":
                    limitations = text_val

            while i < len(lines):
                cur_line = lines[i]
                stripped = cur_line.strip()
                
                if stripped == "---" or stripped.startswith("### [") or (stripped.startswith("## ") and not stripped.startswith("### ")):
                    if current_field:
                        flush_field(current_field, field_lines)
                        current_field = None
                        field_lines = []
                    if stripped != "---":
                        i -= 1
                    break
                
                if stripped.startswith("**Authors:**"):
                    if current_field:
                        flush_field(current_field, field_lines)
                    current_field = "authors"
                    field_lines = [stripped.replace("**Authors:**", "").strip()]
                elif stripped.startswith("**Local PDF:**"):
                    if current_field:
                        flush_field(current_field, field_lines)
                    current_field = "pdf"
                    field_lines = [stripped.replace("**Local PDF:**", "").strip()]
                elif stripped.startswith("**Abstract:**"):
                    if current_field:
                        flush_field(current_field, field_lines)
                    current_field = "abstract"
                    field_lines = [stripped.replace("**Abstract:**", "").strip()]
                elif stripped.startswith("**Conclusion:**"):
                    if current_field:
                        flush_field(current_field, field_lines)
                    current_field = "conclusion"
                    field_lines = [stripped.replace("**Conclusion:**", "").strip()]
                elif stripped.startswith("**Limitations:**"):
                    if current_field:
                        flush_field(current_field, field_lines)
                    current_field = "limitations"
                    field_lines = [stripped.replace("**Limitations:**", "").strip()]
                else:
                    if current_field:
                        field_lines.append(cur_line)
                i += 1

            if current_field:
                flush_field(current_field, field_lines)

            if not paper_id and url:
                paper_id = url.split("/")[-1]
            if not paper_id:
                import hashlib
                paper_id = hashlib.md5(title.encode()).hexdigest()[:10]

            # Extract GitHub and HuggingFace links
            gh_link, hf_link = extract_code_urls(f"{abstract} {conclusion} {limitations}")

            if title:
                papers.append({
                    "id": paper_id,
                    "title": title,
                    "authors": authors,
                    "abstract": abstract,
                    "url": url or f"https://arxiv.org/abs/{paper_id}",
                    "pdf_path": pdf_path,
                    "conclusion": conclusion or "Not found.",
                    "limitations": limitations or "Not found.",
                    "category": current_category,
                    "published_date": "",
                    "is_bookmarked": 0,
                    "tags": [],
                    "notes": "",
                    "github_url": gh_link,
                    "hf_url": hf_link,
                    "created_at": datetime.now().isoformat()
                })
        i += 1

    return papers

def sync_legacy_files(db_path: str = DB_PATH) -> int:
    init_db(db_path)
    count = 0
    
    files_to_check = ["arxiv_insights.md", "arxiv_insights_historical.md"]
    for md_file in files_to_check:
        if os.path.exists(md_file):
            papers = parse_markdown_insights(md_file)
            for p in papers:
                upsert_paper(p, db_path=db_path)
                count += 1
                
    return count

def upsert_paper(paper: Dict[str, Any], db_path: str = DB_PATH) -> bool:
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    
    authors_json = json.dumps(paper.get("authors", []))
    tags_json = json.dumps(paper.get("tags", []))
    created_at = paper.get("created_at") or datetime.now().isoformat()
    
    # Auto-extract code URLs if not explicitly provided
    gh_url = paper.get("github_url")
    hf_url = paper.get("hf_url")
    if not gh_url or not hf_url:
        text_bundle = f"{paper.get('abstract', '')} {paper.get('conclusion', '')} {paper.get('limitations', '')}"
        extracted_gh, extracted_hf = extract_code_urls(text_bundle)
        gh_url = gh_url or extracted_gh
        hf_url = hf_url or extracted_hf
    
    cursor.execute("""
    INSERT INTO papers (
        id, title, authors, abstract, url, pdf_path, conclusion, limitations, category, published_date, is_bookmarked, tags, notes, github_url, hf_url, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        authors = excluded.authors,
        abstract = excluded.abstract,
        url = excluded.url,
        pdf_path = COALESCE(excluded.pdf_path, papers.pdf_path),
        conclusion = CASE WHEN excluded.conclusion != 'Not found.' THEN excluded.conclusion ELSE papers.conclusion END,
        limitations = CASE WHEN excluded.limitations != 'Not found.' THEN excluded.limitations ELSE papers.limitations END,
        category = excluded.category,
        github_url = COALESCE(excluded.github_url, papers.github_url),
        hf_url = COALESCE(excluded.hf_url, papers.hf_url)
    """, (
        paper["id"],
        paper["title"],
        authors_json,
        paper.get("abstract", ""),
        paper.get("url", ""),
        paper.get("pdf_path"),
        paper.get("conclusion", "Not found."),
        paper.get("limitations", "Not found."),
        paper.get("category", "General AI"),
        paper.get("published_date", ""),
        1 if paper.get("is_bookmarked") else 0,
        tags_json,
        paper.get("notes", ""),
        gh_url,
        hf_url,
        created_at
    ))
    conn.commit()
    conn.close()
    return True

def get_paper_by_id(paper_id: str, db_path: str = DB_PATH) -> Optional[Dict[str, Any]]:
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM papers WHERE id = ?", (paper_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return row_to_dict(row)

def get_papers(
    search: Optional[str] = None,
    category: Optional[str] = None,
    has_limitations: Optional[bool] = None,
    has_code: Optional[bool] = None,
    bookmarked_only: Optional[bool] = None,
    sort_by: str = "id",
    sort_order: str = "desc",
    page: int = 1,
    limit: int = 30,
    db_path: str = DB_PATH
) -> Tuple[List[Dict[str, Any]], int]:
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    
    where_clauses = []
    params = []
    
    if search:
        search_pattern = f"%{search}%"
        where_clauses.append("(title LIKE ? OR abstract LIKE ? OR conclusion LIKE ? OR limitations LIKE ? OR authors LIKE ? OR github_url LIKE ? OR hf_url LIKE ?)")
        params.extend([search_pattern, search_pattern, search_pattern, search_pattern, search_pattern, search_pattern, search_pattern])
        
    if category and category != "All":
        where_clauses.append("category = ?")
        params.append(category)
        
    if has_limitations:
        where_clauses.append("limitations IS NOT NULL AND limitations != '' AND limitations != 'Not found.'")

    if has_code:
        where_clauses.append("((github_url IS NOT NULL AND github_url != '') OR (hf_url IS NOT NULL AND hf_url != ''))")
        
    if bookmarked_only:
        where_clauses.append("is_bookmarked = 1")
        
    where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""
    
    count_query = f"SELECT COUNT(*) FROM papers {where_sql}"
    cursor.execute(count_query, params)
    total = cursor.fetchone()[0]
    
    valid_sorts = {"id": "id", "title": "title", "created_at": "created_at", "category": "category"}
    sort_col = valid_sorts.get(sort_by, "id")
    direction = "DESC" if sort_order.lower() == "desc" else "ASC"
    
    offset = (page - 1) * limit
    data_query = f"SELECT * FROM papers {where_sql} ORDER BY {sort_col} {direction} LIMIT ? OFFSET ?"
    cursor.execute(data_query, params + [limit, offset])
    
    rows = cursor.fetchall()
    conn.close()
    
    return [row_to_dict(r) for r in rows], total

def toggle_bookmark(paper_id: str, db_path: str = DB_PATH) -> bool:
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT is_bookmarked FROM papers WHERE id = ?", (paper_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False
    new_val = 0 if row["is_bookmarked"] == 1 else 1
    cursor.execute("UPDATE papers SET is_bookmarked = ? WHERE id = ?", (new_val, paper_id))
    conn.commit()
    conn.close()
    return bool(new_val)

def update_paper(
    paper_id: str,
    notes: Optional[str] = None,
    tags: Optional[List[str]] = None,
    is_bookmarked: Optional[bool] = None,
    github_url: Optional[str] = None,
    hf_url: Optional[str] = None,
    db_path: str = DB_PATH
) -> bool:
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    updates = []
    params = []
    
    if notes is not None:
        updates.append("notes = ?")
        params.append(notes)
    if tags is not None:
        updates.append("tags = ?")
        params.append(json.dumps(tags))
    if is_bookmarked is not None:
        updates.append("is_bookmarked = ?")
        params.append(1 if is_bookmarked else 0)
    if github_url is not None:
        updates.append("github_url = ?")
        params.append(github_url)
    if hf_url is not None:
        updates.append("hf_url = ?")
        params.append(hf_url)
        
    if not updates:
        conn.close()
        return True
        
    params.append(paper_id)
    cursor.execute(f"UPDATE papers SET {', '.join(updates)} WHERE id = ?", params)
    conn.commit()
    conn.close()
    return True

def get_categories(db_path: str = DB_PATH) -> List[str]:
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT category FROM papers WHERE category IS NOT NULL AND category != '' ORDER BY category ASC")
    rows = cursor.fetchall()
    conn.close()
    return [r[0] for r in rows]

def get_stats(db_path: str = DB_PATH) -> Dict[str, Any]:
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM papers")
    total_papers = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM papers WHERE is_bookmarked = 1")
    bookmarked_papers = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM papers WHERE limitations IS NOT NULL AND limitations != '' AND limitations != 'Not found.'")
    papers_with_limitations = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM papers WHERE pdf_path IS NOT NULL AND pdf_path != '' AND pdf_path != 'Not downloaded'")
    papers_with_pdfs = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM papers WHERE github_url IS NOT NULL AND github_url != ''")
    papers_with_code = cursor.fetchone()[0]
    
    cursor.execute("SELECT category, COUNT(*) as count FROM papers GROUP BY category")
    cat_rows = cursor.fetchall()
    categories = {r["category"]: r["count"] for r in cat_rows}
    
    cursor.execute("SELECT limitations FROM papers WHERE limitations IS NOT NULL AND limitations != 'Not found.'")
    lim_rows = cursor.fetchall()
    
    limitation_keywords = [
        {"theme": "Transferability / Generalization", "count": 0, "desc": "Models fail when evaluated across distributions or novel architectures."},
        {"theme": "Computational Overhead & Latency", "count": 0, "desc": "High epoch counts, memory requirements, or real-time inference bottlenecks."},
        {"theme": "Adaptive Adversaries & Evasion", "count": 0, "desc": "Defenses break when attackers know the defense parameters."},
        {"theme": "Dataset & Benchmark Bias", "count": 0, "desc": "Synthetically created datasets lacking real-world enterprise diversity."},
        {"theme": "Policy & Governance Specification", "count": 0, "desc": "Lack of standardized runtime interception hooks or attenuation rules."},
        {"theme": "Multi-Modal / Cross-Cloud Federation", "count": 0, "desc": "Federation, audit substrates, and multi-agent coordination issues."}
    ]
    
    for row in lim_rows:
        text = row["limitations"].lower()
        if "transfer" in text or "generaliz" in text or "out-of-distribution" in text:
            limitation_keywords[0]["count"] += 1
        if "overhead" in text or "epoch" in text or "compute" in text or "cost" in text or "latency" in text:
            limitation_keywords[1]["count"] += 1
        if "adversar" in text or "attack" in text or "robust" in text or "evas" in text:
            limitation_keywords[2]["count"] += 1
        if "dataset" in text or "benchmark" in text or "synthetic" in text:
            limitation_keywords[3]["count"] += 1
        if "policy" in text or "govern" in text or "hook" in text or "runtime" in text:
            limitation_keywords[4]["count"] += 1
        if "federat" in text or "multi-agent" in text or "cloud" in text or "modal" in text:
            limitation_keywords[5]["count"] += 1
            
    conn.close()
    
    return {
        "total_papers": total_papers,
        "bookmarked_papers": bookmarked_papers,
        "categories": categories,
        "papers_with_limitations": papers_with_limitations,
        "papers_with_pdfs": papers_with_pdfs,
        "papers_with_code": papers_with_code,
        "common_limitations": limitation_keywords
    }

def row_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    authors = []
    try:
        authors = json.loads(row["authors"]) if row["authors"] else []
    except Exception:
        authors = [a.strip() for a in row["authors"].split(",") if a.strip()]
        
    tags = []
    try:
        tags = json.loads(row["tags"]) if row["tags"] else []
    except Exception:
        tags = []

    # Safe access to optional migrated columns
    keys = row.keys()
    github_url = row["github_url"] if "github_url" in keys else None
    hf_url = row["hf_url"] if "hf_url" in keys else None
        
    return {
        "id": row["id"],
        "title": row["title"],
        "authors": authors,
        "abstract": row["abstract"] or "",
        "url": row["url"] or "",
        "pdf_path": row["pdf_path"],
        "conclusion": row["conclusion"] or "Not found.",
        "limitations": row["limitations"] or "Not found.",
        "category": row["category"] or "General AI",
        "published_date": row["published_date"] or "",
        "is_bookmarked": bool(row["is_bookmarked"]),
        "tags": tags,
        "notes": row["notes"] or "",
        "github_url": github_url,
        "hf_url": hf_url,
        "created_at": row["created_at"]
    }
