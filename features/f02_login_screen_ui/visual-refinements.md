# F02 (additional scope): Visual Refinements

Additional adjustment work on `f02`, living in the same feature folder, not a new
feature id, per `CLAUDE.md` → "Rules for Agents" → "Adjustment vs. new feature".

## 1. Grid Background Size

Currently `front/src/components/atoms/GridBackground/GridBackground.module.css` uses
`25px` base, `40px` at `≥768px`, `50px` at `≥1200px`, which is visibly larger than
AzanoLabs' actual grid at normal desktop widths. Replace with AzanoLabs' real
breakpoints and sizes exactly:

```css
.gridBackground {
  /* ...unchanged... */
  background-size: 25px 25px;
}

@media (min-width: 360px) {
  .gridBackground {
    background-size: 35px 35px;
  }
}

@media (min-width: 440px) {
  .gridBackground {
    background-size: 40px 40px;
  }
}
```

Remove the old `768px`/`1200px` breakpoints entirely, replace with these two.

## 2. Content Presentation

The tagline and description/philosophy currently render as plain `<p>` text, which
reads as flat and unremarkable for copy this important. Add two new reusable atoms
and restructure `LoginScreen` around them.

### New token (add to `front/src/styles/tokens.css`, colors category)

```css
--color-card-bg: rgba(4, 21, 40, 0.6);
--color-card-border: rgba(11, 210, 255, 0.35);
```

### `atoms/Badge/`

A glowing pill for short, high-importance text (the tagline). Uppercase,
`--font-display`, a neon border with a soft pulsing glow (respect
`prefers-reduced-motion: reduce`, no animation if the user has that set), built the
same way AzanoLabs' own glow utilities work: layered `box-shadow` referencing
`--glow-blue`/`--glow-purple`. Padding from `--spacing-xs`/`--spacing-sm`, radius
from `--radius-md`. Accepts `children: ReactNode`.

### `atoms/Card/`

A glassmorphism container for body text (description, philosophy), matching
AzanoLabs' own `.card` recipe: `background: var(--color-card-bg)`,
`backdrop-filter: blur(8px)` **with the `-webkit-backdrop-filter` prefix**
(`.claude/context/context-iphone-bugs.md` applies here directly), `border: 1px
solid var(--color-card-border)`, radius from `--radius-md`, padding from
`--spacing-md`. Accepts `children: ReactNode`.

### `atoms/GitHubIcon/`

The official GitHub mark as an inline SVG, `fill="currentColor"` (a solid
silhouette icon, not a stroked line icon like the logo atoms), `viewBox="0 0 24
24"`, sized via a `size` prop (default `20`). Path data (the standard, widely-used
GitHub mark):

```
M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12
```

### `LoginScreen` restructure

- Wrap `{t('tagline')}` in `Badge` instead of a plain `<p>`.
- Wrap `{t('description')}` in its own `Card`.
- Wrap `{t('philosophy')}` in its own `Card` (two separate cards, not one shared
  card: keeps "what it is" visually distinct from "why it exists").
- `Button`'s content becomes `<GitHubIcon size={20} /> {t('signInButton')}`
  (`Button` already accepts arbitrary `children`, no change to `Button.tsx`
  itself needed, only its `.module.css` needs `display: flex; align-items:
  center; gap: var(--spacing-xs);` so the icon and text line up).

## 3. Logo Comparison (temporary test arrangement)

Build 3 additional logo concepts, all using the exact same technique as the
existing `MoonOrbitLogo` (a 3-stop `linearGradient` on `stroke`, `feGaussianBlur` +
`feMerge` glow filter, `viewBox="0 0 24 24"`, a `size` prop), so all 4 read as one
consistent family:

- `atoms/RocketAscentLogo/`: a simple line-art rocket ascending, built from basic
  primitives (a triangular nose cone, a rounded rectangular body, two small fin
  triangles, a small flame triangle beneath). Ties directly to "reach the Moon".
- `atoms/ChipMoonLogo/`: a hexagon outline (evokes a microprocessor/chip package)
  with a small crescent moon shape centered inside it. Ties directly to
  "microprocessors" plus the Moon motif together.
- `atoms/CircuitMoonLogo/`: the same crescent moon silhouette, with a few small
  circuit-trace nodes (small circles connected by short right-angle lines)
  branching off its outer edge, evoking a PCB trace. The most literal fusion of
  "hardware" and "Moon".

**Temporary arrangement in `LoginScreen`**: replace the single
`<MoonOrbitLogo size={96} />` with all four logos rendered side by side in a row
(equal size, equal spacing via `--spacing-md`), clearly commented in the code as a
temporary comparison (e.g. `{/* TEMP: logo comparison, remove 3 once one is
chosen, see features/f02_login_screen_ui/visual-refinements.md */}`), so it is
obvious this row is not the final layout and easy to revert once the user picks a
favorite.

## Checkpoints

See `.claude/CHECKPOINTS.md` → "F02: Login Screen UI" → "Additional scope: Visual
Refinements" for the verifiable done-criteria.
