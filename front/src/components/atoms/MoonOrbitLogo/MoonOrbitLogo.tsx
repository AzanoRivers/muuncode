import { useId } from 'react'
import type { CSSProperties } from 'react'
import styles from './MoonOrbitLogo.module.css'

interface MoonOrbitLogoProps {
  size?: number
}

// Crescent moon crossed by an orbit ring, stroked with a blue -> purple -> pink
// gradient and blurred with an SVG filter for the neon glow, per AzanoLabs' HomeLogo technique.
export function MoonOrbitLogo({ size = 96 }: MoonOrbitLogoProps) {
  const gradientId = useId()
  const glowFilterId = useId()

  return (
    <svg
      className={styles.logo}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="MuunCode logo"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'var(--color-neon-blue)' } as CSSProperties} />
          <stop offset="50%" style={{ stopColor: 'var(--color-neon-purple)' } as CSSProperties} />
          <stop offset="100%" style={{ stopColor: 'var(--color-neon-pink)' } as CSSProperties} />
        </linearGradient>
        <filter id={glowFilterId} x="-75%" y="-75%" width="250%" height="250%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blurred" />
          <feMerge>
            <feMergeNode in="blurred" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        filter={`url(#${glowFilterId})`}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.4"
        strokeLinecap="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
        <ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(-15 12 12)" />
      </g>
    </svg>
  )
}
