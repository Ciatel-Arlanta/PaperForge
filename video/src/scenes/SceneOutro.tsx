import React from 'react'
import {
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig
} from 'remotion'
import {
  Star,
  Terminal,
  Zap,
  Bot,
  Layers,
  ArrowRight
} from 'lucide-react'
import { BackgroundGrid } from '../components/BackgroundGrid'
import { BrowserFrame } from '../components/BrowserFrame'
import { GithubIcon } from '../components/Icons'

export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  const cardProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 14 }
  })

  const badgesProgress = spring({
    frame: frame - 35,
    fps,
    config: { damping: 14 }
  })

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
        padding: '50px 60px',
        overflow: 'hidden'
      }}
    >
      <BackgroundGrid accentColor="#3b82f6" />

      {/* Main Title & Call to Action */}
      <div
        style={{
          zIndex: 10,
          textAlign: 'center',
          opacity: headerOpacity,
          marginBottom: '35px'
        }}
      >
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
            border: '2px solid rgba(59, 130, 246, 0.5)',
            boxShadow: '0 0 45px rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 16px auto'
          }}
        >
          <Layers size={36} color="#60a5fa" />
        </div>

        <h1
          style={{
            fontSize: '64px',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: '12px'
          }}
        >
          Forge Your Next Breakthrough.
        </h1>

        <p
          style={{
            fontSize: '22px',
            fontWeight: 500,
            color: '#a1a1aa',
            maxWidth: '850px',
            margin: '0 auto'
          }}
        >
          Turn cutting-edge academic papers into production software with AI agents.
        </p>
      </div>

      {/* Quickstart Command & GitHub Card */}
      <div
        style={{
          zIndex: 10,
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1050px',
          opacity: cardProgress,
          transform: `translateY(${(1 - cardProgress) * 30}px)`,
          marginBottom: '36px'
        }}
      >
        {/* Terminal Run Command */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '16px 24px',
            borderRadius: '14px',
            backgroundColor: 'rgba(18, 18, 22, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 15px 40px rgba(0,0,0,0.5)',
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#ffffff'
          }}
        >
          <Terminal size={22} color="#34d399" />
          <span>python main.py serve</span>
        </div>

        {/* GitHub Link Button */}
        <div
          style={{
            flex: 1.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            boxShadow: '0 15px 40px rgba(59, 130, 246, 0.4)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '17px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GithubIcon size={22} />
            <span>github.com/Ciatel-Arlanta/PaperForge</span>
          </div>
          <ArrowRight size={20} />
        </div>
      </div>

      {/* Trust & Feature Badges */}
      <div
        style={{
          zIndex: 10,
          display: 'flex',
          gap: '16px',
          opacity: badgesProgress,
          transform: `scale(${badgesProgress})`
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#fbbf24',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          <Star size={16} fill="#fbbf24" />
          <span>100% Open Source</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#34d399',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          <Zap size={16} />
          <span>Zero Bandwidth & Free Tier Ready</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#60a5fa',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          <Bot size={16} />
          <span>Antigravity & Claude Native</span>
        </div>
      </div>
    </div>
  )
}
