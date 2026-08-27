import React from 'react'
import {
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig
} from 'remotion'
import { Layers, Sparkles, Cpu, ShieldCheck } from 'lucide-react'
import { BackgroundGrid } from '../components/BackgroundGrid'
import { BrowserFrame } from '../components/BrowserFrame'
import { GithubIcon } from '../components/Icons'

export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Logo & Title animation
  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })
  const headerY = interpolate(frame, [0, 20], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  // Browser mockup rising up with 3D tilt
  const mockupProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 15, mass: 0.9 }
  })

  const tiltX = interpolate(mockupProgress, [0, 1], [22, 6])
  const translateY = interpolate(mockupProgress, [0, 1], [180, 0])
  const mockupScale = interpolate(mockupProgress, [0, 1], [0.85, 1.0])

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
        padding: '40px 60px',
        overflow: 'hidden'
      }}
    >
      <BackgroundGrid accentColor="#3b82f6" />

      {/* Top Header */}
      <div
        style={{
          zIndex: 10,
          textAlign: 'center',
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
          marginBottom: '28px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '8px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#18181b',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa'
            }}
          >
            <Layers size={24} />
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: 900, letterSpacing: '-0.03em', color: '#ffffff' }}>
            Paper<span style={{ color: '#3b82f6' }}>Forge</span> 🔨
          </h1>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              textTransform: 'uppercase',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#93c5fd',
              padding: '4px 12px',
              borderRadius: '8px',
              fontWeight: 700
            }}
          >
            Research-to-Code Platform
          </span>
        </div>

        <p style={{ fontSize: '20px', color: '#a1a1aa', fontWeight: 500 }}>
          Transforming 150+ academic papers into production software blueprints.
        </p>
      </div>

      {/* 3D Browser Mockup with Real App Screenshot */}
      <div
        style={{
          zIndex: 10,
          width: '100%',
          maxWidth: '1400px',
          opacity: mockupProgress
        }}
      >
        <BrowserFrame
          imageSrc="screenshots/01_papers_grid.png"
          scale={mockupScale}
          rotateX={tiltX}
          translateY={translateY}
          boxShadow="0 40px 100px rgba(0, 0, 0, 0.8), 0 0 60px rgba(59, 130, 246, 0.25)"
        />
      </div>
    </div>
  )
}
