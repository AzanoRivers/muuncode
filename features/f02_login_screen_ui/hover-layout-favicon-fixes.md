# F02 (additional scope): Hover, Layout, Icon, and Favicon Fixes

Additional adjustment work on `f02`, living in the same feature folder, not a new
feature id, per `CLAUDE.md` → "Rules for Agents" → "Adjustment vs. new feature".
Reviewed with `reviewer-light` per `CLAUDE.md` → "Feature Development Workflow"
(adjustment round, not a phase boundary).

## 1. Hover Interaction: Revert to Per-Card, Delayed, Not a Blind Timer

**Root cause of "hover feels stuck"**: the previous round moved the hover handler
from each card to the wrapping `.stack` container, starting a blind
`setInterval` that alternates cards every 1.5s regardless of which card the
cursor is actually over. Hovering the exposed back-card corner no longer does
anything targeted, the swap only happens whenever the container-level timer
happens to fire, unrelated to where the cursor is. This is what reads as "stuck".

Fix in `IdePreviewStack.tsx`: go back to per-card hover, but with a delay
(instead of the original instant swap that flickered) using `setTimeout`,
canceled if the cursor leaves that card before the delay elapses. Drop the
blind auto-cycling entirely, it does not match hovering a specific target.

```tsx
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './IdePreviewStack.module.css'

const HOVER_ACTIVATE_DELAY_MS = 1500

export function IdePreviewStack() {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const timeoutRef = useRef<number | undefined>(undefined)

  const scheduleActivate = (index: number) => {
    if (index === activeIndex) return
    timeoutRef.current = window.setTimeout(() => setActiveIndex(index), HOVER_ACTIVATE_DELAY_MS)
  }

  const cancelScheduledActivate = () => {
    window.clearTimeout(timeoutRef.current)
  }

  const selectCard = (index: number) => {
    cancelScheduledActivate()
    setActiveIndex(index)
  }

  return (
    <div className={styles.stack}>
      {[0, 1].map((index) => (
        <button
          key={index}
          type="button"
          className={index === activeIndex ? styles.cardActive : styles.cardBack}
          onMouseEnter={() => scheduleActivate(index)}
          onMouseLeave={cancelScheduledActivate}
          onClick={() => selectCard(index)}
          onFocus={() => selectCard(index)}
        >
          {t('idePreviewPlaceholder')} {index + 1}
        </button>
      ))}
    </div>
  )
}
```

Remove the now-unused `useEffect`/`isHovering`/`intervalRef` entirely, this
component no longer needs `useEffect`.

## 2. Missing Left-Column Content: Likely Pushed Below the Fold, Made Responsive

The grid placement itself (`grid-column: 1`/`2` on `.leftColumn`/`.rightColumn`)
is correct on inspection. The likely actual cause: the previous round doubled
`.stack`'s width unconditionally (`min(56rem, 100%)`) at every viewport width,
not only at `≥1024px`. Below that breakpoint (single column) or on a desktop
window narrower than expected, the much taller stack now pushes the badge and
both cards far down the page, below the fold, reading as "missing" when it is
actually just further down, requiring a scroll that was not needed before.

Fix in `IdePreviewStack.module.css`: keep the stack at its original, more modest
size outside desktop, only grow to the doubled size at the breakpoint where the
2-column layout (and its already-verified total-height math) actually applies:

```css
.stack {
  position: relative;
  width: min(28rem, 100%);
  aspect-ratio: 16 / 10;
}

@media (min-width: 1024px) {
  .stack {
    width: min(56rem, 100%);
  }
}
```

If the content is still not visible after this at the width being tested,
that points to a different cause, report back with the exact viewport width so
this can be investigated further rather than guessed at again.

## 3. Brand Icon: Bigger and Tucked Closer to "Muun"

In `LoginScreen.tsx`, increase `MoonOrbitLogo`'s size from `40` to `48`.

In `LoginScreen.module.css`, remove `.brandMuunColumn`'s `gap` entirely (set to
`0`, do not leave the `--spacing-2xs` token there, it is still visually too far
per the user's report):

```css
.brandMuunColumn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}
```

## 4. Favicon: Transparent Background, Bump Cache-Bust Again

In `front/public/icon.svg`, remove the filled background `<rect>` entirely (it
was added for tab-bar contrast, but reads as an unwanted solid dark square,
the user wants a transparent background instead):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="MuunCode logo">
  <defs>
    <linearGradient id="hm-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0BD2FF" />
      <stop offset="50%" stop-color="#B366FF" />
      <stop offset="100%" stop-color="#FF69B4" />
    </linearGradient>
    <filter id="hm-glow" x="-75%" y="-75%" width="250%" height="250%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="blurred" />
      <feMerge>
        <feMergeNode in="blurred" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <g filter="url(#hm-glow)" fill="none" stroke="url(#hm-gradient)" stroke-width="1.4" stroke-linecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    <ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(-15 12 12)" />
  </g>
</svg>
```

In `front/index.html`, bump both favicon `<link>`s' cache-busting query string
from `?v=2` to `?v=3`. If the old icon still shows after this, it is the
browser's own favicon cache (a known hard-to-bust browser quirk, separate from
normal page caching), closing and reopening the tab fully or clearing that
site's data resolves it, no further code change can force a browser to drop a
cached favicon.

## Checkpoints

See `.claude/CHECKPOINTS.md` → "F02: Login Screen UI" → "Additional scope:
Hover, Layout, Icon, and Favicon Fixes" for the verifiable done-criteria.
