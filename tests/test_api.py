import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db, upsert_paper

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_module():
    init_db()
    upsert_paper({
        "id": "2606.12320v1",
        "title": "A Five-Plane Reference Architecture for Runtime Governance of Production AI Agents",
        "authors": ["Krti Tallam"],
        "abstract": "Enterprise security was built to govern data boundaries.",
        "url": "http://arxiv.org/abs/2606.12320v1",
        "conclusion": "The reference architecture makes a case for runtime governance.",
        "limitations": "The architecture assumes runtime cooperation at hooks.",
        "category": "AI & Cybersecurity Intersection",
        "github_url": "https://github.com/test/repo"
    })

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_list_papers():
    res = client.get("/api/papers")
    assert res.status_code == 200
    data = res.json()
    assert "papers" in data
    assert "total" in data
    assert len(data["papers"]) > 0

def test_list_papers_has_code_filter():
    res = client.get("/api/papers?has_code=true")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    assert all(p["github_url"] or p["hf_url"] for p in data["papers"])

def test_get_paper_detail():
    res = client.get("/api/papers/2606.12320v1")
    assert res.status_code == 200
    assert res.json()["id"] == "2606.12320v1"

def test_bookmark_toggle():
    res = client.post("/api/papers/2606.12320v1/bookmark")
    assert res.status_code == 200
    assert "is_bookmarked" in res.json()

def test_generate_prompt_api():
    res = client.post("/api/prompt/generate", json={
        "paper_ids": ["2606.12320v1"],
        "agent_target": "antigravity",
        "project_type": "fullstack",
        "tech_stack": "python_fastapi_react",
        "focus_angle": "solve_limitations"
    })
    assert res.status_code == 200
    data = res.json()
    assert "prompt_markdown" in data
    assert "spec_markdown" in data
    assert data["estimated_tokens"] > 50

def test_stats_api():
    res = client.get("/api/stats")
    assert res.status_code == 200
    data = res.json()
    assert data["total_papers"] > 0
    assert "categories" in data
