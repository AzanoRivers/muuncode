import { useTranslation } from 'react-i18next'
import { BackIcon, Button } from '@/components/atoms'
import { StatusScreen, StatusScreenAction } from '@/components/molecules'

// Renders for any path other than / and /station.
export function NotFound() {
  const { t } = useTranslation()

  const handleBack = () => {
    window.location.href = '/'
  }

  return (
    <StatusScreen tagline={t('notFoundTagline')} message={t('notFoundMessage')}>
      <StatusScreenAction>
        <Button onClick={handleBack}>
          <BackIcon size={20} />
          {t('backButton')}
        </Button>
      </StatusScreenAction>
    </StatusScreen>
  )
}
