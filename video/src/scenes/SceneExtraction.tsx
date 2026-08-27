import React from 'react'
import {
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig
} from 'remotion'
import {
  Search,
  FileCode,
  AlertOctagon,
  CheckCircle2,
  ScanLine
} from 'lucide-react'
import { BackgroundGrid } from '../components/BackgroundGrid'
import { GithubIcon, HuggingFaceIcon } from '../components/Icons'

export const SceneExtraction: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Scene transitions
  const cardScale = spring({ frame: frame - 10, fps, config: { damping: 14 } })
  const scanProgress = interpolate(frame, [40, 110], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  const limitationGlow = interpolate(frame, [80, 110], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  const badgesProgress = spring({ frame: frame - 110, fps, config: { damping: 12 } })

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
      <BackgroundGrid accentColor="#10b981" />

      {/* Header Tag */}
      <div
        style={{
          zIndex: 10,
          textAlign: 'center',
          marginBottom: '30px'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}
        >
          <ScanLine size={18} />
          <span>Deep Research Extraction Engine</span>
        </div>
        <h2
          style={{
            fontSize: '48px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em'
          }}
        >
          We extract what other tools ignore:{' '}
          <span style={{ color: '#fbbf24' }}>The Unsolved Limitations</span>
        </h2>
      </div>

      {/* Main Interactive Paper Card */}
      <div
        style={{
          zIndex: 10,
          width: '100%',
          maxWidth: '1250px',
          borderRadius: '24px',
          backgroundColor: 'rgba(18, 18, 22, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
          padding: '36px',
          transform: `scale(${cardScale})`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Laser Scanning Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${scanProgress}%`,
            width: '4px',
            background: 'linear-gradient(180deg, transparent 0%, #10b981 50%, transparent 100%)',
            boxShadow: '0 0 25px #10b981, 0 0 50px #10b981',
            opacity: scanProgress > 0 && scanProgress < 100 ? 1 : 0
          }}
        />

        {/* Paper Metadata Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#60a5fa',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: 600
              }}
            >
              arXiv:2606.12412v1
            </span>
            <span
              style={{
                fontSize: '13px',
                color: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle2 size={14} />
              PyMuPDF Section Parsed
            </span>
          </div>

          {/* GitHub & HuggingFace Badges */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              opacity: badgesProgress,
              transform: `scale(${badgesProgress})`
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#f4f4f5'
              }}
            >
              <GithubIcon size={16} />
              <span>github.com/elmma/mllm-reroute</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#fbbf24'
              }}
            >
              <HuggingFaceIcon size={16} />
              <span>Qwen2.5-7B Weights</span>
            </div>
          </div>
        </div>

        {/* Paper Title */}
        <h3
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.3,
            marginBottom: '16px'
          }}
        >
          Reroute, Don&apos;t Remove: Recoverable Visual Token Routing for Multimodal LLMs
        </h3>

        {/* Two-Column Deep Insights Grid */}
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Left: Core Thesis & Conclusion */}
          <div
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '20px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', marginBottom: '8px' }}>
              ✓ Extracted Core Breakthrough
            </div>
            <p style={{ fontSize: '15px', color: '#d4d4d8', lineHeight: 1.5 }}>
              Proposes a dynamic token router that preserves unselected visual tokens in a lightweight secondary buffer instead of pruning them, maintaining 98.4% visual fidelity.
            </p>
          </div>

          {/* Right: The High-Value Limitation Box */}
          <div
            style={{
              flex: 1.2,
              backgroundColor: `rgba(245, 158, 11, ${0.05 + limitationGlow * 0.1})`,
              borderRadius: '14px',
              border: `2px solid rgba(245, 158, 11, ${0.3 + limitationGlow * 0.5})`,
              padding: '20px',
              boxShadow: `0 0 ${limitationGlow * 30}px rgba(245, 158, 11, 0.25)`,
              transition: 'all 0.3s ease'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 800,
                color: '#fbbf24',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}
            >
              <AlertOctagon size={16} />
              <span>⚡ Extracted Limitation & Project Opportunity</span>
            </div>
            <p style={{ fontSize: '15px', color: '#fef3c7', lineHeight: 1.5, fontWeight: 500 }}>
              &ldquo;The secondary buffer incurs a 2.4x latency penalty when visual tokens exceed 128, and fails to handle adversarial noise in perturbed video frames.&rdquo;
            </p>
            <div
              style={{
                marginTop: '12px',
                fontSize: '13px',
                color: '#fbbf24',
                fontWeight: 700
              }}
            >
              👉 Blueprint Target: Implement zero-copy buffer + adversarial robust quantization filter.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
