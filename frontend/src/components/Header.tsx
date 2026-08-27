import React from 'react'
import { Sparkles, BookOpen, DownloadCloud, BarChart3, Sun, Moon, Layers } from 'lucide-react'
import { cn } from '../lib/utils'

interface HeaderProps {
  activeTab: 'papers' | 'prompt' | 'scraper' | 'analytics'
  setActiveTab: (tab: 'papers' | 'prompt' | 'scraper' | 'analytics') => void
  selectedCount: number
  totalPapers: number
  isDarkMode: boolean
  setIsDarkMode: (val: boolean) => void
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedCount,
  totalPapers,
  isDarkMode,
  setIsDarkMode
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-sm">
            <Layers className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-zinc-50 text-base tracking-tight">
                ProjectFinder
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                Research-to-Code
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
              {totalPapers} indexed research papers
            </p>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('papers')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              activeTab === 'papers'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            )}
          >
            <BookOpen className="size-3.5" />
            <span>Papers</span>
          </button>

          <button
            onClick={() => setActiveTab('prompt')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all relative',
              activeTab === 'prompt'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            )}
          >
            <Sparkles className="size-3.5 text-blue-600 dark:text-blue-400" />
            <span>AI Prompt Studio</span>
            {selectedCount > 0 && (
              <span className="size-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {selectedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('scraper')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              activeTab === 'scraper'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            )}
          >
            <DownloadCloud className="size-3.5" />
            <span>Live Scraper</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              activeTab === 'analytics'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            )}
          >
            <BarChart3 className="size-3.5" />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle light and dark mode"
            className="size-8 rounded-md border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>

      </div>
    </header>
  )
}
