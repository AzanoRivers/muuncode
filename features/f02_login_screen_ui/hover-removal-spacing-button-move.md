# F02 (additional scope): Remove Hover, Fix Top Spacing, Move Button to Left Column

Additional adjustment work on `f02`, living in the same feature folder, not a new
feature id, per `CLAUDE.md` → "Rules for Agents" → "Adjustment vs. new feature".
Reviewed with `reviewer-light`.

## 1. Remove the Hover-Swap Mechanism Entirely, Keep Only Click/Focus

**Likely root cause of "goes crazy" oscillation**: hover-triggered swaps change
`.cardActive`/`.cardBack`'s `transform` (size, offset, rotation) via a `0.3s`
CSS transition. While that transition animates and the cursor stays still, the
element boundary sweeping underneath it can cross the cursor's position
mid-animation, firing a stray `mouseenter`/`mouseleave` pair on the other card,
which schedules another swap once its own delay elapses, which animates again,
which can trigger another stray event, repeating indefinitely as long as the
cursor stays roughly still. This is a feedback loop between animated,
overlapping hit-targets and hover-based state changes, not fixable by tuning
the delay value again (already tried twice: `1500`, then `400`, this round
found the actual class of problem instead of a fourth number to try).

Click and focus were already confirmed reliable by the user's own testing.
Remove the hover mechanism completely rather than patch it a fourth time:

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
          onClick={() => setActiveIndex(index)}
          onFocus={() => setActiveIndex(index)}
        >
          {t('idePreviewPlaceholder')} {index + 1}
        </button>
      ))}
    </div>
  )
}
```

Remove `useRef`/`HOVER_ACTIVATE_DELAY_MS`/`scheduleActivate`/
`cancelScheduledActivate`/`onMouseEnter`/`onMouseLeave` entirely, none of it is
used anymore. `IdePreviewStack.module.css`'s `transition` on `.cardActive`/
`.cardBack` stays (the swap still animates smoothly on click, that part was
never the problem), only the JS-driven hover scheduling is removed.

## 2. More Space Above the Tagline Badge

The badge currently sits right at `.content`'s top padding edge
(`var(--spacing-lg)`, 40px), which reads as too tight against the top of the
page. Add an explicit, larger top padding at every breakpoint in
`LoginScreen.module.css` (the shorthand `padding` on `.content` sets all sides
at once, so `padding-top` must be re-declared after each shorthand to survive):

```css
.content {
  /* ...unchanged... */
  padding: var(--spacing-lg) var(--spacing-sm);
  padding-top: var(--spacing-xl);
}

@media (min-width: 768px) {
  .content {
    padding: var(--spacing-lg) var(--spacing-md);
    padding-top: var(--spacing-xl);
  }
  /* ...title rule unchanged... */
}
```

(The `1024px` block does not redeclare `padding` at all today, so it does not
need its own `padding-top` override, it inherits the `768px` block's value.)

## 3. Move the Sign-In Button Into the Left Column

Currently `Button` lives in `.actions`, spanning both columns at the very
bottom, alongside `BrowserSupportNotice`. Move it into `.leftColumn`, right
after the tagline `Badge` and both `Card`s (the "3 text boxes"). `.actions`
keeps only `BrowserSupportNotice`.

In `LoginScreen.tsx`:

```tsx
<div className={styles.leftColumn}>
  <Badge>{t('tagline')}</Badge>
  <Card variant="blue">
    <p className={styles.description}>{t('description')}</p>
  </Card>
  <Card variant="purple">
    <p className={styles.philosophy}>{t('philosophy')}</p>
  </Card>
  <Button onClick={handleSignIn}>
    <GitHubIcon size={20} />
    {t('signInButton')}
  </Button>
</div>
<div className={styles.actions}>
  <BrowserSupportNotice />
</div>
```

`.leftColumn` is a `flex-direction: column` container with no explicit
`align-items`, which defaults to `stretch`; `Button`'s own CSS has no
`display: block`/width constraint that would prevent it from stretching to the
full column width, which would look wrong (buttons should size to their own
content, not stretch full-width). Add `align-self: flex-start` to `.button` in
`Button.module.css` so it keeps its natural, content-sized width regardless of
which flex container it ends up in.

## Checkpoints

See `.claude/CHECKPOINTS.md` → "F02: Login Screen UI" → "Additional scope:
Remove Hover, Fix Top Spacing, Move Button to Left Column" for the verifiable
done-criteria.
