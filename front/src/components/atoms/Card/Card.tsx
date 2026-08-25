import type { ReactNode } from 'react'
import styles from './Card.module.css'

type CardVariant = 'blue' | 'purple' | 'red'

interface CardProps {
  children: ReactNode
  variant?: CardVariant
}

// Glassmorphism container for body copy (description, philosophy), one card per block of text.
export function Card({ children, variant }: CardProps) {
  const variantClass = variant ? styles[`card--${variant}`] : ''
  return <div className={`${styles.card} ${variantClass}`.trim()}>{children}</div>
}
