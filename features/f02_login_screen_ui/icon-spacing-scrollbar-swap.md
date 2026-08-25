# Additional scope: Icon Spacing, No-Scroll Fit, Scrollbar Transparency, Swap-on-Either-Click

Round 11 of adjustments to `f02_login_screen_ui`. Per the standing rule, this stays inside
the existing `f02` feature folder, no new feature id.

## 1. Nudge the MoonOrbitLogo icon down, not the title

`brandMuunColumn` (in `LoginScreen.module.css`) currently has no top spacing, so the icon
sits flush against the top edge of the window. `.title` uses `align-items: flex-end`, so
adding `padding-top` to `.brandMuunColumn` pushes the icon down while the bottom edge of
the column (where the "Muun" text sits) stays anchored exactly where it already is,
alongside "Hyper". This means the title's own vertical position is untouched: only the
icon gets breathing room above it.

Add to `.brandMuunColumn`:
```css
padding-top: var(--spacing-xs);
```

## 2. Reclaim vertical space so the browser-support notice does not need a scrollbar

At the `1024px` breakpoint, `.content` uses a single `gap: var(--spacing-xl)` (6rem) for
the CSS grid, which applies to both the column gap (leftColumn/rightColumn, wanted at
6rem) and the row gap (between that row and `.actions`, unnecessarily large). Split the
shorthand so only the row gap shrinks:

Replace, inside the `@media (min-width: 1024px)` block, in `.content`:
```css
gap: var(--spacing-xl);
```
with:
```css
column-gap: var(--spacing-xl);
row-gap: var(--spacing-sm);
```

Do not change `column-gap`. Do not touch `.leftColumn`/`.rightColumn`'s own internal
`gap`.

## 3. Fix the scrollbar so it visually reads as a floating, transparent, rounded thumb

The current implementation in `reset.css` paints the scrollbar track with
`var(--color-card-bg)` (`rgba(4, 21, 40, 0.6)`), which is nearly opaque against the page
background and renders as a solid rectangle behind the thumb, hiding the transparency
and making the whole scrollbar look like a solid bar rather than AzanoLabs' floating
rounded pill look.

Change, in `reset.css`:
```css
::-webkit-scrollbar-track {
  background: var(--color-card-bg);
}
```
to:
```css
::-webkit-scrollbar-track {
  background: transparent;
}
```

Do not change `::-webkit-scrollbar` (width/height), `::-webkit-scrollbar-thumb`
(background/border-radius), or the hover state: those values were already sourced
directly from AzanoLabs and are correct. Only the track's opacity was wrong.

After this change, verify in a real browser (not just by reading computed styles) that
the scrollbar now reads as a thin, rounded, translucent floating thumb, not a solid bar.
If it still does not look right after this fix, report exactly what it looks like
instead of guessing at another value.

## 4. Clicking either preview card should swap, not just the back one

In `IdePreviewStack.tsx`, both buttons currently call `setActiveIndex(index)` on click,
which is a no-op when the front (already-active) card is clicked, since it just sets the
state to the value it already has. Clicking the back card is the only click that visibly
does anything, which reads as "only the image behind swaps."

Replace the per-button `onClick={() => setActiveIndex(index)}` and
`onFocus={() => setActiveIndex(index)}` with a single shared toggle used by both buttons
for both events, so clicking (or focusing) either card flips which one is active:

```tsx
const toggleActive = () => setActiveIndex((current) => (current === 0 ? 1 : 0))
```

Use `onClick={toggleActive}` and `onFocus={toggleActive}` on both buttons. Do not keep
the per-button index-setting behavior: with only two cards, "swap" and "toggle" are the
same operation regardless of which card triggered it.

## 5. Browser tab title

`front/index.html`'s `<title>` is currently `HyperMuun`. Change it to:
```html
<title>HyperMuun - IDE</title>
```

## Checkpoints

See `.claude/CHECKPOINTS.md` -> "F02: Login Screen UI" -> "Additional scope: Icon
Spacing, No-Scroll Fit, Scrollbar Transparency, Swap-on-Either-Click".
