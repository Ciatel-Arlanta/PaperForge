from app.prompt_engine import generate_agent_prompt
from app.schemas import PromptGenerationRequest

def test_generate_antigravity_prompt():
    papers = [{
        "id": "2606.12320v1",
        "title": "A Five-Plane Reference Architecture for Runtime Governance",
        "authors": ["Krti Tallam"],
        "abstract": "Enterprise security framework for AI agents.",
        "conclusion": "The reference architecture is verified.",
        "limitations": "The architecture assumes runtime cooperation at hooks.",
        "url": "https://arxiv.org/abs/2606.12320v1",
        "category": "AI & Cybersecurity Intersection"
    }]

    req = PromptGenerationRequest(
        paper_ids=["2606.12320v1"],
        agent_target="antigravity",
        project_type="fullstack",
        tech_stack="python_fastapi_react",
        focus_angle="solve_limitations"
    )

    response = generate_agent_prompt(papers, req)
    assert response.estimated_tokens > 100
    assert "AGENT DIRECTIVE" in response.prompt_markdown
    assert "implementation_plan.md" in response.prompt_markdown
    assert "assumes runtime cooperation" in response.prompt_markdown
    assert len(response.suggested_files) > 0

def test_generate_claude_code_prompt():
    papers = [{
        "id": "2606.12251v1",
        "title": "Reinforcement Learning Disrupts Adversarial Optimization",
        "authors": ["Xinhai Zou"],
        "abstract": "RL acts as an implicit regularizer against gradient attacks.",
        "conclusion": "FLatter loss landscapes.",
        "limitations": "Transfer vulnerability exists.",
        "url": "https://arxiv.org/abs/2606.12251v1",
        "category": "AI Only"
    }]

    req = PromptGenerationRequest(
        paper_ids=["2606.12251v1"],
        agent_target="claude_code",
        project_type="cli",
        tech_stack="rust_cli",
        focus_angle="solve_limitations"
    )

    response = generate_agent_prompt(papers, req)
    assert "Claude Code" in response.prompt_markdown
    assert "CLAUDE.md" in response.prompt_markdown
    assert "TDD" in response.prompt_markdown
    assert "Cargo.toml" in str(response.suggested_files)

def test_multi_paper_synthesis_prompt():
    papers = [
        {
            "id": "P1",
            "title": "First Paper on Defense",
            "authors": ["Author 1"],
            "abstract": "Abstract 1",
            "conclusion": "Conclusion 1",
            "limitations": "Limitation 1",
            "url": "http://arxiv.org/abs/P1",
            "category": "AI"
        },
        {
            "id": "P2",
            "title": "Second Paper on Attack",
            "authors": ["Author 2"],
            "abstract": "Abstract 2",
            "conclusion": "Conclusion 2",
            "limitations": "Limitation 2",
            "url": "http://arxiv.org/abs/P2",
            "category": "Cybersecurity"
        }
    ]

    req = PromptGenerationRequest(
        paper_ids=["P1", "P2"],
        agent_target="antigravity",
        project_type="fullstack",
        tech_stack="python_fastapi_react",
        focus_angle="hybrid_synthesis"
    )

    response = generate_agent_prompt(papers, req)
    assert "Paper 1: First Paper on Defense" in response.prompt_markdown
    assert "Paper 2: Second Paper on Attack" in response.prompt_markdown
    assert len(response.paper_summaries) == 2
