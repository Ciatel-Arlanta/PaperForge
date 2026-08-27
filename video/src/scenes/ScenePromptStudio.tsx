import React from 'react'
import {
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig
} from 'remotion'
import {
  Sparkles,
  Bot,
  Terminal,
  Copy,
  Check,
  Code2,
  FileText
} from 'lucide-react'
import { BackgroundGrid } from '../components/BackgroundGrid'
import { BrowserFrame } from '../components/BrowserFrame'

export const ScenePromptStudio: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  const browserProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15 }
  })

  // Token ticker
  const tokenCount = Math.min(2840, Math.floor(interpolate(frame, [25, 120], [0, 2840], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })))

  // Copy click pulse
  const copyClicked = frame > 90
  const copyScale = copyClicked ? interpolate(frame, [90, 100, 110], [1, 0.94, 1]) : 1

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '35px 60px',
        overflow: 'hidden'
      }}
    >
      <BackgroundGrid accentColor="#8b5cf6" />

      {/* Top Header & Agent Targets */}
      <div
        style={{
          zIndex: 10,
          textAlign: 'center',
          opacity: headerOpacity,
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#c084fc',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}
          >
            <Sparkles size={14} />
            <span>AI Agent Prompt Studio</span>
          </span>

          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#34d399',
              fontWeight: 700,
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              padding: '4px 12px',
              borderRadius: '9999px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            ⚡ {tokenCount.toLocaleString()} Tokens Synthesized
          </span>
        </div>

        <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '12px' }}>
          Formulate Agent Prompts for{' '}
          <span style={{ color: '#c084fc' }}>Antigravity</span>,{' '}
          <span style={{ color: '#fb923c' }}>Claude Code</span>, &{' '}
          <span style={{ color: '#60a5fa' }}>Codex</span>
        </h2>
      </div>

      {/* Real App Prompt Studio Screenshot in 3D Browser */}
      <div
        style={{
          zIndex: 10,
          width: '100%',
          maxWidth: '1400px',
          opacity: browserProgress
        }}
      >
        <BrowserFrame
          imageSrc="screenshots/04_prompt_studio_compiled.png"
          url="http://localhost:8000/#prompt"
          scale={0.97}
          rotateX={3}
          boxShadow="0 35px 90px rgba(0, 0, 0, 0.8), 0 0 60px rgba(139, 92, 246, 0.25)"
        />
      </div>
    </div>
  )
}
