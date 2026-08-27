import React, { useState, useEffect } from 'react'
import {
  X,
  ExternalLink,
  FileText,
  Star,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Save,
  Maximize2
} from 'lucide-react'
import { GithubIcon, HuggingFaceIcon } from './Icons'
import type { Paper } from '../types'
import { cn } from '../lib/utils'

interface PaperModalProps {
  paper: Paper | null
  onClose: () => void
  onToggleBookmark: (id: string) => void
  onSelectForPrompt: (paper: Paper) => void
  onUpdateNotes: (paperId: string, notes: string) => void
}

export const PaperModal: React.FC<PaperModalProps> = ({
  paper,
  onClose,
  onToggleBookmark,
  onSelectForPrompt,
  onUpdateNotes
}) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'pdf' | 'notes'>('insights')
  const [notesText, setNotesText] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (paper) {
      setNotesText(paper.notes || '')
      setIsSaved(false)
      setActiveTab('insights')
    }
  }, [paper])

  if (!paper) return null

  const handleSaveNotes = () => {
    onUpdateNotes(paper.id, notesText)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const hasLimitations = paper.limitations && paper.limitations !== 'Not found.' && paper.limitations.length > 10
  const hasConclusion = paper.conclusion && paper.conclusion !== 'Not found.' && paper.conclusion.length > 10
  const hasPdf = paper.pdf_path && paper.pdf_path !== 'Not downloaded'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl max-h-[92dvh] flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 pr-6">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {paper.id}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                {paper.category}
              </span>
              {hasLimitations && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                  Limitations Extracted
                </span>
              )}
              {paper.github_url && (
                <a
                  href={paper.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 border border-zinc-300 dark:border-zinc-700 transition-colors"
                >
                  <GithubIcon className="size-3" />
                  <span>GitHub Repository</span>
                </a>
              )}
              {paper.hf_url && (
                <a
                  href={paper.hf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:text-amber-600 border border-amber-300 dark:border-amber-800/60 transition-colors"
                >
                  <HuggingFaceIcon className="size-3" />
                  <span>Hugging Face Model</span>
                </a>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 text-balance leading-tight">
              {paper.title}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {paper.authors.length > 0 ? paper.authors.join(', ') : 'Authors not specified'}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleBookmark(paper.id)}
              aria-label="Bookmark paper"
              className={cn(
                'size-8 rounded-md border flex items-center justify-center transition-colors',
                paper.is_bookmarked
                  ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-500'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              )}
            >
              <Star className={cn('size-4', paper.is_bookmarked && 'fill-amber-500')} />
            </button>

            <button
              onClick={onClose}
              aria-label="Close details modal"
              className="size-8 rounded-md border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Tab selection */}
        <div className="px-6 border-b border-zinc-200 dark:border-zinc-800 flex gap-4 text-xs font-medium bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            onClick={() => setActiveTab('insights')}
            className={cn(
              'py-2.5 border-b-2 transition-colors',
              activeTab === 'insights'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            )}
          >
            Research Insights & Analysis
          </button>
          {hasPdf && (
            <button
              onClick={() => setActiveTab('pdf')}
              className={cn(
                'py-2.5 border-b-2 transition-colors flex items-center gap-1.5',
                activeTab === 'pdf'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              )}
            >
              <FileText className="size-3.5" />
              <span>Read Local PDF</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('notes')}
            className={cn(
              'py-2.5 border-b-2 transition-colors',
              activeTab === 'notes'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            )}
          >
            Project Notes & Tags {paper.notes && '•'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'insights' && (
            <div className="space-y-6">
              
              {/* Abstract */}
              <section className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Abstract
                </h4>
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/70 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {paper.abstract}
                </div>
              </section>

              {/* Grid of Conclusion & Limitations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Conclusion */}
                <section className="space-y-2 flex flex-col">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                    <CheckCircle2 className="size-3.5 text-zinc-600 dark:text-zinc-400" />
                    <span>Extracted Conclusion</span>
                  </div>
                  <div className="flex-1 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/70 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap">
                    {hasConclusion ? paper.conclusion : <span className="text-zinc-400 italic">No conclusion section extracted.</span>}
                  </div>
                </section>

                {/* Limitations */}
                <section className="space-y-2 flex flex-col">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold">
                    <AlertTriangle className="size-3.5" />
                    <span>Explicit Limitations & Gaps</span>
                  </div>
                  <div className="flex-1 p-4 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap">
                    {hasLimitations ? paper.limitations : <span className="text-zinc-400 italic">No limitations section identified in paper.</span>}
                  </div>
                </section>

              </div>

            </div>
          )}

          {activeTab === 'pdf' && hasPdf && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span>Rendering local PDF from `{paper.pdf_path}`</span>
                <a
                  href={`/api/pdf/${paper.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Maximize2 className="size-3.5" />
                  <span>Open in Full Tab</span>
                </a>
              </div>
              <div className="w-full h-[60dvh] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                <iframe
                  src={`/api/pdf/${paper.id}`}
                  title={paper.title}
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Custom Engineering Notes & Project Ideas
                </label>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Add your thoughts, implementation ideas, or notes on how to adapt this paper..."
                  className="w-full h-48 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 resize-none font-mono"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleSaveNotes}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-white transition-colors"
                >
                  <Save className="size-3.5" />
                  <span>Save Notes</span>
                </button>
                {isSaved && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Notes saved successfully!
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={paper.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            >
              <ExternalLink className="size-3.5" />
              <span>arXiv Source</span>
            </a>

            {paper.github_url && (
              <a
                href={paper.github_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              >
                <GithubIcon className="size-3.5" />
                <span>GitHub Repository</span>
              </a>
            )}

            {paper.hf_url && (
              <a
                href={paper.hf_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 dark:text-amber-300 hover:text-amber-600 px-3 py-1.5 rounded border border-amber-300 dark:border-amber-800 bg-white dark:bg-zinc-900"
              >
                <HuggingFaceIcon className="size-3.5" />
                <span>Hugging Face</span>
              </a>
            )}

            {hasPdf && (
              <a
                href={`/api/pdf/${paper.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              >
                <FileText className="size-3.5" />
                <span>View PDF in Tab</span>
              </a>
            )}
          </div>

          <button
            onClick={() => {
              onSelectForPrompt(paper)
              onClose()
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors"
          >
            <Sparkles className="size-3.5" />
            <span>Launch in AI Prompt Studio</span>
          </button>
        </div>

      </div>
    </div>
  )
}
