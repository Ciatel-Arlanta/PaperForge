import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const BackgroundGrid: React.FC<{ accentColor?: string }> = ({
  accentColor = '#3b82f6'
}) => {
  const frame = useCurrentFrame()
  const offset = interpolate(frame, [0, 900], [0, 40], {
    extrapolateRight: 'extend'
  })

  const glowOpacity = interpolate(
    Math.sin(frame / 20),
    [-1, 1],
    [0.15, 0.28]
  )

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#09090b',
        overflow: 'hidden',
        zIndex: 0
      }}
    >
      {/* Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: -100,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: `${offset}px ${offset}px`,
          maskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 80%)'
        }}
      />

      {/* Top Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '20%',
          width: '60vw',
          height: '60vh',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
          opacity: glowOpacity,
          filter: 'blur(100px)'
        }}
      />

      {/* Bottom Subtle Secondary Glow */}
      <div
        style={{
          position: 'absolute',
          bottom: '-25%',
          right: '15%',
          width: '50vw',
          height: '50vh',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #10b981 0%, transparent 70%)',
          opacity: glowOpacity * 0.7,
          filter: 'blur(120px)'
        }}
      />
    </div>
  )
}
