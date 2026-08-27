import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from typing import Optional, List

from .database import (
    init_db, sync_legacy_files, get_papers, get_paper_by_id,
    toggle_bookmark, update_paper, get_categories, get_stats
)
from .schemas import (
    Paper, PaperListResponse, PaperUpdate, ScrapeJobRequest,
    ScrapeJobStatus, PromptGenerationRequest, PromptGenerationResponse,
    StatsResponse
)
from .prompt_engine import generate_agent_prompt
from .scraper_service import scraper_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and sync legacy papers if empty
    init_db()
    papers, total = get_papers(limit=1)
    if total == 0:
        sync_legacy_files()
    yield
    # Shutdown logic if any

app = FastAPI(
    title="PaperForge: Research-to-Code Platform API",
    description="Research-to-Code Platform with Intelligent Multi-Agent Prompt Synthesis",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "paper_forge"}

@app.get("/api/papers", response_model=PaperListResponse)
def list_papers(
    search: Optional[str] = Query(None, description="Search term in title, abstract, conclusions or limitations"),
    category: Optional[str] = Query(None, description="Filter by category"),
    has_limitations: Optional[bool] = Query(None, description="Only return papers with extracted limitations"),
    has_code: Optional[bool] = Query(None, description="Only return papers with extracted code or models"),
    bookmarked_only: Optional[bool] = Query(None, description="Only return starred papers"),
    sort_by: str = Query("id", description="Field to sort by: id, title, created_at, category"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100)
):
    papers, total = get_papers(
        search=search,
        category=category,
        has_limitations=has_limitations,
        has_code=has_code,
        bookmarked_only=bookmarked_only,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit
    )
    all_categories = get_categories()
    return PaperListResponse(
        papers=[Paper(**p) for p in papers],
        total=total,
        page=page,
        limit=limit,
        categories=all_categories
    )

@app.get("/api/papers/{paper_id}", response_model=Paper)
def get_paper(paper_id: str):
    paper = get_paper_by_id(paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return Paper(**paper)

@app.post("/api/papers/{paper_id}/bookmark")
def bookmark_paper(paper_id: str):
    new_status = toggle_bookmark(paper_id)
    return {"id": paper_id, "is_bookmarked": new_status}

@app.patch("/api/papers/{paper_id}")
def edit_paper(paper_id: str, update_data: PaperUpdate):
    paper = get_paper_by_id(paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    update_paper(
        paper_id,
        notes=update_data.notes,
        tags=update_data.tags,
        is_bookmarked=update_data.is_bookmarked
    )
    return {"status": "updated", "id": paper_id}

@app.get("/api/categories", response_model=List[str])
def list_categories():
    return get_categories()

@app.get("/api/stats", response_model=StatsResponse)
def get_system_stats():
    return StatsResponse(**get_stats())

@app.post("/api/sync")
def sync_legacy():
    count = sync_legacy_files()
    return {"status": "success", "imported_count": count}

@app.post("/api/prompt/generate", response_model=PromptGenerationResponse)
def generate_prompt(request: PromptGenerationRequest):
    if not request.paper_ids:
        raise HTTPException(status_code=400, detail="At least one paper_id is required")
    
    papers = []
    for pid in request.paper_ids:
        p = get_paper_by_id(pid)
        if p:
            papers.append(p)
            
    if not papers:
        raise HTTPException(status_code=404, detail="No matching papers found for given IDs")
        
    return generate_agent_prompt(papers, request)

@app.post("/api/scrape/start")
def start_scrape(req: ScrapeJobRequest):
    queries = []
    if req.queries:
        queries = [q.model_dump() for q in req.queries]
    elif req.custom_query:
        queries = [{"name": "Custom Query", "query": req.custom_query, "limit": req.max_results}]
    else:
        # Default standard queries
        queries = [
            {"name": "AI & Cybersecurity Intersection", "query": "(cat:cs.CR) AND (cat:cs.AI OR cat:cs.LG OR cat:cs.CL)", "limit": 10},
            {"name": "AI Only", "query": "cat:cs.AI OR cat:cs.LG OR cat:cs.CL", "limit": 5},
            {"name": "Cybersecurity Only", "query": "cat:cs.CR", "limit": 5}
        ]
        
    job_id = scraper_service.start_scrape_job(queries, download_pdf=req.download_pdf)
    return {"job_id": job_id, "status": "started"}

@app.get("/api/scrape/status/{job_id}", response_model=ScrapeJobStatus)
def get_scrape_status(job_id: str):
    status = scraper_service.get_job_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    return ScrapeJobStatus(**status)

@app.post("/api/scrape/cancel/{job_id}")
def cancel_scrape_job(job_id: str):
    success = scraper_service.cancel_job(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found or already ended")
    return {"status": "cancelled", "job_id": job_id}

@app.get("/api/pdf/{paper_id}")
def get_pdf(paper_id: str):
    paper = get_paper_by_id(paper_id)
    if not paper or not paper.get("pdf_path"):
        raise HTTPException(status_code=404, detail="PDF not found for this paper")
    
    pdf_path = paper["pdf_path"]
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Local PDF file does not exist")
        
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        content_disposition_type="inline",
        filename=os.path.basename(pdf_path)
    )

# Static file serving for React frontend if built
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return JSONResponse({"message": "Frontend build not found. Run `npm run build` in frontend directory."})
