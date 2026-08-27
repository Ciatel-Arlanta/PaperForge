import asyncio
import os
import re
import time
import uuid
import json
import requests
import fitz
import arxiv
from typing import List, Dict, Optional, Any
from datetime import datetime
from bs4 import BeautifulSoup
from .database import upsert_paper, get_paper_by_id

PDF_DIR = "pdfs"

class ScraperService:
    def __init__(self):
        self.active_jobs: Dict[str, Dict[str, Any]] = {}
        self._cancel_flags: Dict[str, bool] = {}
        os.makedirs(PDF_DIR, exist_ok=True)

    def extract_sections_line_by_line(self, text: str) -> Dict[str, str]:
        sections = {"Conclusion": "Not found.", "Limitations": "Not found."}
        lines = text.split('\n')
        current_section = None
        section_content = []
        
        for line in lines:
            stripped = line.strip()
            if len(stripped) < 100 and re.match(r'^(\d+(\.\d+)*\s*|[IVX]+\.?\s*)?(Conclusion|Conclusions|Concluding Remarks|Limitations|Discussion)\b', stripped, re.IGNORECASE):
                if current_section and section_content:
                    if "conclu" in current_section.lower():
                        sections["Conclusion"] = "\n".join(section_content)
                    elif "limit" in current_section.lower():
                        sections["Limitations"] = "\n".join(section_content)
                current_section = stripped
                section_content = []
            elif current_section:
                if len(stripped) < 100 and re.match(r'^(\d+(\.\d+)*\s*|[IVX]+\.?\s*)?(References|Acknowledgments|Appendix|Acknowledge)\b', stripped, re.IGNORECASE):
                    if "conclu" in current_section.lower():
                        sections["Conclusion"] = "\n".join(section_content)
                    elif "limit" in current_section.lower():
                        sections["Limitations"] = "\n".join(section_content)
                    current_section = None
                else:
                    section_content.append(line)
                    
        if current_section and section_content:
            if "conclu" in current_section.lower() and sections["Conclusion"] == "Not found.":
                sections["Conclusion"] = "\n".join(section_content)
            elif "limit" in current_section.lower() and sections["Limitations"] == "Not found.":
                sections["Limitations"] = "\n".join(section_content)
                
        return sections

    def extract_sections(self, text: str) -> Dict[str, str]:
        sections = {"Conclusion": "Not found.", "Limitations": "Not found."}
        cleaned_text = re.sub(r'arXiv:\d+\.\d+v\d+\s+\[[a-zA-Z-\.]+\]\s+\d+\s+[a-zA-Z]+\s+\d+', '', text)
        cleaned_text = re.sub(r'\n\s*\d+\s*\n', '\n', cleaned_text)
        
        conclusion_pattern = re.compile(
            r'(?:(?:^|\n)(?:\d+\.?\s*|[IVX]+\.?\s*)?(?:Conclusion|Concluding\s+Remarks|Conclusions\s+and\s+Future\s+Work|Conclusions|Discussion)\b.*?)(?:\n|$)(.*?)(?=(?:\n(?:\d+\.?\s*|[IVX]+\.?\s*)?(?:References|Acknowledgements?|Appendix|Bibliography)\b)|$)', 
            re.IGNORECASE | re.DOTALL
        )
        limitations_pattern = re.compile(
            r'(?:(?:^|\n)(?:\d+\.?\s*|[IVX]+\.?\s*)?(?:Limitations?|Limitations?\s+of\s+.*|Limitations?\s+and\s+Future\s+Work)\b.*?)(?:\n|$)(.*?)(?=(?:\n(?:\d+\.?\s*|[IVX]+\.?\s*)?(?:References|Acknowledgements?|Appendix|Bibliography|Conclusion)\b)|$)',
            re.IGNORECASE | re.DOTALL
        )
        
        concl_match = conclusion_pattern.search(cleaned_text)
        limit_match = limitations_pattern.search(cleaned_text)
        
        if concl_match:
            sections["Conclusion"] = concl_match.group(1).strip()
        if limit_match:
            sections["Limitations"] = limit_match.group(1).strip()
            
        if sections["Conclusion"] == "Not found." or sections["Limitations"] == "Not found.":
            fallback = self.extract_sections_line_by_line(cleaned_text)
            if sections["Conclusion"] == "Not found.":
                sections["Conclusion"] = fallback["Conclusion"]
            if sections["Limitations"] == "Not found.":
                sections["Limitations"] = fallback["Limitations"]
                
        for key in sections:
            val = sections[key]
            if val != "Not found.":
                val = re.sub(r'(\w+)-\s*\n\s*(\w+)', r'\1\2', val)
                val = re.sub(r'\s+', ' ', val)
                sections[key] = val[:2500] + ("..." if len(val) > 2500 else "")
                
        return sections

    def extract_from_html(self, paper_id: str) -> Dict[str, str]:
        sections = {"Conclusion": "Not found.", "Limitations": "Not found."}
        clean_id = re.sub(r'v\d+$', '', paper_id)
        urls = [
            f"https://arxiv.org/html/{clean_id}",
            f"https://browse.arxiv.org/html/{clean_id}"
        ]
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        for url in urls:
            try:
                resp = requests.get(url, headers=headers, timeout=12)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.content, 'html.parser')
                    for sec in soup.find_all('section'):
                        header = sec.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
                        if header:
                            h_text = header.get_text().strip().lower()
                            if "conclusion" in h_text or "concluding remarks" in h_text:
                                paragraphs = sec.find_all('p')
                                sections["Conclusion"] = " ".join([p.get_text().strip() for p in paragraphs])
                            elif "limitation" in h_text:
                                paragraphs = sec.find_all('p')
                                sections["Limitations"] = " ".join([p.get_text().strip() for p in paragraphs])
                                
                    if sections["Conclusion"] != "Not found." or sections["Limitations"] != "Not found.":
                        break
            except Exception:
                continue

        for key in sections:
            val = sections[key]
            if val != "Not found.":
                val = re.sub(r'\s+', ' ', val)
                sections[key] = val[:2500] + ("..." if len(val) > 2500 else "")
        return sections

    def process_pdf(self, pdf_path: str) -> str:
        try:
            doc = fitz.open(pdf_path)
            text = ""
            for page in doc:
                text += page.get_text("text") + "\n"
            return text
        except Exception:
            return ""

    def start_scrape_job(self, queries: List[Dict[str, Any]], download_pdf: bool = True) -> str:
        job_id = str(uuid.uuid4())[:8]
        self._cancel_flags[job_id] = False
        
        total_limit = sum(q.get("limit", 10) for q in queries)
        self.active_jobs[job_id] = {
            "job_id": job_id,
            "status": "running",
            "progress": 0,
            "total": total_limit,
            "current_paper": None,
            "logs": [f"Scrape job {job_id} initiated. Query count: {len(queries)}."],
            "new_papers_count": 0,
            "started_at": datetime.now().isoformat(),
            "completed_at": None
        }

        # Run background thread
        asyncio.create_task(self._run_scrape_async(job_id, queries, download_pdf))
        return job_id

    def cancel_job(self, job_id: str) -> bool:
        if job_id in self.active_jobs:
            self._cancel_flags[job_id] = True
            self.active_jobs[job_id]["status"] = "cancelled"
            self.active_jobs[job_id]["logs"].append("Job cancelled by user request.")
            return True
        return False

    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        return self.active_jobs.get(job_id)

    async def _run_scrape_async(self, job_id: str, queries: List[Dict[str, Any]], download_pdf: bool):
        job = self.active_jobs[job_id]
        
        def add_log(msg: str):
            job["logs"].append(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")
            if len(job["logs"]) > 100:
                job["logs"] = job["logs"][-100:]

        client = arxiv.Client(page_size=10, delay_seconds=4.0, num_retries=3)

        try:
            for q in queries:
                if self._cancel_flags.get(job_id, False):
                    add_log("Job was cancelled.")
                    break
                    
                q_name = q.get("name", "Custom Query")
                q_str = q.get("query", "")
                q_limit = q.get("limit", 10)

                add_log(f"Searching arXiv for: '{q_name}' (query: {q_str})")
                
                try:
                    search = arxiv.Search(
                        query=q_str,
                        max_results=q_limit + 20,
                        sort_by=arxiv.SortCriterion.SubmittedDate,
                        sort_order=arxiv.SortOrder.Descending
                    )
                    # Run search in thread pool to avoid blocking async loop
                    papers = await asyncio.to_thread(lambda: list(client.results(search)))
                except Exception as e:
                    add_log(f"Error fetching query '{q_name}': {e}")
                    continue

                count = 0
                for p in papers:
                    if self._cancel_flags.get(job_id, False) or count >= q_limit:
                        break

                    paper_id = p.get_short_id()
                    existing = get_paper_by_id(paper_id)
                    
                    if existing:
                        add_log(f"Skipping already indexed paper: {p.title[:50]}...")
                        continue

                    job["current_paper"] = p.title
                    add_log(f"Processing paper ({count+1}/{q_limit}): {p.title[:60]}...")
                    
                    sanitized_title = re.sub(r'[^a-zA-Z0-9\s_\-\.]', '', p.title)
                    sanitized_title = re.sub(r'\s+', ' ', sanitized_title).strip()[:100]
                    pdf_filename = f"{sanitized_title}.pdf"
                    pdf_path = os.path.join(PDF_DIR, pdf_filename)
                    
                    download_success = False
                    if download_pdf:
                        for dl_attempt in range(2):
                            try:
                                headers = {"User-Agent": "Mozilla/5.0"}
                                resp = await asyncio.to_thread(lambda: requests.get(p.pdf_url, headers=headers, timeout=25))
                                if resp.status_code == 200:
                                    with open(pdf_path, "wb") as f:
                                        f.write(resp.content)
                                    download_success = True
                                    break
                            except Exception as dl_err:
                                add_log(f"PDF download attempt {dl_attempt+1} failed: {dl_err}")
                                await asyncio.sleep(2)

                    sections = {"Conclusion": "Not found.", "Limitations": "Not found."}
                    if download_success:
                        text = await asyncio.to_thread(self.process_pdf, pdf_path)
                        if text:
                            sections = self.extract_sections(text)

                    if sections["Conclusion"] == "Not found." and sections["Limitations"] == "Not found.":
                        add_log(f"Trying HTML fallback for {paper_id}...")
                        html_sec = await asyncio.to_thread(self.extract_from_html, paper_id)
                        if html_sec["Conclusion"] != "Not found.":
                            sections["Conclusion"] = html_sec["Conclusion"]
                        if html_sec["Limitations"] != "Not found.":
                            sections["Limitations"] = html_sec["Limitations"]

                    from .database import extract_code_urls
                    gh_link, hf_link = extract_code_urls(f"{p.title} {p.summary} {p.comment or ''} {sections['Conclusion']} {sections['Limitations']}")

                    paper_dict = {
                        "id": paper_id,
                        "title": p.title,
                        "authors": [a.name for a in p.authors],
                        "abstract": p.summary.replace("\n", " ").strip(),
                        "url": p.entry_id,
                        "pdf_path": pdf_path if download_success else None,
                        "conclusion": sections["Conclusion"],
                        "limitations": sections["Limitations"],
                        "category": q_name,
                        "published_date": p.published.strftime("%Y-%m-%d") if p.published else "",
                        "is_bookmarked": False,
                        "tags": [],
                        "notes": "",
                        "github_url": gh_link,
                        "hf_url": hf_link,
                        "created_at": datetime.now().isoformat()
                    }

                    upsert_paper(paper_dict)
                    job["new_papers_count"] += 1
                    job["progress"] += 1
                    count += 1
                    add_log(f"Indexed: {p.title[:50]} (Limitations: {'Found' if sections['limitations'] != 'Not found.' else 'None'})")

                    # Be polite to arXiv
                    await asyncio.sleep(3.0)

            job["status"] = "completed" if not self._cancel_flags.get(job_id, False) else "cancelled"
            job["completed_at"] = datetime.now().isoformat()
            add_log(f"Job completed. Ingested {job['new_papers_count']} new papers.")

        except Exception as e:
            job["status"] = "failed"
            job["completed_at"] = datetime.now().isoformat()
            add_log(f"Job failed with error: {str(e)}")

scraper_service = ScraperService()
