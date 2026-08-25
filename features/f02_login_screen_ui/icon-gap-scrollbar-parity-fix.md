# Additional scope: Icon-to-Text Gap Fix and Scrollbar Byte-Parity with AzanoLabs

Round 12 of adjustments to `f02_login_screen_ui`. Per the standing rule, this stays
inside the existing `f02` feature folder, no new feature id.

## Context: what actually went wrong in Round 11

Round 11 guessed at two things without comparing against the real source, and both
guesses were wrong:

1. It read "acerca el icono" as "push the icon away from the top edge" and added
   `padding-top` to `.brandMuunColumn`. The user's actual ask was the opposite: bring
   the icon closer to the "Muun" text below it (the DOM gap was already `0`, the
   visible gap comes from the `MoonOrbitLogo` SVG's own drawn content not filling its
   full box, not from any CSS margin/gap). Do not undo the `padding-top` from round 11,
   it is a separate, already-approved fix for a different problem (top-edge breathing
   room); this round only adds a fix for the icon-to-text gap on top of it.
2. It assumed the scrollbar track needed to be `transparent` to look "less solid."
   This was verified against the real source this round: `azanolabs-web`'s
   `app/globals.css` (path:
   `C:\DevCode\Repositories\01_AzanoLabs\azanolabs-web\app\globals.css`, lines 68-99)
   uses a semi-transparent but **not fully transparent** track
   (`rgba(4, 21, 40, 0.6)`), the exact value our `--color-card-bg` token already held
   before round 11's change. Round 11's `transparent` value let the page's grid
   background pattern show through the scrollbar gutter, which is what actually read
   as "square/blocky" to the user, the opposite of the intended fix.

Both fixes below were tested live in a real browser (via `claude-in-chrome`) against
an isolated page running AzanoLabs' exact CSS, side by side with this project's actual
running page, before being written into this spec. Do not deviate from the exact
values given.

## 1. Bring the icon closer to "Muun" without moving the text

In `LoginScreen.module.css`, add to `.brandMuunColumn`, targeting only the SVG child
(do not touch the `span` holding the text, and do not touch the `.brandMuunColumn`
`padding-top` added in round 11):

```css
.brandMuunColumn svg {
  margin-bottom: calc(-1 * var(--spacing-sm));
}
```

This pulls the visual gap between the icon and "Muun" in tighter while leaving the
text span's own box untouched, so "Hyper" and "Muun" stay on the exact same baseline
(verified: both spans' `getBoundingClientRect().bottom` match exactly, `126px` in the
tested viewport, before and after this change).

## 2. Restore scrollbar byte-parity with AzanoLabs

In `front/src/styles/reset.css`:

- Change `::-webkit-scrollbar-track`'s `background` back to `var(--color-card-bg)`
  (undoing round 11's `transparent`, which was the wrong diagnosis).
- Change the `html { scrollbar-color: ...; scrollbar-width: thin; }` rule's selector
  from `html` to `*`, matching AzanoLabs' universal selector exactly (functionally
  near-identical since these properties inherit, but keep it byte-parity to remove any
  doubt).
- Change `rgba(11, 210, 255, 0.35)` in that same `scrollbar-color` line to
  `rgba(11, 210, 255, 0.4)`, the exact alpha AzanoLabs uses for that one line (this is
  the line's literal fallback value already called out as the deliberate exception in
  an earlier round's spec, distinct from `::-webkit-scrollbar-thumb`'s own
  `var(--color-card-border)` reference, which stays `0.35` and is unaffected).

Resulting rule:
```css
* {
  scrollbar-color: rgba(11, 210, 255, 0.4) rgba(4, 21, 40, 0.6);
  scrollbar-width: thin;
}
```

Do not change `::-webkit-scrollbar` (width/height), `::-webkit-scrollbar-thumb`, the
hover state, or `::-webkit-scrollbar-corner`: those already match AzanoLabs exactly.

## Checkpoints

See `.claude/CHECKPOINTS.md` -> "F02: Login Screen UI" -> "Additional scope: Icon Gap
Fix and Scrollbar Byte-Parity with AzanoLabs".
