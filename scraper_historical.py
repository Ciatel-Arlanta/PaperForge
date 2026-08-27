import arxiv
import json
import os
import fitz
import re
import time
import requests
import argparse
from bs4 import BeautifulSoup
from typing import List, Dict
from datetime import datetime, timedelta, timezone

PDF_DIR = "pdfs"
TRACKING_FILE = "downloaded_papers_historical.json"
OUTPUT_MD = "arxiv_insights_historical.md"

def init_env():
    os.makedirs(PDF_DIR, exist_ok=True)
    if not os.path.exists(TRACKING_FILE):
        with open(TRACKING_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f)

def load_tracking() -> dict:
    try:
        with open(TRACKING_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return {paper_id: f"https://arxiv.org/abs/{paper_id}" for paper_id in data}
                
            return data
    except Exception as e:
        print(f"Warning: Could not load tracking file: {e}. Starting fresh.")
        return {}

def save_tracking(tracking_dict: dict):
    try:
        with open(TRACKING_FILE, "w", encoding="utf-8") as f:
            json.dump(tracking_dict, f, indent=2)
    except Exception as e:
        print(f"Error saving tracking file: {e}")

def fetch_papers_with_retry(query: str, max_results: int) -> List[arxiv.Result]:
    client = arxiv.Client(
        page_size=15,       # small page size to reduce 503/429
        delay_seconds=6.0,  # 6 seconds delay between requests (arXiv terms recommend >= 3s)
        num_retries=5       # arxiv library internal retries
    )
    
    retries = 3
    backoff = 15  # start with 15 seconds backoff for 503/429
    
    for attempt in range(retries):
        try:
            search = arxiv.Search(
                query=query,
                max_results=max_results,
                sort_by=arxiv.SortCriterion.SubmittedDate,
                sort_order=arxiv.SortOrder.Descending
            )
            return list(client.results(search))
        except arxiv.HTTPError as e:
            print(f"arXiv HTTP error (attempt {attempt + 1}/{retries}) for query '{query[:30]}...': {e}")
            if attempt < retries - 1:
                print(f"Sleeping for {backoff} seconds before retrying...")
                time.sleep(backoff)
                backoff *= 2
            else:
                print("Max retries reached for this query. Skipping or returning empty list.")
                return []
        except Exception as e:
            print(f"Unexpected error (attempt {attempt + 1}/{retries}): {e}")
            if attempt < retries - 1:
                time.sleep(backoff)
                backoff *= 2
            else:
                return []
    return []

def extract_sections_line_by_line(text: str) -> Dict[str, str]:
    sections = {
        "Conclusion": "Not found.",
        "Limitations": "Not found."
    }
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

def extract_sections(text: str) -> Dict[str, str]:
    sections = {
        "Conclusion": "Not found.",
        "Limitations": "Not found."
    }
    
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
        fallback = extract_sections_line_by_line(cleaned_text)
        if sections["Conclusion"] == "Not found.":
            sections["Conclusion"] = fallback["Conclusion"]
        if sections["Limitations"] == "Not found.":
            sections["Limitations"] = fallback["Limitations"]
            
    for key in sections:
        val = sections[key]
        if val != "Not found.":
            val = re.sub(r'(\w+)-\s*\n\s*(\w+)', r'\1\2', val)
            val = re.sub(r'\s+', ' ', val)
            sections[key] = val[:2000] + ("..." if len(val) > 2000 else "")
            
    return sections

def extract_from_html(paper_id: str) -> Dict[str, str]:
    sections = {
        "Conclusion": "Not found.",
        "Limitations": "Not found."
    }
    
    clean_id = re.sub(r'v\d+$', '', paper_id)
    
    urls = [
        f"https://arxiv.org/html/{clean_id}",
        f"https://browse.arxiv.org/html/{clean_id}"
    ]
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    for url in urls:
        try:
            resp = requests.get(url, headers=headers, timeout=15)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.content, 'html.parser')
                html_sections = soup.find_all('section')
                
                for sec in html_sections:
                    header = sec.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
                    if header:
                        header_text = header.get_text().strip().lower()
                        if "conclusion" in header_text or "concluding remarks" in header_text:
                            paragraphs = sec.find_all('p')
                            sections["Conclusion"] = " ".join([p.get_text().strip() for p in paragraphs])
                        elif "limitation" in header_text:
                            paragraphs = sec.find_all('p')
                            sections["Limitations"] = " ".join([p.get_text().strip() for p in paragraphs])
                            
                # Fallback headings directly
                if sections["Conclusion"] == "Not found.":
                    for h in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
                        h_text = h.get_text().strip().lower()
                        if "conclusion" in h_text or "concluding remarks" in h_text:
                            paragraphs = []
                            for sibling in h.next_siblings:
                                if sibling.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                                    break
                                if sibling.name == 'p':
                                    paragraphs.append(sibling.get_text().strip())
                            if paragraphs:
                                sections["Conclusion"] = " ".join(paragraphs)
                                
                if sections["Limitations"] == "Not found.":
                    for h in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
                        h_text = h.get_text().strip().lower()
                        if "limitation" in h_text:
                            paragraphs = []
                            for sibling in h.next_siblings:
                                if sibling.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                                    break
                                if sibling.name == 'p':
                                    paragraphs.append(sibling.get_text().strip())
                            if paragraphs:
                                sections["Limitations"] = " ".join(paragraphs)
                
                for key in sections:
                    val = sections[key]
                    if val != "Not found.":
                        val = re.sub(r'\s+', ' ', val)
                        sections[key] = val[:2000] + ("..." if len(val) > 2000 else "")
                
                if sections["Conclusion"] != "Not found." or sections["Limitations"] != "Not found.":
                    break
        except Exception as e:
            print(f"HTML fallback failed for {url}: {e}")
            
    return sections

def process_pdf(pdf_path: str) -> str:
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text("text") + "\n"
        return text
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return ""

def main():
    parser = argparse.ArgumentParser(description="Scrape arXiv papers that are at least N days old.")
    parser.path_arg = parser.add_argument("--age-days", type=int, default=60, help="Minimum age of papers in days (default: 60 for ~2 months)")
    args = parser.parse_args()

    init_env()
    downloaded = load_tracking()
    
    # Calculate threshold date
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=args.age_days)
    date_str = cutoff_date.strftime("%Y%m%d%H%M")
    print(f"Polling papers submitted BEFORE: {cutoff_date.strftime('%Y-%m-%d %H:%M UTC')} (submittedDate:[199001010000 TO {date_str}])")
    
    base_queries = [
        {"name": "AI & Cybersecurity Intersection", "query": "(cat:cs.CR) AND (cat:cs.AI OR cat:cs.LG OR cat:cs.CL)", "limit": 35},
        {"name": "AI Only", "query": "cat:cs.AI OR cat:cs.LG OR cat:cs.CL", "limit": 10},
        {"name": "Cybersecurity Only", "query": "cat:cs.CR", "limit": 5}
    ]
    
    all_results = []
    
    for q in base_queries:
        # Append date filter to query
        date_query = f"({q['query']}) AND submittedDate:[199001010000 TO {date_str}]"
        print(f"\nFetching papers for: {q['name']}...")
        print(f"Query: {date_query}")
        
        # Fetch a larger window to find papers (skipping already downloaded ones)
        papers = fetch_papers_with_retry(date_query, q["limit"] + 60)
        
        count = 0
        for p in papers:
            if count >= q["limit"]:
                break
                
            paper_id = p.get_short_id()
            if paper_id in downloaded:
                print(f"Skipping already processed paper: {p.title}")
                continue
                
            # Extra safety check on the publish date
            if p.published > cutoff_date:
                print(f"Skipping paper too new ({p.published}): {p.title}")
                continue
                
            print(f"Processing ({count+1}/{q['limit']}): {p.title} (Published: {p.published.strftime('%Y-%m-%d')})")
            sanitized_title = re.sub(r'[^a-zA-Z0-9\s_\-\.]', '', p.title)
            sanitized_title = re.sub(r'\s+', ' ', sanitized_title).strip()[:120]
            pdf_filename = f"{sanitized_title}.pdf"
            pdf_path = os.path.join(PDF_DIR, pdf_filename)
            
            # Download PDF manually using requests
            download_success = False
            for dl_attempt in range(3):
                try:
                    headers = {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    }
                    pdf_resp = requests.get(p.pdf_url, headers=headers, timeout=30)
                    if pdf_resp.status_code == 200:
                        with open(pdf_path, "wb") as pdf_file:
                            pdf_file.write(pdf_resp.content)
                        download_success = True
                        break
                    else:
                        print(f"Download attempt {dl_attempt+1} got status code {pdf_resp.status_code} for {paper_id}")
                        time.sleep(4)
                except Exception as e:
                    print(f"Download attempt {dl_attempt+1} failed for {paper_id}: {e}")
                    time.sleep(4)
            
            sections = {"Conclusion": "Not found.", "Limitations": "Not found."}
            
            if download_success:
                text = process_pdf(pdf_path)
                if text:
                    sections = extract_sections(text)
            
            # Fallback to HTML if PDF download failed or parsing didn't find sections
            if sections["Conclusion"] == "Not found." and sections["Limitations"] == "Not found.":
                print(f"PDF parsing yielded no sections or download failed. Trying HTML fallback for {paper_id}...")
                html_sections = extract_from_html(paper_id)
                sections["Conclusion"] = html_sections["Conclusion"]
                sections["Limitations"] = html_sections["Limitations"]
                
            result_entry = {
                "id": paper_id,
                "title": p.title,
                "authors": [a.name for a in p.authors],
                "abstract": p.summary.replace("\n", " "),
                "url": p.entry_id,
                "pdf_path": pdf_path if download_success else "Not downloaded",
                "conclusion": sections["Conclusion"],
                "limitations": sections["Limitations"],
                "category": q["name"]
            }
            all_results.append(result_entry)
            downloaded[paper_id] = p.entry_id  # Store abstract url mapping in the dict
            count += 1
            
            # Wait to be polite to arXiv
            time.sleep(4.0)
            
    save_tracking(downloaded)
    
    if all_results:
        existing_content = ""
        if os.path.exists(OUTPUT_MD):
            try:
                with open(OUTPUT_MD, "r", encoding="utf-8") as f:
                    existing_content = f.read()
            except Exception as e:
                print(f"Could not read existing {OUTPUT_MD}: {e}")
        
        with open(OUTPUT_MD, "w", encoding="utf-8") as f:
            if existing_content.strip() and "ArXiv Insights" in existing_content:
                f.write(existing_content)
                f.write("\n\n# New Run Insights\n\n")
            else:
                f.write("# ArXiv Insights (Historical): AI and Cybersecurity\n\n")
            
            current_cat = ""
            for res in sorted(all_results, key=lambda x: x["category"]):
                if res["category"] != current_cat:
                    f.write(f"\n## {res['category']}\n\n")
                    current_cat = res["category"]
                    
                f.write(f"### [{res['title']}]({res['url']})\n")
                f.write(f"**Authors:** {', '.join(res['authors'])}\n\n")
                f.write(f"**Local PDF:** `{res['pdf_path']}`\n\n")
                f.write(f"**Abstract:** {res['abstract']}\n\n")
                f.write(f"**Conclusion:**\n{res['conclusion']}\n\n")
                f.write(f"**Limitations:**\n{res['limitations']}\n\n")
                f.write("---\n")
        print(f"Done! Extracted insights saved/appended to {OUTPUT_MD}")
    else:
        print("No new papers were processed in this run.")

if __name__ == '__main__':
    main()
