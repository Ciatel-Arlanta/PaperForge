import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Sparkles,
  BookOpen,
  ArrowRight,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Star
} from 'lucide-react'

import type { Paper, PaperListResponse, StatsResponse } from './types'
import { Header } from './components/Header'
import { PaperCard } from './components/PaperCard'
import { PaperModal } from './components/PaperModal'
import { PromptStudio } from './components/PromptStudio'
import { ScraperConsole } from './components/ScraperConsole'
import { AnalyticsView } from './components/AnalyticsView'
import { PaperCardSkeleton } from './components/SkeletonLoader'
import { GithubIcon } from './components/Icons'
import { cn } from './lib/utils'

export function App() {
  const [activeTab, setActiveTab] = useState<'papers' | 'prompt' | 'scraper' | 'analytics'>('papers')
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    const saved = localStorage.getItem('project_finder_theme')
    if (saved !== null) {
      return saved === 'dark'
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Data states
  const [papers, setPapers] = useState<Paper[]>([])
  const [totalPapers, setTotalPapers] = useState<number>(0)
  const [categories, setCategories] = useState<string[]>([])
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [hasLimitationsOnly, setHasLimitationsOnly] = useState<boolean>(false)
  const [hasCodeOnly, setHasCodeOnly] = useState<boolean>(false)
  const [bookmarkedOnly, setBookmarkedOnly] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<string>('id')
  const [sortOrder, setSortOrder] = useState<string>('desc')
  const [page, setPage] = useState<number>(1)
  const limit = 20

  // Selection & Modal states
  const [selectedPaperIds, setSelectedPaperIds] = useState<Set<string>>(new Set())
  const [modalPaper, setModalPaper] = useState<Paper | null>(null)

  // Sync dark mode class with HTML element & local storage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
      localStorage.setItem('project_finder_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
      localStorage.setItem('project_finder_theme', 'light')
    }
  }, [isDarkMode])

  // Fetch papers
  const fetchPapers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder
      })

      if (searchQuery.trim()) params.append('search', searchQuery.trim())
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory)
      if (hasLimitationsOnly) params.append('has_limitations', 'true')
      if (hasCodeOnly) params.append('has_code', 'true')
      if (bookmarkedOnly) params.append('bookmarked_only', 'true')

      const res = await fetch(`/api/papers?${params.toString()}`)
      if (res.ok) {
        const data: PaperListResponse = await res.json()
        setPapers(data.papers)
        setTotalPapers(data.total)
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories)
        }
      }
    } catch (err) {
      console.error('Failed to fetch papers:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats')
      if (res.ok) {
        const data: StatsResponse = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  useEffect(() => {
    fetchPapers()
  }, [page, selectedCategory, hasLimitationsOnly, hasCodeOnly, bookmarkedOnly, sortBy, sortOrder])

  useEffect(() => {
    fetchStats()
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchPapers()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Handlers
  const handleToggleSelect = (paperId: string) => {
    setSelectedPaperIds((prev) => {
      const next = new Set(prev)
      if (next.has(paperId)) {
        next.delete(paperId)
      } else {
        next.add(paperId)
      }
      return next
    })
  }

  const handleToggleBookmark = async (paperId: string) => {
    try {
      const res = await fetch(`/api/papers/${paperId}/bookmark`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setPapers((prev) =>
          prev.map((p) => (p.id === paperId ? { ...p, is_bookmarked: data.is_bookmarked } : p))
        )
        fetchStats()
      }
    } catch (err) {
      console.error('Failed to bookmark paper:', err)
    }
  }

  const handleUpdateNotes = async (paperId: string, notes: string) => {
    try {
      await fetch(`/api/papers/${paperId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      setPapers((prev) =>
        prev.map((p) => (p.id === paperId ? { ...p, notes } : p))
      )
    } catch (err) {
      console.error('Failed to update notes:', err)
    }
  }

  const handleDirectPrompt = (paper: Paper) => {
    setSelectedPaperIds(new Set([paper.id]))
    setActiveTab('prompt')
  }

  const totalPages = Math.ceil(totalPapers / limit) || 1

  return (
    <div className="min-h-dvh flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCount={selectedPaperIds.size}
        totalPapers={stats?.total_papers || totalPapers}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main Tab Content */}
      <main className="flex-1 pb-24">
        {activeTab === 'papers' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* Search & Filter Bar */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles, abstracts, conclusions, or limitations..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 transition-all"
                  />
                </div>

                {/* Quick Filters */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setHasLimitationsOnly(!hasLimitationsOnly)
                      setPage(1)
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors',
                      hasLimitationsOnly
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    )}
                  >
                    <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Has Limitations</span>
                  </button>

                  <button
                    onClick={() => {
                      setHasCodeOnly(!hasCodeOnly)
                      setPage(1)
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors',
                      hasCodeOnly
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                        : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    )}
                  >
                    <GithubIcon className="size-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Has Code</span>
                  </button>

                  <button
                    onClick={() => {
                      setBookmarkedOnly(!bookmarkedOnly)
                      setPage(1)
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors',
                      bookmarkedOnly
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    )}
                  >
                    <Star className="size-3.5 text-amber-500 fill-amber-500" />
                    <span>Starred</span>
                  </button>

                  <button
                    onClick={() => fetchPapers()}
                    aria-label="Refresh papers"
                    className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <RefreshCw className="size-4" />
                  </button>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-zinc-400 font-mono text-[11px] mr-1 flex items-center gap-1">
                  <Filter className="size-3" />
                  <span>Category:</span>
                </span>

                {['All', ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat)
                      setPage(1)
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-md whitespace-nowrap transition-colors text-xs font-medium',
                      selectedCategory === cat
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                        : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

            </div>

            {/* Results count & Sorting info */}
            <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
              <span className="font-mono tabular-nums">
                Showing {papers.length} of {totalPapers} research papers
              </span>
              <div className="flex items-center gap-2">
                <span>Sort:</span>
                <select
                  value={`${sortBy}_${sortOrder}`}
                  onChange={(e) => {
                    const [col, dir] = e.target.value.split('_')
                    setSortBy(col)
                    setSortOrder(dir)
                  }}
                  className="bg-transparent border-none text-zinc-700 dark:text-zinc-300 font-medium focus:outline-hidden cursor-pointer"
                >
                  <option value="id_desc">Newest arXiv ID</option>
                  <option value="id_asc">Oldest arXiv ID</option>
                  <option value="title_asc">Title (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Paper Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <PaperCardSkeleton key={i} />
                ))}
              </div>
            ) : papers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {papers.map((paper) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    isSelected={selectedPaperIds.has(paper.id)}
                    onToggleSelect={handleToggleSelect}
                    onToggleBookmark={handleToggleBookmark}
                    onOpenDetails={(p) => setModalPaper(p)}
                    onDirectPrompt={handleDirectPrompt}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center space-y-3">
                <BookOpen className="size-8 text-zinc-400 mx-auto" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  No matching research papers found
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Try adjusting your search terms or filters, or use the Live Scraper to ingest new papers.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('All')
                    setHasLimitationsOnly(false)
                    setBookmarkedOnly(false)
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium hover:bg-zinc-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 tabular-nums px-3">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}

          </div>
        )}

        {activeTab === 'prompt' && (
          <PromptStudio
            selectedPapers={papers.filter((p) => selectedPaperIds.has(p.id))}
            onRemoveSelectedPaper={handleToggleSelect}
            onClearSelectedPapers={() => setSelectedPaperIds(new Set())}
            onNavigateToPapers={() => setActiveTab('papers')}
          />
        )}

        {activeTab === 'scraper' && (
          <ScraperConsole
            onJobFinished={() => {
              fetchPapers()
              fetchStats()
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            stats={stats}
            onFilterByTheme={(theme) => {
              setSearchQuery(theme)
              setActiveTab('papers')
            }}
          />
        )}
      </main>

      {/* Floating Bottom Selection Bar (when papers are selected on 'papers' tab) */}
      {activeTab === 'papers' && selectedPaperIds.size > 0 && (
        <div className="fixed bottom-4 inset-x-0 z-40 max-w-xl mx-auto px-4">
          <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/95 text-white shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center gap-2">
              <span className="size-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center tabular-nums">
                {selectedPaperIds.size}
              </span>
              <span className="text-xs font-medium text-zinc-200">
                {selectedPaperIds.size === 1 ? '1 paper selected' : `${selectedPaperIds.size} papers selected`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedPaperIds(new Set())}
                className="px-2.5 py-1 rounded text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Clear
              </button>

              <button
                onClick={() => setActiveTab('prompt')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs"
              >
                <Sparkles className="size-3.5" />
                <span>Launch in AI Prompt Studio</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paper Inspection Modal */}
      <PaperModal
        paper={modalPaper}
        onClose={() => setModalPaper(null)}
        onToggleBookmark={handleToggleBookmark}
        onSelectForPrompt={handleDirectPrompt}
        onUpdateNotes={handleUpdateNotes}
      />

    </div>
  )
}

export default App
