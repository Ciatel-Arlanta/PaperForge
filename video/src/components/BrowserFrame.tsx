import React from 'react'
import { staticFile, Img } from 'remotion'
import { Globe, Lock } from 'lucide-react'

interface BrowserFrameProps {
  imageSrc: string
  url?: string
  scale?: number
  rotateX?: number
  rotateY?: number
  translateY?: number
  boxShadow?: string
  width?: string | number
  height?: string | number
  zoomOrigin?: string
}

export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  imageSrc,
  url = 'http://localhost:8000',
  scale = 1,
  rotateX = 0,
  rotateY = 0,
  translateY = 0,
  boxShadow = '0 30px 80px rgba(0, 0, 0, 0.7), 0 0 40px rgba(59, 130, 246, 0.15)',
  width = '100%',
  height = 'auto'
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: '16px',
        backgroundColor: '#121216',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow,
        overflow: 'hidden',
        transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${translateY}px) scale(${scale})`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.1s ease-out'
      }}
    >
      {/* Browser Window Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          backgroundColor: '#18181b',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Window controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }} />
        </div>

        {/* Address bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 16px',
            borderRadius: '8px',
            backgroundColor: '#09090b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#a1a1aa',
            minWidth: '280px',
            justifyContent: 'center'
          }}
        >
          <Lock size={12} color="#10b981" />
          <span>{url}</span>
        </div>

        {/* Right dummy controls */}
        <div style={{ display: 'flex', gap: '6px', opacity: 0.5 }}>
          <Globe size={14} color="#a1a1aa" />
        </div>
      </div>

      {/* Screen image content */}
      <div style={{ width: '100%', overflow: 'hidden', display: 'flex', backgroundColor: '#09090b' }}>
        <Img
          src={staticFile(imageSrc)}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            objectFit: 'cover'
          }}
        />
      </div>
    </div>
  )
}
