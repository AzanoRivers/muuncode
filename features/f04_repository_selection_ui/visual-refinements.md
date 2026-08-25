# Additional scope: Visual Refinements

Adjustment round on `f04`, not a new feature, per `CLAUDE.md`'s adjustment-vs-new-
feature rule. The user reviewed the stage-1 mockup and asked for 4 corrections:

1. **Too large overall.** `RepoSelector`'s paddings/gaps/heading size need tightening.
2. **Pulse glow belongs only to the tagline badge.** `Station`'s success message
   ("Aqui Houston, luz verde.") should use the same visual language as every other
   status screen (`StatusScreen`'s `BrandTitle` + pulsing `Badge` tagline), but the
   Public/Private tags on each `RepoListItem` were built by reusing that same `Badge`
   atom, so they pulse too. Only one pulsing element per screen makes sense. Fix:
   a new, non-pulsing atom for the visibility tag, colored by variant (`--color-
   neon-green` for public, `--color-neon-purple` for private, both pre-existing
   tokens, no new ones needed).
3. **Missing brand identity.** Unlike `NotFound`/`ServerError`/`Station`'s own
   `error`/`unauthenticated`/`needsInstall` branches (all via `StatusScreen`, which
   always renders `BrandTitle`), the `success` branch never rendered `BrandTitle` at
   all. Add it, matching the same placement/style.
4. **No page scroll, ever; internal scroll instead.** The whole point of a repo
   picker is that the list can grow arbitrarily long. The page itself (header +
   badge + create-button) must always fit one viewport with zero page-level scroll;
   only the repo list itself scrolls internally when it overflows its allotted
   space. The "Crear nuevo repositorio" action moves to the top of `RepoSelector`
   (before the list), not the bottom, so it is always visible without scrolling.

## Checkpoints

- [ ] `Station.tsx`'s `success` branch renders `BrandTitle` at the top, matching
      `StatusScreen`'s placement/style.
- [ ] The success tagline ("Aqui Houston, luz verde.") renders via the existing
      `Badge` atom (pulsing), not a plain `<p>`.
- [ ] A new atom (e.g. `atoms/VisibilityTag`) replaces `Badge` inside
      `RepoListItem` for the Public/Private label: no pulse animation, colored by
      variant using pre-existing tokens (`--color-neon-green`/`--color-neon-
      purple`), no new color tokens added.
- [ ] `Badge` itself is unchanged: it keeps its pulse for every tagline usage
      across the app (`StatusScreen`, and now `Station`'s success branch);
      `RepoListItem` no longer imports `Badge` at all.
- [ ] The success screen's outer layout fills the viewport height
      (`100vh`/`100dvh`) with the header (`BrandTitle` + tagline) and the
      create-new-repo action always visible, no page-level scrollbar appears
      regardless of how many mock repos are listed.
- [ ] `RepoSelector`'s repo list (`.list` or equivalent) has its own
      `overflow-y: auto` and a bounded height (e.g. `flex: 1; min-height: 0`
      inside a flex column), so it is the only element that scrolls when repos
      overflow the available space.
- [ ] "Crear nuevo repositorio" renders before the repo list, not after.
- [ ] Overall sizing reduced: smaller heading/hint font size and/or padding/gap
      values than the original round, tuned so the whole `success` screen
      (header + create button + a few visible list rows) reads as compact, not
      oversized, at both mobile and `min-width: 1024px` desktop widths.
- [ ] No em dash, no `throw`, no inline `style={{}}`, no new literal color value
      outside `tokens.css`.
- [ ] `pnpm build` and `pnpm lint` (from `front/`) pass.

## Round 2: card layout, create-button size, scrollbar gap

Second batch of feedback after seeing round 1's result:

1. **`RepoListItem` cards read as too short for their content.** Increase the
   card's min-height and reduce the visibility tag's visual weight (new
   `--font-size-2xs` token, one step below the existing `--font-size-xs`, since
   `xs` is already the smallest size token and the tag needs to read smaller than
   the repo name without shrinking to an unreadable size via a raw literal).
2. **Fixed, non-colliding positions.** `repoUpdatedPlaceholder`'s copy shortens to
   just "Reciente"/"Recent" and moves to a fixed position, the card's top-right
   corner (`position: absolute`), so it never competes for space with the name or
   the visibility tag. The visibility tag itself always sits on the right side of
   the icon+name row (it already does via `.name`'s `flex: 1 1 auto`, keep that),
   clearly separated vertically from the corner label so the two never overlap.
3. **Repo name always truncates.** Already has `overflow: hidden; text-overflow:
   ellipsis; white-space: nowrap`, but the parent row currently has `flex-wrap:
   wrap`, which lets the row wrap instead of letting `.name` actually shrink and
   truncate. Remove the wrap so truncation behavior is reliable regardless of name
   length, keeping the card's height/structure constant.
4. **"Crear nuevo repositorio" button is too large.** It is the shared `Button`
   atom at its default size, same as this app's primary CTAs (GitHub sign-in,
   install). In this dashed-border context, it should read smaller/secondary,
   similar to how `Station.module.css`'s `.signOutAction button` already demotes
   that same shared `Button` atom via a child selector, without adding a
   `className` prop to `Button` itself (which is used elsewhere at full size).
5. **Scrollbar needs breathing room.** `RepoSelector`'s `.list` scrollbar currently
   sits flush against the repo cards with zero gap, reads wrong. Add a small
   right padding to `.list` so the scrollbar and the cards have visible
   separation, without introducing horizontal scroll.

### Checkpoints (Round 2)

- [ ] New `--font-size-2xs` token added to `tokens.css`, one step below
      `--font-size-xs` in the existing scale, used by `VisibilityTag` instead of
      `--font-size-xs`.
- [ ] `RepoListItem`'s min-height increased from its round-1 value, enough that
      the icon+name+tag row and the corner label both have comfortable breathing
      room.
- [ ] `repoUpdatedPlaceholder` copy shortened to "Reciente"/"Recent" in both
      `es.json`/`en.json`, rendered via `position: absolute` in the card's
      top-right corner, never overlapping the icon/name/tag row.
- [ ] The icon+name+tag row's parent no longer has `flex-wrap: wrap`; `.name`
      keeps truncating via `overflow: hidden; text-overflow: ellipsis; white-space:
      nowrap` regardless of repo name length; the visibility tag stays visually
      pinned to the row's right edge.
- [ ] "Crear nuevo repositorio"'s `Button` is visually demoted (smaller
      font-size/padding) via a child-selector override in
      `RepoSelector.module.css`, matching the `.signOutAction button` precedent;
      `Button.tsx`/`Button.module.css` themselves stay untouched.
- [ ] `RepoSelector.module.css`'s `.list` has a small right padding so its
      scrollbar visibly separates from the repo cards, no horizontal scrollbar
      introduced.
- [ ] No em dash, no `throw`, no inline `style={{}}`, no literal value where an
      existing or newly-added token already fits.
- [ ] `pnpm build` and `pnpm lint` (from `front/`) pass.

## Round 4: create-button hover glow, and scroll-edge shadows

Two more corrections after seeing Round 3's result:

1. **"Crear nuevo repositorio"'s hover glow is too strong/wide.** It is the shared
   `Button` atom's default hover treatment (a triple-layered `box-shadow` spanning
   `4px`/`12px`/`24px` blue/purple/pink), sized for this app's full-size primary
   CTAs (GitHub sign-in, install). Now that this button is already visually
   demoted (smaller font/padding, see Round 2), its hover glow needs to shrink to
   match, via the same child-selector-override technique already used for its
   size (do not touch `Button.tsx`/`Button.module.css`, which must keep their
   full-strength glow for the app's other CTAs).
2. **Scroll-edge shadows on the repo list.** The repo list (`RepoSelector`'s
   `.list`) scrolls internally (per the "no page scroll" requirement from Round
   1), but currently gives no visual cue that there is more content above/below
   the visible viewport, so scrolling can look like content is abruptly cut off.
   Add a subtle inward-facing shadow at each edge that only scrolling would
   reveal:
   - **Bottom edge**: a thin border on the *top* edge of a bottom indicator strip,
     plus an inward-facing shadow (like an inset shadow reaching up into the
     list), always visible whenever the list can scroll.
   - **Top edge**: the mirrored treatment (a thin border on the *bottom* edge of a
     top indicator strip, shadow reaching down into the list), but this one must
     only be visible once the user has actually scrolled away from the very top;
     at `scrollTop === 0` it must not show at all (nothing to indicate above).
   - Must be implemented with performance foremost: prefer a solution that avoids
     forcing layout/reflow on every scroll frame (a cheap `scrollTop` read plus a
     boolean state change only when the "at top" condition actually flips, not on
     every scroll event, is the right shape; the visual elements themselves should
     be `pointer-events: none` so they never block clicking/keyboard-selecting the
     repo cards beneath them, and should not participate in layout, e.g. via
     `position: absolute` overlays rather than elements that push content).

### Checkpoints (Round 4)

- [ ] `RepoSelector.module.css` has a child-selector override (matching the
      existing `.createRepoAction button` size-demotion precedent) that shrinks
      the create-repo button's hover/focus box-shadow spread well below `Button`'s
      default triple-layer glow; `Button.tsx`/`Button.module.css` themselves are
      untouched.
- [ ] The repo list has a persistent bottom scroll-edge indicator (border + inward
      shadow) that does not depend on scroll position.
- [ ] The repo list has a top scroll-edge indicator (border + inward shadow) that
      is hidden when scrolled to the very top and appears once scrolled away from
      it.
- [ ] The top indicator's visibility is driven by a scroll-position check that
      only updates state when the boolean actually changes (no `setState` on every
      scroll event), and does not force a layout read beyond the scroll event's
      own `scrollTop`.
- [ ] Both indicators are `pointer-events: none` and positioned so they never
      block clicking or keyboard-focusing a `RepoListItem` underneath them.
- [ ] No em dash, no `throw`, no inline `style={{}}`, no new literal color value
      outside `tokens.css`.
- [ ] `pnpm build` and `pnpm lint` (from `front/`) pass.

## Round 5: tighter header spacing, persistent "Siguiente" button

Two more corrections after seeing Round 4's result:

1. **Heading/hint spacing.** `RepoSelector`'s heading ("Elige un repositorio para
   continuar") and hint ("Selecciona uno de tus repositorios, o crea uno nuevo.")
   currently share the same gap as every other element inside `.selector`
   (heading, hint, create-button, list all spaced uniformly). Tighten just the
   heading-to-hint gap specifically (a smaller, dedicated gap between those two
   only, not affecting the spacing to the create-button/list below them), so the
   whole block reads more compact and the rest of the content shifts up slightly,
   making better use of the available vertical space inside the fixed-height
   success screen.
2. **Persistent "Siguiente" button.** Add a "Siguiente"/"Next" button (new i18n
   key `nextButton`) right below `RepoSelector`, always rendered (never
   conditionally hidden), but disabled until a repo is selected: enabled the
   moment `RepoSelector`'s selection state has a repo, disabled (and visually
   read as blocked, not just inert) whenever nothing is selected, including on
   initial load. Selecting/deselecting a repo (clicking the same card again)
   toggles it live. Since `RepoSelector` currently owns `selectedRepoId` as
   private internal state and this new button lives outside it (in `Station.tsx`,
   below `RepoSelector`, above the demoted sign-out action), the selection state
   needs to move up: make `RepoSelector` a controlled component (`selectedRepoId`
   and an `onSelectRepo` callback passed in as props from `Station.tsx`, which
   now owns the state), rather than keeping it as `RepoSelector`'s own
   `useState`. Clicking "Siguiente" while enabled is, for this stage, the same
   kind of placeholder every other not-yet-wired action in this feature uses
   (`// TODO(f04-stage-2): ...` comment + `console.info`, no real navigation yet).
   The success screen must still fit within `100dvh` with zero page-level
   scroll: `RepoSelector` keeps flexing to fill the remaining space, the new
   button and the sign-out action both take their natural (small) height as
   fixed-size flex children below it.

### Checkpoints (Round 5)

- [ ] Heading and hint have their own, smaller dedicated gap between just the two
      of them, distinct from `.selector`'s existing spacing to the create-button
      and list below.
- [ ] `RepoSelector` no longer owns `selectedRepoId` as internal `useState`; it
      receives `selectedRepoId`/`onSelectRepo` (or equivalently named) props from
      `Station.tsx`, which now owns the selection state.
- [ ] A "Siguiente"/"Next" button (`nextButton` i18n key, both `es.json`/`en.json`)
      always renders in `Station.tsx`'s success branch, below `RepoSelector` and
      above the sign-out action, using the shared `Button` atom's native
      `disabled` state (not a fake/inert-looking enabled button) when no repo is
      selected, and enabled the instant one is.
- [ ] Clicking "Siguiente" while enabled is a `// TODO(f04-stage-2): ...` +
      `console.info` placeholder, matching every other not-yet-wired handler in
      this feature; it never fires while disabled (native `disabled` prevents
      this, not just a style).
- [ ] The success screen still fits `100dvh` with zero page-level scroll after
      adding the new button; `RepoSelector` still flexes to fill remaining space,
      only its own internal list scrolls.
- [ ] No em dash, no `throw`, no inline `style={{}}`, no new literal value where
      an existing token already fits.
- [ ] `pnpm build` and `pnpm lint` (from `front/`) pass.

## Round 6: move "Siguiente" inside the selector card, demote its size

Correction to Round 5's placement: the user clarified "Siguiente" belongs INSIDE
`RepoSelector`'s own card (the repo-picker "form"), below the repo list, not
outside it in `Station.tsx`. The sign-out action is the only thing that stays
outside, in `Station.tsx`, below `RepoSelector`. Since it now lives inside the
same compact card as the create-repo button, it also can't be full-size: demote
it the same way "Crear nuevo repositorio" already is (smaller font-size/padding
via a child-selector override), not a full-height primary CTA.

### Checkpoints (Round 6)

- [ ] The "Siguiente"/"Next" button renders inside `RepoSelector`'s own
      `.selector` column (inside the `Card`), below `.list`, not inside
      `Station.tsx`.
- [ ] `Station.tsx` no longer renders a "Siguiente" button or owns a `handleNext`
      handler; `Station.module.css`'s now-unused `.nextAction` rule (if any) is
      removed. The sign-out action is the only thing still rendered below
      `RepoSelector` in `Station.tsx`.
- [ ] `RepoSelector` still receives `selectedRepoId` from `Station.tsx` (Round
      5's controlled-component lift stays as-is: `Station` still owns the
      selection state, since it needs it to pass down as a prop either way);
      `RepoSelector` renders the "Siguiente" button itself, disabled via
      `!selectedRepoId`, with its own local placeholder click handler (the
      `// TODO(f04-stage-2): ...` + `console.info` pattern), no need to bubble
      the click up to `Station.tsx` since it does not depend on anything
      `Station` owns beyond the selection it already passes down.
- [ ] "Siguiente"'s size is demoted (smaller font-size/padding) via a
      child-selector override in `RepoSelector.module.css`, matching the exact
      precedent already used for `.createRepoAction button`.
- [ ] The success screen still fits `100dvh` with zero page-level scroll;
      `RepoSelector`'s own internal list is still the only scrolling element.
- [ ] No em dash, no `throw`, no inline `style={{}}`, no new literal value where
      an existing token already fits.
- [ ] `pnpm build` and `pnpm lint` (from `front/`) pass.

## Round 7: push "Siguiente" down slightly, enlarge the scroll area

Two more corrections after seeing Round 6's result:

1. **"Siguiente" needs a bit more separation above it.** Currently spaced from
   `.list` by `.selector`'s own uniform gap only, same as every other pair in
   that column. Give `.nextAction` a bit of extra `margin-top` on top of that
   existing gap, so it visually reads as its own distinct final step, not just
   another item in the same rhythm as the rest.
2. **The scroll area (`.list`) should occupy more of the available height.**
   `.list` already has `flex: 1` inside `RepoSelector`, so it already claims all
   space left over after the fixed-size chrome around it (heading/hint,
   create-repo button, "Siguiente", paddings/gaps at every level from
   `Station.module.css`'s `.successContent` down through `RepoSelector`). To
   grow it, that surrounding fixed-size chrome needs to shrink a bit: trim
   padding/gap values one step where it does not hurt legibility (e.g.
   `.successContent`'s own padding/gap, `RepoSelector`'s `.selector` gap/padding
   at both breakpoints, `.header`'s gap, `.createRepoAction`/`.nextAction`'s own
   padding), so the net effect is a visibly taller `.list` without breaking the
   `100dvh`/zero-page-scroll constraint or making any text/tap-target
   uncomfortably cramped.

### Checkpoints (Round 7)

- [ ] `.nextAction` has additional top spacing beyond `.selector`'s regular gap,
      visually separating it as the final step.
- [ ] At least one fixed-size chrome element around `.list` (successContent
      padding/gap, `.selector` gap/padding, `.header` gap, action paddings) was
      measurably trimmed, and the result is a `.list` that renders taller /
      shows more repo rows at once than before, at both mobile and
      `min-width: 1024px` desktop widths.
- [ ] No tap target regresses below the existing 44px (`4.4rem`) minimum on
      `RepoListItem`; no text becomes illegibly cramped.
- [ ] The success screen still fits `100dvh` with zero page-level scroll.
- [ ] No em dash, no `throw`, no inline `style={{}}`, no new literal value where
      an existing token already fits.
- [ ] `pnpm build` and `pnpm lint` (from `front/`) pass.

## Round 8: outer spacing vs. inner snugness, corrects Round 7's `.nextAction` margin

Round 7 added `margin-top` to `.nextAction` to separate it from `.list`. The user
then clarified the opposite is wanted for that specific gap: "Siguiente" should
sit snug against the repo-list card's bottom edge (remove that margin, or shrink
it back to just `.selector`'s regular gap, no extra), which in turn frees up a
little more height for `.list` itself. Separately, the user wants MORE breathing
room in two specific outer gaps that Round 7 tightened too much chasing list
height: between the "Aqui Houston, luz verde" tagline and the repo-selector card
above it, and between the repo-selector card and the sign-out action below it.
Both of those are `Station.tsx`-level gaps, not inside `RepoSelector` at all, and
must NOT affect the tight `BrandTitle`-to-tagline spacing (leave that alone).

### Checkpoints (Round 8)

- [ ] `.nextAction`'s `margin-top` (added in Round 7) is removed or reduced back
      to zero extra (just `.selector`'s own gap separates it from `.list`), so
      "Siguiente" reads snug against the card's bottom edge.
- [ ] `RepoSelector`'s `.list` does not shrink from this change (ideally grows
      slightly further, since the removed margin frees more height for it).
- [ ] There is visibly more space between the success tagline `Badge` and
      `RepoSelector` below it, and between `RepoSelector` and the sign-out
      action below that, than Round 7 left there, WITHOUT increasing the gap
      between `BrandTitle` and the tagline `Badge` (that pair stays as tight as
      it already is). Implemented via a targeted margin (e.g. on `RepoSelector`'s
      own `.wrapper`, or on `.signOutAction`), not by bumping
      `Station.module.css`'s shared `.successContent` gap uniformly (which would
      also affect the `BrandTitle`/`Badge` pair).
- [ ] The success screen still fits `100dvh` with zero page-level scroll after
      these changes.
- [ ] No em dash, no `throw`, no inline `style={{}}`, no new literal value where
      an existing token already fits.
- [ ] `pnpm build` and `pnpm lint` (from `front/`) pass.

## Round 9: "Siguiente" must sit almost on the card's bottom edge

Round 8 made `.nextAction` snug against `.list` (no more extra margin between
them), but there is still a visible gap between "Siguiente" and the card's own
bottom edge, coming from the shared `Card` atom's own padding
(`padding: var(--spacing-md)` on all four sides, in `Card.module.css`, used by
every `Card` usage app-wide) plus `RepoSelector.module.css`'s `.selector`
padding at `min-width: 1024px`. The user wants "Siguiente" to sit almost flush
against the card's bottom border, which also frees more height for `.list`.

Fix scoped to this one `RepoSelector` instance, NOT `Card.module.css` itself
(which must keep its normal padding for every other usage app-wide, e.g. Home's
cards, `StatusScreen`'s message card): override just the bottom padding via
`RepoSelector.module.css`'s existing `.wrapper > div` child-selector (the same
technique already used there to turn Card's own rendered `<div>` into a flex
column), setting `padding-bottom: 0` (or a very small value) there, and doing
the same for `.selector`'s own bottom padding at the `min-width: 1024px`
breakpoint. Top/left/right padding on both must stay as they are, only the
bottom shrinks.

### Checkpoints (Round 9)

- [ ] `Card.module.css` itself is untouched; the padding reduction is scoped to
      `RepoSelector.module.css`'s own selectors only.
- [ ] The card's bottom padding (both the `Card` atom's own base padding via
      `.wrapper > div`, and `.selector`'s `min-width: 1024px` padding override)
      is reduced to near-zero, so "Siguiente" reads as almost touching the
      card's bottom border, at both mobile and desktop widths.
- [ ] Top/left/right padding on the card is unaffected.
- [ ] `.list` grows taller as a direct result of the freed space (verify the
      flex chain still resolves correctly, `flex:1; min-height:0` intact at
      every level).
- [ ] The success screen still fits `100dvh` with zero page-level scroll.
- [ ] No em dash, no `throw`, no inline `style={{}}`, no new literal value where
      an existing token already fits.
- [ ] `pnpm build` and `pnpm lint` (from `front/`) pass.

## Round 3: selected-card treatment

The selected `RepoListItem`'s current `box-shadow: 0 0 16px var(--glow-blue)` reads
as too wide/strong, the same visual weight as the pulsing tagline `Badge`. Also, its
border color (`--color-neon-blue`) is identical to the plain `:hover`/`:focus-
visible` border color, so once the wide glow is toned down, selected and hovered
would look the same. Fix:

- A brighter/more distinct border color for the selected state than the plain hover
  border, so it stays visually distinguishable once the glow shrinks.
- A subtle background tint on the selected card (reusing an existing card-
  background token, not a new color), so selection reads clearly without relying on
  a wide blur.
- A much smaller/subtler glow than the current `16px` spread, or none at all if the
  border + background tint alone read clearly as "selected".
- Selecting and deselecting must transition smoothly (border-color, background-
  color, and box-shadow all covered by the existing transition list, tuned so
  neither direction feels abrupt).
- Hovering/focusing an already-selected card must not revert its border back to the
  plain hover color: the selected treatment should stay visually dominant.

### Checkpoints (Round 3)

- [ ] `.itemSelected`'s border color is distinct from `.item:hover`'s plain hover
      border color.
- [ ] `.itemSelected` has a background tint using an existing token (no new color
      literal), and a visibly smaller box-shadow spread than the current `16px`
      (or none).
- [ ] `.itemSelected:hover`/`:focus-visible` keeps the selected treatment dominant,
      does not revert to the plain unselected hover border color.
- [ ] `transition` covers every property that changes between selected/unselected
      (border-color, background-color, box-shadow), tuned so both directions read
      as smooth, not abrupt.
- [ ] `pnpm build` and `pnpm lint` (from `front/`) pass.
