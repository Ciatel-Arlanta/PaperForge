import React from 'react'
import {
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig
} from 'remotion'
import { Layers, Sparkles, Cpu, GitBranch, ShieldCheck } from 'lucide-react'
import { BackgroundGrid } from '../components/BackgroundGrid'

export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Logo impact animations
  const logoScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 12, mass: 0.8 }
  })
  const logoOpacity = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  // Tagline animation
  const taglineProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 14 }
  })

  // Feature badges
  const badge1Progress = spring({ frame: frame - 45, fps, config: { damping: 15 } })
  const badge2Progress = spring({ frame: frame - 60, fps, config: { damping: 15 } })
  const badge3Progress = spring({ frame: frame - 75, fps, config: { damping: 15 } })

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
      <BackgroundGrid accentColor="#3b82f6" />

      {/* Main Brand Impact */}
      <div
        style={{
          zIndex: 10,
          textAlign: 'center',
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          marginBottom: '35px'
        }}
      >
        {/* Brand Icon Badge */}
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '26px',
            background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
            border: '2px solid rgba(59, 130, 246, 0.5)',
            boxShadow: '0 0 50px rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 24px auto'
          }}
        >
          <Layers size={48} color="#60a5fa" />
        </div>

        {/* Brand Name */}
        <h1
          style={{
            fontSize: '92px',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            lineHeight: 1.0,
            marginBottom: '16px'
          }}
        >
          Paper<span style={{ color: '#3b82f6' }}>Forge</span> 🔨
        </h1>

        {/* Subtitle / Category */}
        <div
          style={{
            display: 'inline-block',
            padding: '6px 20px',
            borderRadius: '10px',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#93c5fd',
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontFamily: 'monospace'
          }}
        >
          Research-to-Code Platform & Multi-Agent Prompt Studio
        </div>
      </div>

      {/* Tagline sentence */}
      <div
        style={{
          zIndex: 10,
          textAlign: 'center',
          maxWidth: '900px',
          opacity: taglineProgress,
          transform: `translateY(${(1 - taglineProgress) * 30}px)`,
          marginBottom: '50px'
        }}
      >
        <p
          style={{
            fontSize: '28px',
            fontWeight: 500,
            color: '#d4d4d8',
            lineHeight: 1.4
          }}
        >
          Turn cutting-edge arXiv research papers and their explicit limitations into{' '}
          <span style={{ color: '#60a5fa', fontWeight: 700 }}>production-grade software</span> using AI coding agents.
        </p>
      </div>

      {/* 3 Core Highlights */}
      <div
        style={{
          zIndex: 10,
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1200px'
        }}
      >
        {/* Highlight 1 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px 28px',
            borderRadius: '16px',
            backgroundColor: 'rgba(24, 24, 27, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            opacity: badge1Progress,
            transform: `translateY(${(1 - badge1Progress) * 40}px)`
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
              flexShrink: 0
            }}
          >
            <Cpu size={26} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fafafa' }}>150+ Papers Indexed</div>
            <div style={{ fontSize: '13px', color: '#a1a1aa' }}>AI, Security & Agent Systems</div>
          </div>
        </div>

        {/* Highlight 2 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px 28px',
            borderRadius: '16px',
            backgroundColor: 'rgba(24, 24, 27, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            opacity: badge2Progress,
            transform: `translateY(${(1 - badge2Progress) * 40}px)`
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fafafa' }}>Deep Limitation Parser</div>
            <div style={{ fontSize: '13px', color: '#a1a1aa' }}>Extracts Stated Flaws & Gaps</div>
          </div>
        </div>

        {/* Highlight 3 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px 28px',
            borderRadius: '16px',
            backgroundColor: 'rgba(24, 24, 27, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            opacity: badge3Progress,
            transform: `translateY(${(1 - badge3Progress) * 40}px)`
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a855f7',
              flexShrink: 0
            }}
          >
            <GitBranch size={26} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fafafa' }}>Auto Code Linker</div>
            <div style={{ fontSize: '13px', color: '#a1a1aa' }}>GitHub & HuggingFace Models</div>
          </div>
        </div>
      </div>
    </div>
  )
}
