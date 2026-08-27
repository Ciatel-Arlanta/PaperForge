import React, { useState, useEffect, useRef } from 'react'
import {
  Play,
  Square,
  RefreshCw,
  Terminal,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import type { ScrapeJobStatus } from '../types'
import { cn } from '../lib/utils'

interface ScraperConsoleProps {
  onJobFinished: () => void
}

export const ScraperConsole: React.FC<ScraperConsoleProps> = ({ onJobFinished }) => {
  const [selectedPreset, setSelectedPreset] = useState<'all' | 'ai_cyber' | 'ai' | 'cyber' | 'custom'>('ai_cyber')
  const [customQuery, setCustomQuery] = useState('')
  const [maxResults, setMaxResults] = useState(10)
  const [downloadPdf, setDownloadPdf] = useState(true)

  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [jobStatus, setJobStatus] = useState<ScrapeJobStatus | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const logEndRef = useRef<HTMLDivElement>(null)

  // Polling active job
  useEffect(() => {
    if (!activeJobId) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scrape/status/${activeJobId}`)
        if (res.ok) {
          const data: ScrapeJobStatus = await res.json()
          setJobStatus(data)
          if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
            clearInterval(interval)
            onJobFinished()
          }
        }
      } catch (err) {
        console.error('Error polling scrape job status:', err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [activeJobId])

  // Scroll to bottom of logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [jobStatus?.logs])

  const handleStartScrape = async () => {
    setIsStarting(true)
    try {
      let bodyPayload: any = {
        download_pdf: downloadPdf,
        max_results: maxResults
      }

      if (selectedPreset === 'custom') {
        bodyPayload.custom_query = customQuery || 'cat:cs.AI'
      } else if (selectedPreset === 'ai_cyber') {
        bodyPayload.queries = [
          { name: 'AI & Cybersecurity Intersection', query: '(cat:cs.CR) AND (cat:cs.AI OR cat:cs.LG OR cat:cs.CL)', limit: maxResults }
        ]
      } else if (selectedPreset === 'ai') {
        bodyPayload.queries = [
          { name: 'AI Only', query: 'cat:cs.AI OR cat:cs.LG OR cat:cs.CL', limit: maxResults }
        ]
      } else if (selectedPreset === 'cyber') {
        bodyPayload.queries = [
          { name: 'Cybersecurity Only', query: 'cat:cs.CR', limit: maxResults }
        ]
      } else {
        bodyPayload.queries = [
          { name: 'AI & Cybersecurity Intersection', query: '(cat:cs.CR) AND (cat:cs.AI OR cat:cs.LG OR cat:cs.CL)', limit: Math.ceil(maxResults * 0.6) },
          { name: 'AI Only', query: 'cat:cs.AI OR cat:cs.LG OR cat:cs.CL', limit: Math.ceil(maxResults * 0.25) },
          { name: 'Cybersecurity Only', query: 'cat:cs.CR', limit: Math.ceil(maxResults * 0.15) }
        ]
      }

      const res = await fetch('/api/scrape/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      })

      if (res.ok) {
        const data = await res.json()
        setActiveJobId(data.job_id)
      }
    } catch (err) {
      console.error('Failed to start scrape:', err)
    } finally {
      setIsStarting(false)
    }
  }

  const handleCancelScrape = async () => {
    if (!activeJobId) return
    try {
      await fetch(`/api/scrape/cancel/${activeJobId}`, { method: 'POST' })
    } catch (err) {
      console.error('Failed to cancel scrape:', err)
    }
  }

  const isRunning = jobStatus?.status === 'running'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Live arXiv Scraper & Ingestion Console
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Query the arXiv API, download recent research papers, and automatically extract conclusions and limitations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Query Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Scrape Parameters
            </h3>

            {/* Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Category Scope
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'ai_cyber', name: 'AI & Cybersecurity Intersection', desc: '(cat:cs.CR) AND (cat:cs.AI OR cat:cs.LG)' },
                  { id: 'all', name: 'Standard Multi-Domain Suite', desc: 'Balanced query across AI, Security, & Intersection' },
                  { id: 'ai', name: 'AI & Machine Learning Only', desc: 'cat:cs.AI OR cat:cs.LG OR cat:cs.CL' },
                  { id: 'cyber', name: 'Cybersecurity Only', desc: 'cat:cs.CR' },
                  { id: 'custom', name: 'Custom arXiv Query', desc: 'Direct search query syntax' }
                ].map((item) => (
                  <button
                    key={item.id}
                    disabled={isRunning}
                    onClick={() => setSelectedPreset(item.id as any)}
                    className={cn(
                      'p-2.5 rounded-lg border text-left transition-all text-xs',
                      selectedPreset === item.id
                        ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 font-medium ring-1 ring-blue-500/20 text-zinc-900 dark:text-zinc-100'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 bg-zinc-50/40 dark:bg-zinc-950/40'
                    )}
                  >
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono truncate">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom query input */}
            {selectedPreset === 'custom' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Custom arXiv Query String
                </label>
                <input
                  type="text"
                  disabled={isRunning}
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder={'e.g. ti:"agent" AND cat:cs.CR'}
                  className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                />
              </div>
            )}

            {/* Max results slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <span>Maximum Papers to Ingest</span>
                <span className="font-mono tabular-nums">{maxResults} papers</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                step="2"
                disabled={isRunning}
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* PDF Download Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pdf_dl"
                disabled={isRunning}
                checked={downloadPdf}
                onChange={(e) => setDownloadPdf(e.target.checked)}
                className="rounded border-zinc-300 accent-blue-600 size-4"
              />
              <label htmlFor="pdf_dl" className="text-xs text-zinc-700 dark:text-zinc-300 select-none">
                Download PDF locally and parse with PyMuPDF
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              {!isRunning ? (
                <button
                  onClick={handleStartScrape}
                  disabled={isStarting}
                  className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-xs"
                >
                  <Play className="size-3.5 fill-white" />
                  <span>{isStarting ? 'Initiating Scrape...' : 'Start arXiv Ingestion'}</span>
                </button>
              ) : (
                <button
                  onClick={handleCancelScrape}
                  className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  <Square className="size-3.5 fill-white" />
                  <span>Cancel Current Job</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right: Live Console Terminal (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 shadow-xs overflow-hidden flex flex-col h-[480px]">
            
            {/* Terminal Top Bar */}
            <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-zinc-400" />
                <span className="text-xs font-mono font-medium text-zinc-300">
                  Ingestion Log Terminal
                </span>
              </div>

              {jobStatus && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  {jobStatus.status === 'running' && (
                    <span className="inline-flex items-center gap-1.5 text-blue-400">
                      <RefreshCw className="size-3 animate-spin" />
                      <span>Running</span>
                    </span>
                  )}
                  {jobStatus.status === 'completed' && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="size-3" />
                      <span>Completed ({jobStatus.new_papers_count} new)</span>
                    </span>
                  )}
                  {jobStatus.status === 'cancelled' && (
                    <span className="inline-flex items-center gap-1.5 text-amber-400">
                      <AlertCircle className="size-3" />
                      <span>Cancelled</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Terminal Output */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-zinc-300 space-y-1.5 leading-relaxed">
              {jobStatus && jobStatus.logs.length > 0 ? (
                jobStatus.logs.map((log, index) => (
                  <div
                    key={index}
                    className={cn(
                      'text-xs',
                      log.includes('Error') || log.includes('failed')
                        ? 'text-red-400'
                        : log.includes('Indexed:') || log.includes('Completed')
                        ? 'text-emerald-300'
                        : log.includes('Searching')
                        ? 'text-blue-300'
                        : 'text-zinc-300'
                    )}
                  >
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-zinc-500 italic flex items-center justify-center h-full">
                  No active scrape job. Configure parameters and click "Start arXiv Ingestion" to begin.
                </div>
              )}
              <div ref={logEndRef} />
            </div>

            {/* Progress footer */}
            {jobStatus && (
              <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
                <div className="truncate max-w-sm">
                  {jobStatus.current_paper ? (
                    <span>Processing: {jobStatus.current_paper}</span>
                  ) : (
                    <span>Status: {jobStatus.status.toUpperCase()}</span>
                  )}
                </div>
                <div className="tabular-nums">
                  {jobStatus.new_papers_count} papers added
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  )
}
