import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge, BrandTitle, Button, Card, EnterIcon, GitHubIcon, GridBackground } from '@/components/atoms'
import { BrowserSupportNotice, IdePreviewStack } from '@/components/molecules'
import { isSignedIn } from '@/lib/githubAuth'
import { githubSignInUrl } from '@/lib/githubSignInUrl'
import styles from './Home.module.css'

const TECH_HIGHLIGHT_CLASSES: Record<string, string> = {
  HTML: styles.techHtml,
  CSS: styles.techCss,
  JavaScript: styles.techJs,
}

function withTechHighlights(text: string) {
  return text
    .split(/(HTML|CSS|JavaScript)/g)
    .map((part, index) =>
      TECH_HIGHLIGHT_CLASSES[part] ? (
        <strong key={index} className={TECH_HIGHLIGHT_CLASSES[part]}>
          {part}
        </strong>
      ) : (
        part
      ),
    )
}

// MuunCode's home page, rendered at "/": static welcome screen with the sign-in CTA
// (renamed from its original LoginScreen once its real identity, the app's home page
// rather than just a login screen, became clear). No routing library involved.
export function Home() {
  const { t } = useTranslation()

  // Signed-in users must not be sent through GitHub's install+authorize flow again
  // (already installed and authorized, GitHub would just show its own
  // installation-management page instead of redirecting back). This cheap, local-only
  // check (see githubAuth.ts) only decides which button/label to show; the click
  // handler below runs the real, full check before deciding where it actually goes.
  const [signedIn] = useState(isSignedIn)

  const handleSignIn = () => {
    window.location.href = githubSignInUrl()
  }

  // A plain, instant navigation: Station already shows its full-screen rocket
  // LaunchLoader from the moment it mounts, and now runs the same session/token/
  // installation/project checks (lib/sessionResolution.ts) itself, redirecting on to
  // /lab when everything (including an already-active project) resolves. Running that
  // same check here first, before navigating, used to leave this button sitting with no
  // feedback for however long the network calls took; letting Station's own loader own
  // that wait instead makes the click itself feel instant.
  const handleEnterStation = () => {
    window.location.href = '/station'
  }

  return (
    <GridBackground>
      <main className={styles.content}>
        <div className={styles.rightColumn}>
          <BrandTitle />
          <IdePreviewStack />
        </div>
        <div className={styles.leftColumn}>
          <Badge>{t('tagline')}</Badge>
          <Card variant="blue">
            <p className={styles.description}>{t('description')}</p>
          </Card>
          <Card variant="purple">
            <p className={styles.philosophy}>{withTechHighlights(t('philosophy'))}</p>
          </Card>
          <Button onClick={signedIn ? handleEnterStation : handleSignIn}>
            {signedIn ? <EnterIcon size={20} /> : <GitHubIcon size={20} />}
            {signedIn ? t('enterStationButton') : t('signInButton')}
          </Button>
        </div>
        <div className={styles.actions}>
          <BrowserSupportNotice />
        </div>
      </main>
    </GridBackground>
  )
}
