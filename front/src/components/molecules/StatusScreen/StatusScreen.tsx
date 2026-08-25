import type { ReactNode } from 'react'
import { Badge, BrandTitle, Card, GridBackground } from '@/components/atoms'
import styles from './StatusScreen.module.css'

type StatusScreenVariant = 'blue' | 'purple' | 'red'

interface StatusScreenProps {
  tagline: string
  message: string
  detail?: string
  variant?: StatusScreenVariant
  icon?: ReactNode
  children: ReactNode
}

// Full-page status message (restricted access, needs install, error, 404, 500, ...):
// brand wordmark, a short tagline badge, the message in a card (optionally with a
// leading icon, e.g. a warning triangle for error states), and one or more actions
// (wrap each in StatusScreenAction). Used by Station, NotFound, and ServerError, so
// the shape lives here once instead of being copied into every template. `detail` is
// for a raw, technical error string (e.g. GitHub's own API error text): rendered in its
// own monospace box below the human-readable `message`, never inlined into that
// sentence, so a long or English-only technical reason stays legible instead of running
// together with the localized prose around it.
export function StatusScreen({ tagline, message, detail, variant = 'blue', icon, children }: StatusScreenProps) {
  return (
    <GridBackground>
      <main className={styles.content}>
        <div className={styles.block}>
          <BrandTitle />
          <Badge>{tagline}</Badge>
          <Card variant={variant}>
            {icon ? (
              <div className={styles.messageRow}>
                <span className={styles.messageIcon}>{icon}</span>
                <p className={styles.message}>{message}</p>
              </div>
            ) : (
              <p className={styles.message}>{message}</p>
            )}
            {detail && <pre className={styles.detail}>{detail}</pre>}
          </Card>
          {children}
        </div>
      </main>
    </GridBackground>
  )
}

interface StatusScreenActionProps {
  children: ReactNode
}

// Wraps a single action Button: Button.module.css sets `align-self: flex-start` (so it
// does not stretch inside Home's leftColumn), which would otherwise pin it to
// the left here too, ignoring StatusScreen's own centered layout.
export function StatusScreenAction({ children }: StatusScreenActionProps) {
  return <div className={styles.action}>{children}</div>
}
