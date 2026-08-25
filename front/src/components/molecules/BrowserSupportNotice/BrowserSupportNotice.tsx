import { useTranslation } from 'react-i18next'
import { WarningIcon } from '@/components/atoms'
import styles from './BrowserSupportNotice.module.css'

// Informational callout, not an error state: styled with a subtle border and icon.
export function BrowserSupportNotice() {
  const { t } = useTranslation()

  return (
    <div className={styles.notice} role="note">
      <span className={styles.icon}>
        <WarningIcon size={20} />
      </span>
      <p className={styles.text}>{t('browserNotice')}</p>
    </div>
  )
}
