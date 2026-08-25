# F02 (additional scope): Logo Selection, Favicon, and Layout

Additional adjustment work on `f02`, living in the same feature folder, not a new
feature id, per `CLAUDE.md` → "Rules for Agents" → "Adjustment vs. new feature".

## 1. Logo Decision: `MoonOrbitLogo` Wins

The comparison row served its purpose. Remove the other 3 candidates entirely:
delete `front/src/components/atoms/RocketAscentLogo/`,
`front/src/components/atoms/ChipMoonLogo/`, and
`front/src/components/atoms/CircuitMoonLogo/` (folders and their barrel exports),
and remove the `.logoRow` comparison markup from `LoginScreen.tsx` along with its
`{/* TEMP */}` comment. `MoonOrbitLogo` is MuunCode's logo going forward, remove
its own smoke-test-era comment if any, it is no longer a candidate among others.

## 2. Favicon: SVG, Not a Rasterized `.ico`

Modern browsers (Chrome, Firefox, Edge, current Safari) support SVG favicons
directly, which stays crisp at any resolution and needs no rasterization tooling
or new dependency, the simpler and more modern option per the Technology
Philosophy. Older browsers that do not support it fall back automatically to the
existing `.ico`.

Create `front/public/icon.svg` as a **standalone** file (not a React component;
favicon links need a real file path), using `MoonOrbitLogo`'s exact paths and
gradient/glow technique, with fixed ids (no `useId()`, only one instance exists in
this file) and a filled rounded background square using the app's actual
background color, so the icon reads clearly against a light browser tab bar:

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
  <rect width="24" height="24" rx="4" fill="#041528" />
  <g filter="url(#hm-glow)" fill="none" stroke="url(#hm-gradient)" stroke-width="1.4" stroke-linecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    <ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(-15 12 12)" />
  </g>
</svg>
```

The hex colors above are hardcoded on purpose: standalone favicon files load
outside the page's stylesheet, they cannot read CSS custom properties, so these
are copied verbatim from `tokens.css`'s current values
(`--color-bg`/`--color-neon-blue`/`--color-neon-purple`/`--color-neon-pink`). If
those tokens ever change, this file must be updated to match by hand.

In `front/index.html`, replace the single favicon link with two, SVG first:

```html
<link rel="icon" type="image/svg+xml" href="/icon.svg" />
<link rel="alternate icon" href="/favicon.ico" />
```

Keep the existing `front/public/favicon.ico` (the AzanoLabs placeholder) exactly
where it is, it is now the fallback for browsers without SVG favicon support, not
the primary icon.

## 3. Desktop Layout: Use Horizontal Space, No Scroll

At mobile widths, keep the current single-column, centered layout unchanged. Add
a `min-width: 1024px` breakpoint to `LoginScreen.module.css` that:

- Widens `.content`'s `max-width` to `96rem` (was `67.2rem`), so the layout can
  actually use desktop horizontal space instead of staying narrow and tall.
- Puts the two `Card` elements (description, philosophy) side by side: wrap them
  in a new `.cardGrid` container, `display: grid; grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);`, replacing their current stacked arrangement at this
  breakpoint only (stay stacked below `1024px`).
- Tightens `.content`'s vertical `gap` at this breakpoint (e.g. `var(--spacing-sm)`
  instead of `--spacing-md`) so the full page comfortably fits one typical desktop
  viewport height without a vertical scrollbar.

## 4. Card Color Variants

Each card should read as visually distinct, not two identical dark boxes. Add two
new tokens to `tokens.css` (colors category):

```css
--color-card-bg-blue: rgba(11, 210, 255, 0.1);
--color-card-bg-purple: rgba(179, 102, 255, 0.1);
```

Give `Card` an optional `variant?: 'blue' | 'purple'` prop (default: the existing
neutral `--color-card-bg`, unchanged). Add matching modifier classes in
`Card.module.css` (`.card--blue`, `.card--purple`) that only override
`background`, keep `backdrop-filter`/`border`/`border-radius`/`padding` from the
base `.card` class. Use `variant="blue"` for the description card, `variant="purple"`
for the philosophy card.

## 5. Brand Lockup: Logo Above "Muun", Right-Aligned

Experimental typographic treatment, per the user's own framing ("to see how it
looks"): restructure the `<h1>` so `MoonOrbitLogo` sits directly above the word
"Muun", with "Hyper" beside that column, and the whole title block right-aligned
instead of centered (only the title/logo block, leave the rest of the page's
alignment as-is for now).

Derive the split from the actual translation string, do not hardcode "Hyper"/
"Muun" as separate literals (keeps this driven by `en.json`/`es.json`, not a
second, disconnected source of truth):

```tsx
const title = t('title') // "MuunCode", identical in both locales
const brandPrefix = title.slice(0, 5) // "Hyper"
const brandSuffix = title.slice(5) // "Muun"
```

```tsx
<h1 className={styles.title}>
  <span>{brandPrefix}</span>
  <span className={styles.brandMuunColumn}>
    <MoonOrbitLogo size={40} />
    <span>{brandSuffix}</span>
  </span>
</h1>
```

`.title` becomes `display: flex; align-items: flex-end; justify-content: flex-end;
gap: var(--spacing-xs);` (right-aligned within `.content`, which itself may still
be centered, only this block shifts right). `.brandMuunColumn` is
`display: flex; flex-direction: column; align-items: center; gap: var(--spacing-xs);`
so the icon centers directly above "Muun".

## Checkpoints

See `.claude/CHECKPOINTS.md` → "F02: Login Screen UI" → "Additional scope: Logo
Selection, Favicon, and Layout" for the verifiable done-criteria.
