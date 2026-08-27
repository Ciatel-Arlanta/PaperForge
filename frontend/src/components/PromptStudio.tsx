import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Terminal,
  Layers,
  Shield,
  BookOpen,
  Code2,
  Trash2,
  FileCode,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react'
import { GithubIcon, HuggingFaceIcon } from './Icons'
import type { Paper, PromptGenerationRequest, PromptGenerationResponse } from '../types'
import { cn } from '../lib/utils'

interface PromptStudioProps {
  selectedPapers: Paper[]
  onRemoveSelectedPaper: (id: string) => void
  onClearSelectedPapers: () => void
  onNavigateToPapers: () => void
}

export const PromptStudio: React.FC<PromptStudioProps> = ({
  selectedPapers,
  onRemoveSelectedPaper,
  onClearSelectedPapers,
  onNavigateToPapers
}) => {
  const [agentTarget, setAgentTarget] = useState<PromptGenerationRequest['agent_target']>('antigravity')
  const [projectType, setProjectType] = useState<PromptGenerationRequest['project_type']>('fullstack')
  const [techStack, setTechStack] = useState<PromptGenerationRequest['tech_stack']>('python_fastapi_react')
  const [focusAngle, setFocusAngle] = useState<PromptGenerationRequest['focus_angle']>('solve_limitations')
  const [customInstructions, setCustomInstructions] = useState('')
  const [projectName, setProjectName] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [generatedResult, setGeneratedResult] = useState<PromptGenerationResponse | null>(null)
  const [hasCopied, setHasCopied] = useState(false)
  const [activeView, setActiveView] = useState<'prompt' | 'spec' | 'files'>('prompt')

  // Auto-generate prompt when papers or core configs change (with debounce for text inputs)
  useEffect(() => {
    if (selectedPapers.length === 0) {
      setGeneratedResult(null)
      return
    }

    const timer = setTimeout(() => {
      handleGenerate()
    }, 150)

    return () => clearTimeout(timer)
  }, [
    selectedPapers.length,
    agentTarget,
    projectType,
    techStack,
    focusAngle,
    projectName,
    customInstructions
  ])

  const handleGenerate = async () => {
    if (selectedPapers.length === 0) return
    setIsLoading(true)
    try {
      const payload: PromptGenerationRequest = {
        paper_ids: selectedPapers.map((p) => p.id),
        agent_target: agentTarget,
        project_type: projectType,
        tech_stack: techStack,
        focus_angle: focusAngle,
        project_name: projectName || undefined,
        custom_instructions: customInstructions || undefined
      }

      const res = await fetch('/api/prompt/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data: PromptGenerationResponse = await res.json()
        setGeneratedResult(data)
      }
    } catch (err) {
      console.error('Error generating prompt:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyPrompt = () => {
    if (!generatedResult) return
    const textToCopy = activeView === 'spec' ? generatedResult.spec_markdown : generatedResult.prompt_markdown
    navigator.clipboard.writeText(textToCopy)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  const handleDownloadMarkdown = (type: 'prompt' | 'spec') => {
    if (!generatedResult) return
    const content = type === 'spec' ? generatedResult.spec_markdown : generatedResult.prompt_markdown
    const filename = type === 'spec' ? 'SPEC.md' : 'PROMPT.md'
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  if (selectedPapers.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="size-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-4">
          <Sparkles className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2 text-balance">
          AI Agent Project Idea & Prompt Studio
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto mb-6 text-pretty">
          Transform latest arXiv research findings and extracted paper limitations into comprehensive, production-grade engineering prompts for Antigravity, Claude Code, Codex, or Cursor.
        </p>
        <button
          onClick={onNavigateToPapers}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-medium transition-colors"
        >
          <BookOpen className="size-4" />
          <span>Browse Papers & Select Research</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Configuration controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Selected Papers Header */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  Selected Research ({selectedPapers.length})
                </span>
                {selectedPapers.length > 1 && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/50">
                    Multi-Paper Synthesis
                  </span>
                )}
              </div>
              <button
                onClick={onClearSelectedPapers}
                className="text-xs text-zinc-400 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="size-3" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {selectedPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {paper.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500 flex-wrap">
                      <span className="font-mono">{paper.id}</span>
                      <span>•</span>
                      <span className="truncate">{paper.category}</span>
                      {paper.github_url && (
                        <a
                          href={paper.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-0.5 text-[10px] font-mono text-zinc-700 dark:text-zinc-300 hover:text-blue-600 font-medium px-1 py-0.2 rounded bg-zinc-200/70 dark:bg-zinc-800"
                        >
                          <GithubIcon className="size-2.5" />
                          <span>Code</span>
                        </a>
                      )}
                      {paper.hf_url && (
                        <a
                          href={paper.hf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-0.5 text-[10px] font-mono text-amber-700 dark:text-amber-300 hover:text-amber-600 font-medium px-1 py-0.2 rounded bg-amber-100/60 dark:bg-amber-950/40"
                        >
                          <HuggingFaceIcon className="size-2.5" />
                          <span>Model</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveSelectedPaper(paper.id)}
                    aria-label={`Remove ${paper.title}`}
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Form */}
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            
            {/* Target Agent Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Terminal className="size-3.5 text-blue-600 dark:text-blue-400" />
                <span>Target AI Coding Agent</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'antigravity', label: 'Antigravity', badge: 'Planning Mode' },
                  { id: 'claude_code', label: 'Claude Code', badge: 'TDD / CLI' },
                  { id: 'codex', label: 'Codex / GPT', badge: 'SPEC Mode' },
                  { id: 'cursor', label: 'Cursor / Windsurf', badge: '.cursorrules' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAgentTarget(item.id as any)}
                    className={cn(
                      'p-2 rounded-lg border text-left transition-all',
                      agentTarget === item.id
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 font-medium ring-1 ring-blue-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300 bg-zinc-50/50 dark:bg-zinc-950/40'
                    )}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{item.badge}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Project Archetype */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Layers className="size-3.5 text-zinc-500" />
                <span>Project Archetype</span>
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden font-medium"
              >
                <option value="fullstack">Full-Stack Production System (Backend + UI)</option>
                <option value="cli">Developer CLI & Automation Engine</option>
                <option value="library">Open-Source Modular Library / Core SDK</option>
                <option value="benchmark">Empirical Benchmark & Stress-Test Harness</option>
                <option value="security_tool">Adversarial Defense / Runtime Mediation Gateway</option>
                <option value="research_poc">Proof-of-Concept Research Prototype</option>
              </select>
            </div>

            {/* Tech Stack */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Code2 className="size-3.5 text-zinc-500" />
                <span>Implementation Stack</span>
              </label>
              <select
                value={techStack}
                onChange={(e) => setTechStack(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden font-medium"
              >
                <option value="python_fastapi_react">Python (FastAPI) + React / TypeScript + Tailwind CSS</option>
                <option value="rust_cli">Rust (Tokio, Clap, Anyhow - High Performance)</option>
                <option value="typescript_node">TypeScript / Node.js (Hono, Zod, Vitest)</option>
                <option value="go_backend">Go (Golang Microservice & Distributed Engine)</option>
                <option value="python_ml">Python Research Suite (PyTorch, HuggingFace, Scikit-learn)</option>
              </select>
            </div>

            {/* Focus Angle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Shield className="size-3.5 text-zinc-500" />
                <span>Primary Engineering Angle</span>
              </label>
              <select
                value={focusAngle}
                onChange={(e) => setFocusAngle(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden font-medium"
              >
                <option value="solve_limitations">Solve & Overcome Paper's Stated Limitations</option>
                <option value="hybrid_synthesis">Synthesize Multiple Papers into Hybrid Architecture</option>
                <option value="productionize">Productionize Theory into Battle-Tested System</option>
                <option value="reproducible_eval">Automated Reproducibility & Benchmark Suite</option>
              </select>
            </div>

            {/* Custom Project Name (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Custom Project Name (Optional)
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. AgentGuard-Engine"
                className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
              />
            </div>

            {/* Custom Notes / Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Custom Requirements or Constraints (Optional)
              </label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Include SQLite caching, require 95%+ test coverage, use Docker for deployment..."
                className="w-full h-20 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden resize-none font-mono"
              />
            </div>

          </div>

        </div>

        {/* Right column: Generated Prompt & Spec Viewer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          <div className="flex-1 flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden min-h-[600px]">
            
            {/* View Switcher & Action Bar */}
            <div className="p-3 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap bg-zinc-50/60 dark:bg-zinc-950/60">
              
              <div className="flex items-center gap-1 bg-zinc-200/70 dark:bg-zinc-800 p-0.5 rounded-lg">
                <button
                  onClick={() => setActiveView('prompt')}
                  className={cn(
                    'px-3 py-1 rounded-md text-xs font-medium transition-all',
                    activeView === 'prompt'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  )}
                >
                  Agent Prompt
                </button>
                <button
                  onClick={() => setActiveView('spec')}
                  className={cn(
                    'px-3 py-1 rounded-md text-xs font-medium transition-all',
                    activeView === 'spec'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  )}
                >
                  SPEC.md
                </button>
                <button
                  onClick={() => setActiveView('files')}
                  className={cn(
                    'px-3 py-1 rounded-md text-xs font-medium transition-all',
                    activeView === 'files'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  )}
                >
                  Suggested Files ({generatedResult?.suggested_files.length || 0})
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {generatedResult && (
                  <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
                    ~{generatedResult.estimated_tokens} tokens
                  </span>
                )}

                <button
                  onClick={handleCopyPrompt}
                  disabled={!generatedResult}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-xs',
                    hasCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  )}
                >
                  {hasCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  <span>{hasCopied ? 'Copied Prompt!' : 'Copy for AI Agent'}</span>
                </button>

                <button
                  onClick={() => handleDownloadMarkdown(activeView === 'spec' ? 'spec' : 'prompt')}
                  disabled={!generatedResult}
                  aria-label="Download prompt as markdown"
                  className="size-8 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Download className="size-3.5" />
                </button>
              </div>

            </div>

            {/* Prompt View Content */}
            <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed bg-zinc-50/30 dark:bg-zinc-950/30">
              {isLoading ? (
                <div className="flex items-center justify-center h-64 text-zinc-400 gap-2">
                  <RefreshCw className="size-5 animate-spin text-blue-600" />
                  <span>Synthesizing paper limitations and formulating AI directives...</span>
                </div>
              ) : generatedResult ? (
                activeView === 'prompt' ? (
                  <pre className="whitespace-pre-wrap font-mono select-all">
                    {generatedResult.prompt_markdown}
                  </pre>
                ) : activeView === 'spec' ? (
                  <pre className="whitespace-pre-wrap font-mono select-all">
                    {generatedResult.spec_markdown}
                  </pre>
                ) : (
                  <div className="space-y-3 font-sans">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                      Recommended File Scaffolding
                    </h4>
                    <div className="p-4 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs space-y-1">
                      {generatedResult.suggested_files.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <FileCode className="size-3.5 text-blue-400 shrink-0" />
                          <span>{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ) : null}
            </div>

            {/* Footer notice */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-[11px] text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Info className="size-3.5 text-blue-500" />
                <span>Ready to paste directly into Antigravity, Claude Code, or Codex chat.</span>
              </div>
              <span className="font-mono">Target: {agentTarget.toUpperCase()}</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
