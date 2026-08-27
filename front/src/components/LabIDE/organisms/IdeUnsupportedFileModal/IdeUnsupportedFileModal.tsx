import { useTranslation } from 'react-i18next'
import { RocketIcon } from '@/components/atoms'
import styles from './IdeUnsupportedFileModal.module.css'

interface IdeUnsupportedFileModalProps {
  onClose: () => void
}

// Rendered as IdeModal's own children (size="small"), same "modal is a generic shell,
// content owns everything about what it shows" pattern IdeDeleteRepoModal already
// established. Purely informational, not a destructive action, so styled with plain
// foreground tokens rather than --ide-color-danger*: a single dismiss button, no red.
export function IdeUnsupportedFileModal({ onClose }: IdeUnsupportedFileModalProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.content}>
      <RocketIcon size={28} />
      <h2 className={styles.title}>{t('ideUnsupportedFileTitle')}</h2>
      <p className={styles.message}>{t('ideUnsupportedFileMessage')}</p>
      <p className={styles.supportedTypes}>{t('ideUnsupportedFileSupportedTypes')}</p>
      <button type="button" className={styles.button} onClick={onClose}>
        {t('ideUnsupportedFileButton')}
      </button>
    </div>
  )
}
