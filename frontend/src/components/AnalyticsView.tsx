import React from 'react'
import { ShieldAlert, BookOpen, Star, FileText, ArrowUpRight } from 'lucide-react'
import type { StatsResponse } from '../types'

interface AnalyticsViewProps {
  stats: StatsResponse | null
  onFilterByTheme: (theme: string) => void
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, onFilterByTheme }) => {
  if (!stats) return null

  const limitationPercentage = stats.total_papers > 0
    ? Math.round((stats.papers_with_limitations / stats.total_papers) * 100)
    : 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Research & Limitation Taxonomy Analytics
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Aggregate insights, paper category distributions, and recurring engineering bottlenecks across papers.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium uppercase font-mono">Total Papers</span>
            <BookOpen className="size-4" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
            {stats.total_papers}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Across arXiv AI & Security categories
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono">Extracted Limitations</span>
            <ShieldAlert className="size-4" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
            {stats.papers_with_limitations}
            <span className="text-xs font-normal text-zinc-500 ml-1.5 font-mono">({limitationPercentage}%)</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Gaps ready for engineering solutions
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono">Local PDFs Cached</span>
            <FileText className="size-4" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
            {stats.papers_with_pdfs}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Full-text available for deep extraction
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-xs font-medium uppercase font-mono">Bookmarked Papers</span>
            <Star className="size-4 fill-amber-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
            {stats.bookmarked_papers}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Starred for project formulation
          </div>
        </div>

      </div>

      {/* Two columns: Category Breakdown & Limitation Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Categories (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
            Category Breakdown
          </h3>

          <div className="space-y-3">
            {Object.entries(stats.categories).map(([category, count]) => {
              const pct = stats.total_papers > 0 ? Math.round((count / stats.total_papers) * 100) : 0
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    <span className="truncate">{category}</span>
                    <span className="font-mono tabular-nums text-zinc-500">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Common Limitation Themes (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Common Research Bottlenecks & Opportunity Themes
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stats.common_limitations.map((item) => (
              <div
                key={item.theme}
                onClick={() => onFilterByTheme(item.theme.split('/')[0].trim())}
                className="group p-3.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 hover:border-blue-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.theme}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 tabular-nums">
                      {item.count}
                    </span>
                    <ArrowUpRight className="size-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed text-pretty">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}
