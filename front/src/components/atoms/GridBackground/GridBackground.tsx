import type { ReactNode } from 'react'
import styles from './GridBackground.module.css'

interface GridBackgroundProps {
  children?: ReactNode
}

// Full-viewport HUD-style grid pattern, drawn with two layered linear-gradients (no image asset).
export function GridBackground({ children }: GridBackgroundProps) {
  return <div className={styles.gridBackground}>{children}</div>
}
