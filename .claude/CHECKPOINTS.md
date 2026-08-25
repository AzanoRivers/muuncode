# CHECKPOINTS.md: MuunCode

Canonical done-criteria per feature. The Implementer uses this file to know when a
feature is complete. The Reviewer uses it to validate the Implementer's work. Every item
must be verifiable by running something or reading a specific file; if an item cannot be
verified this way, it must be rewritten.

There are two reviewers, per `CLAUDE.md` → "Feature Development Workflow": the fast
`reviewer-light` validates every adjustment/tweak round's checkpoints (the many small
"### Additional scope" subsections most features accumulate), while the full `reviewer`
only runs once, as the final gate right before a feature is marked `done` for good and
the lead advances to a new feature/phase.

---

## F01: Environment Setup

Scaffolds the frontend skeleton per `features/f01_environment_setup/environment-setup.md`.
Produces an empty, working skeleton only: no editor, no file explorer, no other IDE
feature. Built directly on the foundation architecture decisions the user and the lead
worked through together, recorded in `CLAUDE.md` (that discussion phase has no feature
ID and no folder under `features/`, on purpose: `features/` is reserved for specs of
things that actually get built and executed, never for decision write-ups on their own).

- [x] `front/` exists at the repository root, and `front/package.json`,
      `front/vite.config.ts`, and `front/index.html` all exist inside it (not at the
      repository root directly, and not inside `features/`).
- [x] `front/pnpm-lock.yaml` exists; no `package-lock.json` or `yarn.lock` exists
      anywhere in the repository.
- [x] No dependency version in `front/package.json` was hand-typed: every entry
      corresponds to something installed via `pnpm add <package>@latest` (verified by
      re-running `pnpm install` inside `front/` and confirming no changes).
- [x] Vite's default boilerplate is gone. Note: this Vite release scaffolds different
      placeholder filenames than originally assumed (`hero.png`/`icons.svg`/
      `favicon.svg` instead of `react.svg`/`vite.svg`); the Reviewer confirmed none of
      the actual placeholder files remain and `App.tsx` has no leftover counter demo.
- [x] `front/public/favicon.ico` is a copy of
      `C:\DevCode\Repositories\01_AzanoLabs\azanolabs-web\app\favicon.ico` (verified
      byte-identical, same size), and `front/index.html`'s `<link rel="icon">` resolves
      to it.
- [x] `front/src/components/atoms/`, `molecules/`, `organisms/`, and `templates/` all
      exist.
- [x] `front/src/styles/tokens.css` exists, contains only `:root` CSS custom properties
      (no selectors targeting actual elements/classes), and is imported once in
      `front/src/main.tsx`.
- [x] Exactly one global CSS file exists (`front/src/styles/tokens.css`); no other
      `.css` file outside a component's own folder is imported anywhere in `front/src/`.
- [x] At least one smoke-test component (`Button`) exists under
      `front/src/components/atoms/Button/`, has both `Button.tsx` and
      `Button.module.css` in that same folder, its `.module.css` references
      `var(--token-name)` values from `tokens.css`, and it renders without error when the
      dev server runs (`pnpm dev` from inside `front/`).
- [x] `pnpm dev` starts without errors and `pnpm build` completes successfully, both run
      from inside `front/`.
- [x] `.claude/feature_list.json` entry `f01` has `status: "done"`.

---

## F02: Login Screen UI

Builds the static, fully-styled login/welcome screen per
`features/f02_login_screen_ui/login-screen-ui.md`. Design and markup only: no real
GitHub OAuth in this feature.

- [x] `front/vite.config.ts` has a `resolve.alias` entry mapping `@` to `front/src`,
      and the matching `compilerOptions.paths` entry exists. Note: this Vite scaffold
      splits tsconfig into a references-only `front/tsconfig.json` plus
      `front/tsconfig.app.json`/`tsconfig.node.json`; the alias correctly lives in
      `tsconfig.app.json` (the project that actually governs `src/`), not the root
      file, which has no `compilerOptions` block. The Reviewer confirmed this
      resolves correctly via `npx tsc -p tsconfig.app.json --noEmit`.
- [x] Every component folder (including the retrofitted `atoms/Button/`) has its own
      `index.ts` barrel, and every Atomic Design category folder (`atoms/`,
      `molecules/`, `organisms/`, `templates/`) has its own `index.ts` barrel
      re-exporting everything inside it. No barrel imports another barrel.
- [x] `front/src/App.tsx` imports every component via the `@/components/<category>`
      alias/barrel, not a relative path (`../`) and not a deep direct file path.
- [x] `front/src/styles/tokens.css` contains the exact color tokens specified in the
      spec (`--color-bg: #041528`, `--color-neon-blue: #0BD2FF`,
      `--color-neon-purple: #B366FF`, `--color-neon-pink: #FF69B4`, plus the glow,
      typography, spacing, and radius tokens), still only `:root` custom properties.
- [x] `@fontsource/orbitron` and `@fontsource/space-grotesk` are installed via
      `pnpm add <package>@latest` (not hand-typed versions) and imported once in
      `front/src/main.tsx`.
- [x] `front/src/components/atoms/MoonOrbitLogo/` exists with `MoonOrbitLogo.tsx` and
      `MoonOrbitLogo.module.css` in the same folder. The SVG uses a `linearGradient`
      with exactly the 3 stops (`--color-neon-blue` at 0%, `--color-neon-purple` at
      50%, `--color-neon-pink` at 100%) applied via `stroke` (not `fill`), and an SVG
      `<filter>` with `feGaussianBlur` + `feMerge` for the glow.
- [x] `front/src/components/atoms/GridBackground/` exists and renders the two-layer
      grid pattern using `--color-bg`/`--color-grid-line`, no hardcoded colors.
- [x] `front/src/components/atoms/Button/` (from `f01`) is restyled with a primary CTA
      variant using `--font-display`, uppercase text, and a glow on hover, all via
      `var(--token-name)`, no literal values.
- [x] `front/src/components/molecules/BrowserSupportNotice/` exists with its own
      `.tsx`/`.module.css` pair and renders the `browserNotice` translation key.
- [x] `front/src/components/templates/LoginScreen/` exists, composes
      `GridBackground`, `MoonOrbitLogo`, title, tagline, description, philosophy,
      the CTA `Button`, and `BrowserSupportNotice`, and is rendered from
      `front/src/App.tsx` as the app's current view.
- [x] `i18next`, `react-i18next`, and `i18next-browser-languagedetector` are installed
      via `pnpm add <package>@latest` (not hand-typed versions).
- [x] The language detector is configured with `order: ['localStorage', 'navigator']`
      exactly; grep confirms no `path`, `subdomain`, `htmlTag`, or `cookie` detection
      method is enabled anywhere in the i18n config.
- [x] `front/src/locales/en.json` and `front/src/locales/es.json` exist with the exact
      copy specified in the spec, at minimum the keys `title`, `tagline`,
      `description`, `philosophy`, `signInButton`, `browserNotice`.
- [x] Setting the OS/browser language to Spanish and loading the page renders the
      Spanish copy; setting it to a third language (e.g. French) falls back to
      English. Neither case changes the URL.
- [x] The sign-in button's `onClick` is a placeholder only (comment referencing the
      future GitHub OAuth feature, no real network call); no GitHub API calls,
      GitHub App code, or serverless functions exist anywhere in this feature's diff.
- [x] `pnpm dev` starts without errors and `pnpm build` completes successfully, both
      run from inside `front/`.
- [x] `.claude/feature_list.json` entry `f02` has `status: "done"`, re-checked
      after the additional-scope round below was also approved.

### Additional scope: CSS Reset and Base Font Sizing

Added after `f02`'s first approval, per
`features/f02_login_screen_ui/css-reset.md`. Fixes the unstyled-browser-default
look (stray white padding/margins) and adopts `1rem = 10px`.

- [x] `front/src/styles/reset.css` exists (the second, and only other, allowed
      global CSS file besides `tokens.css`) with Josh Comeau's modern reset,
      including `html { font-size: 62.5%; }` (never a hardcoded `font-size: 10px`
      on `html`), and `#root` (not `#__next`) in the isolation rule.
- [x] `reset.css` is imported in `front/src/main.tsx` before `tokens.css`.
- [x] `front/src/styles/tokens.css`'s six spacing/radius tokens are recomputed to
      their exact pixel-equivalent under the new base: `--radius-sm: 0.4rem`,
      `--radius-md: 0.8rem`, `--spacing-xs: 0.8rem`, `--spacing-sm: 1.6rem`,
      `--spacing-md: 2.4rem`, `--spacing-lg: 4rem`. No other pre-existing token in
      that file changes.
- [x] `tokens.css` gains 7 new font-size tokens (`--font-size-xs: 1.2rem`,
      `--font-size-sm: 1.4rem`, `--font-size-body: 1.5rem`,
      `--font-size-base: 1.6rem`, `--font-size-md: 2rem`,
      `--font-size-title: 4rem`, `--font-size-title-lg: 4.8rem`), and every
      component that previously had a literal `font-size` (`LoginScreen`,
      `Button`, `BrowserSupportNotice`) now references the matching
      `var(--font-size-*)` instead.
- [x] The non-token dimensional literals (`LoginScreen.module.css`'s
      `max-width: 42rem`, `BrowserSupportNotice.module.css`'s `max-width: 32rem`
      and icon `width`/`height: 1.25rem`) are recomputed in place to `67.2rem`,
      `51.2rem`, and `2rem` respectively, preserving their exact pixel size. These
      stay literals, they are not tokenized (not a declared token category).
- [x] Visually, the entire login screen (spacing, radii, and every font size) looks
      identical to the previously approved version, same pixel sizes throughout,
      and the stray white browser-default padding/margin around the page is gone.
- [x] Increasing or decreasing the browser's font-size/zoom accessibility setting
      scales the page proportionally (confirms `62.5%` stayed relative, was not
      hardcoded to `10px`).
- [x] `pnpm dev` starts without errors and `pnpm build` completes successfully, both
      run from inside `front/`.
- [x] `.claude/feature_list.json` entry `f02` has `status: "done"` again.

### Additional scope: Visual Refinements

Added after the CSS-reset round above, per
`features/f02_login_screen_ui/visual-refinements.md`. Grid size fix, badge/card
content presentation, GitHub icon on the sign-in button, and a temporary 4-logo
comparison arrangement.

- [x] `GridBackground.module.css`'s `background-size` is exactly `25px` (base),
      `35px` (`≥360px`), `40px` (`≥440px`); the old `768px`/`1200px` breakpoints
      are gone.
- [x] `tokens.css` gains `--color-card-bg` and `--color-card-border`, no other
      pre-existing token changes.
- [x] `atoms/Badge/`, `atoms/Card/`, and `atoms/GitHubIcon/` each exist with their
      own `.tsx`/`.module.css` (or just `.tsx` for `GitHubIcon`) pair and barrel,
      per `CLAUDE.md` → "Import Conventions".
- [x] `Card`'s `backdrop-filter` has the `-webkit-backdrop-filter` prefix.
- [x] `LoginScreen` wraps the tagline in `Badge`, the description in its own
      `Card`, and the philosophy in its own separate `Card`.
- [x] The sign-in `Button` renders `GitHubIcon` next to the `signInButton` text,
      laid out with `display: flex; align-items: center; gap: var(--spacing-xs)`
      in `Button.module.css`.
- [x] `atoms/RocketAscentLogo/`, `atoms/ChipMoonLogo/`, and `atoms/CircuitMoonLogo/`
      each exist, each using the same technique as `MoonOrbitLogo` (3-stop
      `linearGradient` on `stroke`, `feGaussianBlur` + `feMerge` glow,
      `viewBox="0 0 24 24"`, a `size` prop).
- [x] `LoginScreen` currently renders all four logos side by side (temporary),
      with a comment in the code marking this as temporary and pointing to
      `visual-refinements.md`.
- [x] No literal color/spacing/radius value was inlined anywhere in this round's
      new `.module.css` files; every value is a `var(--token-name)` reference.
- [x] `pnpm dev` starts without errors and `pnpm build` completes successfully,
      both run from inside `front/`.
- [x] `.claude/feature_list.json` entry `f02` has `status: "done"` again.

### Additional scope: Logo Selection, Favicon, and Layout

Added after the Visual Refinements round above, per
`features/f02_login_screen_ui/logo-selection-and-layout.md`. `MoonOrbitLogo` wins
the comparison, becomes the favicon, and the desktop layout gets reworked.

- [x] `atoms/RocketAscentLogo/`, `atoms/ChipMoonLogo/`, and
      `atoms/CircuitMoonLogo/` no longer exist (folders and barrel exports both
      removed); `atoms/MoonOrbitLogo/` remains.
- [x] `LoginScreen.tsx` no longer has a `.logoRow` or a comparison comment.
- [x] `front/public/icon.svg` exists as a standalone file (fixed ids, no
      `useId()`) with the exact gradient stops and paths from the spec, plus the
      `#041528` rounded background rect.
- [x] `front/index.html` has `<link rel="icon" type="image/svg+xml"
      href="/icon.svg">` followed by `<link rel="alternate icon"
      href="/favicon.ico">`; `front/public/favicon.ico` still exists unchanged.
- [x] At `min-width: 1024px`, `.content`'s `max-width` is `96rem`, and the
      description/philosophy `Card`s render side by side in a 2-column grid
      (`.cardGrid`); below `1024px` they stay stacked.
- [x] `tokens.css` gains `--color-card-bg-blue` and `--color-card-bg-purple`, no
      other pre-existing token changes. `Card` has a working `variant` prop with
      `.card--blue`/`.card--purple` modifier classes overriding only
      `background`. The description card uses `variant="blue"`, the philosophy
      card uses `variant="purple"`.
- [x] The title's "Hyper"/"Muun" split is derived from `t('title')` via
      `.slice()`, not hardcoded as separate literal strings. `MoonOrbitLogo`
      renders directly above the "Muun" text, and the whole title block is
      right-aligned within `.content` (`justify-content: flex-end`).
- [x] Loading the page at a typical desktop viewport height (e.g. 900px) shows
      the entire login screen with no vertical scrollbar.
- [x] `pnpm dev` starts without errors and `pnpm build` completes successfully,
      both run from inside `front/`.
- [x] `.claude/feature_list.json` entry `f02` has `status: "done"` again.

### Additional scope: Desktop Two-Column Layout and IDE Preview Stack

Added after the Logo Selection round above, per
`features/f02_login_screen_ui/desktop-layout-and-preview-stack.md`. Replaces that
round's `.cardGrid` with a page-level two-column desktop layout, left-aligns body
text, and adds a placeholder, interactive IDE-preview image stack.

- [x] `.description` and `.philosophy` are `text-align: left` at every breakpoint
      (not just `≥1024px`).
- [x] `molecules/IdePreviewStack/` exists with its own barrel, exported from
      `molecules/index.ts`. Renders 2 buttons, one `cardActive` and one
      `cardBack` at a time, each showing `idePreviewPlaceholder` plus its number.
- [x] `en.json`/`es.json` both gain the `idePreviewPlaceholder` key with the
      exact copy from the spec; the number is appended in code, not translated.
- [x] Hovering, focusing, or clicking either preview card sets it as
      `cardActive` (front, no offset, glow) and the other as `cardBack` (behind,
      offset, rotated); the visual change transitions smoothly and is disabled
      under `prefers-reduced-motion: reduce`.
- [x] `LoginScreen.module.css`'s `≥1024px` block no longer has `.cardGrid`; it
      has `.leftColumn` (text, left-aligned), `.rightColumn` (title + stack,
      right-aligned), and `.actions` (button + notice, spanning both columns)
      inside a 2-column `.content` grid.
- [x] `.leftColumn`, `.rightColumn`, and `.actions` each have a base
      `display: flex; flex-direction: column; gap: var(--spacing-sm);` rule
      **outside** the `1024px` media query, so their own children are properly
      spaced below `1024px` too (this was the Round 5 rejection: without this
      base rule, elements inside each wrapper touch with zero gap on mobile,
      even though `.content`'s own gap still separates the three wrappers from
      each other). The media query only adds `align-items`/`grid-column`
      overrides on top, it does not redeclare `display`/`flex-direction`/`gap`.
- [x] Below `1024px`, the layout stays single-column with title and the preview
      stack appearing first (source order), and every element within each
      wrapper has visible, consistent spacing (verify this visually/by reading
      the compiled CSS, not just that the wrapper divs themselves are present).
- [x] The full page still fits one typical desktop viewport height with no
      vertical scrollbar, re-verified with this round's new content included
      (not assumed unchanged from the prior round's math).
- [x] `pnpm dev` starts without errors and `pnpm build` completes successfully,
      both run from inside `front/`.
- [x] `.claude/feature_list.json` entry `f02` has `status: "done"` again.

---

### Additional scope: Layout and Interaction Polish

Added after the Desktop Two-Column round above, per
`features/f02_login_screen_ui/layout-and-interaction-polish.md`.

- [x] `front/index.html`'s two favicon `<link>`s have a `?v=2` cache-busting
      query string appended; `icon.svg`/`favicon.ico` content is unchanged.
- [x] `tokens.css` gains `--spacing-2xs: 0.4rem` and `--spacing-xl: 6rem`; no
      other pre-existing token changes.
- [x] `.brandMuunColumn`'s `gap` uses `var(--spacing-2xs)`.
- [x] `.leftColumn` has `grid-column: 1` and `.rightColumn` has
      `grid-column: 2` inside the `1024px` media query, so text renders on the
      visual left and title+stack renders on the visual right (this was
      reversed before: DOM order, not the class names, controlled the visual
      position).
- [x] `IdePreviewStack.module.css`: `.stack`'s width is `min(56rem, 100%)`;
      `.cardBack` is now larger and offset further than `.cardActive`
      (`scale(1.1)` vs `scale(1)`, `translate(2rem, 2rem)`), the reverse of the
      previous round's smaller/less-offset back card.
- [x] `IdePreviewStack.tsx`: hovering an individual button no longer swaps the
      active card instantly; hovering the wrapping `.stack` starts a 1.5 second
      (`1500`ms) auto-cycle between the two cards, implemented as
      `setInterval`/`useEffect` keyed on a hover boolean state, cleared on
      mouse leave. Clicking or focusing a specific card selects it immediately
      and clears the interval (pausing auto-cycle until the next hover-in).
- [x] `LoginScreen.module.css`'s `1024px` block: `max-width: 128rem`,
      `grid-template-columns: minmax(32rem, 42rem) 1fr`, `gap: var(--spacing-xl)`.
- [x] `BrowserSupportNotice.tsx` renders an inline SVG warning-triangle icon
      (path + line + circle, per the spec) instead of the circle-with-"i" text;
      `.icon` in its `.module.css` no longer has a circular `border`/
      `border-radius`, still uses `color: var(--color-neon-blue)`.
- [x] `pnpm dev` starts without errors and `pnpm build` completes successfully,
      both run from inside `front/`.
- [x] `.claude/feature_list.json` entry `f02` has `status: "done"` again.

---

### Additional scope: Hover, Layout, Icon, and Favicon Fixes

Added after the Layout and Interaction Polish round above, per
`features/f02_login_screen_ui/hover-layout-favicon-fixes.md`. Reviewed with
`reviewer-light` (adjustment round, not a phase boundary).

- [x] `IdePreviewStack.tsx` no longer uses `useEffect`/`isHovering`/
      `intervalRef`. Each button has its own `onMouseEnter` (schedules a
      `1500`ms `setTimeout` activation) and `onMouseLeave` (clears it);
      `onClick`/`onFocus` select immediately and clear any pending timeout.
- [x] `IdePreviewStack.module.css`'s `.stack` is `width: min(28rem, 100%)` at
      the base level, growing to `width: min(56rem, 100%)` only inside
      `@media (min-width: 1024px)`.
- [x] `LoginScreen.tsx`: `MoonOrbitLogo` renders with `size={48}` (was `40`).
- [x] `LoginScreen.module.css`: `.brandMuunColumn`'s `gap` is `0`.
- [x] `front/public/icon.svg` no longer has the filled background `<rect>`;
      the gradient, filter, and both path/ellipse shapes are otherwise
      unchanged from the previous round.
- [x] `front/index.html`'s two favicon `<link>`s use `?v=3` (was `?v=2`).
- [x] `pnpm dev` starts without errors and `pnpm build` completes successfully,
      both run from inside `front/`.
- [x] `.claude/feature_list.json` entry `f02` has `status: "done"` again.

---

### Additional scope: Grid Row, Hover Delay, and Favicon Removal

Added after the Hover, Layout, Icon, and Favicon Fixes round above, per
`features/f02_login_screen_ui/grid-row-hover-favicon-fixes.md`. Diagnosed via
an actual browser session (`claude-in-chrome`), not by reading code alone.
Reviewed with `reviewer-light`.

- [x] `LoginScreen.module.css`'s `1024px` block: `.leftColumn` has
      `grid-column: 1; grid-row: 1;`, `.rightColumn` has `grid-column: 2;
      grid-row: 1;`. Verify in a real browser (not just by reading the CSS)
      that `.leftColumn` and `.rightColumn` render at the same `top` position,
      side by side, not one above the other.
- [x] `IdePreviewStack.tsx`'s `HOVER_ACTIVATE_DELAY_MS` is `400` (was `1500`).
- [x] `front/public/favicon.ico` no longer exists.
- [x] `front/index.html` has no `<link rel="alternate icon">` line; only the
      SVG `<link rel="icon" type="image/svg+xml" href="/icon.svg?v=3">` remains.
- [x] `pnpm dev` starts without errors and `pnpm build` completes successfully,
      both run from inside `front/`.
- [x] `.claude/feature_list.json` entry `f02` has `status: "done"` again.

---

### Additional scope: Remove Hover, Fix Top Spacing, Move Button to Left Column

Added after the Grid Row round above, per
`features/f02_login_screen_ui/hover-removal-spacing-button-move.md`. Reviewed
with `reviewer-light`.

- [x] `IdePreviewStack.tsx` has no `useRef`, no `HOVER_ACTIVATE_DELAY_MS`, no
      `scheduleActivate`/`cancelScheduledActivate`, no `onMouseEnter`/
      `onMouseLeave`. Only `onClick`/`onFocus` select a card, immediately.
- [x] `IdePreviewStack.module.css`'s `transition` on `.cardActive`/`.cardBack`
      is unchanged (the animation itself was never the problem, the JS-driven
      hover scheduling was).
- [x] `LoginScreen.module.css`'s `.content` has `padding-top:
      var(--spacing-xl)` both at the base rule and inside the `768px` media
      query (re-declared after each `padding` shorthand).
- [x] `LoginScreen.tsx`: `Button` (sign-in) is now inside `.leftColumn`, after
      `Badge` and both `Card`s; `.actions` contains only
      `BrowserSupportNotice`.
- [x] `Button.module.css`'s `.button` has `align-self: flex-start` so it does
      not stretch to the full width of `.leftColumn`.
- [x] `pnpm dev` starts without errors and `pnpm build` completes successfully,
      both run from inside `front/`.
- [x] `.claude/feature_list.json` entry `f02` has `status: "done"` again.

---

### Additional scope: Custom Scrollbar, Title Position, Button Copy

Added after the Remove Hover round above, per
`features/f02_login_screen_ui/scrollbar-title-position-copy.md`. Reviewed with
`reviewer-light`.

- [x] `tokens.css` gains `--color-scrollbar-thumb-hover` and
      `--glow-scrollbar-hover`, no other pre-existing token changes.
- [x] `front/src/styles/reset.css` has the `html`/`::-webkit-scrollbar*` block
      exactly as specced, referencing `var(--color-card-bg)`,
      `var(--color-card-border)`, `var(--color-scrollbar-thumb-hover)`, and
      `var(--glow-scrollbar-hover)` (no literal color values inline).
- [x] `CLAUDE.md` → "Frontend Architecture" → the `reset.css` bullet mentions
      scrollbar theming as part of its job, not only the reset.
- [x] `LoginScreen.module.css`'s `.rightColumn` has `margin-top: calc(var(--spacing-xs) - var(--spacing-xl));`.
      `.leftColumn` has no margin/padding change from this round.
- [x] `front/src/locales/es.json`'s `signInButton` is `"Iniciar con GitHub"`;
      `en.json`'s `signInButton` is unchanged.
- [x] `pnpm dev` starts without errors and `pnpm build` completes successfully,
      both run from inside `front/`.
- [x] `.claude/feature_list.json` entry `f02` has `status: "done"` again.

---

### Additional scope: Icon Spacing, No-Scroll Fit, Scrollbar Transparency, Swap-on-Either-Click

Added after the Custom Scrollbar round above, per
`features/f02_login_screen_ui/icon-spacing-scrollbar-swap.md`.

- [x] `LoginScreen.module.css`'s `.brandMuunColumn` gains `padding-top:
      var(--spacing-xs);`. Verify in a real browser that the icon sits with
      visible space above it while the "Muun" text stays aligned with "Hyper"
      exactly as before (the title's own position must not move).
- [x] `LoginScreen.module.css`'s `1024px` block: `.content`'s `gap:
      var(--spacing-xl);` is replaced by `column-gap: var(--spacing-xl);
      row-gap: var(--spacing-sm);`. `.leftColumn`/`.rightColumn`'s own internal
      `gap` is unchanged.
- [x] `reset.css`'s `::-webkit-scrollbar-track` background is `transparent`
      (was `var(--color-card-bg)`). `::-webkit-scrollbar`,
      `::-webkit-scrollbar-thumb`, and the hover state are unchanged. Verify
      in a real browser, not just by reading computed styles, that the
      scrollbar now reads as a thin rounded translucent floating thumb.
- [x] `IdePreviewStack.tsx` has a single `toggleActive` function (
      `setActiveIndex((current) => (current === 0 ? 1 : 0))`), used as both
      `onClick` and `onFocus` on both buttons; no per-button
      `setActiveIndex(index)` call remains. Verify in a real browser that
      clicking either card (front or back) swaps which one is active.
- [x] `front/index.html`'s `<title>` is `MuunCode - IDE`.
- [x] `pnpm dev` starts without errors and `pnpm build` completes successfully,
      both run from inside `front/`.
- [x] `.claude/feature_list.json` entry `f02` has `status: "done"` again.

---

### Additional scope: Icon Gap Fix and Scrollbar Byte-Parity with AzanoLabs

Added after the Icon Spacing round above, per
`features/f02_login_screen_ui/icon-gap-scrollbar-parity-fix.md`. Corrects two wrong
guesses from that round, verified this time against AzanoLabs' actual source
(`C:\DevCode\Repositories\01_AzanoLabs\azanolabs-web\app\globals.css`) and in a real
browser before being specced.

- [x] `LoginScreen.module.css`: `.brandMuunColumn svg` has `margin-bottom: calc(-1 *
      var(--spacing-sm));`. The `span` holding the "Muun" text and the
      `.brandMuunColumn`'s own `padding-top` (from the prior round) are unchanged.
      Verify in a real browser that "Hyper" and "Muun" still sit on the exact same
      baseline (matching `getBoundingClientRect().bottom` values) and that the icon
      now has a small, clearly reduced gap above "Muun", not touching it.
- [x] `reset.css`: `::-webkit-scrollbar-track`'s `background` is `var(--color-card-bg)`
      (the `transparent` from the prior round is reverted). The `scrollbar-color`/
      `scrollbar-width: thin` rule's selector is `*` (was `html`), and its
      `scrollbar-color` value is exactly `rgba(11, 210, 255, 0.4) rgba(4, 21, 40,
      0.6);`. `::-webkit-scrollbar`, `::-webkit-scrollbar-thumb`, the hover state, and
      `::-webkit-scrollbar-corner` are unchanged.
- [x] `pnpm dev` starts without errors and `pnpm build` completes successfully, both
      run from inside `front/`.
- [x] `.claude/feature_list.json` entry `f02` has `status: "done"` again.

---

### Additional scope: MuunCode Rebrand

Added after the Icon Gap Fix round above, per
`features/f02_login_screen_ui/muuncode-rebrand.md`. Renames the brand from "HyperMuun"
to "MuunCode", with `MoonOrbitLogo` inline as the "o" in "Code". Prototyped live in a
browser via DOM manipulation (no code touched) before being specced, per the user's
explicit request to experiment first.

- [x] `front/src/locales/en.json` and `front/src/locales/es.json`: `title` is
      `"MuunCode"` in both files. No other key changed in either file.
- [x] `LoginScreen.tsx`: `brandPrefix`/`brandSuffix` are `title.slice(0, 5)` /
      `title.slice(6)`. The `<h1>` renders `brandPrefix`, then `MoonOrbitLogo` with
      `size={28}` directly (no wrapping `.brandMuunColumn` span), then `brandSuffix`,
      all as siblings on one line.
- [x] `LoginScreen.module.css`: `.brandMuunColumn` and `.brandMuunColumn svg` no longer
      exist. `.title` is `display: block; text-align: right;` (not flex). `.title svg`
      has `display: inline-block; width: 2.8rem; height: 2.8rem; vertical-align:
      middle; transform: translateY(-0.1em);`. Every other property already on
      `.title` (font/color/shadow tokens) is unchanged.
- [x] Loading the page in a real browser (not just reading the CSS) shows "MuunCode"
      as one continuous wordmark, right-aligned, with the moon icon sitting inline
      where the "o" in "Code" would be, roughly letter-sized and vertically centered
      with the surrounding text, at both the base and `768px+` font sizes.
- [x] `pnpm dev` starts without errors and `pnpm build` completes successfully, both
      run from inside `front/`.
- [x] `.claude/feature_list.json` entry `f02` has `status: "done"` again.

---

### Additional scope: Larger MuunCode Icon

Added after the MuunCode Rebrand round above, per
`features/f02_login_screen_ui/muuncode-icon-size.md`. Tested live at both font sizes
before being specced.

- [x] `LoginScreen.module.css`'s `.title svg` has `width: 3.2rem; height: 3.2rem;`
      (was `2.8rem`). `display`, `vertical-align`, and
      `transform: translateY(-0.1em)` are unchanged. `LoginScreen.tsx`'s
      `MoonOrbitLogo` still has `size={28}` (unchanged; the CSS override is what
      actually controls the rendered size).
- [x] `pnpm dev` starts without errors and `pnpm build` completes successfully, both
      run from inside `front/`.
- [x] `.claude/feature_list.json` entry `f02` has `status: "done"` again.

---

### Additional scope: Off-Harness Batch (Bigger Icon, MuunCode Rebrand, Card Copy, Purple Scrollbar)

No spec file for this round: done directly by the lead per the user's explicit request
to skip the Implementer/`reviewer-light` spec-writing cycle for fast, trivial tweaks.
Reviewed after the fact with `reviewer-light` against this checklist instead of a
formal spec. See `.claude/progress/review_f02.md` for the full review.

- [x] `LoginScreen.module.css`'s `.title svg` is `width: 3.6rem; height: 3.6rem;
      margin-left: -0.6rem;` (supersedes the `3.2rem` value from the round above,
      tested live at both font sizes).
- [x] Every "HyperMuun" mention across the repository (docs, `.claude/`, `features/`,
      app code/locales) is replaced with "MuunCode", except historical narration of
      the rename event itself (e.g. "renames the brand from 'HyperMuun' to
      'MuunCode'"), which intentionally keeps the old name to stay readable.
      `.claude/context/HyperMuun-Context.md` is renamed to `MuunCode-Context.md`,
      referenced under its new name from `CLAUDE.md`/`.claude/AGENTS.md`.
      `.claude/settings.local.json`'s path-based permission entries are updated to
      the project's current folder name, not treated as brand-text find/replace.
- [x] `front/src/locales/en.json`/`es.json`: `description` and `philosophy` hold the
      user's exact new copy (IDE pitch + HTML/CSS/JavaScript/hardware paragraph),
      with a coherent English translation in `en.json`.
- [x] `LoginScreen.tsx` has a `withTechHighlights` helper wrapping the literal words
      "HTML", "CSS", "JavaScript" in `<strong>` with a per-tech CSS class, used when
      rendering `philosophy`. `LoginScreen.module.css` has `.techHtml`/`.techCss`/
      `.techJs`, each with a `color: var(--color-tech-*)`.
- [x] `tokens.css` gains `--color-tech-html`/`--color-tech-css`/`--color-tech-js`,
      and a new `--color-scrollbar-thumb` (purple, `rgba(179, 102, 255, 0.5)`);
      `--color-scrollbar-thumb-hover` and `--glow-scrollbar-hover` are updated from
      blue to purple.
- [x] `reset.css`'s `* { scrollbar-color: ...; }` uses `var(--color-scrollbar-thumb)
      var(--color-bg)` (tokens only, no literal colors); `::-webkit-scrollbar-track`
      uses `var(--color-bg)`; `::-webkit-scrollbar-thumb` uses
      `var(--color-scrollbar-thumb)`. A comment explains that `scrollbar-color` (not
      the `::-webkit-scrollbar-*` rules) is what actually renders in this Chromium
      build with `scrollbar-width: thin` set, the root cause behind every prior
      scrollbar round's fix having no visible effect.
- [x] `pnpm build` completes successfully from `front/` (after a fresh
      `pnpm install`, required once because `node_modules` symlinks still pointed at
      the pre-rename folder path).
- [x] `.claude/feature_list.json` entry `f02` has `status: "done"` again.

---

## F03: GitHub Authentication

Wires the real "Iniciar con GitHub" flow per
`features/f03_github_auth/github-auth.md`, replacing `f02`'s placeholder
`console.info` handler. Implements the architecture already decided in `CLAUDE.md` ->
"Authentication and Account Creation": a GitHub App (already created by the user
outside this repo, App `MuunCode`, App ID `4511196`), two stateless Vercel serverless
functions, and client-side token storage. No repo creation, file read/write, or other
GitHub Contents/Git Data API usage in this feature.

**Post-approval correction** (found by actually running `vercel dev` against a real
GitHub App, after this feature was first approved): Vercel only auto-discovers
Serverless Functions under a root-level `api/` directory, it does not follow an
arbitrary path from a `functions` glob in `vercel.json`. `backend/api/` never worked.
Functions moved to `api/`, shared lib moved to `api/lib/`, `backend/` removed
entirely, root `package.json`/`tsconfig.json` added (`@vercel/node`, `typescript`,
`@types/node`) so `api/*.ts` type-checks. The callback path was also shortened from
`/auth/callback` to `/station` in a separate bug-fix round. Checkpoints below reflect
the corrected, actually-working state.

- [x] `api/auth-exchange.ts` exists. `POST`, body `{ code: string }`, calls
      `https://github.com/login/oauth/access_token` with `client_id`/`client_secret`
      read from `process.env.GITHUB_CLIENT_ID`/`process.env.GITHUB_CLIENT_SECRET`
      (never a literal value), returns `{ accessToken, refreshToken, expiresIn,
      refreshTokenExpiresIn }`. Never logs the secret or either token.
- [x] `api/auth-refresh.ts` exists. `POST`, body `{ refreshToken: string }`,
      calls the same GitHub endpoint with `grant_type=refresh_token`, returns the same
      response shape as `auth-exchange.ts`. Both import shared logic from
      `api/lib/githubOAuth.ts`.
- [x] `vercel.json` exists at the repo root with `buildCommand`/`outputDirectory`
      pointing at `front/`'s build, and a `functions` entry routing `api/*.ts` with
      `{ "maxDuration": 10 }` (no `runtime` key: the earlier `"runtime": "@vercel/node"`
      value was the old `now.json`-era format and is invalid in current `vercel.json`,
      confirmed by a real `vercel dev` run).
- [x] `.env.example` exists at the repo root with `GITHUB_CLIENT_ID=` and
      `GITHUB_CLIENT_SECRET=` (no values); `.env` (not `.env.local`, per the user's
      standing preference) holds the real local values, gitignored. No file anywhere
      in the repo contains a literal Client Secret, private key content, or
      access/refresh token.
- [x] `LoginScreen.tsx`'s `handleSignIn` navigates to
      `https://github.com/apps/muuncode/installations/new` instead of only logging to
      the console.
- [x] A callback view (`front/src/components/templates/Station/`, renamed from its
      original `AuthCallback` once its real identity as MuunCode's IDE entry point
      became clear) renders when the app loads at `/station`, reads `code` from
      `window.location.search`, `POST`s it to `/api/auth-exchange`, stores the
      resulting tokens plus a computed expiry timestamp in `localStorage`, then
      redirects to `/`. Deciding between `LoginScreen`/`Station` reads
      `window.location.pathname` directly; no routing library is introduced. The
      effect fires the exchange exactly once (guarded by a ref, since GitHub's `code`
      is single-use) and always resolves to either success or the error message,
      never staying stuck on the loading text (a StrictMode double-invoke bug where a
      stale cleanup's `isCancelled` flag swallowed a real error was fixed).
- [x] A helper module (e.g. `front/src/lib/githubAuth.ts`) reads the stored tokens and
      transparently calls `/api/auth-refresh` when the access token is expired (or
      near expiry) before returning a usable token; nothing else in the codebase reads
      the raw `localStorage` auth keys directly.
- [x] `pnpm build` completes successfully from `front/`.
- [x] `.gitignore` covers `*.pem` and the app's `.env*` files (already true as of
      this feature's planning; re-confirm it still does).
- [x] `.claude/feature_list.json` entry `f03` has `status: "done"` (flipped after the
      full `reviewer`'s first approval of this initial round).

---

### Additional scope: Vercel Architecture Correction

See `features/f03_github_auth/vercel-architecture-correction.md` for the full
writeup. Found and fixed live, off-harness, while actually running `vercel dev`
against a real GitHub App for the first time.

- [x] `api/` exists at the repo root (not `backend/api/`); `backend/` does not exist.
- [x] `api/lib/githubOAuth.ts` and `api/lib/devCors.ts` hold the shared logic used by
      all three functions; each function file itself stays a thin HTTP handler.
- [x] Root `package.json`/`tsconfig.json` exist for `api/*.ts` only (`@vercel/node`,
      `typescript`, `@types/node`); `pnpm exec tsc --noEmit` from the repo root passes.
- [x] `vercel.json`'s `functions` entry has no `runtime` key.
- [x] `front/.env`/`.env.example` hold `VITE_API_BASE_URL`/`VITE_GITHUB_CLIENT_ID`;
      root `.env`/`.env.example` hold `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`. No
      `.env.local` anywhere in the repo.
- [x] `api/lib/devCors.ts` only allows `localhost:<port>` origins, never a wildcard.
- [x] No `throw` in `api/lib/githubOAuth.ts` or `front/src/lib/githubAuth.ts`, other
      than the single, immediately-caught `JSON.parse` case in `githubAuth.ts`.
- [x] `pnpm build` and `pnpm lint` (from `front/`) pass.

---

### Additional scope: Session Lifecycle and Sign-In Flow Correctness

See `features/f03_github_auth/session-lifecycle-and-sign-in-flow.md`. Three real bugs
found by clicking through the flow, each with an empirically-verified root cause.

- [x] `front/src/lib/githubSignInUrl.ts`'s `githubSignInUrl()` always returns the
      plain `https://github.com/login/oauth/authorize` URL; no `localStorage`-based
      heuristic decides between an "install" and an "authorize" URL.
- [x] `GITHUB_INSTALL_URL` (`/installations/new`) is only used on the dedicated "needs
      install" screen, gated by `api/check-installation.ts`'s real answer, never on
      the general sign-in button.
- [x] `front/src/lib/githubAuth.ts`'s `isSignedIn()` checks `refreshTokenExpiresAt`
      and clears the stored session if it has passed.
- [x] `Station.tsx` calls `checkHasInstallation()` (via
      `front/src/lib/githubInstallation.ts`) after every successful token acquisition,
      before ever reaching the success screen.
- [x] `api/check-installation.ts` goes through `applyDevCors` like the other two
      functions, and never receives or needs the Client Secret.
- [x] `pnpm build` and `pnpm lint` pass.

---

### Additional scope: Station UX, Pages, and Status Screens

See `features/f03_github_auth/station-ux-and-status-screens.md`.

- [x] `AuthCallback` is renamed `Station`; `LoginScreen` is renamed `Home`.
- [x] `components/templates/` is empty (just an explanatory `index.ts`);
      `components/pages/` holds `Home`, `Station`, `NotFound`, `ServerError`, each
      with its own barrel, plus a category barrel re-exporting all four.
- [x] `App.tsx` picks between the four by reading `window.location.pathname`
      directly (no routing library), wrapped in an `ErrorBoundary` class component
      that renders `ServerError` on a caught render error.
- [x] `molecules/StatusScreen` (with `StatusScreenAction`) is used by `Station` (its
      `unauthenticated`/`needsInstall`/`error` states), `NotFound`, and `ServerError`;
      none of those re-implement the badge/card/actions shape on their own.
- [x] `atoms/BrandTitle` has no `text-align` of its own; `Home` and `StatusScreen`
      each control its alignment from their own context.
- [x] `molecules/LaunchLoader` only renders while `Station`'s status is `exchanging`
      (including its `exiting` phase); every other status never mounts it. Its
      canvas animation and every CSS animation on it (`liftoff`, `bob`, `flyAway`,
      `flamePulse`) are disabled/collapsed under `prefers-reduced-motion: reduce`.
- [x] `atoms/WarningIcon` is the single source of that SVG; `BrowserSupportNotice`
      and `Station`'s error screen both import it, neither has its own inline copy.
- [x] `Card`'s `variant` type includes `'red'`, backed by new
      `--color-neon-red`/`--color-card-bg-red`/`--color-card-border-red` tokens, not
      used as literals anywhere.
- [x] `pnpm build` and `pnpm lint` pass.

---

## F04: Repository Selection UI (Mockup)

See `features/f04_repository_selection_ui/repository-selection-ui.md` for full
context. Stage 1 only: static, responsive mockup with mock data, no real GitHub API
wiring, no persistence, no IDE navigation.

- [ ] `components/organisms/RepoSelector/` exists (first organism in the project;
      `organisms/index.ts` re-exports it); rendered inside `Station.tsx`'s `'success'`
      branch, directly under the `t('stationSuccess')` message.
- [ ] `RepoSelector` renders a heading/hint (`repoSelectorHeading`/`repoSelectorHint`)
      and a list of mock repositories from a hardcoded array living in the component,
      explicitly commented as temporary mockup data for this stage.
- [ ] Each mock repo renders via `molecules/RepoListItem/`: `atoms/RepoIcon`, the
      repo name, the existing `Badge` atom for Public/Private (no new badge
      component), and the static `repoUpdatedPlaceholder` hint text.
- [ ] `RepoListItem` is a real `<button>` element (not a `div` with `onClick`):
      reachable and activatable via keyboard (Tab + Enter/Space), not just mouse
      click.
- [ ] Clicking a `RepoListItem` toggles a local "selected" visual state only (CSS
      class change, reusing an existing neon-blue-based token already used for
      focus/hover elsewhere, not a new color token); no network call, no navigation.
- [ ] A "Crear nuevo repositorio" action is visually distinct from the existing-repo
      items (its own dashed-border or equivalent treatment), not styled as just
      another list row, and uses the full `Button` atom, not a minor link.
- [ ] Both the repo-select and create-new handlers are explicit placeholders
      (`// TODO(f04-stage-2): ...` + `console.info`), matching the precedent
      `f02`'s original sign-in button used before it was wired: never a bare
      do-nothing handler with no comment.
- [ ] `atoms/RepoIcon` and `atoms/PlusIcon` exist as simple line-icon SVGs (no
      gradient/glow technique, that is reserved for brand marks), matching
      `BackIcon`/`EnterIcon`'s existing style.
- [ ] Base (mobile) styles: full-width stacked list, each `RepoListItem` at least a
      44px-tall tap target. `min-width: 1024px` override: `RepoSelector` centers with
      a constrained `max-width` (~60rem) and more generous padding; still a single
      vertical list, no grid.
- [ ] Outer container is the existing `Card` atom (`variant="blue"`), not a new
      container component. No dividing lines (`<hr>` or border-only separators)
      between list items, spacing only (`var(--spacing-sm)`), consistent with the
      rest of the app's glass-card house style.
- [ ] The existing sign-out button in `Station.tsx`'s `'success'` branch still
      renders, demoted to a small secondary action below `RepoSelector`, not removed
      (still needed for manual testing).
- [ ] No em dash, no `throw`, no inline `style={{}}` outside a documented dynamic
      CSS-custom-property case, no literal color/spacing value outside `tokens.css`.
- [ ] New i18n keys (`repoSelectorHeading`, `repoSelectorHint`, `createRepoButton`,
      `publicBadge`, `privateBadge`, `repoUpdatedPlaceholder`) exist in both
      `front/src/locales/es.json` and `en.json`, no key present in one but missing
      from the other.
- [ ] `pnpm build` and `pnpm lint` (from `front/`) pass.

---

## F04 additional scope: Repository Creation Accordion

See `features/f04_repository_selection_ui/repository-creation-accordion.md` for full
context. Still stage-1 mockup: no real GitHub API call yet.

- [x] `molecules/AccordionPanel` exists as a generic, reusable expand/collapse
      primitive (not hardcoded to repos), used twice inside `RepoSelector`.
- [x] `molecules/CreateRepoForm` exists with repo name (required, `MIN_NAME_LENGTH
      = 8`, spaces replaced with hyphens as the user types), visibility
      (public/private, defaulting to a sensible value), and description
      (optional) fields; reuses `publicBadge`/`privateBadge` copy for the
      visibility options, no duplicated strings.
- [x] Exactly one accordion section is expanded at a time, including a "both
      collapsed" state reachable by clicking whichever header is already open
      (true accordion with a tri-state `'create' | 'existing' | null`, not a
      simple two-panel toggle).
- [x] "Crear nuevo repositorio" is a full-width tab-style header (not the old
      small dashed-border button), collapsed by default.
- [x] "Seleccionar repositorio existente" is a full-width tab-style header wrapping
      the existing mock repo list, expanded by default.
- [x] `Siguiente`'s `disabled` state is computed from whichever section is
      expanded (or `true` when neither is): `selectedRepoId` when existing-repo is
      expanded, the create form's validity when create-new is expanded.
- [x] Clicking `Siguiente` while enabled remains a `// TODO(f04-stage-2): ...` +
      `console.info` placeholder in both modes, no real navigation or API call.
- [x] **Superseded technique, verified against actual current code**: the
      accordion transition does NOT use the originally-planned CSS-only
      `grid-template-rows: 0fr`/`1fr` trick. That approach was replaced (see
      `features/f04_repository_selection_ui/repository-creation-accordion.md`'s
      final round and `.claude/progress/history.md`) after repeatedly proving
      unreliable across collapse/expand directions, a genuine CSS Grid/Flexbox
      intrinsic-sizing edge case, not just an animation-timing bug. The current,
      verified-working approach: `RepoSelector` measures the real available
      space once per toggle (`useLayoutEffect` + `ResizeObserver`, never per
      animation frame) and passes it to `AccordionPanel` as a `contentHeight`
      prop, which drives a `--accordion-content-height` CSS custom property (the
      one documented dynamic-inline-style exception) read by a single,
      never-class-swapped `max-height` rule. The collapsed section still takes
      effectively zero layout height (`0px`).
- [x] The success screen still fits `100dvh` with zero page-level scroll; whichever
      accordion section is expanded is the one that gets the measured available
      height, with `.list`'s own `overflow-y: auto` handling genuine internal
      scrolling past that.
- [x] `prefers-reduced-motion: reduce` collapses the accordion transition to an
      instant state change.
- [x] Typing in `CreateRepoForm`'s fields does not re-render `RepoSelector`'s own
      tree (specifically, the mock repo list) beyond what is unavoidable; validity
      changes are only propagated up when the boolean actually flips.
- [x] New i18n keys (`createRepoTabLabel`, `existingRepoTabLabel`,
      `repoNameLabel`, `repoNamePlaceholder`, `repoVisibilityLabel`,
      `repoDescriptionLabel`, `repoDescriptionPlaceholder`) exist in both
      `es.json`/`en.json`.
- [x] The now-unused `createRepoButton` i18n key and any now-dead CSS for the old
      dashed-border button, and every dead class from the superseded
      grid-template-rows/flex-toggle-sync attempts (`.panelExpanded`,
      `.panelCollapsed`, `.contentWrapperExpanded`, `.listWrapperExpanded`,
      `.listExpanded`), are removed, not left as dead code.
- [x] No em dash, no `throw`, no inline `style={{}}` outside the documented
      dynamic CSS-custom-property case (`--accordion-content-height`), no literal
      color/spacing value outside `tokens.css`.
- [x] `pnpm build` and `pnpm lint` (from `front/`) pass.

**Fast-pass review** (`reviewer-light`, 2026-08-20): APPROVED. Verified live
against actual current code (not the superseded technique this checklist
originally described), report at `.claude/progress/review_f04.md`.

---

## F04 additional scope: Real GitHub Repository Data

See `features/f04_repository_selection_ui/real-github-repo-data.md` for full
context. Replaces the stage-1 mock data with real GitHub API calls: listing the
signed-in account's actual repositories, and creating a new one.

- [x] `api/list-repos.ts` and `api/create-repo.ts` exist, follow
      `check-installation.ts`'s exact shape (`applyDevCors` first, `POST`-only,
      body-based input, no Client Secret in either).
- [x] `@octokit/auth-app` (decided over hand-signing with a generic JOSE library)
      added via `pnpm add @octokit/auth-app`; `api/lib/githubAppAuth.ts` wraps
      it, never lets it throw past this module's own boundary, returns `null`
      on any failure.
- [x] Neither new endpoint, nor any shared `api/lib/` helper they use, ever sends
      the GitHub App's private key or Client Secret to the browser.
- [x] **Superseded twice since, verified against current code**: `api/create-
      repo.ts` originally called `POST /user/repos` with `auto_init: true`, then
      added the repo to the installation itself. The "New Repository Scaffold"
      round below changed this to `auto_init: false` (real scaffold commits
      instead of GitHub's own placeholder README); the "Repository Creation
      Confirmation Flow" round further split repo creation and the
      install-add step into two separate endpoints (`api/create-repo.ts` /
      `api/scaffold-repo.ts`). The install-add behavior itself (tolerated as a
      no-op when the installation already covers all repos) is unchanged,
      just relocated to `api/scaffold-repo.ts`.
- [x] `front/src/lib/githubRepos.ts` exists, both functions return `null` on any
      failure, no `throw` anywhere in this feature's new code.
- [x] `RepoSelector.tsx` shows a real loading state while `listRepos` is in flight,
      and a real error state if it fails, scoped to the existing-repo accordion
      section only. **Superseded**: Round 2 below moved this loading/error
      handling up to `Station.tsx`'s own full-screen loader; `RepoSelector`
      no longer fetches or shows loading/error UI for this at all.
- [x] Selecting a real repo, or successfully creating one, reaches a clear success
      state without attempting to navigate into a nonexistent IDE view.
      **Superseded**: the "Repository Creation Confirmation Flow" round added
      the real IDE view (`f05`'s `/ide` stub) both paths now navigate to.
- [x] No em dash, no literal color/spacing value outside `tokens.css` for any new
      UI (loading/error states), `@/` path alias imports with barrels for any new
      component.
- [x] `pnpm build` and `pnpm lint` (from `front/`) pass; root `pnpm exec tsc
      --noEmit` passes (covers the new `api/*.ts` files).

**Fast-pass review** (`reviewer-light`, 2026-08-20): APPROVED.

### Round 2: recent-activity sort/label, rocket-loader-driven initial fetch

See `features/f04_repository_selection_ui/real-github-repo-data.md`'s "Round 2"
section for full context.

- [x] `api/list-repos.ts` includes `pushed_at` and sorts by it, most recent
      first; `api/create-repo.ts`'s response includes the same field.
- [x] `Repo` type gains `updatedAt: string`; a new relative-time utility uses
      `Intl.RelativeTimeFormat` (no new dependency), driven by the current
      i18next language.
- [x] `RepoListItem` renders a real, computed relative-time label;
      `repoUpdatedPlaceholder` removed from both locale files.
- [x] `Station.tsx` fetches the repo list itself (chained after
      `resolveInstallationStatus`), still showing `LaunchLoader` (message
      switched to `repoListLoading` for this phase) while in flight; only
      reaches `'success'` once the fetch succeeds, passing `repos` down.
- [x] A failed initial fetch reaches the existing full-screen `'error'` status,
      not a small in-card message.
- [x] `RepoSelector` no longer fetches on its own mount and has no more
      loading/error/retry UI for the initial load; its create-new-repo submit
      flow is unchanged. **Superseded**: the "Repository Creation Confirmation
      Flow" round later moved the create-new submit flow up to `Station.tsx`
      too (a confirmation step, then `Station`'s own loader phases), so this
      is no longer accurate for the SUBMIT flow specifically, only for the
      initial-list-fetch concern this round itself addressed.
- [x] No em dash, no `throw`, no new literal color/spacing value, no new
      runtime dependency for relative-time formatting.
- [x] `pnpm build` and `pnpm lint` (from `front/`) pass; root `pnpm exec tsc
      --noEmit` passes.

**Fast-pass review** (`reviewer-light`, 2026-08-20): APPROVED.

### Round 3: only list repositories that already are MuunCode projects

See `features/f04_repository_selection_ui/real-github-repo-data.md`'s "Round 3"
section for full context.

- [x] `api/lib/githubInstallationId.ts` (or equivalent) also resolves the
      installation account's `login`.
- [x] `api/list-repos.ts` calls GitHub's Code Search API exactly once per
      request (`filename:workspace.json path:.MuunCode user:{login}`), filters
      its repo array to the matching ids before responding.
- [x] A search failure reaches the same existing error path (clear non-200,
      no thrown exception); a legitimately empty match set still responds
      `200` with `[]`, never treated as a failure.
- [x] `RepoSelector.tsx` shows a warning-toned empty state (reusing
      `WarningIcon` + existing red-toned tokens, no new color token) scoped to
      the existing-repo section when `repos.length === 0`, not the full-page
      error screen.
- [x] `repoSelectorHint`/`existingRepoTabLabel` updated with the `(Proyecto
      MuunCode)`/`(MuunCode Project)` qualifier in both locale files; new
      `repoListEmptyTagline`/`repoListEmptyMessage` keys added. **Refined
      since, off-harness**: the tab-label qualifier was later shortened to
      just `(MuunCode)`, rendered in its own smaller, non-uppercased `<span>`
      (`muunCodeQualifier` key), and a "Start new" shortcut button was added
      inside the empty state.
- [x] No em dash, no `throw`, no new literal color/spacing value, no new
      runtime dependency.
- [x] `pnpm build` and `pnpm lint` (from `front/`) pass; root `pnpm exec tsc
      --noEmit` passes.

**Fast-pass review** (`reviewer-light`, 2026-08-21): APPROVED.

---

## F04 additional scope: New Repository Scaffold

See `features/f04_repository_selection_ui/new-repo-scaffold.md` for full context.

- [x] `api/lib/repoScaffoldTemplates.ts` exists with `buildWorkspaceConfig`,
      `buildReadme`, and `GREETINGS_MD`; `GREETINGS_MD`'s Spanish text matches
      the user's original wording verbatim, English section first. **Refined
      since**: `GREETINGS_MD` gained a bilingual `# GREETINGS / HOLA!!!` title
      and a two-language index at the top, matching `README.md`'s own index
      pattern.
- [x] **Superseded, verified against current code**: `api/lib/
      githubContentCommit.ts` (one Contents-API PUT per file, three separate
      commits) was replaced by the "Repository Creation Confirmation Flow"
      round's `api/lib/githubGitDataCommit.ts` (one single real commit via the
      Git Data API); the old file was deleted, confirmed zero remaining
      imports of it anywhere in the repo.
- [x] **Superseded**: `api/create-repo.ts` used `auto_init: false` and
      committed the three scaffold files itself at the time this round
      shipped; the "Repository Creation Confirmation Flow" round moved the
      scaffold-commit step out to the new `api/scaffold-repo.ts` endpoint
      (`auto_init: false` itself is unchanged, still correct).
- [x] `.MuunCode/workspace.json` matches the documented schema exactly
      (`muunCodeVersion`, `name`, `device: null`, `display: null`,
      `createdAt`).
- [x] `README.md` has the repo name as H1, an optional description tagline
      (cleanly omitted if blank), an index linking both language sections,
      English section first with device/display/purpose prompts, Spanish
      section second mirroring the same structure.
- [x] A failure partway through the three scaffold commits results in a clear
      error response, never a silent success, and never an automatic repo
      deletion/rollback.
- [x] The existing "add repo to installation" step still runs after the
      scaffold commits (now inside `api/scaffold-repo.ts`, see above).
- [x] No em dash, no `throw`, no new runtime dependency.
- [x] `pnpm build` and `pnpm lint` (from `front/`) pass; root `pnpm exec tsc
      --noEmit` passes.

**Fast-pass review** (`reviewer-light`, 2026-08-21): APPROVED.

## F04 additional scope: Repository Creation Confirmation Flow

See `features/f04_repository_selection_ui/repo-creation-confirmation-flow.md`.

- [x] Clicking `Siguiente` in create mode shows the confirmation summary
      (tagline, interpolated body text, the `.MuunCode` warning, `Crear`/
      `Cancelar`) instead of immediately calling the creation API; `Cancelar`
      returns to the accordion view without losing typed form values.
- [x] Clicking `Crear` shows `Station`'s existing full-screen `LaunchLoader`,
      message switching between the "creating" and "adjusting lunar
      parameters" phases at the real boundary between the two backend calls.
- [x] `api/create-repo.ts` only creates the bare repository; `api/scaffold-
      repo.ts` (new) commits all three scaffold files as ONE real git commit
      via the Git Data API, message `"MuunCode: Foundation - Houston, repo
      {name} successfully created"`, then the existing installation-add step.
- [x] A failure in either endpoint reaches the existing full-screen `'error'`
      status; the created repository is never automatically deleted.
- [x] `Repo`'s type and both endpoints' responses include `owner`; both
      confirm paths navigate to `/ide?owner={owner}&repo={name}`.
- [x] `Station.tsx`'s `'success'` branch no longer renders the tagline/sign-out
      pairing (moved to `f05`'s stub).
- [x] No em dash, no `throw`, no new literal color/spacing value, no new
      runtime dependency.
- [x] `pnpm build` and `pnpm lint` (from `front/`) pass; root `pnpm exec tsc
      --noEmit` passes.

**Fast-pass review** (`reviewer-light`, 2026-08-21): APPROVED. Report at
`.claude/progress/review_f04.md`.

---

## F04 additional scope: Repo Creation Backend Hardening

No dedicated spec file: real bugs found and fixed during live, end-to-end
testing of the round above against the real GitHub API, each one only
surfacing once the previous was fixed. See `impl_f04.md`'s "2026-08-21:
Additional scope, Repo Creation Backend Hardening" section for the full
bug-by-bug narrative.

- [x] `api/create-repo.ts`/`api/scaffold-repo.ts` forward GitHub's own error
      detail instead of one generic message.
- [x] `api/scaffold-repo.ts` runs `addRepoToInstallation` before the git-data
      commit (the App's installation must cover the repo before the Git Data
      API can write to it).
- [x] Default branch is always `master` (`api/create-repo.ts` hardcodes it;
      `setDefaultBranch` re-asserts it after the real commit lands),
      regardless of the signed-in account's own default-branch-name setting.
- [x] `api/lib/githubBootstrapBranch.ts` (Contents API, the only surface that
      can write to a zero-ref repo) creates a throwaway first commit on
      `master`; `commitFiles` force-updates that same ref with its own real,
      parent-less commit, so the bootstrap commit never appears in the
      repo's visible history.
- [x] A scaffold-commit (or bootstrap) failure deletes the orphaned bare
      repository automatically (`api/lib/githubDeleteRepo.ts`), reporting
      `repoDeleted` back so the frontend can tell the user whether manual
      cleanup is still needed (explicit user decision, superseding this
      feature's earlier "never auto-delete" checkpoint above).
- [x] `api/list-repos.ts`'s "is this a MuunCode project" filter uses a direct
      Contents API existence check per repo, not GitHub's Code Search API
      (real, unbounded indexing lag produced false negatives on repos whose
      scaffold commit had already genuinely landed).
- [x] Repos with over a year of inactivity are excluded before the
      Contents-API check even runs.
- [x] `front/src/lib/githubRepos.ts`'s `createBareRepo`/`scaffoldRepo` return
      a controlled `{ ok, ... }` result, never `null`/a bare boolean.
- [x] `StatusScreen` gained an optional `detail` prop: GitHub's raw technical
      error text renders in its own monospace box, not interpolated into the
      localized `message` sentence.
- [x] `RepoSelector`'s "Siguiente" button disables itself the instant an
      existing-repo confirmation is submitted, guarding against a double
      click.
- [x] No em dash, no `throw`, no new literal color/spacing value outside
      `tokens.css`.
- [x] `pnpm build`/`pnpm lint` (`front/`) and root `pnpm exec tsc --noEmit`
      pass. Live end-to-end tested by the user against the real GitHub API;
      the final retry produced a real repo with one correct commit on
      `master` containing all three scaffold files.

**Full review** (`reviewer`, 2026-08-21): APPROVED (together with F05, see
`.claude/progress/review_f04.md`). Non-blocking findings from that pass are
tracked in the next section below.

---

## F04/F05 additional scope: Session State Machine Unification, Pagination & Cleanup

No dedicated spec file: follow-up round addressing every non-blocking finding
from the 2026-08-21 full `reviewer` pass (`review_f04.md`/`review_f05.md`),
per explicit user request ("vamos a corregir todo").

- [x] `Station.tsx`'s returning-visitor flow no longer hand-rolls its own copy
      of the `isSignedIn` -> `getAccessToken` -> `checkHasInstallation` ->
      `readActiveProject` sequence: it calls `lib/sessionResolution.ts`'s
      `resolveSession()` (returning visit) / `resolveSessionFromToken()`
      (fresh OAuth code-exchange, which already holds a verified token) and
      switches on the result. `noProject` is the only outcome `Station.tsx`
      still does real extra work for (loading the paginated repo list).
      Resolves the architectural-drift finding from the full review: there is
      now exactly one place this sequence is implemented.
- [x] `api/lib/githubInstallationId.ts`'s unused `accountLogin`/`account`
      fields and null-check (dead code left over from the superseded Code
      Search approach, with a now-false comment) are removed.
- [x] `api/list-repos.ts` supports real pagination (`page` param, `per_page`
      capped at 100, `hasMore` derived from GitHub's own `total_count`);
      `front/src/lib/githubRepos.ts`'s `listRepos` takes a `page` argument and
      returns `{ repos, hasMore }`.
- [x] `RepoSelector`'s existing-repo list implements infinite scroll: crossing
      a near-bottom threshold while `hasMoreRepos` is true and no load is
      already in flight requests the next page via `Station.tsx`'s
      `handleLoadMoreRepos`, appending results; a small "loading more"
      indicator shows while a page request is in flight.
- [x] A small, always-visible notice in the existing-repo panel states that
      only repositories with under a year of inactivity are shown
      (`repoListActivityNotice`).
- [x] `api/list-repos.ts`'s per-repo Contents-API "is this a MuunCode
      project" existence check runs in concurrency-limited batches
      (`mapWithConcurrencyLimit`, batch size 10), not one unbounded
      `Promise.all` per page, to avoid tripping GitHub's abuse/secondary rate
      limiting on accounts with many repos per page.
- [x] The em dash violations flagged by the full review
      (`features/f04_repository_selection_ui/real-github-repo-data.md`,
      `.claude/progress/current.md`) are fixed.
- [x] No em dash, no `throw`, no new literal color/spacing value outside
      `tokens.css`, no new runtime dependency.
- [x] `pnpm build`/`pnpm lint` (`front/`) and root `pnpm exec tsc --noEmit`
      pass.

---

## F05: IDE Viewer Page (Stub)

See `features/f05_ide_viewer_page/ide-viewer-page.md`. **Superseded**: this
round's `/ide` route, `IdeViewer` component, and query-string-based
owner/repo handoff were all replaced by the round below
("Session Resolution State Machine + /ide -> /lab Rename"). Kept here as the
historical record of what this feature originally shipped as; do not treat
any checkpoint below as describing the current code.

- [x] `App.tsx`'s `CurrentView` routes `/ide` to a new `IdeViewer` page.
- [x] `IdeViewer` reads `owner`/`repo` from `window.location.search`; renders
      `NotFound` if either is missing.
- [x] `IdeViewer` renders `BrandTitle`, the `stationSuccess`-keyed tagline
      `Badge`, an interpolated "project open" line, and a sign-out button
      matching `Station`'s existing `handleSignOut` behavior.
- [x] `Station.tsx`'s `'success'` branch has dropped this same pairing (shared
      checkpoint with `f04`'s confirmation-flow round).
- [x] No em dash, no `throw`, no literal color/spacing value outside
      `tokens.css`, `@/` path alias imports with barrels.
- [x] `pnpm build` and `pnpm lint` (from `front/`) pass.

**Fast-pass review** (`reviewer-light`, 2026-08-21): APPROVED. Report at
`.claude/progress/review_f05.md`. Full `reviewer` not yet run as this new
feature's final gate.

---

## F05 additional scope: Session Resolution State Machine + /ide -> /lab Rename

See `features/f05_ide_viewer_page/session-resolution-and-lab-rename.md`.
Supersedes the F05 stub round above: the route is `/lab`, the component is
`LabViewer`, and it no longer reads a query string.

- [x] `lib/activeProject.ts` exists (`storeActiveProject`/`readActiveProject`/
      `clearActiveProject`), `localStorage` key `muuncode.activeProject`,
      never throws.
- [x] `lib/sessionResolution.ts` exists, exports `resolveSession()` (and, as
      of the following round, `resolveSessionFromToken()`) returning a
      5-state discriminated union, never throws.
- [x] `/ide` route and `IdeViewer` folder no longer exist; `/lab` and
      `LabViewer` exist in their place, registered in `App.tsx` and the
      `pages/` barrel.
- [x] `LabViewer` reads no query params; resolves via `resolveSession()` on
      mount, bounces to `/station` on anything short of `ready`.
- [x] `Station.tsx` calls `storeActiveProject` before both navigations to
      `/lab` (select-existing, create-new); `LabViewer`'s own sign-out calls
      `clearActiveProject` alongside `clearGitHubTokens`.
- [x] Home's `handleEnterStation` was briefly async and called
      `resolveSession()` before navigating; superseded by the loader-
      consistency round below (a plain instant navigation instead).
- [x] Loader consistency (found via live user testing): `LaunchLoader`'s
      `liftoff` keyframe starts past `.box`'s own height so the rocket
      genuinely enters from below frame; `Station.tsx`'s `navigateToLab()`
      and `LabViewer`'s own `isLoaderExiting` state both wait for the exit
      animation to finish before navigating/swapping content, instead of
      cutting the animation off mid-flight.
- [x] No em dash, no `throw`, no new literal color/spacing value, no new
      runtime dependency.
- [x] `pnpm build` and `pnpm lint` (from `front/`) pass; root `pnpm exec tsc
      --noEmit` passes.

**Full review** (`reviewer`, 2026-08-21): APPROVED (together with F04, see
`.claude/progress/review_f05.md`). One architectural finding (`Station.tsx`
not yet unified with `resolveSession()`) is resolved in
"F04/F05 additional scope: Session State Machine Unification, Pagination &
Cleanup" above.

---

_No further features have been defined yet. New `## F0N: Feature Name` sections are
added here by the lead as each feature is planned, matching the corresponding entry in
`.claude/feature_list.json`._

