# F02 (additional scope): Layout and Interaction Polish

Additional adjustment work on `f02`, living in the same feature folder, not a new
feature id, per `CLAUDE.md` → "Rules for Agents" → "Adjustment vs. new feature".

## 0. Favicon: Likely a Browser Cache Issue, Not a Code Bug

`front/index.html` and `front/public/icon.svg` were re-verified and are correct:
the SVG favicon already uses `MoonOrbitLogo`'s exact paths, referenced before the
`.ico` fallback. Browsers cache favicons aggressively, sometimes surviving a
normal reload. As a low-cost precaution, append a cache-busting query string to
both favicon `<link>`s in `front/index.html`:

```html
<link rel="icon" type="image/svg+xml" href="/icon.svg?v=2" />
<link rel="alternate icon" href="/favicon.ico?v=2" />
```

If it still shows the old icon after this, it is the browser's cache, not the
app: try a hard refresh or an incognito/private window.

## 1. Brand Icon Closer to "Muun"

Add a new, smaller token to `tokens.css` (spacing category, the scale currently
has no value below `--spacing-xs`):

```css
--spacing-2xs: 0.4rem;
```

In `LoginScreen.module.css`, change `.brandMuunColumn`'s `gap` from
`var(--spacing-xs)` to `var(--spacing-2xs)`.

## 2. Fix the Column Order Bug

**Root cause of the "columns are reversed" complaint**: `.rightColumn` (title +
stack) is first in `LoginScreen.tsx`'s markup, `.leftColumn` (text cards) is
second, but neither has an explicit `grid-column`. CSS Grid auto-placement fills
tracks in DOM order by default, so the first-in-markup element lands in the
visually-left track regardless of its class name. This is why title+stack
currently render on the left and the text cards on the right, the opposite of
both the class names' intent and what the user wants.

Fix in `LoginScreen.module.css`, inside the existing `@media (min-width: 1024px)`
block: add explicit placement so the class names match the actual visual result:

```css
.leftColumn {
  grid-column: 1;
}

.rightColumn {
  grid-column: 2;
}
```

Do not reorder the JSX to work around this, the explicit `grid-column` is the
correct, self-documenting fix and keeps the markup's reading order (title first)
intact for narrow-width, single-column layouts.

## 3. Preview Stack: Bigger, More of the Back Card Exposed, Timed Auto-Cycle

### Bigger, defensively responsive sizing

In `IdePreviewStack.module.css`, double `.stack`'s width, but clamp it so it can
never overflow its column on narrower desktop widths:

```css
.stack {
  position: relative;
  width: min(56rem, 100%);
  aspect-ratio: 16 / 10;
}
```

### Back card bigger and offset further, not smaller

Currently `.cardBack` scales *down* (`scale(0.97)`), which hides more of it, the
opposite of what is wanted. Swap so the back card is visibly *larger* than the
front one and offset further, exposing a bigger, easier-to-hit sliver:

```css
.cardActive {
  z-index: 2;
  transform: translate(0, 0) rotate(0deg) scale(1);
  box-shadow: 0 0 16px var(--glow-blue);
}

.cardBack {
  z-index: 1;
  transform: translate(2rem, 2rem) rotate(3deg) scale(1.1);
}
```

### Timed auto-cycle instead of instant hover-swap

Currently hovering a card swaps it to active immediately
(`onMouseEnter={() => setActiveIndex(index)}` on each button), which flickers
constantly while the cursor sits still. Replace with: hovering the *stack*
(not each card individually) starts a 1.5 second auto-cycle between the two
cards; it does not swap immediately on hover-in. Clicking (or focusing, for
keyboard users) a specific card selects it immediately and pauses the auto-cycle
until the cursor leaves and re-enters the stack. This also means touch/tap
(which never fires hover) is unaffected: tapping the exposed corner of the back
card still brings it to front immediately, exactly as before.

`IdePreviewStack.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './IdePreviewStack.module.css'

const AUTO_CYCLE_INTERVAL_MS = 1500

export function IdePreviewStack() {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const intervalRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!isHovering) return
    intervalRef.current = window.setInterval(() => {
      setActiveIndex((current) => (current === 0 ? 1 : 0))
    }, AUTO_CYCLE_INTERVAL_MS)
    return () => window.clearInterval(intervalRef.current)
  }, [isHovering])

  const selectCard = (index: number) => {
    window.clearInterval(intervalRef.current)
    setActiveIndex(index)
  }

  return (
    <div
      className={styles.stack}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {[0, 1].map((index) => (
        <button
          key={index}
          type="button"
          className={index === activeIndex ? styles.cardActive : styles.cardBack}
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

Note `onMouseEnter` moved from each button to the wrapping `.stack` div, and
each button no longer has its own `onMouseEnter`, only `onClick`/`onFocus`.

## 4. Desktop: Use More Horizontal Space, Push Columns Toward the Edges

Add a new, larger token to `tokens.css` (spacing category):

```css
--spacing-xl: 6rem;
```

In `LoginScreen.module.css`'s `@media (min-width: 1024px)` block, widen the
container, use the new larger gap, and give the text column a controlled,
readable width so the remaining (larger) space goes to the stack's column:

```css
@media (min-width: 1024px) {
  .content {
    max-width: 128rem;
    display: grid;
    grid-template-columns: minmax(32rem, 42rem) 1fr;
    align-items: start;
    gap: var(--spacing-xl);
    text-align: left;
  }

  /* .leftColumn / .rightColumn grid-column rules from section 2 stay as they are */

  .rightColumn {
    align-items: flex-end;
    gap: var(--spacing-md);
  }

  .actions {
    grid-column: 1 / -1;
    align-items: center;
  }
}
```

(Only `max-width`, `grid-template-columns`, and `gap` change here versus the
current rule; everything else in this block stays as it already is.)

## 5. Warning Triangle Icon on `BrowserSupportNotice`

Replace the circle-with-"i" placeholder in
`front/src/components/molecules/BrowserSupportNotice/BrowserSupportNotice.tsx`
with an actual warning-triangle icon (exclamation mark inside a triangle, the
universal warning symbol), keeping the same color token (`--color-neon-blue`,
via `currentColor`) so it stays on-brand, just reads clearly as a warning
instead of an info notice:

```tsx
<svg className={styles.icon} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
  <path d="M12 3 L22 20 H2 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  <line x1="12" y1="9" x2="12" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  <circle cx="12" cy="17.2" r="0.9" fill="currentColor" />
</svg>
```

Update `.icon` in `BrowserSupportNotice.module.css`: remove the circular
`border`/`border-radius` (the icon is now the triangle shape itself, it does not
need a circular frame around it), keep `color: var(--color-neon-blue)` and
`flex-shrink: 0`.

## Checkpoints

See `.claude/CHECKPOINTS.md` → "F02: Login Screen UI" → "Additional scope:
Layout and Interaction Polish" for the verifiable done-criteria.
