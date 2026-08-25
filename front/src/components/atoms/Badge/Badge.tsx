import type { ReactNode } from 'react'
import styles from './Badge.module.css'

interface BadgeProps {
  children: ReactNode
}

// Glowing pill for short, high-importance copy (e.g. the tagline).
export function Badge({ children }: BadgeProps) {
  return <span className={styles.badge}>{children}</span>
}
