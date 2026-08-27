import argparse
import sys
import os
import io

# Ensure UTF-8 output on Windows terminals
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding != 'utf-8':
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import uvicorn
from app.database import init_db, sync_legacy_files, get_stats, get_paper_by_id, get_papers
from app.prompt_engine import generate_agent_prompt
from app.schemas import PromptGenerationRequest
from app.scraper_service import scraper_service

def cmd_serve(args):
    """Launch the FastAPI server and Web UI."""
    init_db()
    # Check if papers exist, if not sync
    papers, total = get_papers(limit=1)
    if total == 0:
        print("Empty database detected. Auto-syncing from legacy markdown insights...")
        sync_legacy_files()
        
    print(f"\n=======================================================")
    print(f"  ArXiv Project Finder & AI Agent Prompt Studio")
    print(f"  Web Dashboard: http://{args.host}:{args.port}")
    print(f"  API Docs:      http://{args.host}:{args.port}/docs")
    print(f"=======================================================\n")
    uvicorn.run("app.main:app", host=args.host, port=args.port, reload=args.reload)

def cmd_sync(args):
    """Synchronize papers from markdown files into SQLite."""
    print("Synchronizing markdown and JSON papers into SQLite database...")
    count = sync_legacy_files()
    print(f"Successfully processed and stored {count} papers in papers.db.")
    stats = get_stats()
    print(f"Total Papers in Database: {stats['total_papers']}")
    print(f"Papers with Limitations:  {stats['papers_with_limitations']}")

def cmd_stats(args):
    """Display analytics on indexed research papers."""
    init_db()
    stats = get_stats()
    print("\n=== Project Finder Research Analytics ===")
    print(f"Total Papers:            {stats['total_papers']}")
    print(f"Bookmarked Papers:       {stats['bookmarked_papers']}")
    print(f"Papers with Limitations: {stats['papers_with_limitations']}")
    print(f"Papers with Local PDFs:  {stats['papers_with_pdfs']}")
    print("\n--- Categories ---")
    for cat, cnt in stats["categories"].items():
        print(f"  * {cat}: {cnt} papers")
    print("\n--- Common Limitation Themes ---")
    for lim in stats["common_limitations"]:
        print(f"  * {lim['theme']} ({lim['count']} papers): {lim['desc']}")
    print("=========================================\n")

def cmd_prompt(args):
    """Generate an AI agent prompt for one or more papers."""
    init_db()
    paper_ids = args.paper_ids
    papers = []
    for pid in paper_ids:
        p = get_paper_by_id(pid)
        if p:
            papers.append(p)
        else:
            print(f"Warning: Paper '{pid}' not found in database.")

    if not papers:
        print("Error: No valid papers found for the provided IDs.")
        sys.exit(1)

    req = PromptGenerationRequest(
        paper_ids=paper_ids,
        agent_target=args.agent,
        project_type=args.type,
        tech_stack=args.stack,
        focus_angle=args.angle,
        custom_instructions=args.custom
    )

    response = generate_agent_prompt(papers, req)
    
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(response.prompt_markdown)
        print(f"Prompt successfully written to {args.output} (Est. tokens: ~{response.estimated_tokens})")
    else:
        print("\n" + "="*70)
        print(f"GENERATED AI AGENT PROMPT ({args.agent.upper()}) | ~{response.estimated_tokens} TOKENS")
        print("="*70 + "\n")
        print(response.prompt_markdown)
        print("\n" + "="*70)

def main():
    parser = argparse.ArgumentParser(
        description="ArXiv Research-to-Project Finder & AI Agent Prompt Studio"
    )
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # Serve command
    serve_parser = subparsers.add_parser("serve", help="Launch the Web UI and API server")
    serve_parser.add_argument("--host", default="127.0.0.1", help="Host address (default: 127.0.0.1)")
    serve_parser.add_argument("--port", type=int, default=8000, help="Port number (default: 8000)")
    serve_parser.add_argument("--reload", action="store_true", help="Enable uvicorn hot-reload")

    # Sync command
    subparsers.add_parser("sync", help="Sync markdown and json papers into SQLite database")

    # Stats command
    subparsers.add_parser("stats", help="Display research and limitation statistics")

    # Prompt command
    prompt_parser = subparsers.add_parser("prompt", help="Generate AI Agent prompt from paper(s)")
    prompt_parser.add_argument("--paper-ids", "-p", nargs="+", required=True, help="ArXiv IDs of papers")
    prompt_parser.add_argument("--agent", "-a", default="antigravity", choices=["antigravity", "claude_code", "codex", "cursor", "generic"], help="Target AI agent")
    prompt_parser.add_argument("--type", "-t", default="fullstack", choices=["fullstack", "cli", "library", "benchmark", "security_tool", "research_poc"], help="Project archetype")
    prompt_parser.add_argument("--stack", "-s", default="python_fastapi_react", choices=["python_fastapi_react", "rust_cli", "typescript_node", "go_backend", "python_ml"], help="Tech stack")
    prompt_parser.add_argument("--angle", default="solve_limitations", choices=["solve_limitations", "hybrid_synthesis", "productionize", "reproducible_eval"], help="Focus angle")
    prompt_parser.add_argument("--custom", "-c", default="", help="Custom constraints/instructions")
    prompt_parser.add_argument("--output", "-o", help="Output file path (e.g. PROMPT.md)")

    args = parser.parse_args()

    if not args.command or args.command == "serve":
        if not args.command:
            class DefaultArgs:
                host = "127.0.0.1"
                port = 8000
                reload = False
            cmd_serve(DefaultArgs())
        else:
            cmd_serve(args)
    elif args.command == "sync":
        cmd_sync(args)
    elif args.command == "stats":
        cmd_stats(args)
    elif args.command == "prompt":
        cmd_prompt(args)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
