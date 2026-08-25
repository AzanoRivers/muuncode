import { useId } from 'react'
import type { CSSProperties } from 'react'
import styles from './RocketIcon.module.css'

interface RocketIconProps {
  size?: number
}

// Rocket silhouette, stroked with the same blue -> purple -> pink gradient and glow
// filter technique as MoonOrbitLogo. Used by LaunchLoader, sitting still while its
// container's canvas scrolls stars/clouds past it.
export function RocketIcon({ size = 40 }: RocketIconProps) {
  const gradientId = useId()
  const glowFilterId = useId()

  return (
    <svg
      className={styles.rocket}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Rocket"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'var(--color-neon-blue)' } as CSSProperties} />
          <stop offset="50%" style={{ stopColor: 'var(--color-neon-purple)' } as CSSProperties} />
          <stop offset="100%" style={{ stopColor: 'var(--color-neon-pink)' } as CSSProperties} />
        </linearGradient>
        <filter id={glowFilterId} x="-75%" y="-75%" width="250%" height="250%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blurred" />
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
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 1.5c2.4 2.6 3.8 6.2 3.8 9.7 0 2.6-1.4 4.7-3.8 6.3-2.4-1.6-3.8-3.7-3.8-6.3 0-3.5 1.4-7.1 3.8-9.7z" />
        <circle cx="12" cy="9.2" r="1.3" />
        <path d="M8.4 12.3 5.6 16.4l3-1" />
        <path d="M15.6 12.3l2.8 4.1-3-1" />
      </g>
    </svg>
  )
}
