import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './CreateRepoForm.module.css'

type RepoVisibility = 'public' | 'private'

export interface CreateRepoFormValues {
  name: string
  description: string
  isPrivate: boolean
}

// Imperative escape hatch for reading the form's current values on demand (e.g. right
// before submitting), without lifting name/visibility/description state up to
// RepoSelector: lifting them would re-render RepoSelector's own tree (in particular the
// repo list living in the sibling accordion section) on every keystroke, which the
// original design of this component (see repository-creation-accordion.md) explicitly
// avoided for the validity boolean already. useImperativeHandle keeps that guarantee
// intact: the ref object is only read when RepoSelector's "Siguiente" handler actually
// calls getValues(), never as a side effect of typing.
export interface CreateRepoFormHandle {
  getValues: () => CreateRepoFormValues
}

interface CreateRepoFormProps {
  onValidityChange: (isValid: boolean) => void
}

// GitHub itself allows single-character repo names; this minimum is a stricter,
// deliberate stage-1 mockup rule requested for this form specifically, unrelated to
// GitHub's own real naming constraints (which the real API call now enforces too).
const MIN_NAME_LENGTH = 8

// Repo name/visibility/description fields for the create-new-repository accordion
// section. All keystroke-level state stays local to this component: only a derived
// validity boolean bubbles up to RepoSelector, and only when it actually flips (the
// same "only call the callback when the boolean actually changes" guard RepoSelector's
// own scroll-indicator handler already uses). This keeps typing here from re-rendering
// RepoSelector's own tree. The current field values are exposed imperatively via ref
// (see CreateRepoFormHandle above), read only once, on submit.
export const CreateRepoForm = forwardRef<CreateRepoFormHandle, CreateRepoFormProps>(function CreateRepoForm(
  { onValidityChange },
  ref,
) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [visibility, setVisibility] = useState<RepoVisibility>('public')
  const [description, setDescription] = useState('')
  const lastNotifiedValidity = useRef(false)

  useEffect(() => {
    const isValid = name.trim().length >= MIN_NAME_LENGTH
    if (lastNotifiedValidity.current !== isValid) {
      lastNotifiedValidity.current = isValid
      onValidityChange(isValid)
    }
  }, [name, onValidityChange])

  useImperativeHandle(
    ref,
    () => ({
      getValues: () => ({
        name: name.trim(),
        description: description.trim(),
        isPrivate: visibility === 'private',
      }),
    }),
    [name, description, visibility],
  )

  return (
    <div className={styles.form}>
      <label className={styles.field}>
        <span className={styles.label}>{t('repoNameLabel')}</span>
        <input
          type="text"
          className={styles.input}
          value={name}
          placeholder={t('repoNamePlaceholder')}
          onChange={(event) => setName(event.target.value.replace(/ /g, '-'))}
        />
      </label>

      <div className={styles.field}>
        <span className={styles.label}>{t('repoVisibilityLabel')}</span>
        <div className={styles.visibilityOptions}>
          <button
            type="button"
            className={
              visibility === 'public' ? `${styles.visibilityOption} ${styles.visibilityOptionPublic}` : styles.visibilityOption
            }
            aria-pressed={visibility === 'public'}
            onClick={() => setVisibility('public')}
          >
            {t('publicBadge')}
          </button>
          <button
            type="button"
            className={
              visibility === 'private'
                ? `${styles.visibilityOption} ${styles.visibilityOptionPrivate}`
                : styles.visibilityOption
            }
            aria-pressed={visibility === 'private'}
            onClick={() => setVisibility('private')}
          >
            {t('privateBadge')}
          </button>
        </div>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>{t('repoDescriptionLabel')}</span>
        <textarea
          className={styles.textarea}
          value={description}
          placeholder={t('repoDescriptionPlaceholder')}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
    </div>
  )
})
