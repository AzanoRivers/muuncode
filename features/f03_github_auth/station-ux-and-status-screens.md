# Additional scope: Station UX, Pages, and Status Screens

Written retroactively. Covers the naming/structure corrections and the new
loading/error visuals built on top of the working auth flow.

## Renames: identity, not just labels

- `AuthCallback` → **`Station`**: it was never just a throwaway OAuth redirect
  screen. `/station` is MuunCode's actual IDE entry point; the real IDE UI does not
  exist yet, so it currently only shows status screens, but the name now matches what
  it already is, not what it used to be.
- `LoginScreen` → **`Home`**: it renders at `/`, the home route, exactly as real a
  route as `/station`. Signing in is one action on that page, not its whole identity.

## `templates/` → `pages/`

Every current top-level view (`Home`, `Station`, `NotFound`, `ServerError`) is
route-bound: `App.tsx` picks exactly one of them directly from
`window.location.pathname` or a caught render error, never composed inside another
view. That is what `CLAUDE.md`'s Atomic Design section already called out `pages/`
for. All four moved from `templates/` to `pages/`; `templates/` stays empty until
something genuinely needs a reusable page-shaped layout shared across more than one
page.

## New molecule: `StatusScreen`

`Station`'s "unauthenticated"/"needs install" screens, plus `NotFound` and
`ServerError`, all needed the exact same shape: brand wordmark, a short tagline badge,
the message in a card, one or more actions. `molecules/StatusScreen` (with a
`StatusScreenAction` wrapper for each button, since `Button.module.css`'s
`align-self: flex-start` would otherwise pin every button left) holds that shape once.
It also accepts an optional `variant` (`'blue' | 'purple' | 'red'`, passed to `Card`)
and an optional `icon`, used by the error screen below.

## New atom: `BrandTitle`

The `MuunCode` wordmark (brand prefix + `MoonOrbitLogo` inline as the "o" in "Code" +
brand suffix) used to live only inside `Home`. Extracted into its own atom once
`StatusScreen` needed the identical wordmark at the top of every status page. Its own
CSS deliberately does not set `text-align`, it inherits from wherever it renders, so
`Home` can right-align it while `StatusScreen` centers it, with no duplicated markup.

## New molecule: `LaunchLoader` (the loading screen)

Replaces the plain "Iniciando sesión con GitHub..." text while `Station` is verifying
the session (a network round trip that takes a couple of seconds) with a small rocket
launch animation:

- A `<canvas>` draws a starfield and a few clouds continuously scrolling downward,
  plus a fixed "ground" strip near the bottom, inside a tall glass-card-styled box.
- `atoms/RocketIcon` (same gradient+glow SVG technique as `MoonOrbitLogo`) sits on top
  of the canvas, not drawn on it: on mount it plays a one-time "liftoff" animation
  (starts near the ground, climbs to its resting position with a slight overshoot),
  then hands off seamlessly to an infinite, subtle up/down bob, done by staggering two
  CSS animations on the same element via `animation-delay` rather than trying to
  combine them into one keyframe.
- A `"CARGANDO..."` label sits centered inside the ground strip, styled to match
  `Button`'s typography (`--font-display`, bold, uppercase), not the more decorative
  title/tagline treatment used elsewhere on the page.
- When `Station` resolves the check (success, error, or needs-install), it does not
  swap screens immediately: it sets `LaunchLoader`'s `exiting` prop, which plays a
  700ms exit (`RocketIcon` flies up and out of frame while fading, the whole box fades
  via an opacity transition), and only then actually switches to the next screen
  (`Station.tsx`'s `EXIT_ANIMATION_MS` matches this duration exactly).
- Respects `prefers-reduced-motion`: draws one static canvas frame with no
  `requestAnimationFrame` loop, and every CSS animation (bob, liftoff, fly-away, flame
  pulse) collapses to a static end state instead.

## Styled error screen

The error screen (`Station`'s `error` status) now uses `StatusScreen` with
`variant="red"` and a leading `atoms/WarningIcon` (extracted from
`BrowserSupportNotice`, which had its own inline copy of the exact same warning
triangle SVG; now both share the one atom) instead of a plain sentence with no
styling. Tagline is the iconic "Houston, tenemos un problema...". Two actions: retry
sign-in (the same GitHub button as the other screens) and "Regresar" to `/`.

New tokens for this: `--color-neon-red`, `--color-card-bg-red`,
`--color-card-border-red`; `Card`'s `variant` type gained `'red'` alongside the
existing `'blue'`/`'purple'`.

## New pages: 404 and 500

`NotFound` (anything other than `/` or `/station`) and `ServerError` (rendered by a
new `ErrorBoundary` class component in `App.tsx`, wrapping the whole app, catching any
unexpected render error) both use `StatusScreen` with just a single "Regresar" action,
no other buttons.

## Checkpoints

- [x] `components/templates/` is empty (just an explanatory `index.ts`);
      `components/pages/` holds `Home`, `Station`, `NotFound`, `ServerError`, each
      with its own barrel, plus a category barrel re-exporting all four.
- [x] `App.tsx` picks between them by reading `window.location.pathname` directly (no
      routing library), and wraps everything in an `ErrorBoundary` that renders
      `ServerError` on a caught render error.
- [x] `molecules/StatusScreen` is used by `Station` (2 of its 5 states), `NotFound`,
      and `ServerError`; none of those four re-implement the badge/card/actions shape
      on their own.
- [x] `atoms/BrandTitle` has no `text-align` of its own; `Home` and `StatusScreen`
      each control its alignment from their own context.
- [x] `molecules/LaunchLoader` only renders while `Station`'s status is `exchanging`
      (including its `exiting` phase); every other status never mounts it.
- [x] `LaunchLoader`'s canvas animation and every CSS animation on it (`liftoff`,
      `bob`, `flyAway`, `flamePulse`) are disabled/collapsed under
      `prefers-reduced-motion: reduce`.
- [x] `atoms/WarningIcon` is the single source of that SVG; `BrowserSupportNotice` and
      `Station`'s error screen both import it, neither has its own inline copy.
- [x] `Card`'s `variant` type includes `'red'`; the new color tokens exist in
      `tokens.css` and are not used as literals anywhere else.
- [x] `pnpm build` and `pnpm lint` pass.
