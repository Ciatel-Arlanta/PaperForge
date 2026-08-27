import React from 'react'
import {
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig
} from 'remotion'
import { ScanLine, AlertOctagon, CheckCircle2, FileCode } from 'lucide-react'
import { BackgroundGrid } from '../components/BackgroundGrid'
import { BrowserFrame } from '../components/BrowserFrame'
import { GithubIcon, HuggingFaceIcon } from '../components/Icons'

export const SceneExtraction: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Transitions
  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  const browserProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15 }
  })

  // Floating highlight callout card
  const calloutProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 13 }
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
        justifyContent: 'flex-start',
        padding: '40px 60px',
        overflow: 'hidden'
      }}
    >
      <BackgroundGrid accentColor="#10b981" />

      {/* Top Tagline */}
      <div
        style={{
          zIndex: 10,
          textAlign: 'center',
          opacity: headerOpacity,
          marginBottom: '24px'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 16px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}
        >
          <ScanLine size={16} />
          <span>Automated Research Intelligence</span>
        </div>
        <h2 style={{ fontSize: '44px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Real GitHub Repos & <span style={{ color: '#fbbf24' }}>Extracted Author Limitations</span>
        </h2>
      </div>

      {/* Real App Screenshot & Floating Highlight Card */}
      <div
        style={{
          zIndex: 10,
          position: 'relative',
          width: '100%',
          maxWidth: '1400px',
          display: 'flex',
          justifyContent: 'center',
          opacity: browserProgress
        }}
      >
        {/* Real App Screenshot */}
        <div style={{ width: '100%' }}>
          <BrowserFrame
            imageSrc="screenshots/02_has_code_filtered.png"
            url="http://localhost:8000/?has_code=true"
            scale={0.96}
            rotateX={4}
            boxShadow="0 30px 80px rgba(0, 0, 0, 0.7), 0 0 50px rgba(16, 185, 129, 0.2)"
          />
        </div>

        {/* Floating Callout Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            width: '480px',
            borderRadius: '16px',
            backgroundColor: 'rgba(12, 12, 16, 0.95)',
            border: '2px solid #f59e0b',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 35px rgba(245, 158, 11, 0.35)',
            backdropFilter: 'blur(20px)',
            padding: '22px',
            opacity: calloutProgress,
            transform: `translateY(${(1 - calloutProgress) * 40}px) scale(${calloutProgress})`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <AlertOctagon size={18} color="#fbbf24" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>
              Deep Limitation Extracted
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#fef3c7', lineHeight: 1.5, marginBottom: '14px' }}>
            &ldquo;Suffers from 2.4x latency overhead when routing visual tokens and vulnerable to adversarial noise.&rdquo;
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                fontSize: '12px',
                color: '#ffffff',
                fontWeight: 600
              }}
            >
              <GithubIcon size={14} />
              <span>Official Repo Found</span>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                fontSize: '12px',
                color: '#34d399',
                fontWeight: 600
              }}
            >
              <CheckCircle2 size={14} />
              <span>PyMuPDF Parsed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
