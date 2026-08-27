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
  Zap,
  Code2,
  FileText
} from 'lucide-react'
import { BackgroundGrid } from '../components/BackgroundGrid'

export const ScenePromptStudio: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Agent selector animations
  const agent1Progress = spring({ frame: frame - 10, fps, config: { damping: 14 } })
  const agent2Progress = spring({ frame: frame - 20, fps, config: { damping: 14 } })
  const agent3Progress = spring({ frame: frame - 30, fps, config: { damping: 14 } })
  const agent4Progress = spring({ frame: frame - 40, fps, config: { damping: 14 } })

  // Code editor streaming
  const codeBoxScale = spring({ frame: frame - 30, fps, config: { damping: 15 } })
  const tokenCount = Math.min(2840, Math.floor(interpolate(frame, [40, 130], [0, 2840], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })))

  // Copy button click animation
  const copyClicked = frame > 110
  const copyScale = copyClicked ? interpolate(frame, [110, 120, 130], [1, 0.92, 1]) : 1

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px'
      }}
    >
      <BackgroundGrid accentColor="#8b5cf6" />

      {/* Header Tag */}
      <div
        style={{
          zIndex: 10,
          textAlign: 'center',
          marginBottom: '28px'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: '#c084fc',
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}
        >
          <Sparkles size={18} />
          <span>Multi-Agent Prompt Studio</span>
        </div>
        <h2
          style={{
            fontSize: '46px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em'
          }}
        >
          Turn Research Gaps into{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #c084fc 0%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Executable AI Coding Blueprints
          </span>
        </h2>
      </div>

      {/* Agent Target Selector Bar */}
      <div
        style={{
          zIndex: 10,
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          width: '100%',
          maxWidth: '1250px',
          justifyContent: 'center'
        }}
      >
        {/* Antigravity (Active) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            borderRadius: '14px',
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            border: '2px solid #8b5cf6',
            boxShadow: '0 0 25px rgba(139, 92, 246, 0.4)',
            color: '#ffffff',
            opacity: agent1Progress,
            transform: `scale(${agent1Progress})`
          }}
        >
          <Bot size={24} color="#c084fc" />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>Google Antigravity</div>
            <div style={{ fontSize: '12px', color: '#c084fc' }}>Planning Mode & Harness</div>
          </div>
        </div>

        {/* Claude Code */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            borderRadius: '14px',
            backgroundColor: 'rgba(24, 24, 27, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#d4d4d8',
            opacity: agent2Progress,
            transform: `scale(${agent2Progress})`
          }}
        >
          <Terminal size={24} color="#f97316" />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>Claude Code</div>
            <div style={{ fontSize: '12px', color: '#a1a1aa' }}>TDD & CLAUDE.md</div>
          </div>
        </div>

        {/* OpenAI Codex */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            borderRadius: '14px',
            backgroundColor: 'rgba(24, 24, 27, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#d4d4d8',
            opacity: agent3Progress,
            transform: `scale(${agent3Progress})`
          }}
        >
          <FileText size={24} color="#10b981" />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>OpenAI Codex</div>
            <div style={{ fontSize: '12px', color: '#a1a1aa' }}>SPEC.md & Schemas</div>
          </div>
        </div>

        {/* Cursor */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            borderRadius: '14px',
            backgroundColor: 'rgba(24, 24, 27, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#d4d4d8',
            opacity: agent4Progress,
            transform: `scale(${agent4Progress})`
          }}
        >
          <Code2 size={24} color="#3b82f6" />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>Cursor / Windsurf</div>
            <div style={{ fontSize: '12px', color: '#a1a1aa' }}>.cursorrules Directives</div>
          </div>
        </div>
      </div>

      {/* Compiled Prompt Terminal Viewer */}
      <div
        style={{
          zIndex: 10,
          width: '100%',
          maxWidth: '1250px',
          borderRadius: '20px',
          backgroundColor: 'rgba(12, 12, 16, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
          transform: `scale(${codeBoxScale})`
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span style={{ marginLeft: '12px', fontFamily: 'monospace', fontSize: '13px', color: '#a1a1aa' }}>
              PROMPT.md &mdash; Master Implementation Directive
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#c084fc', fontWeight: 600 }}>
              ⚡ {tokenCount.toLocaleString()} Tokens Compiled
            </span>

            {/* Copy Action Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '8px',
                backgroundColor: copyClicked ? '#10b981' : '#8b5cf6',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                boxShadow: copyClicked ? '0 0 25px #10b981' : '0 0 20px rgba(139, 92, 246, 0.5)',
                transform: `scale(${copyScale})`,
                transition: 'background-color 0.2s ease'
              }}
            >
              {copyClicked ? <Check size={16} /> : <Copy size={16} />}
              <span>{copyClicked ? 'Copied to Clipboard!' : 'Copy for AI Agent'}</span>
            </div>
          </div>
        </div>

        {/* Code Content */}
        <div
          style={{
            padding: '24px 30px',
            fontFamily: 'monospace',
            fontSize: '15px',
            lineHeight: 1.6,
            color: '#e4e4e7',
            backgroundColor: '#09090d'
          }}
        >
          <div>
            <span style={{ color: '#c084fc', fontWeight: 700 }}># MISSION:</span>{' '}
            <span style={{ color: '#ffffff' }}>Build Production Visual Token Routing Engine (arXiv:2606.12412)</span>
          </div>
          <div>
            <span style={{ color: '#60a5fa', fontWeight: 700 }}>## 1. OFFICIAL REPOSITORY:</span>{' '}
            <span style={{ color: '#34d399' }}>https://github.com/elmma/mllm-reroute</span>
          </div>
          <div>
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>## 2. SOLVE STATED LIMITATIONS:</span>{' '}
            <span style={{ color: '#fef3c7' }}>Eliminate 2.4x secondary buffer latency using Zero-Copy Shared Memory</span>
          </div>
          <div>
            <span style={{ color: '#a855f7', fontWeight: 700 }}>## 3. AGENT DIRECTIVES:</span>{' '}
            <span style={{ color: '#d4d4d8' }}>Follow TDD workflow &bull; Create benchmark harness &bull; Verify with PyTest</span>
          </div>
        </div>
      </div>
    </div>
  )
}
