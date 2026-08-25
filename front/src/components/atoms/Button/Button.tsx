import type { ReactNode } from 'react'
import styles from './Button.module.css'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}

// Smoke-test atom for f01: proves scaffold -> tokens -> CSS Module -> component folder works.
export function Button({ children, onClick, disabled }: ButtonProps) {
  return (
    <button type="button" className={styles.button} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
