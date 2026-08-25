# F02 (additional scope): Custom Scrollbar, Title Position, Button Copy

Additional adjustment work on `f02`, living in the same feature folder, not a new
feature id, per `CLAUDE.md` → "Rules for Agents" → "Adjustment vs. new feature".
Reviewed with `reviewer-light`.

Note: hover removal was already completed in the previous round
(`hover-removal-spacing-button-move.md`); `IdePreviewStack.tsx` already has no
hover logic, only `onClick`/`onFocus`. If it still appears to hover-swap when
tested, that is a stale browser cache, not the code.

## 1. Custom Desktop Scrollbar (AzanoLabs' Exact Recipe)

Read directly from AzanoLabs' own `globals.css` (the global, non-variant
scrollbar rule, not one of its per-component color variants):

```css
html {
  scrollbar-color: rgba(11, 210, 255, 0.35) rgba(4, 21, 40, 0.6);
  scrollbar-width: thin;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--color-card-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--color-card-border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-scrollbar-thumb-hover);
  box-shadow: 0 0 6px var(--glow-scrollbar-hover);
}

::-webkit-scrollbar-corner {
  background: transparent;
}
```

`--color-card-bg` (`rgba(4, 21, 40, 0.6)`) and `--color-card-border`
(`rgba(11, 210, 255, 0.35)`) already exist in `tokens.css` and happen to match
AzanoLabs' track/thumb values exactly, reuse them instead of duplicating.
`scrollbar-color`'s Firefox thumb value uses `0.35` (matching
`--color-card-border`) rather than AzanoLabs' own slightly different `0.4` for
that one property, a deliberate, negligible simplification to avoid adding a
token for a barely perceptible alpha difference.

Add two new tokens to `tokens.css` (colors category):

```css
--color-scrollbar-thumb-hover: rgba(11, 210, 255, 0.65);
--glow-scrollbar-hover: rgba(11, 210, 255, 0.5);
```

Add the scrollbar block above to `front/src/styles/reset.css`. This broadens
`reset.css`'s documented purpose slightly: update `CLAUDE.md` → "Frontend
Architecture: Atomic Design + Pure CSS" → the `reset.css` bullet to say its job
is "normalizing browser defaults and theming native browser chrome (the
scrollbar)", not only resets, since scrollbar theming does not fit `tokens.css`
(not a component) or a component's own `.module.css` (it targets `html`/
`::-webkit-scrollbar`, not a component class) either.

## 2. Move the Title/Logo Up, Leave the Left Column Untouched

`.content`'s `padding-top: var(--spacing-xl)` (added last round) pushes both
columns down together. The user wants only the title/logo lifted closer to the
top edge (fine if it ends up nearly touching it), the left column's spacing
must stay exactly as it is.

Add a negative top margin to `.rightColumn` only, expressed via existing
tokens (not a new literal value), leaving a small residual gap
(`--spacing-xs`) rather than landing at exactly `0`:

```css
.rightColumn {
  /* ...existing properties unchanged... */
  margin-top: calc(var(--spacing-xs) - var(--spacing-xl));
}
```

This pulls only `.rightColumn` (title + preview stack) up by
`var(--spacing-xl)` minus a small `var(--spacing-xs)` remainder, while
`.leftColumn` is a separate box entirely unaffected by this margin, so its
position from last round's `padding-top` change stays exactly as it is.

## 3. Shorter Sign-In Button Copy (Spanish Only)

In `front/src/locales/es.json`, change `"signInButton"` from
`"Iniciar sesión con GitHub"` to `"Iniciar con GitHub"`. Do not change
`en.json`'s `"Sign in with GitHub"`, only the Spanish string was asked for.

## Checkpoints

See `.claude/CHECKPOINTS.md` → "F02: Login Screen UI" → "Additional scope:
Custom Scrollbar, Title Position, Button Copy" for the verifiable
done-criteria.
