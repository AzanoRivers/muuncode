import { useTranslation } from 'react-i18next'
import styles from './VisibilityTag.module.css'

interface VisibilityTagProps {
  isPrivate: boolean
}

// Static, non-animated colored pill for a repository's Public/Private status.
// Shares Badge's pill shape and border weight, but never pulses: unlike Badge,
// which stays reserved for the one pulsing tagline per screen (see StatusScreen
// and Station's success branch), this atom is for repeated, purely informational
// labels where a pulsing animation on every row would be visual noise.
export function VisibilityTag({ isPrivate }: VisibilityTagProps) {
  const { t } = useTranslation()
  const variantClass = isPrivate ? styles.private : styles.public

  return <span className={`${styles.tag} ${variantClass}`}>{t(isPrivate ? 'privateBadge' : 'publicBadge')}</span>
}
