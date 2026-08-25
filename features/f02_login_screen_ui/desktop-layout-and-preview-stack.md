# F02 (additional scope): Desktop Two-Column Layout and IDE Preview Stack

Additional adjustment work on `f02`, living in the same feature folder, not a new
feature id, per `CLAUDE.md` → "Rules for Agents" → "Adjustment vs. new feature".

**This round replaces the `≥1024px` `.cardGrid` treatment from the previous round**
(side-by-side description/philosophy cards): the two-column split now happens at
the page level instead, described below.

There are no real IDE mockups yet (nothing beyond this login screen has been
built). Per the user's explicit confirmation, this round builds the full
placeholder-image-stack mechanism now with clearly-labeled placeholders, ready to
swap in real screenshots later without touching any component logic.

## 1. Left-Align Body Text

`Card`'s content (description, philosophy) currently inherits `.content`'s
`text-align: center`. Add `text-align: left` directly on `.description` and
`.philosophy` in `LoginScreen.module.css` so they read left-aligned regardless of
what alignment the surrounding layout uses, at every breakpoint (mobile included,
left-aligned paragraphs are more readable than centered ones generally, not just a
desktop-only fix).

## 2. New Molecule: `IdePreviewStack`

Two overlapping placeholder cards. Hovering (desktop) or tapping the visible
sliver of the back card (mobile, since the front card visually covers most of it,
the only tappable area naturally is that exposed corner, no special hit-area math
needed) brings that card to the front with a smooth transition.

`front/src/components/molecules/IdePreviewStack/IdePreviewStack.tsx`:

```tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './IdePreviewStack.module.css'

export function IdePreviewStack() {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className={styles.stack}>
      {[0, 1].map((index) => (
        <button
          key={index}
          type="button"
          className={index === activeIndex ? styles.cardActive : styles.cardBack}
          onMouseEnter={() => setActiveIndex(index)}
          onFocus={() => setActiveIndex(index)}
          onClick={() => setActiveIndex(index)}
        >
          {t('idePreviewPlaceholder')} {index + 1}
        </button>
      ))}
    </div>
  )
}
```

`IdePreviewStack.module.css`:

```css
.stack {
  position: relative;
  width: 28rem;
  aspect-ratio: 16 / 10;
}

.cardActive,
.cardBack {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-card-bg);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cardActive {
  z-index: 2;
  transform: translate(0, 0) rotate(0deg) scale(1.03);
  box-shadow: 0 0 16px var(--glow-blue);
}

.cardBack {
  z-index: 1;
  transform: translate(1.2rem, 1.2rem) rotate(3deg) scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .cardActive,
  .cardBack {
    transition: none;
  }
}
```

Add its barrel `index.ts`, export it from `molecules/index.ts`.

### New locale keys

Add to both `en.json` and `es.json`:

```json
"idePreviewPlaceholder": "IDE preview"
```
(Spanish: `"Vista previa del IDE"`.) The component appends the number (`1`/`2`)
itself, not part of the translated string.

## 3. Desktop Two-Column Page Layout (replaces the previous `.cardGrid` rule)

In `LoginScreen.module.css`, replace the `@media (min-width: 1024px)` block's
`.cardGrid` rule with a page-level two-column split:

**Base rule, outside any media query** (this is the part missed in the first
attempt at this spec, caught by the Reviewer: without it, `.leftColumn`,
`.rightColumn`, and `.actions` have no spacing between their own children below
`1024px`, since `.content`'s `gap` only separates the three wrapper `<div>`s
from each other, not the elements nested inside each one):

```css
.leftColumn,
.rightColumn,
.actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
```

Then, inside `@media (min-width: 1024px)`, only the grid/alignment specifics
(do not repeat `display`/`flex-direction`/`gap`, they are already set above,
this block only overrides what actually differs at this breakpoint):

```css
@media (min-width: 1024px) {
  .content {
    max-width: 96rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: start;
    gap: var(--spacing-lg);
    text-align: left;
  }

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

Remove the old flex-column `.content` rule's `align-items: center` /
`text-align: center` only within this `1024px` override (keep them for narrower
widths, where everything still stacks in one column as it does today). Remove
`.cardGrid` entirely, it is superseded by `.leftColumn`.

### `LoginScreen.tsx` restructure

Wrap existing elements into two new container `<div>`s (only meaningful at
`≥1024px`, they render as plain stacking containers below that):

```tsx
<GridBackground>
  <main className={styles.content}>
    <div className={styles.rightColumn}>
      <h1 className={styles.title}>{/* unchanged */}</h1>
      <IdePreviewStack />
    </div>
    <div className={styles.leftColumn}>
      <Badge>{t('tagline')}</Badge>
      <Card variant="blue"><p className={styles.description}>{t('description')}</p></Card>
      <Card variant="purple"><p className={styles.philosophy}>{t('philosophy')}</p></Card>
    </div>
    <div className={styles.actions}>
      <Button onClick={handleSignIn}><GitHubIcon size={20} />{t('signInButton')}</Button>
      <BrowserSupportNotice />
    </div>
  </main>
</GridBackground>
```

Note `rightColumn` appears first in markup (it is the grid's first column at
desktop) even though it is visually on the right; at narrow widths (single
column, no grid), source order becomes visual order, so title+stack still show
first, which matches the current mobile reading order and needs no separate
mobile-only reordering rule.

## Manual Verification

- At `≥1024px`: text column reads left-aligned, title/stack column is visually on
  the right, hovering either preview card brings it to the front smoothly,
  tabbing to a card with the keyboard also brings it to front (focus parity).
- At `<1024px`: single column, title+stack first, then badge/cards/button/notice,
  tapping the visible corner of the back preview card brings it to front (no
  hover available, click/tap still works).
- The page still fits one typical desktop viewport height with no vertical
  scrollbar (re-verify this explicitly, this round adds a new visual element).

## Checkpoints

See `.claude/CHECKPOINTS.md` → "F02: Login Screen UI" → "Additional scope:
Desktop Two-Column Layout and IDE Preview Stack" for the verifiable done-criteria.
