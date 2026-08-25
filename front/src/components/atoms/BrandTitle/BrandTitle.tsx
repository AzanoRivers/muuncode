import { useTranslation } from 'react-i18next'
import { MoonOrbitLogo } from '../MoonOrbitLogo'
import styles from './BrandTitle.module.css'

// MuunCode's wordmark: MoonOrbitLogo inline as the "o" in "Code". Text-align is
// intentionally not set here, it inherits from wherever this renders (the home
// screen right-aligns it, /station centers it).
export function BrandTitle() {
  const { t } = useTranslation()
  const title = t('title')
  const brandPrefix = title.slice(0, 5)
  const brandSuffix = title.slice(6)

  return (
    <h1 className={styles.title}>
      <a href="/" className={styles.link}>
        <span>{brandPrefix}</span>
        <MoonOrbitLogo size={28} />
        <span>{brandSuffix}</span>
      </a>
    </h1>
  )
}
