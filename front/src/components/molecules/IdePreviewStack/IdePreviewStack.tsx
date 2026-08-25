import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './IdePreviewStack.module.css'

export function IdePreviewStack() {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const toggleActive = () => setActiveIndex((current) => (current === 0 ? 1 : 0))

  return (
    <div className={styles.stack}>
      {[0, 1].map((index) => (
        <button
          key={index}
          type="button"
          className={index === activeIndex ? styles.cardActive : styles.cardBack}
          onClick={toggleActive}
          onFocus={toggleActive}
        >
          {t('idePreviewPlaceholder')} {index + 1}
        </button>
      ))}
    </div>
  )
}
