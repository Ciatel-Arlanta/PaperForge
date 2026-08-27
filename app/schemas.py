from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PaperBase(BaseModel):
    id: str
    title: str
    authors: List[str] = []
    abstract: str
    url: str
    pdf_path: Optional[str] = None
    conclusion: str = "Not found."
    limitations: str = "Not found."
    category: str = "General AI"
    published_date: Optional[str] = None
    is_bookmarked: bool = False
    tags: List[str] = []
    notes: Optional[str] = None
    github_url: Optional[str] = None
    hf_url: Optional[str] = None

class Paper(PaperBase):
    created_at: Optional[str] = None

class PaperUpdate(BaseModel):
    is_bookmarked: Optional[bool] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    github_url: Optional[str] = None
    hf_url: Optional[str] = None

class PaperListResponse(BaseModel):
    papers: List[Paper]
    total: int
    page: int
    limit: int
    categories: List[str]

class ScrapeQueryItem(BaseModel):
    name: str
    query: str
    limit: int = 10

class ScrapeJobRequest(BaseModel):
    queries: Optional[List[ScrapeQueryItem]] = None
    custom_query: Optional[str] = None
    max_results: int = 10
    download_pdf: bool = True

class ScrapeJobStatus(BaseModel):
    job_id: str
    status: str  # "idle" | "running" | "completed" | "failed" | "cancelled"
    progress: int = 0
    total: int = 0
    current_paper: Optional[str] = None
    logs: List[str] = []
    new_papers_count: int = 0
    started_at: Optional[str] = None
    completed_at: Optional[str] = None

class PromptGenerationRequest(BaseModel):
    paper_ids: List[str]
    agent_target: str = "antigravity"  # antigravity, claude_code, codex, cursor, generic
    project_type: str = "fullstack"    # fullstack, cli, library, benchmark, security_tool, research_poc
    tech_stack: str = "python_fastapi_react"  # python_fastapi_react, rust_cli, typescript_node, go_backend, python_ml
    focus_angle: str = "solve_limitations"    # solve_limitations, hybrid_synthesis, productionize, reproducible_eval
    project_name: Optional[str] = None
    custom_instructions: Optional[str] = None

class PromptGenerationResponse(BaseModel):
    prompt_markdown: str
    estimated_tokens: int
    spec_markdown: str
    suggested_files: List[str]
    paper_summaries: List[Dict[str, Any]]

class StatsResponse(BaseModel):
    total_papers: int
    bookmarked_papers: int
    categories: Dict[str, int]
    papers_with_limitations: int
    papers_with_pdfs: int
    papers_with_code: int = 0
    common_limitations: List[Dict[str, Any]]
