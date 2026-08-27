import React, { useState } from 'react'
import {
  Star,
  ExternalLink,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { GithubIcon, HuggingFaceIcon } from './Icons'
import type { Paper } from '../types'
import { cn } from '../lib/utils'

interface PaperCardProps {
  paper: Paper
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onToggleBookmark: (id: string) => void
  onOpenDetails: (paper: Paper) => void
  onDirectPrompt: (paper: Paper) => void
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  isSelected,
  onToggleSelect,
  onToggleBookmark,
  onOpenDetails,
  onDirectPrompt
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState<'abstract' | 'conclusion' | 'limitations'>('abstract')

  const hasLimitations = paper.limitations && paper.limitations !== 'Not found.' && paper.limitations.length > 20
  const hasConclusion = paper.conclusion && paper.conclusion !== 'Not found.' && paper.conclusion.length > 20

  return (
    <div
      className={cn(
        'group relative rounded-lg border transition-all duration-150 bg-white dark:bg-zinc-900',
        isSelected
          ? 'border-blue-500/80 ring-1 ring-blue-500/30 bg-blue-50/20 dark:bg-blue-950/10'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
      )}
    >
      <div className="p-4 sm:p-5">
        
        {/* Top bar: Category + Status Badges + Actions */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Checkbox for Prompt Studio selection */}
            <button
              onClick={() => onToggleSelect(paper.id)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium transition-colors border',
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
              )}
              aria-label={isSelected ? 'Deselect paper for prompt' : 'Select paper for prompt'}
            >
              <CheckCircle2 className={cn('size-3.5', isSelected ? 'opacity-100' : 'opacity-40')} />
              <span>{isSelected ? 'Selected' : 'Select'}</span>
            </button>

            {/* Category tag */}
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
              {paper.category}
            </span>

            {/* Limitations indicator badge */}
            {hasLimitations ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Limitations Identified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 dark:text-zinc-500 border border-zinc-200/40 dark:border-zinc-800/40">
                No Stated Limitations
              </span>
            )}

            {/* GitHub Code Available Badge */}
            {paper.github_url && (
              <a
                href={paper.github_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label="Open GitHub Repository"
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white border border-transparent shadow-xs transition-colors"
              >
                <GithubIcon className="size-3" />
                <span>GitHub</span>
              </a>
            )}

            {/* HuggingFace Models Badge */}
            {paper.hf_url && (
              <a
                href={paper.hf_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label="Open Hugging Face Model"
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 hover:bg-amber-200 border border-amber-300 dark:border-amber-800 shadow-xs transition-colors"
              >
                <HuggingFaceIcon className="size-3" />
                <span>Model</span>
              </a>
            )}
          </div>

          {/* Right actions: Bookmark & ArXiv link */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleBookmark(paper.id)}
              aria-label={paper.is_bookmarked ? 'Remove from bookmarks' : 'Bookmark this paper'}
              className={cn(
                'size-7 rounded flex items-center justify-center transition-colors',
                paper.is_bookmarked
                  ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/30'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}
            >
              <Star className={cn('size-3.5', paper.is_bookmarked && 'fill-amber-500')} />
            </button>

            <a
              href={paper.url}
              target="_blank"
              rel="noreferrer"
              aria-label="Open arXiv abstract page"
              className="size-7 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>

        {/* Paper Title */}
        <h3
          onClick={() => onOpenDetails(paper)}
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors text-balance leading-snug mb-1"
        >
          {paper.title}
        </h3>

        {/* Authors */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 truncate">
          {paper.authors.length > 0 ? paper.authors.join(', ') : 'Authors not listed'}
        </p>

        {/* Abstract snippet or tabbed preview */}
        <div className="text-xs text-zinc-600 dark:text-zinc-300 text-pretty leading-relaxed mb-3">
          {!isExpanded ? (
            <p className="line-clamp-2">
              {paper.abstract}
            </p>
          ) : (
            <div className="mt-2 space-y-2.5">
              {/* Sub-tabs inside expanded card */}
              <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                <button
                  onClick={() => setActiveSubTab('abstract')}
                  className={cn(
                    'px-2 py-0.5 text-[11px] font-medium rounded',
                    activeSubTab === 'abstract'
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  )}
                >
                  Abstract
                </button>
                <button
                  onClick={() => setActiveSubTab('conclusion')}
                  className={cn(
                    'px-2 py-0.5 text-[11px] font-medium rounded',
                    activeSubTab === 'conclusion'
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  )}
                >
                  Conclusion {hasConclusion && '•'}
                </button>
                <button
                  onClick={() => setActiveSubTab('limitations')}
                  className={cn(
                    'px-2 py-0.5 text-[11px] font-medium rounded',
                    activeSubTab === 'limitations'
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  )}
                >
                  Limitations {hasLimitations && '•'}
                </button>
              </div>

              {/* Subtab content */}
              <div className="p-3 rounded bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800/60 max-h-56 overflow-y-auto">
                {activeSubTab === 'abstract' && (
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {paper.abstract}
                  </p>
                )}
                {activeSubTab === 'conclusion' && (
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {paper.conclusion}
                  </p>
                )}
                {activeSubTab === 'limitations' && (
                  <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {hasLimitations ? (
                      <div>
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold mb-1">
                          <AlertCircle className="size-3.5" />
                          <span>Explicit Limitations & Future Directions</span>
                        </div>
                        <p>{paper.limitations}</p>
                      </div>
                    ) : (
                      <p className="text-zinc-400 dark:text-zinc-500 italic">
                        No specific limitations section identified during PDF/HTML extraction.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium py-1"
            >
              <span>{isExpanded ? 'Collapse' : 'Inspect Insights'}</span>
              {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>

            {paper.pdf_path && paper.pdf_path !== 'Not downloaded' && (
              <a
                href={`/api/pdf/${paper.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium py-1"
              >
                <FileText className="size-3.5" />
                <span>PDF</span>
              </a>
            )}
          </div>

          {/* Direct prompt trigger */}
          <button
            onClick={() => onDirectPrompt(paper)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-medium text-xs transition-colors"
          >
            <Sparkles className="size-3" />
            <span>Generate Prompt</span>
          </button>
        </div>

      </div>
    </div>
  )
}
