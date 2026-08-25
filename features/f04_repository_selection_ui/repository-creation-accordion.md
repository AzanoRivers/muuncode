# Additional scope: Repository Creation Accordion

Adjustment round on `f04`, not a new feature, per `CLAUDE.md`'s adjustment-vs-new-
feature rule: this is more work on the already-approved repository-selection mockup,
not a new phase. The mockup's overall shape (Card, no page scroll, internal list
scroll, "Siguiente" button) stays exactly as already built; this round replaces the
static "Crear nuevo repositorio" dashed-border button with a real accordion, and adds
a second, equally-real path for `Siguiente` to act on: creating a brand new repo
instead of picking an existing one.

Still stage-1 mockup: no real GitHub API call yet (neither listing nor creating a
repo). Clicking `Siguiente` in either mode stays a `// TODO(f04-stage-2): ...` +
`console.info` placeholder, per this feature's existing pattern. Stage 2 (real
`POST /user/repos` call, real field validation against GitHub's actual naming rules,
adding the newly-created repo to the GitHub App's installation if needed) is a
separate, later request.

## What changes

`RepoSelector`'s two top-level sections become a true accordion, exactly one
expanded at a time:

1. **"Crear nuevo repositorio"** (collapsed by default): a full-width tab-style
   header, not a small dashed-border button anymore. Expanding it reveals a small
   sub-form: repository name (required text field), visibility (public/private,
   reusing the same public/private concept `VisibilityTag` already displays, but as
   an interactive selectable control here, not a static tag), and description
   (optional). Copy: `createRepoTabLabel` ("Crear nuevo repositorio", same text the
   old button used), `repoNameLabel`/`repoNamePlaceholder`,
   `repoVisibilityLabel`, `repoDescriptionLabel`/`repoDescriptionPlaceholder`
   (all new i18n keys, both `es.json`/`en.json`). Reuse the existing
   `publicBadge`/`privateBadge` copy for the two visibility options, no duplicate
   strings.
2. **"Seleccionar repositorio existente"** (expanded by default): the existing
   `.list` of mock repos, unchanged in content/behavior, just now living inside
   the second accordion section instead of being the page's only content. New
   i18n key `existingRepoTabLabel`.

Only one section is expanded at a time (real accordion behavior, not two
independently-collapsible panels): expanding one collapses the other.

## `Siguiente`'s meaning depends on which section is expanded

`RepoSelector` already renders a single `Siguiente` button below both sections
(added in earlier rounds). Its enabled/disabled state and its meaning now depend on
which accordion section is currently expanded:

- **Existing-repo section expanded**: enabled exactly when a repo from the list is
  selected (`selectedRepoId`), same behavior as before.
- **Create-new section expanded**: enabled exactly when the repo name field is
  non-empty (trimmed). Visibility always has a value (pick a sensible default,
  e.g. public, matching github.com's own default), so it never blocks enablement.
  Description is optional, never blocks enablement either.

Clicking `Siguiente` while enabled stays a placeholder in both cases (per this
feature's existing pattern), just logging which mode/data it would act on.

## Component structure

- New molecule **`molecules/AccordionPanel`**: a generic, reusable single section
  (header button that toggles expand/collapse + a content region), not hardcoded to
  repos, so it is a clean primitive `RepoSelector` composes twice (once per
  section). Exposes whatever props make sense for a controlled expand/collapse
  (e.g. `label`, `isExpanded`, `onToggle`, `children`), and owns the accordion
  animation itself so both usages inherit it identically.
- New molecule **`molecules/CreateRepoForm`**: the name/visibility/description
  fields. Owns its own local state for the text inputs (do NOT lift keystroke-level
  state up into `RepoSelector`, which would re-render the whole component,
  including the mock repo list, on every keystroke; see Performance below).
  Notifies its parent only of derived validity via a callback (e.g.
  `onValidityChange: (isValid: boolean) => void`), following the same
  "only call the callback when the boolean actually changes" guard already used
  elsewhere in this feature (the scroll-indicator `onScroll` handler is the
  precedent). Full field values are not yet threaded further up: stage 2's real
  wiring is what will actually need them for the real API call, this stage's
  `Siguiente` placeholder can read them directly off `CreateRepoForm`'s own
  rendered inputs if it wants to log something concrete, or simply log that create
  mode was submitted; do not over-engineer value-plumbing this stage does not need.
- `RepoSelector` gains `expandedPanel: 'existing' | 'create'` state (a plain
  `useState`, defaulting to `'existing'`) and `createFormIsValid: boolean` state
  (defaulting to `false`, updated via `CreateRepoForm`'s `onValidityChange`).
  `Siguiente`'s `disabled` becomes
  `expandedPanel === 'existing' ? !selectedRepoId : !createFormIsValid`.

## Animation and performance requirements

This is the part the user explicitly called out as needing careful attention:

- The expand/collapse transition must be smooth on both desktop and mobile, with
  **no janky/heavy animation** and **no unnecessary re-renders**.
- Prefer a CSS-driven technique that the browser can animate cheaply (composited),
  not a JavaScript-measured height animation (no reading `scrollHeight` on every
  frame, no `requestAnimationFrame` loop driving the height by hand). The
  `grid-template-rows: 0fr` <-> `1fr` transition technique (a well-established,
  performant CSS-only approach for animating an element's height to its content's
  natural size) is a good fit; another equally valid CSS-only technique is
  acceptable if it achieves the same smoothness without JS-measured heights.
- The collapsed section must not affect layout while collapsed (effectively zero
  height, not just visually hidden while still taking space), and the whole
  `RepoSelector` must keep fitting inside `Station`'s fixed `100dvh` success
  screen with zero page-level scroll, exactly as already established: whichever
  section is expanded should be the one that flexes to fill the remaining
  vertical space (mirroring how `.list` alone currently does this), the collapsed
  one contributes only its own header's height.
- Respect `prefers-reduced-motion: reduce` (collapse the transition to an instant
  state change, matching every other animation in this codebase).
- Avoid unnecessary re-renders: toggling which section is expanded must not
  remount or re-render the mock repo list unnecessarily, and typing into
  `CreateRepoForm`'s fields must not re-render `RepoSelector`'s own tree beyond
  what is strictly needed (see `CreateRepoForm`'s own local-state requirement
  above). Use the existing "only setState when the value actually changes" guard
  pattern already established in this feature wherever a boolean derived from
  higher-frequency input (scroll position, form validity) is involved.

## Explicitly out of scope for this round

- Real GitHub repo creation (`POST /user/repos`), or any other real network call.
- Full GitHub repo-name validation rules (this stage only requires "non-empty,
  trimmed"; matching GitHub's actual allowed-character rules is stage-2 polish).
- Adding a newly-created repo to the GitHub App's installation.
- Persisting which accordion section was last expanded, or any form field value,
  across a page reload.

## Checkpoints

- [ ] `molecules/AccordionPanel` exists as a generic, reusable expand/collapse
      primitive (not hardcoded to repos), used twice inside `RepoSelector`.
- [ ] `molecules/CreateRepoForm` exists with repo name (required), visibility
      (public/private, defaulting to a sensible value), and description
      (optional) fields; reuses `publicBadge`/`privateBadge` copy for the
      visibility options, no duplicated strings.
- [ ] Exactly one accordion section is expanded at a time: expanding one collapses
      the other (true accordion, not two independently toggleable panels).
- [ ] "Crear nuevo repositorio" is a full-width tab-style header (not the old
      small dashed-border button), collapsed by default.
- [ ] "Seleccionar repositorio existente" is a full-width tab-style header wrapping
      the existing mock repo list, expanded by default.
- [ ] `Siguiente`'s `disabled` state is computed from whichever section is
      expanded: `selectedRepoId` when existing-repo is expanded, the create form's
      validity (non-empty trimmed name) when create-new is expanded.
- [ ] Clicking `Siguiente` while enabled remains a `// TODO(f04-stage-2): ...` +
      `console.info` placeholder in both modes, no real navigation or API call.
- [ ] The accordion transition uses a CSS-only technique (e.g.
      `grid-template-rows: 0fr`/`1fr`), not a JS-measured height animation; the
      collapsed section takes effectively zero layout height.
- [ ] The success screen still fits `100dvh` with zero page-level scroll; whichever
      accordion section is expanded is the one that flexes to fill the remaining
      vertical space (mirroring `.list`'s existing behavior).
- [ ] `prefers-reduced-motion: reduce` collapses the accordion transition to an
      instant state change.
- [ ] Typing in `CreateRepoForm`'s fields does not re-render `RepoSelector`'s own
      tree (specifically, the mock repo list) beyond what is unavoidable; validity
      changes are only propagated up when the boolean actually flips.
- [ ] New i18n keys (`createRepoTabLabel`, `existingRepoTabLabel`,
      `repoNameLabel`, `repoNamePlaceholder`, `repoVisibilityLabel`,
      `repoDescriptionLabel`, `repoDescriptionPlaceholder`) exist in both
      `es.json`/`en.json`.
- [ ] The now-unused `createRepoButton` i18n key and any now-dead CSS for the old
      dashed-border button are removed, not left as dead code.
- [ ] No em dash, no `throw`, no inline `style={{}}` outside a documented dynamic
      CSS-custom-property case, no literal color/spacing value outside
      `tokens.css`.
- [ ] `pnpm build` and `pnpm lint` (from `front/`) pass.

## Round 2: allow both collapsed, fix the transition glitch

Two real bugs found after clicking through the accordion live:

1. **Clicking the already-expanded tab's header should also close it**, leaving
   both sections collapsed (a lot of empty space in the card). This is the
   desired behavior, not a bug to prevent: `expandedPanel` needs a third state
   (`null`, neither expanded), reachable by clicking whichever header is
   currently active. `Siguiente` must be disabled whenever `expandedPanel` is
   `null` (neither a repo is selected nor a create-form is in progress).

2. **The expand/collapse transition itself is visually broken.** Opening "Crear
   nuevo repositorio" makes the existing-repo section's content appear to
   momentarily render on top of/overlapping the create section, instead of
   smoothly pushing content down. Root cause: `AccordionPanel`'s outer `.panel`
   switches between `.panelCollapsed { flex: none }` (auto/content-based height)
   and `.panelExpanded { flex: 1; min-height: 0 }` (flex-distributed height)
   *instantly*, at the exact same moment the *inner* `.contentWrapper`'s
   `grid-template-rows` starts a 300ms transition between `0fr`/`1fr`. Those are
   two fundamentally different sizing algorithms (flex-distributed vs.
   content-based/auto) with no shared interpolatable value between them, so the
   outer box's height snaps instantly while only the inner row track is actually
   animating, producing exactly the "appears on top of / doesn't push down,
   looks wrong" symptom described. The `0fr`/`1fr` grid trick is only reliable
   when the flex item's own outer sizing mode stays the same across the whole
   transition (this is the standard, well-tested way this technique is used);
   toggling `flex: none` <-> `flex: 1` on the same element that also contains the
   animating grid breaks that assumption.

   Fix by decoupling the two: give `AccordionPanel`'s outer `.panel` a single,
   *stable* sizing mode that never switches between collapsed and expanded (e.g.
   always `flex: 0 1 auto` / never toggling to `flex: 1`), so only the inner
   `grid-template-rows` transition is ever responsible for the visible height
   change, with nothing else changing sizing algorithm mid-transition. Since the
   existing-repo list still needs a comfortable, usable scrollable height when
   expanded (it can no longer rely on "flex:1 fills whatever is left" for that),
   give the list itself a sensible explicit height budget when expanded (e.g. a
   `max-height` using an existing spacing token or a sensible viewport-relative
   value, with its own `overflow-y: auto` exactly as it has today for scrolling
   within that budget), rather than deriving its height from the now-removed
   outer flex-grow behavior. Re-verify the "no page-level scroll, ever" rule
   still holds with this new sizing approach: the card's total height (header +
   whichever accordion content is expanded, if any + Siguiente) must still fit
   inside `Station`'s fixed `100dvh`, so pick a `max-height` for the list that
   comfortably fits within the remaining space in realistic conditions, it does
   not need to dynamically claim 100% of whatever room happens to be left
   anymore.

   **This fix must be verified live in a real browser, not just by reading the
   CSS**: click "Crear nuevo repositorio" open from the default state, then
   click "Seleccionar repositorio existente" open again, repeatedly, and confirm
   the transition looks like a clean push-down/reveal in both directions, with
   no overlap, no flash, no content appearing to render above content it should
   be pushing down. A code-only read of the stylesheet is not sufficient to close
   this checkpoint, since the bug is a live-rendering timing issue that CSS alone
   does not reveal on inspection.

### Checkpoints (Round 2)

- [ ] `expandedPanel` supports a third, "neither expanded" state, reachable by
      clicking the header of whichever panel is currently expanded.
- [ ] `Siguiente` is disabled whenever neither panel is expanded.
- [ ] `AccordionPanel`'s outer `.panel` no longer switches between two different
      outer sizing algorithms (e.g. `flex: none` vs `flex: 1`) synchronously with
      the inner `grid-template-rows` transition; only one thing animates the
      visible height per panel.
- [ ] The existing-repo list still has a comfortable, usable scrollable height
      when its section is expanded, achieved without depending on "flex:1 fills
      remaining space" (e.g. via an explicit `max-height`).
- [ ] Verified live in a real browser (not just by reading CSS): repeatedly
      toggling both accordion sections open/closed produces a clean push-down
      reveal/collapse in both directions, no overlap, no flash, no momentary
      rendering on top of the other section.
- [ ] The success screen still fits `100dvh` with zero page-level scroll in every
      combination of accordion state (both collapsed, either one expanded).
- [ ] No em dash, no `throw`, no inline `style={{}}`, no new literal value where
      an existing token already fits.
- [ ] `pnpm build` and `pnpm lint` (from `front/`) pass.

## Round 3: the expanded list overflows its own panel, overlapping "Siguiente"

Found by the lead directly in a real browser after Round 2, using
`getBoundingClientRect()` on the actual rendered elements (not just reading CSS):
with the existing-repo panel expanded, `.list`'s real rendered height was `320px`
(`32rem` at the `min-width: 1024px` breakpoint) while its own containing
`.panel`'s rendered height was only `291.6px`, of which the header ate roughly
`35px`, leaving only ~`256px` for the content area. The list overflows its own
panel by roughly `64px`, and `.nextAction` (rendered right after the panel in
`.selector`'s flex column) ends up positioned inside that overflow region,
producing exactly the "Siguiente sits on top of a repo row" bug.

**Root cause**: `AccordionPanel.module.css`'s `.contentPadding`, and
`RepoSelector.module.css`'s `.listWrapper`, both still use
`flex: 1; min-height: 0;`. That combination is correct ONLY when an ancestor
provides a *stretched, definite* height for them to grow into (which is exactly
how this worked before Round 2, when `AccordionPanel`'s outer `.panel` still
switched to `flex: 1` on expand). Round 2 removed that outer stretch (on purpose,
to fix the transition glitch), so `.panel` is now intrinsically/auto-sized based
on its content. But `flex: 1; min-height: 0` on a descendant, in an
intrinsically-sized ancestor chain with no stretch to grow into, causes the
browser's auto-height calculation for the ancestors to under-report the
descendant's true content height (since `min-height: 0` signals "do not fall
back to content-based sizing" at every level of that chain), rather than
reflecting `.list`'s actual, real `max-height`-capped size. The result: `.panel`'s
own auto height ends up smaller than what `.list` actually renders at, and the
excess spills out past `.panel`'s bottom edge into whatever comes next in the
flex column.

**Fix**: `.contentPadding` (in `AccordionPanel.module.css`) and `.listWrapper` (in
`RepoSelector.module.css`) must stop relying on `flex: 1` to inherit height from a
stretched ancestor that no longer exists; they should size normally based on
their own content (i.e., let `.list`'s explicit `max-height` be the actual
authoritative size the whole chain reflects, instead of a `flex:1;min-height:0`
combination that erases that signal for auto-height ancestors). Verify with real
`getBoundingClientRect()` measurements in a live browser (not just a code read)
that, once expanded, `.panel`'s own rendered bottom edge is at or past `.list`'s
rendered bottom edge (no overflow), and that `.nextAction`'s rendered top is at or
below `.panel`'s rendered bottom (no overlap), at both mobile and
`min-width: 1024px` widths, and with different mock-repo-count scenarios if easy
to check (fewer repos than fit vs. more than fit, to confirm scrolling still
engages correctly at the cap without ever overflowing its own container).

### Checkpoints (Round 3)

- [ ] `.contentPadding` (`AccordionPanel.module.css`) no longer relies on
      `flex: 1; min-height: 0` to inherit a stretched height from a removed outer
      flex-stretch; it sizes based on its own content instead.
- [ ] `.listWrapper` (`RepoSelector.module.css`) has the same fix applied.
- [ ] Measured live in a real browser via `getBoundingClientRect()`: the expanded
      panel's own rendered bottom edge is at or past `.list`'s rendered bottom
      edge (no overflow past the panel), and `.nextAction`'s rendered top is at or
      below the panel's rendered bottom (no overlap with the list), at both
      mobile and `min-width: 1024px` widths.
- [ ] The accordion's collapse/expand transition (fixed in Round 2) still works
      correctly after this change: re-verify live, no regression of the earlier
      overlap/flash glitch.
- [ ] The success screen still fits `100dvh` with zero page-level scroll.
- [ ] No em dash, no `throw`, no inline `style={{}}`, no new literal value where
      an existing token already fits.
- [ ] `pnpm build` and `pnpm lint` (from `front/`) pass.

## Round 4 supersedes Round 3's `max-height` approach

Live measurement AFTER Round 3 (done by the lead directly in a real browser with
`getBoundingClientRect()`, both before and after reloading to confirm the fix was
actually applied) revealed Round 3's fix does not actually solve the problem: a
static `max-height` cannot adapt to how much vertical space is genuinely
available, which depends on the real browser window height. Measured live at a
674px-tall viewport: the truly available content budget for the expanded panel
was only ~256px, while `.list`'s Round-3 `max-height` (`32rem` = 320px at
`min-width: 1024px`) demanded more than that. The browser flex-shrunk the panel
below its content's needs and, since nothing clips the overflow, the excess
spilled out past the panel's own box, overlapping `Siguiente` again, this time
even at rest with no transition in progress at all, not just during the click
transition Round 2 originally targeted.

**Correct direction**: restore genuine dynamic "fill whatever is actually
available" sizing, all the way from `.selector` down to `.list`, matching this
whole feature's original, already-correct behavior from Rounds 1 and 4-9 (before
this accordion round started). Concretely:

- Restore `flex: 1; min-height: 0;` on `.contentPadding` (`AccordionPanel.module.css`),
  `.listWrapper`, and `.list` (`RepoSelector.module.css`) exactly as they were
  before Round 3.
- Remove `.list`'s static `max-height` values entirely (both the mobile base rule
  and the `min-width: 1024px` override added in Round 3): `flex: 1; min-height: 0;`
  plus the already-existing `overflow-y: auto` is what correctly bounds it to
  whatever space is actually available and makes it scroll for any excess, with
  no static value needed or wanted.
- Restore `AccordionPanel`'s outer `.panel` toggling between a collapsed mode
  (content-based, effectively zero extra height) and an expanded mode that gets a
  real, definite share of `.selector`'s available space (i.e., something
  equivalent to the original `.panelExpanded { flex: 1; min-height: 0; }` /
  `.panelCollapsed { flex: none; }` pair from before Round 2), since without this,
  nothing upstream of `.contentWrapper` ever has a genuine definite height to
  stretch `.list` into, no matter what flex properties the deeper descendants
  have.
- Separately and carefully re-diagnose whatever *transition-time* visual glitch
  originally motivated Round 2, now that the steady-state sizing is correct
  again. This must be verified live in a real browser by actually clicking
  between the two accordion sections repeatedly, rather than assuming the
  earlier diagnosis (an instant flex-basis-mode switch racing an animated
  `grid-template-rows` transition) was correct without seeing it reproduced
  against the now-corrected steady-state layout. It is plausible the originally
  reported glitch was actually this same overflow-into-next-sibling issue all
  along, just made more visually confusing by happening mid-transition; if so,
  fixing the steady-state overflow (this round) may already resolve it with
  nothing further needed. If a genuine, separate transition-time glitch still
  reproduces after this fix, it must be solved without reintroducing the
  overflow bug (e.g. by checking stacking/z-index during the animation, not by
  changing the sizing strategy back to a static value).

### Checkpoints (Round 4)

- [ ] `.contentPadding`, `.listWrapper`, and `.list` have `flex: 1; min-height: 0;`
      restored; `.list`'s static `max-height` values (added in Round 3) are
      removed.
- [ ] `AccordionPanel`'s outer `.panel` again gets a real, definite share of
      `.selector`'s available space when expanded (dynamic, not a static value),
      restoring the pre-Round-2 `.panelExpanded`/`.panelCollapsed` behavior (or
      equivalent).
- [ ] Measured live with `getBoundingClientRect()`, at the actual browser
      viewport height being tested (not assumed): with the existing-repo panel
      expanded, the panel's own rendered bottom edge is at or past `.list`'s
      rendered bottom edge (no overflow), and `Siguiente` never overlaps the
      list.
- [ ] The list visibly fills available vertical space (matching the original
      "aprovechar el alto de la pantalla" requirement) rather than stopping at an
      arbitrarily small fixed height, when there is genuinely more room to use.
- [ ] Whatever transition-time visual behavior remains is checked live, by
      actually clicking between sections repeatedly in a real browser; if
      something still looks wrong, it is diagnosed against the corrected
      steady-state layout, not against the old (overflowing) one.
- [ ] The success screen still fits `100dvh` with zero page-level scroll.
- [ ] No em dash, no `throw`, no inline `style={{}}`, no new literal value where
      an existing token already fits.
- [ ] `pnpm build` and `pnpm lint` (from `front/`) pass.
