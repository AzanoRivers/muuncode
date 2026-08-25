import { useTranslation } from 'react-i18next'
import { BackIcon, Button } from '@/components/atoms'
import { StatusScreen, StatusScreenAction } from '@/components/molecules'

// Rendered by App.tsx's error boundary when an unexpected render error is caught,
// instead of a blank crashed page.
export function ServerError() {
  const { t } = useTranslation()

  const handleBack = () => {
    window.location.href = '/'
  }

  return (
    <StatusScreen tagline={t('serverErrorTagline')} message={t('serverErrorMessage')}>
      <StatusScreenAction>
        <Button onClick={handleBack}>
          <BackIcon size={20} />
          {t('backButton')}
        </Button>
      </StatusScreenAction>
    </StatusScreen>
  )
}
