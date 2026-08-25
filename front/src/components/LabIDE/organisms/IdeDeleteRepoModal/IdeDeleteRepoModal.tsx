import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { WarningIcon } from '@/components/atoms'
import { getAccessToken } from '@/lib/githubAuth'
import { deleteRepo } from '@/lib/githubRepos'
import styles from './IdeDeleteRepoModal.module.css'

interface IdeDeleteRepoModalProps {
  owner: string
  repoName: string
  onClose: () => void
  onDeleted: () => void
}

type DeleteStatus = 'idle' | 'deleting' | 'error'

// Rendered as IdeModal's own children (size="small"), per this project's shared-modal
// architecture: IdeModal itself stays a generic shell (isOpen/onClose/size/children
// only, see its own file, unchanged by this feature), every real modal's actual
// content AND state lives in its own component instead, so IdeModal never needs to
// know anything about what it is showing or how. Requires typing the repo's exact
// name before enabling the destructive action, GitHub's own real confirmation pattern
// for this exact action (Settings -> Danger Zone -> Delete this repository): this
// deletes the real GitHub repository itself, not a MuunCode-only concept VS Code's own
// reference (this project's usual UI source) has an equivalent for.
export function IdeDeleteRepoModal({ owner, repoName, onClose, onDeleted }: IdeDeleteRepoModalProps) {
  const { t } = useTranslation()
  const [confirmText, setConfirmText] = useState('')
  const [status, setStatus] = useState<DeleteStatus>('idle')

  const isConfirmed = confirmText === repoName
  const isDeleting = status === 'deleting'

  const handleConfirm = async () => {
    if (!isConfirmed || isDeleting) return

    setStatus('deleting')

    const accessToken = await getAccessToken()
    if (!accessToken) {
      setStatus('error')
      return
    }

    const result = await deleteRepo(accessToken, { owner, name: repoName })
    if (!result.ok) {
      setStatus('error')
      return
    }

    onDeleted()
  }

  return (
    <div className={styles.content}>
      <h2 className={styles.title}>{t('ideDeleteRepoTitle')}</h2>

      <div className={styles.warningBox}>
        <span className={styles.warningIcon}>
          <WarningIcon size={18} />
        </span>
        <p className={styles.warningText}>{t('ideDeleteRepoWarning')}</p>
      </div>

      <label className={styles.instruction} htmlFor="delete-repo-confirm-input">
        {t('ideDeleteRepoInstructionPrefix')}
        <strong className={styles.repoName}>{repoName}</strong>
        {t('ideDeleteRepoInstructionSuffix')}
      </label>
      <input
        id="delete-repo-confirm-input"
        type="text"
        className={styles.input}
        value={confirmText}
        onChange={(event) => setConfirmText(event.target.value)}
        disabled={isDeleting}
        autoComplete="off"
        autoFocus
      />

      {status === 'error' && <p className={styles.errorMessage}>{t('ideDeleteRepoErrorMessage')}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isDeleting}>
          {t('cancelButton')}
        </button>
        <button
          type="button"
          className={styles.confirmButton}
          onClick={handleConfirm}
          disabled={!isConfirmed || isDeleting}
        >
          {isDeleting ? t('ideDeleteRepoDeletingLabel') : t('ideDeleteRepoConfirmButton')}
        </button>
      </div>
    </div>
  )
}
