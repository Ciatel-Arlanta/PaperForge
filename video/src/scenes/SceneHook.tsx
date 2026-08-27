import React from 'react'
import {
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig
} from 'remotion'
import { FileText, AlertTriangle, XCircle, ShieldAlert } from 'lucide-react'
import { BackgroundGrid } from '../components/BackgroundGrid'

export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Intro animations
  const titleOpacity = interpolate(frame, [10, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })
  const titleY = interpolate(frame, [10, 35], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  // Floating paper cards physics
  const card1Progress = spring({ frame: frame - 15, fps, config: { damping: 14 } })
  const card2Progress = spring({ frame: frame - 30, fps, config: { damping: 14 } })
  const card3Progress = spring({ frame: frame - 45, fps, config: { damping: 14 } })

  // Floating subtle oscillation
  const float1 = Math.sin(frame / 15) * 8
  const float2 = Math.cos(frame / 18) * 10
  const float3 = Math.sin(frame / 20) * 9

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
        padding: '60px'
      }}
    >
      <BackgroundGrid accentColor="#ef4444" />

      {/* Main Headline */}
      <div
        style={{
          zIndex: 10,
          textAlign: 'center',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          maxWidth: '1200px',
          marginBottom: '50px'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 20px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '24px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}
        >
          <AlertTriangle size={20} />
          <span>The Academic Research Dilemma</span>
        </div>

        <h1
          style={{
            fontSize: '58px',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: '#ffffff'
          }}
        >
          Academic papers contain breakthrough ideas...
          <br />
          <span
            style={{
              background: 'linear-gradient(90deg, #f87171 0%, #fb923c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            but they stay trapped in static PDFs.
          </span>
        </h1>
      </div>

      {/* Problem Cards Deck */}
      <div
        style={{
          zIndex: 10,
          display: 'flex',
          gap: '30px',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1300px'
        }}
      >
        {/* Card 1 */}
        <div
          style={{
            flex: 1,
            padding: '30px',
            borderRadius: '20px',
            backgroundColor: 'rgba(18, 18, 22, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(16px)',
            opacity: card1Progress,
            transform: `translateY(${(1 - card1Progress) * 60 + float1}px) rotate(-2deg)`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#a1a1aa', fontFamily: 'monospace' }}>arXiv:2606.12412</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#fafafa' }}>Dense Theoretical Math</div>
            </div>
          </div>
          <p style={{ fontSize: '15px', color: '#a1a1aa', lineHeight: 1.5 }}>
            Formulas and algorithms remain locked in LaTeX notation without practical implementations.
          </p>
          <div
            style={{
              marginTop: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#f87171',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <XCircle size={16} />
            <span>Trapped in 15-Page PDF</span>
          </div>
        </div>

        {/* Card 2 */}
        <div
          style={{
            flex: 1,
            padding: '30px',
            borderRadius: '20px',
            backgroundColor: 'rgba(18, 18, 22, 0.85)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 20px 50px rgba(239, 68, 68, 0.15)',
            backdropFilter: 'blur(16px)',
            opacity: card2Progress,
            transform: `translateY(${(1 - card2Progress) * 60 + float2}px) scale(1.05)`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b'
              }}
            >
              <ShieldAlert size={22} />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#a1a1aa', fontFamily: 'monospace' }}>Section 8: Limitations</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#fafafa' }}>Explicit Gaps & Flaws</div>
            </div>
          </div>
          <p style={{ fontSize: '15px', color: '#a1a1aa', lineHeight: 1.5 }}>
            Authors list major vulnerabilities, 20x latency overheads, and failure modes that get ignored.
          </p>
          <div
            style={{
              marginTop: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#fbbf24',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <AlertTriangle size={16} />
            <span>Cited Flaws Never Solved</span>
          </div>
        </div>

        {/* Card 3 */}
        <div
          style={{
            flex: 1,
            padding: '30px',
            borderRadius: '20px',
            backgroundColor: 'rgba(18, 18, 22, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(16px)',
            opacity: card3Progress,
            transform: `translateY(${(1 - card3Progress) * 60 + float3}px) rotate(2deg)`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}
            >
              <XCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#a1a1aa', fontFamily: 'monospace' }}>Zero Tooling</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#fafafa' }}>Missing Software</div>
            </div>
          </div>
          <p style={{ fontSize: '15px', color: '#a1a1aa', lineHeight: 1.5 }}>
            No CLI, no backend API, no automated test harness, and no ready-to-run AI agent prompts.
          </p>
          <div
            style={{
              marginTop: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#f87171',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <XCircle size={16} />
            <span>Zero Production Code</span>
          </div>
        </div>
      </div>
    </div>
  )
}
