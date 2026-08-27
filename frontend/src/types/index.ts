export interface Paper {
  id: string
  title: string
  authors: string[]
  abstract: string
  url: string
  pdf_path?: string
  conclusion: string
  limitations: string
  category: string
  published_date?: string
  is_bookmarked: boolean
  tags: string[]
  notes?: string
  github_url?: string
  hf_url?: string
  created_at?: string
}

export interface PaperListResponse {
  papers: Paper[]
  total: number
  page: number
  limit: number
  categories: string[]
}

export interface PromptGenerationRequest {
  paper_ids: string[]
  agent_target: 'antigravity' | 'claude_code' | 'codex' | 'cursor' | 'generic'
  project_type: 'fullstack' | 'cli' | 'library' | 'benchmark' | 'security_tool' | 'research_poc'
  tech_stack: 'python_fastapi_react' | 'rust_cli' | 'typescript_node' | 'go_backend' | 'python_ml'
  focus_angle: 'solve_limitations' | 'hybrid_synthesis' | 'productionize' | 'reproducible_eval'
  project_name?: string
  custom_instructions?: string
}

export interface PromptGenerationResponse {
  prompt_markdown: string
  estimated_tokens: number
  spec_markdown: string
  suggested_files: string[]
  paper_summaries: {
    id: string
    title: string
    authors: string
    abstract: string
    conclusion: string
    limitations: string
    url: string
    category: string
    github_url?: string
    hf_url?: string
  }[]
}

export interface ScrapeJobStatus {
  job_id: string
  status: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  total: number
  current_paper?: string
  logs: string[]
  new_papers_count: number
  started_at?: string
  completed_at?: string
}

export interface LimitationTheme {
  theme: string
  count: number
  desc: string
}

export interface StatsResponse {
  total_papers: number
  bookmarked_papers: number
  categories: Record<string, number>
  papers_with_limitations: number
  papers_with_pdfs: number
  papers_with_code: number
  common_limitations: LimitationTheme[]
}
