# F02 (additional scope): Grid Row, Hover Delay, and Favicon Removal

Additional adjustment work on `f02`, living in the same feature folder, not a new
feature id, per `CLAUDE.md` → "Rules for Agents" → "Adjustment vs. new feature".
Reviewed with `reviewer-light`.

This round was diagnosed by actually opening the running dev server in a real
Chrome tab (via `claude-in-chrome`) and inspecting computed styles/bounding
rects directly, not by reading the CSS and guessing, since the previous two
rounds' guesses on these same reports did not fix them.

## 1. Confirmed Root Cause: Left Column Landing on a New Grid Row

Verified directly in-browser at 1536px width: `.rightColumn` (DOM-first) sits at
`top: 40px`, `.leftColumn` (DOM-second) sits at `top: 594px`, a whole row lower,
even though both have distinct, correct `grid-column` values (`1` and `2`).
`getComputedStyle` confirms both have `grid-row: auto`.

**Root cause**: neither `.leftColumn` nor `.rightColumn` has an explicit
`grid-row`. CSS Grid's sparse auto-placement cursor only ever moves forward: it
places `.rightColumn` (processed first, DOM order) at column 2 of row 1, which
advances the placement cursor forward past row 1's remaining columns. When
`.leftColumn` is then placed at explicit column 1, the cursor has already
passed row 1, so the algorithm wraps to row 2, even though row 1's column 1 was
actually free the whole time. This is why the two-column layout never worked
as a real 2-column layout, despite the `grid-column` values themselves being
correct (this is what earlier rounds checked and is why it kept passing
review): column placement was right, row placement was the missing piece.

**Fix**, in `LoginScreen.module.css`'s `@media (min-width: 1024px)` block: pin
both columns to the same row explicitly.

```css
.leftColumn {
  grid-column: 1;
  grid-row: 1;
}

.rightColumn {
  grid-column: 2;
  grid-row: 1;
  align-items: flex-end;
  gap: var(--spacing-md);
}
```

(`.actions` needs no change: with both columns now correctly sharing row 1, it
naturally lands in row 2 on its own, which is already the intended position.)

## 2. Hover Delay: Shorten Substantially

The 1500ms hover-to-activate delay was verified to work mechanically (tested by
scripting a held hover over the back card's exposed corner for 2 seconds, it
did activate). The likely real-world problem: 1.5 full seconds is a long time
to hold a real, hand-controlled cursor perfectly still over a thin, irregular
exposed sliver without any pixel of drift; the slightest movement off that
sliver fires `onMouseLeave`, cancels the pending timeout, and the delay resets,
so it can feel like it "never" activates even though the mechanism itself is
sound. Shorten the delay so it is far more forgiving:

In `IdePreviewStack.tsx`, change `HOVER_ACTIVATE_DELAY_MS` from `1500` to `400`.

## 3. Remove `favicon.ico` Entirely

Delete `front/public/favicon.ico`. In `front/index.html`, remove the
`<link rel="alternate icon" href="/favicon.ico?v=3" />` line entirely (there is
no fallback file to point to anymore). Only the SVG favicon `<link>` remains.
Browsers without SVG favicon support will show no custom icon at all, an
accepted tradeoff per the user's explicit instruction.

## Checkpoints

See `.claude/CHECKPOINTS.md` → "F02: Login Screen UI" → "Additional scope:
Grid Row, Hover Delay, and Favicon Removal" for the verifiable done-criteria.
