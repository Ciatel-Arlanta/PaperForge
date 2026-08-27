import re
from typing import List, Dict, Any, Optional
from .schemas import PromptGenerationRequest, PromptGenerationResponse

def clean_text(text: str) -> str:
    if not text or text == "Not found.":
        return "Not specified in paper extraction."
    return re.sub(r'\s+', ' ', text).strip()

def build_paper_summary(paper: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": paper.get("id", ""),
        "title": paper.get("title", ""),
        "authors": ", ".join(paper.get("authors", [])) if isinstance(paper.get("authors"), list) else str(paper.get("authors", "")),
        "abstract": clean_text(paper.get("abstract", "")),
        "conclusion": clean_text(paper.get("conclusion", "")),
        "limitations": clean_text(paper.get("limitations", "")),
        "url": paper.get("url", ""),
        "category": paper.get("category", ""),
        "github_url": paper.get("github_url"),
        "hf_url": paper.get("hf_url")
    }

STACK_CONFIGS = {
    "python_fastapi_react": {
        "name": "Python (FastAPI) + React / TypeScript + Tailwind CSS",
        "backend": "Python 3.12+ (FastAPI, Pydantic v2, SQLite/PostgreSQL, PyTest)",
        "frontend": "React 19 + TypeScript + Vite + Tailwind CSS",
        "file_structure": [
            "backend/app/main.py",
            "backend/app/core/engine.py",
            "backend/app/models/schemas.py",
            "backend/tests/test_engine.py",
            "frontend/src/App.tsx",
            "frontend/src/components/",
            "README.md",
            "pyproject.toml"
        ]
    },
    "rust_cli": {
        "name": "Rust High-Performance CLI / Systems Tool",
        "backend": "Rust (Edition 2021, Tokio, Clap, Anyhow/Thiserror, Rayon)",
        "frontend": "Rich Terminal UI (Ratatui / Crossterm) or Headless CLI",
        "file_structure": [
            "src/main.rs",
            "src/lib.rs",
            "src/engine/mod.rs",
            "src/models/mod.rs",
            "src/cli/mod.rs",
            "tests/integration_tests.rs",
            "Cargo.toml",
            "README.md"
        ]
    },
    "typescript_node": {
        "name": "TypeScript / Node.js Fullstack & Microservices",
        "backend": "Node.js 22+ (TypeScript, Hono/Express, Zod, Vitest)",
        "frontend": "Next.js / Vite React + Tailwind CSS",
        "file_structure": [
            "src/index.ts",
            "src/services/engine.ts",
            "src/types/index.ts",
            "tests/engine.test.ts",
            "package.json",
            "tsconfig.json",
            "README.md"
        ]
    },
    "go_backend": {
        "name": "Go (Golang) Microservice & Distributed Engine",
        "backend": "Go 1.22+ (Gin/Chi, gRPC, Testify, Goroutines)",
        "frontend": "Lightweight Dashboard or REST API",
        "file_structure": [
            "cmd/server/main.go",
            "pkg/engine/engine.go",
            "pkg/models/models.go",
            "pkg/engine/engine_test.go",
            "go.mod",
            "README.md"
        ]
    },
    "python_ml": {
        "name": "Python ML/AI Research & Experimentation Framework",
        "backend": "PyTorch / HuggingFace / Scikit-learn / NumPy / PyTest",
        "frontend": "Jupyter Notebooks / Streamlit Evaluation Suite",
        "file_structure": [
            "src/models/core_model.py",
            "src/data/loader.py",
            "src/eval/benchmark.py",
            "src/train.py",
            "tests/test_model.py",
            "pyproject.toml",
            "README.md"
        ]
    }
}

PROJECT_TYPE_CONFIGS = {
    "fullstack": {
        "title": "Full-Stack Production System",
        "goal": "Build an end-to-end operational software platform with interactive UI, real-time backend engine, and persistence layer."
    },
    "cli": {
        "title": "Developer CLI & Automation Tool",
        "goal": "Build a lightning-fast, terminal-native CLI utility with rich diagnostics, batch processing, and composable piping."
    },
    "library": {
        "title": "Open-Source Library / Core Engine Package",
        "goal": "Build a modular, zero-bloat, highly extensible open-source SDK/library with comprehensive unit test coverage and type definitions."
    },
    "benchmark": {
        "title": "Empirical Benchmark & Evaluation Harness",
        "goal": "Build a reproducible test suite and comparative evaluation harness to stress-test adversarial conditions, latency, and failure modes."
    },
    "security_tool": {
        "title": "Adversarial Defense / Security Governance Module",
        "goal": "Build a real-time security mediation, attack detection, and policy enforcement gateway."
    },
    "research_poc": {
        "title": "Proof-of-Concept Research Prototype",
        "goal": "Implement the core algorithms proposed in the paper and prove feasibility on targeted sample datasets."
    }
}

def generate_project_name(papers: List[Dict[str, Any]], custom_name: Optional[str]) -> str:
    if custom_name and custom_name.strip():
        return custom_name.strip()
    if not papers:
        return "Autonomous-Research-Project"
    
    first_title = papers[0].get("title", "Project")
    words = re.findall(r'[A-Za-z0-9]+', first_title)
    keywords = [w for w in words if len(w) > 3 and w.lower() not in {"with", "using", "based", "from", "through", "toward", "their", "under"}][:3]
    if keywords:
        return "-".join(keywords).title().replace(" ", "") + "-Engine"
    return "Project-" + papers[0].get("id", "Alpha").replace(".", "-")

def generate_agent_prompt(
    papers: List[Dict[str, Any]],
    request: PromptGenerationRequest
) -> PromptGenerationResponse:
    summaries = [build_paper_summary(p) for p in papers]
    stack_info = STACK_CONFIGS.get(request.tech_stack, STACK_CONFIGS["python_fastapi_react"])
    proj_type = PROJECT_TYPE_CONFIGS.get(request.project_type, PROJECT_TYPE_CONFIGS["fullstack"])
    project_name = generate_project_name(papers, request.project_name)
    agent = request.agent_target.lower()
    focus_angle = request.focus_angle

    # Build Paper Context Section
    paper_context_blocks = []
    has_any_code = False
    for idx, p in enumerate(summaries, 1):
        code_lines = []
        if p.get("github_url"):
            code_lines.append(f"- **Official Reference Code:** [{p['github_url']}]({p['github_url']})")
            has_any_code = True
        if p.get("hf_url"):
            code_lines.append(f"- **Model Weights / Checkpoints:** [{p['hf_url']}]({p['hf_url']})")

        code_section = "\n".join(code_lines) + "\n" if code_lines else ""

        block = f"""### Paper {idx}: {p['title']}
- **arXiv ID:** `{p['id']}` ([Link]({p['url']}))
- **Authors:** {p['authors']}
- **Domain:** {p['category']}
{code_section}- **Core Abstract:**
  > {p['abstract']}

- **Key Findings & Conclusions:**
  {p['conclusion']}

- **Explicit Limitations & Stated Future Work:**
  {p['limitations']}
"""
        paper_context_blocks.append(block)

    papers_text = "\n".join(paper_context_blocks)

    # Core Engineering Mission Formulation
    if focus_angle == "solve_limitations":
        mission = f"Implement the core concepts of the cited research while specifically solving and overcoming the stated limitations (such as generalization gaps, computational overhead, lack of runtime cooperation, or transferability)."
    elif focus_angle == "hybrid_synthesis":
        mission = f"Synthesize the breakthrough findings of these complementary papers into a unified, synergistic software architecture that combines the strengths of each paper."
    elif focus_angle == "productionize":
        mission = f"Transform the academic theory and PoC mechanisms from the research into a production-grade, highly reliable, and fault-tolerant software system."
    else:  # reproducible_eval
        mission = f"Build an automated, reproducible benchmark and experimentation harness to rigorously evaluate the paper's claims under diverse stress conditions."

    reference_code_note = ""
    if has_any_code:
        reference_code_note = "- **Official Code Inspection:** Authors provide reference implementation link(s) above. Inspect the repository for algorithmic details, tensor operations, and baseline evaluation protocols, and build a clean, well-tested production implementation based on it.\n"

    # Spec generation
    spec_md = f"""# System Specification: {project_name}

## 1. Executive Summary
- **Project Goal:** {proj_type['goal']}
- **Target Stack:** {stack_info['name']}
- **Primary Research Basis:** {', '.join([p['title'] for p in summaries])}

## 2. Key Architecture Objectives
1. **Core Mechanism Implementation:** Faithfully translate the theoretical formulations from the research paper(s) into robust, testable code modules.
2. **Addressing Known Bottlenecks:** Systematically resolve the explicit limitations identified in the paper (e.g. transfer vulnerabilities, overhead, or uncalibrated detection).
3. **Clean Interface Separation:** Isolate data models, execution engines, and presentation layers with explicit type contracts.
4. **Comprehensive Test Suite:** Include unit, integration, and stress tests to verify correctness and resilience.

## 3. Recommended File Scaffolding
```
{project_name}/
""" + "\n".join([f"├── {f}" for f in stack_info["file_structure"]]) + """
```
"""

    # Generate Agent-Specific Prompts
    if agent == "antigravity":
        prompt_md = f"""# AGENT DIRECTIVE: Build `{project_name}`

You are pair-programming with me as an expert senior software architect and systems engineer.
We are building **{project_name}**, a {proj_type['title']}.

---

## 🔬 Research Foundation & Extracted Insights

{papers_text}

---

## 🎯 Engineering Mission & Project Scope
**Objective:** {mission}
**Target Stack:** {stack_info['name']}
**Stack Components:**
- **Backend/Core:** `{stack_info['backend']}`
- **UI / Client:** `{stack_info['frontend']}`
{reference_code_note}
{f"**Custom Constraints / Instructions:**\n{request.custom_instructions}\n" if request.custom_instructions else ""}

---

## 📋 Planning & Execution Protocol

Before writing code, please execute in **Planning Mode**:

### Phase 1: Research & System Design (`implementation_plan.md`)
1. Create a detailed `implementation_plan.md` artifact outlining:
   - **Architectural Diagram (Mermaid):** Data flow, core abstraction layers, and mediation points.
   - **Type Definitions & Domain Model:** Core structs, request/response models, state machines.
   - **Engine Formulation:** How the core algorithms from the paper will be implemented.
   - **Resolution of Limitations:** Specific mitigation strategy for every limitation identified in the paper.
   - **File Scaffolding:** Exact file paths and component responsibilities.
   - **Verification Harness:** Commands to run automated unit & integration tests.

### Phase 2: User Approval Gate
- Stop and present the plan for review.

### Phase 3: Phased Execution & Verification
Upon approval, implement the system systematically:
- **Milestone 1:** Core models, data structures, and foundational algorithms.
- **Milestone 2:** Execution engine, adapters, and business logic.
- **Milestone 3:** API / CLI / UI interface layer.
- **Milestone 4:** Full test suite (TDD with unit tests, property checks, and benchmark fixtures).
- **Milestone 5:** Create `walkthrough.md` documenting architecture, test run results, and usage examples.

Let's begin by generating the implementation plan!
"""

    elif agent == "claude_code":
        prompt_md = f"""# Mission: Build `{project_name}`

## Context & Research Basis
We are implementing a {proj_type['title']} based on latest arXiv research:
{papers_text}

## Goal
{mission}

## Tech Stack
- **Architecture:** {stack_info['name']}
- **Core Engine:** `{stack_info['backend']}`
- **Frontend / Interface:** `{stack_info['frontend']}`
{reference_code_note}
{f"## Custom User Guidelines\n{request.custom_instructions}\n" if request.custom_instructions else ""}

## Execution Instructions for Claude Code
1. **Initialize Project:** Scaffold the repository with the following structure:
   - File scaffolding: {', '.join(stack_info['file_structure'])}
2. **Follow TDD (Red-Green-Refactor):**
   - Write comprehensive unit tests for every mathematical or algorithmic component before implementing the core logic.
   - Ensure edge cases highlighted in the paper's limitations are covered by test fixtures.
3. **Code Quality Constraints:**
   - Avoid over-engineering, dead abstractions, and unnecessary dependencies.
   - Keep functions concise, pure, and type-safe.
   - Provide clean error types (no unhandled exceptions).
4. **Documentation:**
   - Create a clean `README.md` with installation, CLI usage, and architecture diagram.
   - Create a `CLAUDE.md` with dev commands (`test`, `build`, `lint`).

Please start by scaffolding the project and writing the core tests!
"""

    elif agent == "codex":
        prompt_md = f"""# System Specification & Implementation Prompt: `{project_name}`

### Overview
Implement **{project_name}** ({proj_type['title']}) using {stack_info['name']}.

### Background Research
{papers_text}

### Primary Requirements
1. **Core Problem:** {mission}
2. **Design Specifications:**
   - Implement the theoretical model from the paper.
   - Implement mitigations for the explicit limitations stated in the paper.
   - Provide clean APIs, robust error handling, and end-to-end execution pipeline.
{reference_code_note}3. **Directory Structure:**
```
""" + "\n".join(stack_info["file_structure"]) + """
```

{f"### Additional Requirements\n{request.custom_instructions}\n" if request.custom_instructions else ""}

Please generate the complete, production-ready codebase following these specifications.
"""

    elif agent == "cursor":
        prompt_md = f"""# Cursor / Windsurf Project Prompt: `{project_name}`

## Objective
Build **{project_name}** ({proj_type['title']}) based on the attached research findings.

## Research Context
{papers_text}

## Stack & Target Environment
- **Stack:** {stack_info['name']}
- **Backend:** {stack_info['backend']}
- **Frontend:** {stack_info['frontend']}

## Mission
{mission}
{reference_code_note}
{f"## Extra Instructions\n{request.custom_instructions}\n" if request.custom_instructions else ""}

## Project Rules (.cursorrules)
- Prefer modern idioms and type safety.
- Write unit tests for all core algorithms and boundary conditions.
- Adhere strictly to the recommended architecture in `{stack_info['file_structure'][0]}`.

Let's begin by writing the core data structures and unit tests!
"""

    else:  # Generic
        prompt_md = f"""# AI Project Generation Prompt: `{project_name}`

## 1. Project Overview
- **Name:** {project_name}
- **Type:** {proj_type['title']}
- **Tech Stack:** {stack_info['name']}
- **Mission:** {mission}

## 2. Research Papers & Extracted Insights
{papers_text}
{reference_code_note}
{f"## 3. Custom Instructions\n{request.custom_instructions}\n" if request.custom_instructions else ""}

## 4. Deliverables
1. **Architecture Blueprint:** System diagrams, data models, and API interfaces.
2. **Core Implementation:** Complete source code for all modules.
3. **Verification Suite:** Unit and integration tests covering the paper's edge cases and limitations.
4. **Documentation:** Step-by-step setup and execution guide in `README.md`.
"""

    est_tokens = len(prompt_md) // 4

    return PromptGenerationResponse(
        prompt_markdown=prompt_md.strip(),
        estimated_tokens=est_tokens,
        spec_markdown=spec_md.strip(),
        suggested_files=stack_info["file_structure"],
        paper_summaries=summaries
    )
