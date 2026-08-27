import os
import pytest
from app.database import (
    init_db, upsert_paper, get_paper_by_id, get_papers,
    toggle_bookmark, get_stats, extract_code_urls
)

TEST_DB = "test_papers.db"

@pytest.fixture(autouse=True)
def setup_teardown():
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)
    init_db(TEST_DB)
    yield
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)

def test_upsert_and_get_paper():
    paper = {
        "id": "2406.99999v1",
        "title": "Test Defense Architecture for LLMs",
        "authors": ["Alice Smith", "Bob Jones"],
        "abstract": "We evaluate runtime defense mechanisms. Code at https://github.com/org/repo and model at https://huggingface.co/org/model.",
        "url": "https://arxiv.org/abs/2406.99999v1",
        "pdf_path": "pdfs/test.pdf",
        "conclusion": "The framework achieves strong empirical robustness.",
        "limitations": "Transferability across novel architectures was not tested.",
        "category": "AI & Cybersecurity Intersection",
        "is_bookmarked": False
    }

    upsert_paper(paper, db_path=TEST_DB)
    retrieved = get_paper_by_id("2406.99999v1", db_path=TEST_DB)

    assert retrieved is not None
    assert retrieved["title"] == "Test Defense Architecture for LLMs"
    assert len(retrieved["authors"]) == 2
    assert "Transferability" in retrieved["limitations"]
    assert retrieved["github_url"] == "https://github.com/org/repo"
    assert retrieved["hf_url"] == "https://huggingface.co/org/model"

def test_extract_code_urls_regex():
    text = "The code can be found here: https://github.com/elmma/mllm-reroute. Models available at https://huggingface.co/Qwen/Qwen2.5-7B"
    gh, hf = extract_code_urls(text)
    assert gh == "https://github.com/elmma/mllm-reroute"
    assert hf == "https://huggingface.co/Qwen/Qwen2.5-7B"

def test_search_and_filter_papers():
    p1 = {
        "id": "1",
        "title": "Adversarial Robustness in Neural Networks",
        "authors": ["Alice"],
        "abstract": "Deep learning defenses.",
        "url": "https://arxiv.org/abs/1",
        "conclusion": "Good",
        "limitations": "High computational cost",
        "category": "AI Only"
    }
    p2 = {
        "id": "2",
        "title": "Network Intrusion Detection with Random Forests",
        "authors": ["Bob"],
        "abstract": "Network security classification.",
        "url": "https://arxiv.org/abs/2",
        "conclusion": "Good",
        "limitations": "Not found.",
        "category": "Cybersecurity Only"
    }
    upsert_paper(p1, db_path=TEST_DB)
    upsert_paper(p2, db_path=TEST_DB)

    # Search
    results, total = get_papers(search="Adversarial", db_path=TEST_DB)
    assert total == 1
    assert results[0]["id"] == "1"

    # Filter has_limitations
    results, total = get_papers(has_limitations=True, db_path=TEST_DB)
    assert total == 1
    assert results[0]["id"] == "1"

def test_toggle_bookmark():
    p = {
        "id": "100",
        "title": "Test Paper",
        "authors": [],
        "abstract": "A",
        "url": "https://arxiv.org/abs/100"
    }
    upsert_paper(p, db_path=TEST_DB)

    status = toggle_bookmark("100", db_path=TEST_DB)
    assert status is True

    retrieved = get_paper_by_id("100", db_path=TEST_DB)
    assert retrieved["is_bookmarked"] is True

    status = toggle_bookmark("100", db_path=TEST_DB)
    assert status is False
