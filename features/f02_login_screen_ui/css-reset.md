# F02 (additional scope): CSS Reset and Base Font Sizing

Additional work added to `f02` after its first approval, living in the same feature
folder rather than as a separate feature id, since it is a fix to `f02`'s own output,
not a new, independent piece of functionality.

## Objective

Fix the unstyled-browser-default look (stray white padding/margins) on the login
screen by adding a modern CSS reset, and adopt the `1rem = 10px` sizing convention
so future spacing/font-size math stays simple. This is a foundational fix that
touches `f02`'s already-approved output; no new visual design, no new components.

Reference: `CLAUDE.md` → "Frontend Architecture: Atomic Design + Pure CSS" (updated
to allow exactly two global CSS files: `tokens.css` and `reset.css`).

## The Reset

Create `front/src/styles/reset.css` with Josh Comeau's modern CSS reset
(https://www.joshwcomeau.com/css/custom-css-reset/), adapted for this app (Vite's
root div is `#root`, there is no `#__next`, that is a Next.js concern):

```css
/*
  Modern CSS reset, adapted from Josh Comeau
  https://www.joshwcomeau.com/css/custom-css-reset/
*/

*, *::before, *::after {
  box-sizing: border-box;
}

*:not(dialog) {
  margin: 0;
}

html {
  font-size: 62.5%; /* 62.5% of the ~16px browser default = 10px, so 1rem = 10px */
}

@media (prefers-reduced-motion: no-preference) {
  html {
    interpolate-size: allow-keywords;
  }
}

body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

p {
  text-wrap: pretty;
}
h1, h2, h3, h4, h5, h6 {
  text-wrap: balance;
}

#root {
  isolation: isolate;
}
```

Import `reset.css` in `front/src/main.tsx` before `tokens.css` (the reset normalizes
browser defaults first, tokens declare values on top of a clean base).

**Do not use `font-size: 10px` directly on `html`.** It must stay `62.5%`
(a percentage of the browser's own default, respecting the user's zoom/accessibility
font-size preference). A hardcoded pixel value here would defeat that.

## Recompute Existing `rem` Values

`front/src/styles/tokens.css`'s spacing/radius tokens were written assuming the
browser default (`1rem = 16px`). Recompute each to the exact same pixel size under
the new `1rem = 10px` base, so the already-approved `f02` login screen's visual
sizing does not shift:

| Token | Old value (16px base) | Pixel size | New value (10px base) |
|---|---|---|---|
| `--radius-sm` | `0.25rem` | 4px | `0.4rem` |
| `--radius-md` | `0.5rem` | 8px | `0.8rem` |
| `--spacing-xs` | `0.5rem` | 8px | `0.8rem` |
| `--spacing-sm` | `1rem` | 16px | `1.6rem` |
| `--spacing-md` | `1.5rem` | 24px | `2.4rem` |
| `--spacing-lg` | `2.5rem` | 40px | `4rem` |

Update only these six values in `tokens.css`.

## New Font-Size Tokens (found during implementation, expands this feature's scope)

The first implementation pass correctly flagged that several components have
literal `font-size` values written under the old `1rem = 16px` assumption, which
`rem` affects globally: they would render smaller once `html { font-size: 62.5%; }`
lands, exactly like the spacing tokens above. Per `CLAUDE.md` → "Frontend
Architecture" ("font" is already a declared token category alongside color and
spacing), add these to `tokens.css` instead of recomputing the literals in place:

| Token | Pixel size | Value (10px base) | Currently used by (old literal) |
|---|---|---|---|
| `--font-size-xs` | 12px | `1.2rem` | `BrowserSupportNotice` small text (`0.75rem`) |
| `--font-size-sm` | 14px | `1.4rem` | `BrowserSupportNotice` text (`0.875rem`) |
| `--font-size-body` | 15px | `1.5rem` | `LoginScreen` philosophy paragraph (`0.9375rem`) |
| `--font-size-base` | 16px | `1.6rem` | `LoginScreen` description, `Button` (`1rem`) |
| `--font-size-md` | 20px | `2rem` | `LoginScreen` tagline (`1.25rem`) |
| `--font-size-title` | 40px | `4rem` | `LoginScreen` title, base (`2.5rem`) |
| `--font-size-title-lg` | 48px | `4.8rem` | `LoginScreen` title, wider breakpoint (`3rem`) |

Update each listed component's `.module.css` to reference the matching
`var(--font-size-*)` instead of its current literal `rem` value. This also fixes a
pre-existing rule violation from the first `f02` round (literal font-size values
that should already have been tokens); the Reviewer missed it then, catch it now.

## Non-Token Dimensional Values (recompute in place, do not tokenize)

`max-width`, icon `width`/`height`, and similar one-off component dimensions are
not a declared token category (only color, font, and spacing are); recompute these
literals in place to preserve their exact pixel size, do not add tokens for them:

| File | Property | Old value (16px base) | Pixel size | New value (10px base) |
|---|---|---|---|---|
| `LoginScreen.module.css` | `max-width` | `42rem` | 672px | `67.2rem` |
| `BrowserSupportNotice.module.css` | `max-width` | `32rem` | 512px | `51.2rem` |
| `BrowserSupportNotice.module.css` | icon `width`/`height` | `1.25rem` | 20px | `2rem` |

## Manual Verification

- Load the login screen before and after: the white browser-default padding/margin
  around the page is gone, and every element's visual size (spacing, radii) looks
  identical to before, not smaller or larger, confirming the recompute preserved
  intent.
- Resize the browser's font-size/zoom accessibility setting up or down: the page
  scales proportionally (confirms `62.5%` stayed relative, was not hardcoded to
  `10px`).

## Checkpoints

See `.claude/CHECKPOINTS.md` → "F02: Login Screen UI" → "Additional scope: CSS
Reset and Base Font Sizing" for the verifiable done-criteria the Implementer and
Reviewer use for this round of work.
