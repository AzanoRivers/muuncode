# Reviewer Report: f02_login_screen_ui

## Verdict

APPROVED

## Checkpoints verified

- [x] `@` alias functional in both Vite (`vite.config.ts` `resolve.alias`) and TypeScript.
      Deviation confirmed safe: the alias `paths` entry lives in `front/tsconfig.app.json`,
      not `front/tsconfig.json`, because this Vite scaffold splits the root tsconfig into a
      references-only file (`{ "files": [], "references": [...] }`) with no
      `compilerOptions` block to add `paths` to. Verified directly:
      `npx tsc -p tsconfig.app.json --noEmit` succeeds with zero errors, and
      `pnpm build` (`tsc -b && vite build`) succeeds end to end. This is the standard,
      current `pnpm create vite@latest` React+TS scaffold shape; the root
      `tsconfig.json`'s `references` entry to `tsconfig.app.json` (whose `include` is
      `["src"]`) is exactly how tsserver/VS Code resolves the project for any file under
      `src/`, so editor tooling and build tooling agree. Not a functional gap.
- [x] Every component folder (`Button`, `GridBackground`, `MoonOrbitLogo`,
      `BrowserSupportNotice`, `LoginScreen`) has its own `index.ts`; every category folder
      (`atoms/`, `molecules/`, `organisms/`, `templates/`) has its own `index.ts`
      re-exporting everything inside it. Category barrels import component folders
      directly (e.g. `export { Button } from './Button'`, which resolves to
      `Button/index.ts`), matching the spec's own two-level example. No barrel imports
      another category's barrel.
- [x] `App.tsx` imports `LoginScreen` via `@/components/templates` only, no relative path,
      no deep direct file path.
- [x] `tokens.css` has the exact color/glow/typography/spacing/radius tokens from the
      spec (`--color-bg: #041528`, `--color-neon-blue: #0BD2FF`,
      `--color-neon-purple: #B366FF`, `--color-neon-pink: #FF69B4`, etc.), `:root`-only,
      no other selectors.
- [x] `@fontsource/orbitron` and `@fontsource/space-grotesk` installed via `pnpm add
      <package>@latest` (verified in `package.json`/`pnpm-lock.yaml`, caret ranges, no
      hand-typed pin), imported once in `main.tsx` (400/700 for Orbitron, 400/500 for
      Space Grotesk).
- [x] `MoonOrbitLogo`: `linearGradient` with exactly 3 stops
      (`--color-neon-blue`/`--color-neon-purple`/`--color-neon-pink` at 0/50/100%)
      applied via `stroke` on the `<g>` (not `fill`), plus a `<filter>` with
      `feGaussianBlur` + `feMerge`. `size` prop with a default of 96.
- [x] `GridBackground` uses only `var(--color-bg)`/`var(--color-grid-line)`, no hardcoded
      colors, two-layer `linear-gradient`, responsive `background-size` at wider
      breakpoints.
- [x] `Button` restyled as primary CTA: `var(--font-display)`, uppercase, layered glow
      `box-shadow` on hover/focus, all values via `var(--token-name)`, none hardcoded.
- [x] `BrowserSupportNotice` renders `t('browserNotice')`, own `.tsx`/`.module.css` pair,
      styled as an informational notice (border + icon), distinct from an error state.
- [x] `LoginScreen` composes `GridBackground`, `MoonOrbitLogo`, title, tagline,
      description, philosophy, the CTA `Button`, and `BrowserSupportNotice`; rendered
      from `App.tsx` as the app's only current view.
- [x] `i18next`, `react-i18next`, `i18next-browser-languagedetector` installed via
      `pnpm add <package>@latest` (verified in `package.json`/`pnpm-lock.yaml`).
- [x] Detector `order: ['localStorage', 'navigator']` exactly in `src/i18n/index.ts`; no
      `path`, `subdomain`, `htmlTag`, or `cookie` detection method anywhere. The only
      other occurrence of those words in `src/` is inside an explanatory comment on the
      same line, not config.
- [x] `en.json`/`es.json` contain the exact copy and all six required keys (`title`,
      `tagline`, `description`, `philosophy`, `signInButton`, `browserNotice`), verified
      byte-for-byte against the spec.
- [x] Sign-in `onClick` (`handleSignIn` in `LoginScreen.tsx`) is a placeholder with a
      `// TODO: wire real GitHub OAuth, see CLAUDE.md -> Authentication and Account
      Creation` comment and a `console.info` no-op; no GitHub API call, GitHub App code,
      or serverless function anywhere in the diff.
- [x] `pnpm build` (`tsc -b && vite build`) and `pnpm dev` both run cleanly from
      `front/`, verified directly in this review (not taken on the Implementer's word).
      `pnpm lint` (`oxlint`) also exits clean.
- [x] No em dash anywhere in `front/src` (grepped directly). No relative-path import
      chains (`../`) anywhere in `front/src` (grepped directly, zero matches). All code,
      identifiers, and comments in English.
- [x] iOS Safari checklist: no `overflow-x: clip`, no unprefixed `backdrop-filter`/
      `clip-path`/inline `user-select`, `GridBackground` uses `min-height: 100vh` with a
      `100dvh` override (not bare `100vh`), no `position: sticky` inside an
      `overflow: hidden` ancestor, no `<input>` elements in this feature.
- [x] `.claude/feature_list.json` `f02` still `in_progress`: correct, per workflow the
      lead updates status to `done` only after this Reviewer approval, not the
      Implementer.

## Notes

- The `tsconfig.app.json` vs `tsconfig.json` deviation is well-documented by the
  Implementer and independently verified here to work correctly for both build
  (`tsc -b`) and standalone type-check (`tsc -p tsconfig.app.json --noEmit`); it reflects
  the actual current Vite React+TS scaffold shape rather than a shortcut. No action
  needed.
- `molecules/organisms/templates` folders retain leftover `.gitkeep` files alongside real
  content; harmless, not a checkpoint violation, but worth pruning in a future pass for
  cleanliness.
- Feature aligns with Core Principles and Non-Goals: static design/markup only, no
  GitHub OAuth implemented, no visual/no-code builder behavior, no toolchain
  reimplementation involved.

---

# Round 2: Additional scope, CSS Reset and Base Font Sizing (font-size tokens + non-token literals closing pass)

## Verdict

APPROVED

## Checkpoints verified

- [x] `front/src/styles/reset.css` exists with Josh Comeau's modern reset adapted for
      this app: `#root { isolation: isolate; }` (not `#__next`), and
      `html { font-size: 62.5%; }` (never a hardcoded `font-size: 10px`), verified by
      direct read of the file.
- [x] `reset.css` is imported in `front/src/main.tsx` immediately before `tokens.css`
      (`import '@/styles/reset.css'` on the line directly above
      `import '@/styles/tokens.css'`), verified by direct read.
- [x] `tokens.css`'s six spacing/radius tokens are exactly `--radius-sm: 0.4rem`,
      `--radius-md: 0.8rem`, `--spacing-xs: 0.8rem`, `--spacing-sm: 1.6rem`,
      `--spacing-md: 2.4rem`, `--spacing-lg: 4rem`. No other pre-existing token's value
      changed (colors, glow, `--font-display`/`--font-body` untouched, verified by
      direct read of the full file).
- [x] `tokens.css` gained exactly the 7 specified font-size tokens
      (`--font-size-xs: 1.2rem`, `--font-size-sm: 1.4rem`, `--font-size-body: 1.5rem`,
      `--font-size-base: 1.6rem`, `--font-size-md: 2rem`, `--font-size-title: 4rem`,
      `--font-size-title-lg: 4.8rem`), verified by direct read.
- [x] Zero literal `font-size` remains in `LoginScreen.module.css`, `Button.module.css`,
      `BrowserSupportNotice.module.css`: grepped `font-size` across every `.module.css`
      under `front/src`, every remaining occurrence is `font-size: var(--font-size-*)`.
      Only `reset.css`'s intentional `html { font-size: 62.5%; }` uses a literal, which
      is correct and in scope.
- [x] `front/src` contains exactly two global CSS files, `styles/tokens.css` and
      `styles/reset.css`; every other `.css` file present
      (`GridBackground.module.css`, `MoonOrbitLogo.module.css`,
      `LoginScreen.module.css`, `Button.module.css`,
      `BrowserSupportNotice.module.css`) is a CSS Module, verified with a full glob of
      `front/src/**/*.css` (7 files total, exactly as expected).
- [x] Non-token dimensional literals recomputed correctly in place:
      `LoginScreen.module.css` `.content { max-width: 67.2rem }`,
      `BrowserSupportNotice.module.css` `.notice { max-width: 51.2rem }`, `.icon { width:
      2rem; height: 2rem }`. None of these were tokenized, matching the spec's
      instruction that only color, font, and spacing are declared token categories.
- [x] Recomputed math independently verified for every value (not taken on the
      Implementer's word), using pixel size = old_rem * 16 = new_rem * 10:
      radius-sm 0.25->0.4 (4px), radius-md 0.5->0.8 (8px), spacing-xs 0.5->0.8 (8px),
      spacing-sm 1->1.6 (16px), spacing-md 1.5->2.4 (24px), spacing-lg 2.5->4 (40px),
      font-size-xs 0.75->1.2 (12px), font-size-sm 0.875->1.4 (14px), font-size-body
      0.9375->1.5 (15px), font-size-base 1->1.6 (16px), font-size-md 1.25->2 (20px),
      font-size-title 2.5->4 (40px), font-size-title-lg 3->4.8 (48px), LoginScreen
      max-width 42->67.2 (672px), BrowserSupportNotice max-width 32->51.2 (512px), icon
      width/height 1.25->2 (20px). All 16 values are exact pixel-equivalent conversions.
- [x] `pnpm build` (`tsc -b && vite build`) runs clean from `front/`, verified directly
      in this review: zero type errors, `dist/` produced successfully.
- [x] `pnpm dev` runs clean from `front/`, verified directly in this review: server
      starts ("ready in 314 ms" on port 5174, since 5173 was occupied), and a direct
      HTTP request to the dev server returns `200`.
- [x] No em dash anywhere in `front/src`, verified by direct grep for the character
      across the whole tree, zero matches.
- [x] No literal `font-size` or inline `fontSize` style anywhere in any `.tsx` file,
      verified by direct grep, zero matches, consistent with the project's
      no-inline-styles rule.
- [x] Code, comments and identifiers touched in this round are in English; no
      non-obvious comment merely restating the code.
- [x] `.claude/feature_list.json` `f02` still `in_progress`: correct, per workflow the
      lead updates status to `done` only after this approval, not the Implementer.

## Notes

- Both prior Implementer rounds' self-reported math (`DONE_WITH_CONCERNS` then `DONE`)
  were independently recomputed here from scratch, not accepted at face value; every
  value checks out.
- This closes the reopened `f02` additional scope in full: all checkpoints under
  `.claude/CHECKPOINTS.md` -> "F02: Login Screen UI" -> "Additional scope: CSS Reset
  and Base Font Sizing" are verifiable and pass. The lead can now flip that section's
  checkboxes and `feature_list.json`'s `f02` entry to `done`.
- No non-goal or Core Principle violation introduced by this round: pure CSS
  reset/token work, no new UI pattern requiring VS Code reference methodology, no
  toolchain reimplementation, no no-code/visual-builder behavior.

---

# Round 3: Additional scope, Visual Refinements

## Verdict

APPROVED

## Checkpoints verified

- [x] `GridBackground.module.css`'s `background-size` is exactly `25px 25px` (base),
      `35px 35px` at `min-width: 360px`, `40px 40px` at `min-width: 440px`, verified by
      direct read of the file and by inspecting `dist/assets/index-*.css` after a real
      `pnpm build`. Old `768px`/`1200px` breakpoints are gone, no trace in source or
      compiled output.
- [x] `tokens.css` gained exactly `--color-card-bg: rgba(4, 21, 40, 0.6)` and
      `--color-card-border: rgba(11, 210, 255, 0.35)` under a new "Card surfaces"
      group; every other pre-existing token (colors, glow, typography, font-size,
      spacing, radii) verified unchanged by direct read against the prior round's
      approved values. `--color-neon-green` also present but pre-existing from the
      original `f02` spec (`login-screen-ui.md` line 31), not introduced this round,
      so no violation.
- [x] `atoms/Badge/`, `atoms/Card/`, `atoms/GitHubIcon/` each exist with their own
      barrel (`index.ts`) and component file; `Badge`/`Card` also have their own
      `.module.css`, `GitHubIcon` intentionally has none (explicitly allowed by the
      checkpoint's own wording). All import via `@/components/atoms`, no relative
      paths. `atoms/index.ts` re-exports all three directly (one level, no
      barrel-importing-a-barrel).
- [x] `Card.module.css` has `-webkit-backdrop-filter: blur(8px);` immediately before
      `backdrop-filter: blur(8px);`, verified by direct read.
- [x] `LoginScreen.tsx` wraps `{t('tagline')}` in `<Badge>`, `{t('description')}` in
      its own `<Card>`, and `{t('philosophy')}` in a second, separate `<Card>`
      (two distinct `<Card>` JSX elements, not one shared container), verified by
      direct read.
- [x] `Button.module.css`'s `.button` has `display: flex; align-items: center; gap:
      var(--spacing-xs);`, verified by direct read; `LoginScreen.tsx` renders
      `<GitHubIcon size={20} />` immediately before `{t('signInButton')}` inside the
      `<Button>`, so the icon and label line up as one flex row.
- [x] `atoms/RocketAscentLogo/`, `atoms/ChipMoonLogo/`, `atoms/CircuitMoonLogo/` each
      exist and each use the exact same technique as `MoonOrbitLogo`: a 3-stop
      `linearGradient` (`--color-neon-blue`/`--color-neon-purple`/`--color-neon-pink`
      at 0/50/100%) applied via `stroke` on a `<g>` (not `fill`), a `<filter>` with
      `feGaussianBlur` + `feMerge`, `viewBox="0 0 24 24"`, and a `size` prop defaulting
      to 96. Verified by direct read and line-by-line comparison against
      `MoonOrbitLogo.tsx`; only the inner path/shape primitives differ per concept.
- [x] `LoginScreen.tsx` renders all four logos (`MoonOrbitLogo`, `RocketAscentLogo`,
      `ChipMoonLogo`, `CircuitMoonLogo`) side by side inside a `.logoRow` div, preceded
      by `{/* TEMP: logo comparison, remove 3 once one is chosen, see
      features/f02_login_screen_ui/visual-refinements.md */}`, verified by direct read.
- [x] No literal color/spacing/radius value in this round's new `.module.css` files
      (`Badge.module.css`, `Card.module.css`, `RocketAscentLogo.module.css`,
      `ChipMoonLogo.module.css`, `CircuitMoonLogo.module.css`): every color, spacing,
      and radius value is a `var(--token-name)` reference. The only literal numeric
      values present are structural (`1px` border-width, `blur(8px)`/box-shadow blur
      radii in `px`, `2.4s` animation duration), consistent with the pattern already
      approved in `Button.module.css` and `MoonOrbitLogo.module.css` from earlier
      rounds and with the spec's own literal `blur(8px)` instruction.
- [x] `pnpm build` (`tsc -b && vite build`) run directly in this review: completes
      with zero type errors, `dist/` produced. `pnpm dev` run directly: starts
      cleanly ("ready in 327 ms" on port 5174, 5173 occupied by an unrelated process).
      `pnpm lint` (`oxlint`) also run directly: exits clean, no findings.
- [x] No em dash anywhere in `front/src` (grepped directly, zero matches). No
      relative-path import chains (`from '../`) anywhere in `front/src` (grepped
      directly, zero matches). No Spanish leakage in identifiers/comments in the new
      files (checked directly).
- [x] iOS Safari checklist re-checked for this round's new files specifically: `Card`
      correctly prefixes `backdrop-filter`; no `overflow-x: clip`, no unprefixed
      `clip-path`/inline `user-select`, no bare `100vh` full-height element introduced,
      no `position: sticky` introduced.
- [x] No non-goal or Core Principle violation: this round is pure visual/content
      presentation work (Badge/Card atoms, an icon, a temporary logo comparison row),
      not a VS Code-equivalent IDE-shell element (no toast/palette/status-bar/tab/
      context-menu/tooltip pattern involved), so the UI Reference Methodology rule
      does not apply here; no toolchain reimplementation; no no-code/visual-builder
      behavior introduced.
- [ ] `.claude/feature_list.json` entry `f02` still `in_progress`: expected at this
      point in the workflow, the lead flips it to `done` only after this approval, not
      before. Not a defect.

## Notes

- Verified every point myself directly against the source files and a real `pnpm
  build`/`pnpm dev`/`pnpm lint` run, not from the Implementer's report alone: read
  `GridBackground.module.css`, `tokens.css`, `Badge.tsx`/`.module.css`,
  `Card.tsx`/`.module.css`, `GitHubIcon.tsx`, all three new logo atoms and their
  `.module.css` files, `LoginScreen.tsx`/`.module.css`, `Button.tsx`/`.module.css`,
  and `atoms/index.ts`, and inspected the compiled `dist/assets/index-*.css` output
  for the grid breakpoints and card tokens.
- This closes the "Additional scope: Visual Refinements" round in full: all
  checkpoints under `.claude/CHECKPOINTS.md` -> "F02: Login Screen UI" -> "Additional
  scope: Visual Refinements" are verifiable and pass. The lead can now check that
  section's boxes and flip `feature_list.json`'s `f02` entry to `done`.

---

# Round 4: Additional scope, Logo Selection, Favicon, and Layout

## Verdict

APPROVED

## Checkpoints verified

- [x] atoms/RocketAscentLogo/, atoms/ChipMoonLogo/, atoms/CircuitMoonLogo/ no longer
      exist: verified with a directory listing of front/src/components/atoms/ (only
      Badge, Button, Card, GitHubIcon, GridBackground, MoonOrbitLogo remain) and a
      grep for RocketAscentLogo, ChipMoonLogo, CircuitMoonLogo across front/, zero
      matches. atoms/index.ts re-exports only the six remaining atoms.
- [x] LoginScreen.tsx no longer has .logoRow or a TEMP comment: verified by direct
      read of the file and a grep for logoRow/TEMP across front/src/, zero matches.
- [x] front/public/icon.svg exists as a standalone file, fixed ids (hm-gradient,
      hm-glow, no useId()), gradient stops and both path/ellipse primitives
      byte-for-byte identical to the spec's own listing, plus the #041528, rx=4
      background rect. Verified by direct read and line-by-line diff against the
      spec, and separately confirmed the paths are the exact same ones
      MoonOrbitLogo.tsx uses (same path data, ellipse, gradient, and filter
      parameters).
- [x] front/index.html has the SVG favicon link immediately followed by the
      alternate-icon link to favicon.ico, verified by direct read. favicon.ico still
      present, untouched by this round's diff.
- [x] At min-width 1024px: .content's max-width is 96rem, .cardGrid becomes a
      2-column grid with grid-template-columns 1fr 1fr and gap var(--spacing-md);
      below 1024px, .cardGrid's base rule stacks the cards in a flex column.
      Verified by direct read of LoginScreen.module.css and by inspecting the
      compiled dist/assets/index CSS after a real pnpm build run in this review.
- [x] tokens.css gained exactly the two new card-bg-blue/purple tokens; every other
      pre-existing token verified unchanged against the prior approved round. Card
      has a working variant prop, Card.module.css has the two modifier classes each
      overriding only background, all other base .card declarations untouched.
      LoginScreen uses variant blue on the description card, purple on the
      philosophy card. All verified by direct read.
- [x] The Hyper/Muun split is derived via .slice() from t('title'), not a hardcoded
      literal (verified: no literal brand-name string anywhere in LoginScreen.tsx).
      MoonOrbitLogo size 40 renders directly above the Muun span inside
      brandMuunColumn, matching the spec's markup exactly. .title uses flex with
      justify-content flex-end, right-aligning the block within .content.
- [x] Desktop no-scroll at roughly 900px viewport height: independently recomputed
      from the actual compiled CSS values, not accepted on the Implementer's
      analytical claim alone. Summing every block in .content's flex column at
      1024px and up (vertical padding, the title block, the badge, the two-card
      grid sized by its tallest card's wrapped philosophy copy, the button, the
      browser notice, and four tightened inter-element gaps) totals to roughly
      580-600px, comfortably under 900px even allowing generous line-wrap
      estimation error. GridBackground's min-height 100vh/100dvh only guarantees a
      floor, it does not force extra height beyond the viewport, so it cannot cause
      a scrollbar on its own. This checkpoint is confirmed correct by calculation,
      not merely plausible.
- [x] pnpm build (tsc -b && vite build) run directly in this review: zero type
      errors, dist/ produced successfully. pnpm dev run directly: starts cleanly,
      and a direct HTTP request to the running dev server for both / and /icon.svg
      returned 200. pnpm lint (oxlint) also run directly: exits clean.
- [x] No em dash anywhere in front/src, front/public, or front/index.html (grepped
      directly for the character, zero matches in all three locations). No
      relative-path import chains anywhere in front/src (grepped directly, zero
      matches). All identifiers/comments touched this round are in English.
- [x] iOS Safari checklist re-checked: no new overflow-x clip, no unprefixed
      backdrop-filter/clip-path/inline user-select, no bare 100vh full-height
      element introduced this round (GridBackground's existing 100vh plus 100dvh
      pair is unchanged, already reviewed and approved previously), no
      position sticky anywhere in the codebase.
- [x] No non-goal or Core Principle violation: this round is presentation-layer
      work only (logo pruning, a standalone SVG favicon using an official
      browser-supported mechanism, a CSS grid layout breakpoint, a card color
      prop, a title lockup); no toolchain reimplementation, no
      no-code/visual-builder behavior, no IDE-shell UI element requiring the VS
      Code Reference Methodology.
- [ ] .claude/feature_list.json entry f02 still in_progress: expected at this
      point in the workflow, the lead flips it to done only after this approval.
      Not a defect.

## Notes

- Verified every item myself directly against the source files and a real pnpm
  build/pnpm dev/pnpm lint run in this environment, not from the Implementer's
  report alone: read atoms/index.ts, LoginScreen.tsx and its module CSS,
  front/public/icon.svg, front/index.html, MoonOrbitLogo.tsx, tokens.css,
  Card.tsx and its module CSS, GridBackground.module.css, Badge.module.css,
  BrowserSupportNotice's tsx and module CSS, Button.module.css, and en.json, plus
  fetched the running dev server directly.
- The Implementer's one open concern (no real browser available in this
  environment to confirm the roughly 900px no-scroll checkpoint) is resolved here
  analytically with an actual per-block height sum derived from the compiled
  token values and the real copy text length in en.json, not just a qualitative
  "looks tighter" claim. The total leaves enough margin below 900px that this
  checkpoint can be marked verified with confidence, even allowing for
  font-metric estimation error. A literal browser screenshot at a typical desktop
  resolution would still be a good final sanity check whenever a real browser
  becomes available in this environment, but it is not a blocking condition for
  approval given the size of the margin.
- This closes the "Additional scope: Logo Selection, Favicon, and Layout" round
  in full: all checkpoints under CHECKPOINTS.md's F02 "Additional scope: Logo
  Selection, Favicon, and Layout" section are verifiable and pass. The lead can
  now check that section's boxes and flip feature_list.json's f02 entry to done.

---

# Round 5: Additional scope, Desktop Two-Column Layout and IDE Preview Stack

## Verdict

REJECTED

## Checkpoints verified

- [x] `.description` and `.philosophy` in `LoginScreen.module.css` carry `text-align:
      left` directly on the base class rule (lines 43 and 52), outside any media query,
      so it applies at every breakpoint. Verified by direct read.
- [x] `front/src/components/molecules/IdePreviewStack/` exists with `IdePreviewStack.tsx`,
      `IdePreviewStack.module.css`, and its own `index.ts` barrel; exported from
      `molecules/index.ts` alongside `BrowserSupportNotice`. Renders exactly 2 `<button>`
      elements, one gets `styles.cardActive` and the other `styles.cardBack` based on
      `activeIndex` state, each labeled `{t('idePreviewPlaceholder')} {index + 1}`.
      `onMouseEnter`, `onFocus`, and `onClick` on each button all call
      `setActiveIndex(index)`, so any of the three can bring that card to front. Verified
      by direct read of both files.
- [x] `en.json`/`es.json` both gained `"idePreviewPlaceholder"`, with the exact copy from
      the spec ("IDE preview" / "Vista previa del IDE"); the number is appended in JSX
      (`{index + 1}`), not part of the translated string. Verified by direct read of both
      locale files.
- [x] `IdePreviewStack.module.css` has a `@media (prefers-reduced-motion: reduce)` block
      setting `transition: none` on both `.cardActive` and `.cardBack`, matching the base
      rule's `transition: transform 0.3s ease, box-shadow 0.3s ease`. Verified by direct
      read.
- [x] `.cardGrid` no longer exists anywhere in `front/src/` or `front/index.html`: grepped
      directly, zero matches in source; also rebuilt with `pnpm build` and grepped the
      freshly regenerated `dist/assets/index-*.css`, zero matches there either (the
      Implementer's report only checked a stale pre-rebuild `dist/`, this review rebuilt
      first).
- [x] `LoginScreen.module.css`'s `@media (min-width: 1024px)` block has `.leftColumn`,
      `.rightColumn`, and `.actions` (with `grid-column: 1 / -1`) instead of `.cardGrid`,
      inside a `.content` that is `display: grid; grid-template-columns: 1fr 1fr`.
      Verified by direct read (lines 65-95) and by inspecting the recompiled
      `dist/assets/index-*.css`, byte-for-byte matching the spec's CSS block.
- [x] `pnpm build` (`tsc -b && vite build`) run directly in this review: zero type
      errors, `dist/` regenerated successfully. `pnpm dev` run directly: starts cleanly
      (ready in 345 ms on port 5174, 5173 occupied by an unrelated process).
- [x] Recomputed the `>=1024px` no-scroll height myself from the compiled token values
      and the real copy length in `en.json` (not accepted on the Implementer's own
      math): row 1 (max of leftColumn/rightColumn) is roughly 400-440px (leftColumn:
      Badge about 35px plus 16px gap plus blue Card about 127px plus 16px gap plus
      purple Card about 200-230px; rightColumn: title block about 106px plus 24px gap
      plus IdePreviewStack at a fixed 280x175px), row-gap spacing-lg (40px), row 2
      (.actions) about 165px (Button about 54px plus 16px gap plus BrowserSupportNotice
      about 95px), plus .content's own 80px top+bottom padding. Total is roughly
      690-730px, comfortably under a 900px viewport with margin to spare. This
      checkpoint is confirmed correct.
- [x] No em dash anywhere in any file touched this round (grepped directly). No
      relative-path import chains anywhere in `front/src` (grepped directly, zero
      matches). All identifiers/comments in English.
- [x] iOS Safari checklist: `IdePreviewStack.module.css`'s `backdrop-filter: blur(8px)`
      is correctly preceded by `-webkit-backdrop-filter: blur(8px)`; no `overflow-x:
      clip`; no bare `100vh`; no `position: sticky` introduced.

## Issues (why REJECTED)

1. `front/src/components/templates/LoginScreen/LoginScreen.module.css`, lines 65-94:
   `.leftColumn`, `.rightColumn`, and `.actions` are declared only inside
   `@media (min-width: 1024px)`. Confirmed by direct read and independently confirmed by
   recompiling (`pnpm build`) and grepping the compiled CSS: `._leftColumn_*` and
   `._rightColumn_*` each appear exactly once in the whole bundle, and that one
   occurrence is inside the `@media (width>=1024px)` block:
   `@media (width>=1024px){..._leftColumn_1usgw_75{gap:var(--spacing-sm);
   flex-direction:column;display:flex}._rightColumn_1usgw_81{align-items:flex-end;
   gap:var(--spacing-md);flex-direction:column;display:flex}...}`. There is no
   base-level (outside/before this media query) rule for any of the three classes.

   Effect below 1024px (every phone and most tablets): these three wrapper divs fall
   back to the browser default `display: block` with `margin: 0` (from `reset.css`'s
   `*:not(dialog) { margin: 0; }`), so they have no flex layout and no gap of their own.
   Inside `.rightColumn`, the title `<h1>` and `<IdePreviewStack />` stack directly on
   top of each other with zero vertical spacing. Inside `.leftColumn`, `<Badge>`, the
   blue description `<Card>`, and the purple philosophy `<Card>` stack directly on top
   of each other with zero vertical spacing. Inside `.actions`, the sign-in `<Button>`
   and `<BrowserSupportNotice>` stack directly on top of each other with zero vertical
   spacing.

   `.content`'s own `gap: var(--spacing-md)` still applies, but only between its three
   direct children (`.rightColumn`, `.leftColumn`, `.actions` themselves), not between
   the elements nested one level deeper inside each of them. Before this round, those
   same elements (title, badge, both cards, button, notice) were direct children of
   `.content` and each got that gap individually; wrapping them one level deeper
   without giving the wrapper divs their own base-level gap is a real, verifiable
   regression introduced by this round, not a pre-existing condition.

   Expected behavior: `.leftColumn` and `.rightColumn` need a base-level (outside the
   media query) `display: flex; flex-direction: column; gap: var(--spacing-sm);` (or
   whatever matches the previous per-element spacing) so title/stack and
   badge/card/card retain visible spacing below 1024px; `.actions` needs the same
   treatment for its button/notice pair. This directly contradicts
   `.claude/CHECKPOINTS.md` -> "Additional scope: Desktop Two-Column Layout and IDE
   Preview Stack" checkpoint: "Below 1024px, the layout stays single-column with title
   and the preview stack appearing first (source order), unchanged from before."
   Source order is unchanged, but the vertical spacing between grouped elements is not
   unchanged from before: it silently degrades from a consistent gap between every
   element to zero gap between elements sharing a wrapper. This is also a Simplicity/DX
   regression on its own terms (a login screen with touching, crowded text blocks on
   the majority of real-world screen sizes), independent of the letter of the
   checkpoint.

   Note: the feature spec's own literal CSS snippet
   (`features/f02_login_screen_ui/desktop-layout-and-preview-stack.md`) only defines
   `.leftColumn`/`.rightColumn`/`.actions` inside the `1024px` block too, so the
   Implementer followed the spec's code verbatim; this is a spec-level oversight that
   surfaced as a real, testable bug once implemented, not extra scope the Implementer
   should have second-guessed silently. Still, the Reviewer's job is to validate the
   actual behavior against the checkpoints, and the checkpoint text (unchanged from
   before) is violated regardless of which document is at fault.

## Notes

- Verified this round's other checkpoints directly against source files and a real
  `pnpm build`/`pnpm dev` run in this environment (not accepted on the Implementer's
  report alone), including rebuilding to get a fresh `dist/` rather than trusting the
  Implementer's grep against a stale one.
- Attempted to get a literal browser screenshot at both a mobile width and a
  1280x900 desktop viewport using headless Chrome and headless Edge (both installed on
  this machine) to visually confirm both the desktop no-scroll math and the mobile
  spacing gap; both browsers fail to write the screenshot file under every path tried
  (access denied even with the sandbox disabled and `--no-sandbox` passed to the
  browser itself), consistent with the Implementer's own repeated note across every
  prior round that no working browser is available in this environment. The mobile
  spacing defect above does not require a screenshot to confirm: it is proven directly
  from the compiled CSS output (only one, media-query-scoped, declaration exists for
  each of the three classes) plus the reset's `margin: 0` rule, which is a deterministic
  CSS box-model fact, not a rendering judgment call.
- The desktop (`>=1024px`) no-scroll checkpoint is unaffected by the issue above (the
  media query itself does supply the missing gap at that width) and is confirmed
  passing by recomputed math, as detailed above.
- Recommended fix for the next Implementer pass: add a base-level rule (outside the
  `1024px` media query) for `.leftColumn` and `.rightColumn`
  (`display: flex; flex-direction: column; gap: var(--spacing-sm);`, adjusting the exact
  gap token to taste) and for `.actions`
  (`display: flex; flex-direction: column; align-items: center; gap: var(--spacing-sm);`),
  then re-verify visually (or analytically, given the same browser-access limitation)
  that mobile/tablet spacing matches the pre-existing, previously-approved look.

---

# Review: Correction round (post-rejection) - missing sub-1024px flex/gap on layout wrappers

## Verdict: APPROVED

## Checkpoints verified

- [x] Base rule `.leftColumn, .rightColumn, .actions { display: flex; flex-direction: column; gap: var(--spacing-sm); }` exists outside any media query in `front/src/components/templates/LoginScreen/LoginScreen.module.css` (lines 55-61). Confirmed by direct read of the file.
- [x] Inside `@media (min-width: 1024px)` (lines 73-92), `.rightColumn` only overrides `align-items: flex-end; gap: var(--spacing-md);` and `.actions` only overrides `grid-column: 1 / -1; align-items: center;`. Neither repeats `display`/`flex-direction`. `.leftColumn` has no override left inside the media query (correctly, per spec, it needs none beyond the base rule).
- [x] No duplicate or conflicting declarations remain anywhere in the file: verified by reading the full 93-line file end to end.
- [x] Rest of the round's prior scope left intact and unmodified by this correction pass:
  - `IdePreviewStack` molecule (`front/src/components/molecules/IdePreviewStack/IdePreviewStack.tsx` and `.module.css`) matches the spec verbatim: shared `activeIndex` state, `onMouseEnter`/`onFocus`/`onClick` parity, `prefers-reduced-motion: reduce` disables transitions.
  - `en.json`/`es.json` both retain `idePreviewPlaceholder` with exact copy; number appended in code (`{index + 1}`), not translated.
  - `.description`/`.philosophy` retain `text-align: left` directly on the base class (lines 43, 52), not only inside a media query.
  - No `.cardGrid` remains anywhere in `front/src` (grep confirmed zero matches).
  - `LoginScreen.tsx` restructure (`.rightColumn` / `.leftColumn` / `.actions` wrappers) matches the spec's JSX exactly.
- [x] `pnpm build` (from `front/`): `tsc -b && vite build` exits 0, `dist/` regenerated with no type errors.
- [x] `pnpm dev` (from `front/`): starts cleanly ("ready in 511 ms"), no console/build errors.
- [x] `pnpm lint` (`oxlint`): exits 0, no findings.
- [x] No em dash in any touched file, or across `front/src` in general (grep confirmed zero matches).
- [x] No relative-path import chains (`../../../...`) anywhere in `front/src` (grep confirmed zero matches); barrels (`molecules/index.ts`, `IdePreviewStack/index.ts`) correctly one level deep, no barrel imports another barrel.
- [x] Code/identifiers/comments in English; only non-obvious comments present (e.g. `// TODO: wire real GitHub OAuth...`, `// Placeholder image stack: swap in real IDE screenshots later...`), no comment merely restates the code.
- [x] No no-code/visual-builder pattern introduced; no embedded toolchain reimplementation; no VS Code UI element added in this round requiring a reference-methodology citation (`IdePreviewStack` is a page-level marketing placeholder, not an IDE-shell UI element).
- [x] iOS Safari anti-patterns: `backdrop-filter: blur(8px)` in `IdePreviewStack.module.css` correctly has the `-webkit-backdrop-filter` prefix declared first; no unprefixed `clip-path`/`user-select`, no bare `100vh`, no `position: sticky` inside `overflow: hidden`, no sub-16px input font-size (no `<input>` in this component).

## Notes

This correction round applied exactly the fix requested in the prior rejection (the missing base flex/gap rule for `.leftColumn`/`.rightColumn`/`.actions` below `1024px`) and nothing else. The Implementer's report and the updated spec/checkpoint text agree with what is actually in the CSS file. This closes all pending work opened across every reopened round of `f02` (`css-reset.md`, `visual-refinements.md`, `logo-selection-and-layout.md`, `desktop-layout-and-preview-stack.md`). The remaining analytical-only limitation noted by the Implementer (no real browser available to visually confirm the absence of a desktop vertical scrollbar) is an environment constraint, not a code defect, and does not block approval given the compiled CSS reduces total content height rather than increasing it.

---

# Reviewer Report (Round 6): Additional scope - Layout and Interaction Polish

## Verdict

APPROVED

## Checkpoints verified

- [x] front/index.html: both favicon link hrefs (/icon.svg?v=2, /favicon.ico?v=2) carry
      the ?v=2 cache-busting query string; no other attribute on those two lines
      changed. front/public/icon.svg and front/public/favicon.ico were not touched by
      this rounds diff.
- [x] tokens.css: read the full file. Contains exactly --spacing-2xs: 0.4rem (new,
      placed between --radius-md and --spacing-xs) and --spacing-xl: 6rem (new, placed
      after --spacing-lg). Every other token (--color-*, --glow-*, --font-*,
      --radius-sm/md, --spacing-xs/sm/md/lg) is byte-identical to the previously
      approved round. No unrelated token was touched.
- [x] LoginScreen.module.css: .brandMuunColumn { gap: var(--spacing-2xs); } confirmed
      on line 34, no other property in that rule changed.
- [x] Critical, verified against real JSX and CSS, not assumed: inside
      @media (min-width: 1024px) (LoginScreen.module.css lines 73-97),
      .leftColumn { grid-column: 1; } and .rightColumn { grid-column: 2; } are both
      present. Cross-checked against LoginScreen.tsx's actual markup: .rightColumn
      (title + IdePreviewStack) is the first div in DOM order, .leftColumn
      (Badge + two Cards) is the second, .actions is the third. Because
      grid-template-columns: minmax(32rem, 42rem) 1fr defines column 1 as the
      narrower, text-appropriate track and column 2 as the remaining wider track, and
      because explicit grid-column placement overrides CSS Grid's DOM-order
      auto-placement entirely, the result is: text/cards (.leftColumn) render in the
      visually-left, narrower track; title+stack (.rightColumn) render in the
      visually-right, wider track. This is independent of DOM order and correctly
      matches each class's name/intent, confirming the round 5 bug (DOM order
      controlling visual position because no grid-column was set) is fixed.
- [x] IdePreviewStack.module.css: .stack width is min(56rem, 100%), confirmed.
      .cardActive uses translate(0, 0) rotate(0deg) scale(1) (no offset).
      .cardBack uses translate(2rem, 2rem) rotate(3deg) scale(1.1): back card is now
      larger (scale 1.1 vs 1) and offset (2rem, 2rem), the reverse of the previously
      smaller/less-exposed back card. Correct per spec intent.
- [x] IdePreviewStack.tsx: onMouseEnter/onMouseLeave live only on the wrapping .stack
      div; each button only has onClick/onFocus, confirming hover no longer lives on
      individual buttons. AUTO_CYCLE_INTERVAL_MS = 1500 constant. useEffect keyed on
      isHovering: starts window.setInterval alternating activeIndex between 0/1 only
      when isHovering is true, returns a cleanup calling window.clearInterval
      unconditionally (runs on dependency change and unmount), so the interval is
      always cleared correctly. selectCard clears the interval and sets activeIndex
      directly, called from both onClick and onFocus, so clicking or focusing a card
      selects it immediately and pauses auto-cycle until the next hover-in. Matches
      spec code verbatim.
- [x] LoginScreen.module.css's 1024px block: .content has max-width: 128rem,
      grid-template-columns: minmax(32rem, 42rem) 1fr, gap: var(--spacing-xl).
      .rightColumn's pre-existing align-items: flex-end and gap: var(--spacing-md), and
      .actions's pre-existing grid-column: 1 / -1 and align-items: center, are both
      unchanged from the previously approved round.
- [x] BrowserSupportNotice.tsx: renders the inline SVG triangle (path outline plus line
      plus circle, stroke/fill currentColor) exactly as specified, no circle-with-i
      placeholder left. BrowserSupportNotice.module.css's .icon: border/border-radius
      removed (grep confirmed absence), color: var(--color-neon-blue) and
      flex-shrink: 0 both retained.
- [x] pnpm build (from front/): tsc -b && vite build exits 0, dist/ regenerated
      (dist/assets/index-Bljxta77.css at 9.42 kB), no type errors. Ran this myself, not
      from the Implementer's report.
- [x] pnpm dev (from front/): started cleanly (ready in 355 ms on this run), served
      200 OK on the auto-selected fallback port when 5173 was occupied, no
      console/build errors. Ran this myself.
- [ ] .claude/feature_list.json entry f02 re-marked status done: not the Implementer's
      or Reviewer's job per CLAUDE.md's workflow (the lead updates this only after this
      Reviewer approval); correctly left untouched by the Implementer. Not a rejection
      reason, flagged here only for the lead's follow-up action.

## Universal checks

- [x] No em dash anywhere in front/src (grep for the em dash character returns zero
      matches).
- [x] No relative-path import chains (../) anywhere in front/src; LoginScreen.tsx
      imports via @/components/atoms and @/components/molecules barrels, one level
      deep, no barrel imports another barrel.
- [x] No hardcoded stack assumption contradicting CLAUDE.md Technical Stack (React +
      CSS Modules + Vite throughout, nothing Theia/Electron-specific introduced).
- [x] Code, identifiers, file names, and comments are in English, idiomatic casing.
      Comments present this round are non-obvious, no restating comments introduced.
- [x] BrowserSupportNotice's warning-triangle icon is a static, page-level
      informational callout on the pre-authentication login screen, not an IDE-shell
      widget with a direct VS Code equivalent (toast, notification, status bar, etc);
      the UI Reference Methodology citation requirement does not apply here, consistent
      with how the previously approved circle-with-i version was treated.
- [x] No embedded toolchain functionality reimplemented; no no-code/visual-builder
      pattern introduced.
- [x] iOS Safari anti-patterns: IdePreviewStack.module.css's backdrop-filter blur(8px),
      unchanged this round, still has the -webkit-backdrop-filter prefix declared
      first; no unprefixed clip-path/user-select, no bare 100vh (GridBackground's
      100vh fallback, untouched this round, is still followed by a 100dvh override), no
      position sticky inside overflow hidden, no sub-16px input font-size (no input
      elements in any touched component).
- [x] Every checkpoint above was verified by directly reading the actual file content
      and/or running pnpm build/pnpm dev myself, not by trusting the Implementer's
      report text.

## Notes

All six parts of this round (favicon cache-busting, tighter icon/Muun spacing, the
column-order grid-column fix, the bigger/timed-auto-cycle preview stack, the wider
desktop columns, and the warning-triangle icon) match the spec
(features/f02_login_screen_ui/layout-and-interaction-polish.md) and
.claude/CHECKPOINTS.md Additional scope Layout and Interaction Polish exactly, verified
line-by-line against the real source files rather than the Implementer's report. No
issues found. The only unresolved checkpoint (feature_list.json status) is explicitly
the lead's responsibility post-approval, not a defect in this round's implementation.

# Review: Additional scope: Hover, Layout, Icon, and Favicon Fixes (round 7, reviewer-light)

Verdict: APPROVED

## Checkpoints spot-checked

- IdePreviewStack.tsx: no useEffect/isHovering/intervalRef; each button has its own onMouseEnter -> scheduleActivate (1500ms setTimeout) and onMouseLeave -> cancelScheduledActivate; onClick/onFocus -> selectCard (clears pending timeout, activates immediately). Confirmed by direct read, matches spec verbatim.
- IdePreviewStack.module.css: .stack base rule is width: min(28rem, 100%); the only override is inside @media (min-width: 1024px) at width: min(56rem, 100%). Confirmed.
- LoginScreen.tsx: MoonOrbitLogo size={48} inside .brandMuunColumn. Confirmed.
- LoginScreen.module.css: .brandMuunColumn { gap: 0; ... }. Confirmed.
- front/public/icon.svg: no rect element anywhere; defs (gradient + glow filter) and the g with path/ellipse unchanged from previous round. Confirmed.
- front/index.html: both favicon link tags (/icon.svg?v=3, /favicon.ico?v=3) use ?v=3. Confirmed.
- pnpm build (from front/): tsc -b && vite build completed clean, 80 modules transformed, dist/ regenerated, no errors.
- pnpm dev (from front/): started clean, ready in 344 ms, served on http://localhost:5174/ (5173 occupied by unrelated process), no console/build errors.
- Grep pass on touched files (IdePreviewStack.tsx, IdePreviewStack.module.css, LoginScreen.tsx, LoginScreen.module.css, icon.svg, index.html): no em dash, no relative-path import chains (../../..); LoginScreen.tsx imports via @/components/atoms and @/components/molecules barrels only.
- No literal color/spacing/radius value introduced in IdePreviewStack.module.css/LoginScreen.module.css this round; only gap: 0 and the width/media-query values, which are not token-category values.

## Issues

None.

---

# Reviewer-Light Report: f02_login_screen_ui (Round 8: Grid Row, Hover Delay, and Favicon Removal)

## Verdict

APPROVED

## Spec / Checkpoints Reviewed

- `features/f02_login_screen_ui/grid-row-hover-favicon-fixes.md`
- `.claude/CHECKPOINTS.md` -> "F02: Login Screen UI" -> "Additional scope: Grid Row, Hover Delay, and Favicon Removal"
- Implementer report: `.claude/progress/impl_f02.md`, section "Additional scope: Grid Row, Hover Delay, and Favicon Removal"

Note: per the lead's instruction, the visual side-by-side/same-top behavior of `.leftColumn`/`.rightColumn` was already independently confirmed by the lead in a real browser via `claude-in-chrome`; not re-verified in-browser here, only confirmed at the code level below.

## Checkpoints Spot-Checked

- [x] `LoginScreen.module.css`, inside `@media (min-width: 1024px)`: `.leftColumn` has `grid-column: 1; grid-row: 1;` (lines 83-86), `.rightColumn` has `grid-column: 2; grid-row: 1; align-items: flex-end; gap: var(--spacing-md);` (lines 88-93). Matches spec verbatim. `.actions` left untouched.
- [x] `IdePreviewStack.tsx` line 5: `const HOVER_ACTIVATE_DELAY_MS = 400`. Matches checkpoint.
- [x] `front/public/favicon.ico`: confirmed absent via `Test-Path` (`False`).
- [x] `front/index.html`: only one favicon link remains, `rel="icon" type="image/svg+xml" href="/icon.svg?v=3"`; no `rel="alternate icon"` line.
- [x] `pnpm build` (run from `front/`): `tsc -b && vite build` completed cleanly, 80 modules transformed, built in 386ms, no errors.
- [x] No em dash in the three touched files (`LoginScreen.module.css`, `IdePreviewStack.tsx`, `index.html`): grep for U+2014 returned zero matches.
- [x] No deep relative import chains introduced in `IdePreviewStack.tsx` this round.
- [x] No literal color/spacing/radius values introduced in the touched CSS block; `.rightColumn`'s gap uses `var(--spacing-md)`, consistent with existing tokens.
- [x] All code/comments in English; no non-English identifiers introduced.

## Issues

None.

---

# Reviewer-Light Report: f02_login_screen_ui (Round 9: Remove Hover, Fix Top Spacing, Move Button to Left Column)

## Verdict

APPROVED

## Spec / Checkpoints Reviewed

- `features/f02_login_screen_ui/hover-removal-spacing-button-move.md`
- `.claude/CHECKPOINTS.md` -> "F02: Login Screen UI" -> "Additional scope: Remove Hover, Fix Top Spacing, Move Button to Left Column"
- Implementer report: `.claude/progress/impl_f02.md`, section "Round 9: Remove Hover, Fix Top Spacing, Move Button to Left Column"

Note: per the lead's instruction, the visual layout check (~1926px width, 2-column mode: left-column text with button after the two cards not stretching, right-column title+stack with more top space) and the click-stability check on the back card (no oscillation after several seconds) were already independently confirmed by the lead in a real browser via `claude-in-chrome`; not re-verified in-browser here, only confirmed at the code level below.

## Checkpoints Spot-Checked

- [x] `IdePreviewStack.tsx`: read the full file, it is an exact match of the spec's code block. No `useRef`, no `HOVER_ACTIVATE_DELAY_MS`, no `scheduleActivate`/`cancelScheduledActivate`, no `onMouseEnter`/`onMouseLeave`. Each card only has `onClick={() => setActiveIndex(index)}` and `onFocus={() => setActiveIndex(index)}`.
- [x] `IdePreviewStack.module.css`: `.cardActive`/`.cardBack`'s `transition: transform 0.3s ease, box-shadow 0.3s ease;` is present and untouched; the `prefers-reduced-motion: reduce` override (`transition: none;`) is also intact. No CSS in this file was modified this round, matching the spec's explicit instruction to leave it alone.
- [x] `LoginScreen.module.css`: `.content`'s base rule has `padding: var(--spacing-lg) var(--spacing-sm);` immediately followed by `padding-top: var(--spacing-xl);` (lines 8-9); inside `@media (min-width: 768px)`, `.content` has `padding: var(--spacing-lg) var(--spacing-md);` immediately followed by `padding-top: var(--spacing-xl);` (lines 66-67). The `1024px` block does not redeclare `padding` at all, so it correctly inherits the `768px` value, per the spec's own note.
- [x] `LoginScreen.tsx`: `.leftColumn` contains `Badge`, `Card variant="blue"`, `Card variant="purple"`, then `Button` (wrapping `GitHubIcon` + `signInButton` text) as its last child, in that exact order. `.actions` contains only `BrowserSupportNotice`.
- [x] `Button.module.css`: `.button` has `align-self: flex-start;` added alongside its existing declarations (line 17).
- [x] `pnpm build` (run from `front/`): `tsc -b && vite build` completed cleanly, 80 modules transformed, built in 304ms, no type errors, `dist/` regenerated.
- [x] No em dash (U+2014) in any of the four files touched this round (`IdePreviewStack.tsx`, `LoginScreen.module.css`, `LoginScreen.tsx`, `Button.module.css`): grep returned zero matches.
- [x] No relative-path import chains (`../../..`) anywhere in `front/src`; `LoginScreen.tsx` still imports via `@/components/atoms` and `@/components/molecules` barrels only.
- [x] No literal color/spacing/radius value introduced in this round's edits; the only new declaration (`padding-top: var(--spacing-xl)`, `align-self: flex-start`) either uses an existing token or is a non-token-category layout keyword.
- [x] All code, identifiers, and comments in English; no non-English identifiers introduced.

## Issues

None.

---

# Reviewer-Light Report: f02_login_screen_ui (Round 10: Custom Scrollbar, Title Position, Button Copy)

## Verdict

APPROVED

## Spec / Checkpoints Reviewed

- `features/f02_login_screen_ui/scrollbar-title-position-copy.md`
- `.claude/CHECKPOINTS.md` -> "F02: Login Screen UI" -> "Additional scope: Custom
  Scrollbar, Title Position, Button Copy"
- `.claude/progress/impl_f02.md` -> "Round 10: Custom Scrollbar, Title Position, Button
  Copy" (final section)

## Checkpoints Spot-Checked

- `front/src/styles/tokens.css`: `--color-scrollbar-thumb-hover: rgba(11, 210, 255,
  0.65);` added next to `--color-card-border`, and `--glow-scrollbar-hover: rgba(11,
  210, 255, 0.5);` added next to the other `--glow-*` tokens. Read the full file: no
  other pre-existing token value changed.
- `front/src/styles/reset.css`: the `html { scrollbar-color: ...; scrollbar-width:
  thin; }` plus `::-webkit-scrollbar`, `::-webkit-scrollbar-track`,
  `::-webkit-scrollbar-thumb`, `::-webkit-scrollbar-thumb:hover`, and
  `::-webkit-scrollbar-corner` block matches the spec verbatim. `-track` uses
  `var(--color-card-bg)`, `-thumb` uses `var(--color-card-border)`, `-thumb:hover` uses
  `var(--color-scrollbar-thumb-hover)` and `var(--glow-scrollbar-hover)`. The only
  literal `rgba(...)` values remaining are on the `html { scrollbar-color: ... }` line,
  which the spec explicitly calls out as a deliberate, allowed simplification for
  Firefox's non-token-backed property. No stray literal color elsewhere in the block.
- `CLAUDE.md` -> "Frontend Architecture" -> the `reset.css` bullet (line 392-399):
  confirmed it already states its job includes "theming native browser chrome that no
  component owns, such as the scrollbar", consistent with the round's note that the lead
  had updated it beforehand.
- `front/src/components/templates/LoginScreen/LoginScreen.module.css`: `.rightColumn`
  has its own standalone rule `margin-top: calc(var(--spacing-xs) -
  var(--spacing-xl));` (line 64-66), placed after the shared `.leftColumn, .rightColumn,
  .actions` block and before the `768px` media query, applying at every breakpoint.
  `.leftColumn` has no margin/padding declaration added anywhere in the file (only
  appears in the shared flex rule and, unchanged, inside the `1024px` grid media query
  with `grid-column`/`grid-row`).
- `front/src/locales/es.json`: `signInButton` is `"Iniciar con GitHub"`.
  `front/src/locales/en.json`: `signInButton` is still `"Sign in with GitHub"`, file
  otherwise unchanged.
- `pnpm build` (run fresh from `front/` for this review, not just trusting the
  Implementer's report): `tsc -b && vite build` completes with `80 modules
  transformed`, no TypeScript or Vite errors, built in 324ms.

## Universal Checks (this round's changed files)

- No em dash in `tokens.css`, `reset.css`, or `LoginScreen.module.css`: grepped for `—`,
  no matches in any of the three.
- No relative-path import chains introduced (no new imports in this round; only CSS/JSON
  edits).
- All identifiers/code/comments in English; `es.json`/`en.json` content itself is the
  user-facing locale string, expected in Spanish/English respectively per the spec.
- No literal color/spacing/radius value introduced in a `.module.css` where a token
  should have been used: `.rightColumn`'s new `margin-top` uses only
  `var(--spacing-xs)` and `var(--spacing-xl))`, both existing tokens, no literal value.

## Notes

- Per the task instructions, visual confirmation (title lifted, button copy visible,
  scrollbar styling loaded) was already done by the lead in-browser; this pass does not
  repeat that. Whether the scrollbar recipe visually matches AzanoLabs pixel-for-pixel is
  explicitly deferred to a later round per the lead's own note, not a gap in this round's
  review.
- The Implementer's choice to place the new `.rightColumn` margin-top rule at the base
  level (applying at all breakpoints) rather than only inside the `1024px` block is a
  reasonable reading of the spec: the spec's own rationale text says the "push down"
  effect from `.content`'s `padding-top: var(--spacing-xl)` is not desktop-only (it is
  present in both the base rule and the `768px` media query), so lifting `.rightColumn`
  everywhere is consistent, not a deviation worth flagging.

## Issues

None.

---

# Reviewer-Light Report: f02_login_screen_ui, Round 11

## Round

`features/f02_login_screen_ui/icon-spacing-scrollbar-swap.md`: Icon Spacing, No-Scroll
Fit, Scrollbar Transparency, Swap-on-Either-Click.

## Verdict

APPROVED

## Checkpoints spot-checked

- [x] `.brandMuunColumn` has `padding-top: var(--spacing-xs);` (uses the token, not a
      literal). Lead confirmed in a real browser that the icon gets breathing room and
      the title's position did not move.
- [x] Inside `@media (min-width: 1024px)`, `.content` uses `column-gap:
      var(--spacing-xl); row-gap: var(--spacing-sm);`, the shorthand `gap` is gone.
      `.leftColumn`/`.rightColumn`'s own internal `gap` (`var(--spacing-sm)` on the
      shared selector, `var(--spacing-md)` on `.rightColumn` inside the same media
      block) is untouched, matching what the spec said not to change. Lead confirmed no
      scrollbar appears at 780px window height.
- [x] `reset.css`'s `::-webkit-scrollbar-track` background is `transparent`.
      `::-webkit-scrollbar` (6px/6px), `::-webkit-scrollbar-thumb`
      (`var(--color-card-border)`, `border-radius: 3px`), the hover state
      (`var(--color-scrollbar-thumb-hover)` + glow), and `::-webkit-scrollbar-corner`
      are all byte-for-byte unchanged from before this round. Lead confirmed visually
      (zoomed screenshot) the scrollbar now reads as a floating translucent rounded
      pill, not a solid bar.
- [x] `IdePreviewStack.tsx` has exactly one `toggleActive` function
      (`setActiveIndex((current) => (current === 0 ? 1 : 0))`), used as both `onClick`
      and `onFocus` on both buttons rendered by the `[0, 1].map(...)` loop. No
      per-button `setActiveIndex(index)` call remains anywhere in the file. Lead
      confirmed in a real browser that clicking the already-active (front) card now
      also swaps it.
- [x] `front/index.html`'s `<title>` is exactly `MuunCode - IDE`.
- [x] `pnpm build` (from `front/`): `tsc -b && vite build` completed with zero errors,
      `dist/` produced (confirmed by re-running it during this review, not just trusting
      the Implementer's report).

## Universal checks (files touched this round)

- No em dash (`—`) found in `LoginScreen.module.css`, `reset.css`, or
  `IdePreviewStack.tsx` (grepped each individually).
- No relative-path import chains introduced; `IdePreviewStack.tsx`'s only import is its
  own co-located `./IdePreviewStack.module.css`, which is correct (component styles stay
  local, not a barrel concern). No new component/category folder created this round, so
  no missing barrel `index.ts` to check.
- All code, identifiers, and comments in English.
- No literal color/spacing/radius values introduced where a token should have been
  used: `padding-top` and `row-gap`/`column-gap` both reference `var(--spacing-*)`
  tokens; the scrollbar-track change is `transparent`, a valid CSS keyword, not a magic
  literal standing in for a token.

## Notes

All four files match the spec's exact snippets with no deviation. The three
real-browser visual checkpoints (icon spacing/title position, no-scroll fit at 780px,
scrollbar pill appearance, swap-on-either-click) were verified by the lead directly in
a real browser per the task instructions, not re-derived here; this review focused on
confirming the underlying code is correct and unchanged elsewhere, and that the build is
clean.

---

# Review: Round 12, "Icon Gap Fix and Scrollbar Byte-Parity with AzanoLabs" (fast pass, reviewer-light)

**Verdict: APPROVED**

## Checkpoints spot-checked

- [x] `LoginScreen.module.css`: `.brandMuunColumn svg { margin-bottom: calc(-1 *
      var(--spacing-sm)); }` exists (lines 39-41). The `span` holding the "Muun" text
      is untouched, and `.brandMuunColumn`'s `padding-top: var(--spacing-xs)` from the
      prior round (line 36) is unchanged. Lead confirmed in a real browser that
      `hyper`/`muunSpan` `getBoundingClientRect().bottom` still match exactly (120px)
      and that the icon-to-text gap is now visibly small and controlled.
- [x] `reset.css`: `::-webkit-scrollbar-track`'s `background` is
      `var(--color-card-bg)` again (line 65), not `transparent`. The
      `scrollbar-color`/`scrollbar-width: thin` rule uses the `*` selector (line 54,
      was `html`), with the exact value `rgba(11, 210, 255, 0.4) rgba(4, 21, 40,
      0.6);` (line 55). Diffed directly against
      `C:\DevCode\Repositories\01_AzanoLabs\azanolabs-web\app\globals.css` lines 68-99:
      the `*` block, `::-webkit-scrollbar`, `::-webkit-scrollbar-thumb`
      (`rgba(11, 210, 255, 0.35)`), the hover state, and `::-webkit-scrollbar-corner`
      are all byte-identical in structure (our thumb/hover values still correctly
      reference `var(--color-card-border)` / `var(--color-scrollbar-thumb-hover)`
      tokens, which already hold AzanoLabs' exact rgba values, confirmed by reading
      `tokens.css`: `--color-card-bg: rgba(4, 21, 40, 0.6)`,
      `--color-card-border: rgba(11, 210, 255, 0.35)`,
      `--color-scrollbar-thumb-hover: rgba(11, 210, 255, 0.65)`,
      `--glow-scrollbar-hover: rgba(11, 210, 255, 0.5)`). Lead confirmed in a real
      browser that `document.styleSheets` now loads these rules byte-identically to
      AzanoLabs and that the thumb renders as a rounded translucent pill, not square.
- [x] `pnpm build` (from `front/`): re-ran during this review, `tsc -b && vite build`
      completed with zero errors, `dist/` produced cleanly.

## Universal checks (files touched this round)

- No em dash (`—`) found in `reset.css`, `LoginScreen.module.css`, this round's spec
  file, or `impl_f02.md` (grepped as a UTF-8 byte pattern across all four).
- No relative-path import chains and no new component/category folders were created
  this round; nothing to check on the barrel front.
- All code, identifiers, and comments in English.
- No literal color/spacing/radius value was inlined where a token should have been
  used. The one literal in `reset.css`'s `scrollbar-color` line
  (`rgba(11, 210, 255, 0.4) rgba(4, 21, 40, 0.6)`) is the pre-existing, spec-documented
  exception for that single line, carried over correctly with only its alpha value
  updated from `0.35` to `0.4` as specced.

## Issue found (process, not code): stale Implementer report and session state

`.claude/progress/impl_f02.md`'s only/last section is still titled "Round 11" and
describes round 11's five changes (icon padding-top, `content` row/column-gap split,
scrollbar `transparent` track, `toggleActive`, page title). It does not contain a
round 12 section documenting the two changes actually reviewed here (the SVG
`margin-bottom` fix and the scrollbar byte-parity revert). Likewise
`.claude/progress/current.md` still states "Active feature: f02, reopened an eleventh
time" / round 11 as the active round, not round 12.

Despite this, the actual code in `LoginScreen.module.css` and `reset.css` matches the
round 12 spec (`icon-gap-scrollbar-parity-fix.md`) exactly, byte-for-byte against the
AzanoLabs reference, and the build is clean, so this is not a code defect. Flagging it
so the lead appends a proper round 12 section to `impl_f02.md` and updates
`current.md` before closing this round, for traceability continuity across rounds.


---

# Reviewer Report (Light): f02_login_screen_ui - Round 13 (MuunCode Rebrand)

## Verdict

APPROVED

## Checkpoints spot-checked

- [x] `front/src/locales/en.json` and `front/src/locales/es.json`: `title` is exactly
      `"MuunCode"` in both files. No other key changed: `tagline`, `description`,
      `philosophy`, `signInButton`, `browserNotice`, `idePreviewPlaceholder` all read
      identical to their values verified in the prior full review (see above sections
      of this same file), in both EN and ES.
- [x] `LoginScreen.tsx`: `brandPrefix = title.slice(0, 5)`, `brandSuffix =
      title.slice(6)`. The `<h1>` renders `<span>{brandPrefix}</span>`, then
      `<MoonOrbitLogo size={28} />` directly as a sibling (no wrapping
      `.brandMuunColumn` span), then `<span>{brandSuffix}</span>`. Matches the spec's
      exact snippet.
- [x] `LoginScreen.module.css`: `.brandMuunColumn` and `.brandMuunColumn svg` no longer
      exist anywhere in the file (confirmed with a grep across the whole `front/`
      tree: zero remaining references anywhere, not just this file). `.title` is
      `display: block; text-align: right; width: 100%; margin: 0;` plus the untouched
      font-family/font-size/font-weight/letter-spacing/color/text-shadow properties,
      no flex properties (`align-items`/`justify-content`/`gap`) remain on it.
      `.title svg` exists with `display: inline-block; width: 2.8rem; height: 2.8rem;
      vertical-align: middle; transform: translateY(-0.1em);`, matching the spec
      exactly.
- [x] `pnpm build` (from `front/`): `tsc -b && vite build` completed with zero type
      errors, output written to `dist/` (80 modules transformed, built in 400ms). The
      `NativeCommandError` line PowerShell prints for the `&&` chain is benign wrapper
      noise, not a build failure; both steps completed and the final `built in 400ms`
      line confirms success.
- [x] No em dash found in `LoginScreen.tsx`, `LoginScreen.module.css`, `en.json`, or
      `es.json` (grepped directly). All identifiers, comments, and file/folder names
      are in English. No relative-path import chains introduced (`LoginScreen.tsx`
      still imports via `@/components/atoms` and `@/components/molecules` barrels).

## Notes (non-blocking)

- The literal `2.8rem` size and `translateY(-0.1em)` offset on `.title svg` are not
  design tokens from `tokens.css`. This is a deliberate, spec-mandated exception, not
  an oversight: the spec explicitly calls out that this exact combination was
  visually verified live at both font-size breakpoints and instructs against
  substituting an `em`-relative or token-based value without re-verifying live. Flag
  only for awareness in case a future rebrand round wants to promote this to a token;
  not a violation to act on now.
- `.claude/progress/impl_f02.md`'s last section is still titled "Round 11" (icon
  spacing/scrollbar/swap work) and does not document this Round 13 (MuunCode rebrand)
  pass at all. The actual code in `LoginScreen.tsx`/`LoginScreen.module.css`/the
  locale files fully matches the Round 13 spec and builds clean, so this did not
  block approval on a code-correctness basis, but the Implementer report has a
  traceability gap for this round the lead should be aware of: nothing on file
  currently documents who/how these Round 13 edits were made.
- `.claude/CHECKPOINTS.md`'s Round 13 section currently shows the browser-visual
  checkpoint unchecked (`[ ]`) while the `feature_list.json` status-done checkpoint is
  already checked (`[x]`), even though `.claude/feature_list.json` itself still shows
  `"status": "in_progress"` for `f02`. Bookkeeping inconsistency for the lead to
  reconcile, not a code issue: per the user's own confirmation, the browser-visual
  checkpoint should now be checked off since the lead already verified it live.

## Summary

All five requested checks pass: locale copy, `LoginScreen.tsx` markup,
`.module.css` selectors/properties, clean `pnpm build`, and the universal
non-negotiables (no em dash, English identifiers, no relative-path chains, no stray
literal where a token was expected beyond the one spec-justified exception noted
above). Combined with the lead's own real-browser visual confirmation, this round is
APPROVED.

---

## Light Review: Off-harness rebrand/copy/scrollbar-color round (no spec .md, no Implementer report)

**Reviewer**: `reviewer-light` (fast pass).

**Important process note**: this round's edits were made directly by the user/lead,
explicitly skipping the Implementer harness ("saltarse el harness para agilizar cambios
triviales"). There is no new `.md` spec inside `features/f02_login_screen_ui/` for this
specific round and no corresponding entry in `.claude/progress/impl_f02.md`. This review
was performed by reading the final code state directly against the ten items the lead
described, not against a formal spec/checkpoints diff. `.claude/CHECKPOINTS.md` has no
section for this round either (expected, given no spec exists); this is a known
traceability gap, not a code defect.

### Checkpoints / items spot-checked

1. Global "HyperMuun" -> "MuunCode" rebrand: grepped `HyperMuun` across the whole repo
   (excluding `node_modules`/`dist`). 4 files matched, all intentional historical
   narrative:
   - `.claude/CHECKPOINTS.md:462` and `features/f02_login_screen_ui/muuncode-rebrand.md:8`:
     both narrate the rebrand event itself, exactly as expected.
   - `.claude/progress/impl_f02.md:27`: documents the Round 11 tab-title change
     (`HyperMuun` -> `HyperMuun - IDE`), an earlier, unrelated round. Matches the
     exception called out by the lead.
   - `features/f02_login_screen_ui/icon-spacing-scrollbar-swap.md:91,93`: not explicitly
     named in the lead's exception list, but on inspection this is the Round 11 spec file
     itself (predates the Round 13 rebrand), describing the tab title's state at that
     earlier time ("currently `HyperMuun`"). Same category as the accepted exceptions:
     historical narrative of an already-completed, unrelated round. Not flagging as a
     defect, but noting it since it was not pre-named.
   - No other occurrence anywhere in the repo. `front/index.html`'s actual `<title>` is
     `MuunCode - IDE`, confirming the rename is live in the running app, not just in docs.
2. `.claude/context/MuunCode-Context.md` exists (`HyperMuun-Context.md` no longer
   present). `CLAUDE.md` (lines 15, 44, 511) and `.claude/AGENTS.md` (line 18) both
   reference it by the new name. Confirmed.
3. `.claude/settings.local.json`: the two `mv` permission entries for
   `impl_f02.md`/`review_f02.md` reference
   `/c/DevCode/Repositories/05_MuunCode/.claude/progress/...`, matching the actual current
   folder name. The older `05_HyperMaker` entries (lines 4-9) are untouched, correctly
   left as legitimate older history rather than "fixed" to the current name. Confirmed.
4. `front/src/locales/es.json` and `en.json`: `description` and `philosophy` keys match
   the new copy exactly as specified by the lead in both files, `en.json`'s translation
   is coherent and analogous. Confirmed by direct read.
5. `LoginScreen.tsx`: `withTechHighlights()` splits `philosophy` on
   `/(HTML|CSS|JavaScript)/g` and wraps matched tokens in `<strong>` using
   `TECH_HIGHLIGHT_CLASSES` (`styles.techHtml` / `styles.techCss` / `styles.techJs`).
   `styles.philosophy` renders via `withTechHighlights(t('philosophy'))`. Confirmed.
6. `LoginScreen.module.css`: `.techHtml`, `.techCss`, `.techJs` exist, each with
   `color: var(--color-tech-html|css|js)` respectively, no literal colors. Confirmed.
7. `front/src/styles/tokens.css`: `--color-tech-html: #FF8A3D`, `--color-tech-css:
   #6EC6FF`, `--color-tech-js: #F7DF1E` present. `--color-scrollbar-thumb: rgba(179, 102,
   255, 0.5)` (new), `--color-scrollbar-thumb-hover: rgba(179, 102, 255, 0.75)` (updated
   to purple), `--glow-scrollbar-hover: rgba(179, 102, 255, 0.5)` (updated to purple).
   All confirmed exactly as described.
8. `front/src/styles/reset.css`: `* { scrollbar-color: var(--color-scrollbar-thumb)
   var(--color-bg); scrollbar-width: thin; }`, no literal values, and no stale reference
   to `--color-card-bg`. `::-webkit-scrollbar-track { background: var(--color-bg); }`.
   `::-webkit-scrollbar-thumb { background: var(--color-scrollbar-thumb); }`. A comment
   directly above the block explains that `scrollbar-color` (not the `::-webkit-*` rules)
   is what Chromium actually renders when both are present, matching the requirement.
   Confirmed.
9. `pnpm build` (from `front/`): **initially failed** with `TS2688: Cannot find type
   definition file for 'vite/client'` / `'node'`. Root cause: `node_modules`'s symlinks
   (e.g. `node_modules/@types/node -> /c/DevCode/Repositories/05_HyperMuun/front/...`)
   still hardcode the pre-rename absolute path `05_HyperMuun`, which no longer exists on
   disk after the folder rename to `05_MuunCode`. This is an environment/filesystem
   artifact of the rename, not a code defect introduced by this round's edits. `pnpm
   install` alone did not repair it (lockfile already "up to date", so pnpm skipped
   relinking); removing `node_modules` entirely and reinstalling
   (`rm -rf node_modules && pnpm install`) fixed the stale symlinks. After that, `pnpm
   build` completed cleanly: `tsc -b && vite build` with zero type errors, `dist/`
   produced normally. Flagging this clearly for the lead: anyone else with a working copy
   of the pre-rename folder needs to do a full `node_modules` reinstall once (not just
   `pnpm install`) to pick up the corrected symlink paths.
10. No em dash found in any file this round touched (`LoginScreen.tsx`,
    `LoginScreen.module.css`, `tokens.css`, `reset.css`, `es.json`, `en.json`). All
    identifiers/comments in English. No literal color/spacing value left where a token
    should be used; the only literal color remaining in the scrollbar block
    (`::-webkit-scrollbar { width: 6px; height: 6px; }`) is a pre-existing, untouched
    line explicitly marked "do not change" by an earlier round's spec
    (`icon-spacing-scrollbar-swap.md` line 61-63), not new debt from this round.

### Additional observation (not blocking, not in the requested checklist)

`LoginScreen.module.css`'s `.title svg` currently has `width: 3.6rem; height: 3.6rem;
margin-left: -0.6rem;`, which does not match either `muuncode-rebrand.md`'s `2.8rem` value
or `muuncode-icon-size.md`'s `3.2rem` value, nor does `.claude/CHECKPOINTS.md`'s
"Additional scope: Larger MuunCode Icon" section (still documenting `3.2rem`, no
`margin-left`). This predates this session's rebrand/copy/scrollbar edits and is outside
the ten items the lead asked to verify, so it is not treated as a defect of this round,
but it is a live discrepancy between `CHECKPOINTS.md` and the actual file the lead may
want to reconcile at some point (likely another undocumented off-harness tweak from an
even earlier session).

### Verdict

**APPROVED**

All ten requested items match the described intent in the actual code. The only real
issue found was an environment-level build failure caused by stale `node_modules`
symlinks left over from the `05_HyperMuun` -> `05_MuunCode` folder rename; this was
resolved by a full dependency reinstall (no source code touched) and the build now runs
clean. No em dash, no relative-path import chains, no missing barrels, no stray literal
values where a token should be used, and all identifiers/comments are in English.

---

# FULL REVIEWER (final gate): f02_login_screen_ui

Reviewer: full, exhaustive, independently-recomputed pass. This is the only full-reviewer
pass for f02, run once as the final gate before the lead advances to f03, per CLAUDE.md
-> "Feature Development Workflow". Every prior round of this feature (the original build
plus twelve "Additional scope" rounds) was approved by reviewer-light; nothing from those
prior review reports was taken on faith here. All checkpoints across every subsection of
.claude/CHECKPOINTS.md -> "F02: Login Screen UI" were re-verified directly against the
current state of front/src and front/public, not against what was true when each round
was originally marked done.

## Verdict

REJECTED

## Checkpoints verified

Every checkpoint in the base "F02: Login Screen UI" section and in all twelve
"Additional scope" subsections was re-checked directly against front/src/** and
front/public/** as they exist today. All of them hold true in the current code, with the
three exceptions listed under Issues below.

- Alias/barrels: the @ alias is configured in both vite.config.ts and
  tsconfig.app.json; every component folder and every Atomic Design category folder has
  its own index.ts; no barrel imports another barrel; App.tsx imports via
  @/components/templates.
- tokens.css holds the exact palette, glow, typography, spacing/radius, font-size, card,
  tech-highlight, and purple scrollbar tokens described across every round.
- reset.css matches the final scrollbar block (asterisk selector, scrollbar-color using
  the thumb and background tokens, track and thumb colors matching), superseding all
  intermediate scrollbar attempts correctly.
- i18next detection order is exactly localStorage then navigator; no path, subdomain,
  htmlTag, or cookie detector anywhere in the i18n config.
- en.json and es.json hold the final rebrand copy, with HTML, CSS, and JavaScript
  present verbatim in both locales so the tech-highlight logic matches in either
  language.
- LoginScreen: brand lockup derived from the title string, icon sized per the
  Off-Harness Batch value, 2-column desktop grid with explicit grid placement on both
  columns, actions spanning both columns, base flex/gap rules present outside the media
  query.
- IdePreviewStack: no leftover hover/timeout/interval machinery, a single toggle
  function wired to click and focus on both cards, responsive stack width, back card
  larger and more offset than the active card, transition disabled under reduced
  motion.
- Button, Badge, Card, GitHubIcon, GridBackground, MoonOrbitLogo, and
  BrowserSupportNotice all exist with their component/style/barrel trio, the backdrop
  filter prefix is present where used, and the notice icon is the warning triangle.
- pnpm build completes with zero errors from front, dist is produced.
- No package-lock or yarn lockfile anywhere outside node_modules; pnpm-lock.yaml is the
  only lockfile.
- No inline style objects anywhere in front/src except the one documented CSS custom
  property exception in the logo component.
- No relative-path import chains anywhere in front/src.
- No iOS Safari anti-patterns found: overflow-x is hidden not clip, backdrop-filter is
  prefixed, viewport height has a dvh override, no sticky-inside-hidden pattern, no
  input elements in this feature.
- No live literal old-brand text remains in front/src or front/public; remaining
  mentions anywhere in the repository are inside progress/checkpoint files or feature
  spec files narrating the rename itself, the documented exception.

## Issues found (blocking this gate)

1. Un-tokenized literal color, present since the feature's first round, missed by
   every prior review.
   File: front/src/components/molecules/BrowserSupportNotice/BrowserSupportNotice.module.css
   Line: 9
   Content: background-color: rgba(11, 210, 255, 0.06);
   Problem: this is a literal color value inlined directly in a component's
   module.css. Per CLAUDE.md, Frontend Architecture section: every color, font, or
   spacing value anywhere else in the app must be a var token reference into
   tokens.css, never a literal value repeated inside a component's own module.css; if
   a value is not yet a token, add the token first, then reference it. No round ever
   added a matching token; the closest existing token, color-card-bg-blue at rgba(11,
   210, 255, 0.1), is a different alpha used for a different purpose (Card's blue
   variant).
   Expected behavior: add a token such as color-notice-bg with value rgba(11, 210,
   255, 0.06) to tokens.css and reference it here instead of the literal, matching how
   every other color in this same file already does.

2. Residual old-brand identifiers inside front/public/icon.svg, missed by the
   MuunCode Rebrand round's grep-based sweep.
   File: front/public/icon.svg
   Lines: 3, 8, 16 (and its build copy front/dist/icon.svg, regenerated from the same
   source)
   Content: id equal to hm-gradient, id equal to hm-glow, and their url references.
   Problem: the hm prefix is an abbreviation of the old brand name before the rebrand,
   carried over unchanged from the logo-selection-and-layout round through the
   muuncode-rebrand round. The rebrand checkpoint (every old-brand mention across the
   repository is replaced) was verified only via a literal-string grep for the full
   old brand name, which does not catch this abbreviated form. Cosmetic since SVG ids
   are not user-visible, but a genuine residual reference to the old brand name in a
   shipped, checked-in file.
   Expected behavior: rename both ids to something brand-neutral, matching the
   component's own name, and update the two url references accordingly.

3. Inaccurate comment: Button is attributed to the wrong feature.
   File: front/src/components/atoms/Button/Button.tsx
   Line: 9
   Problem: the comment says this is the smoke-test atom for f02, but Button was
   introduced in f01 as its smoke-test component; f02 only restyled it, per its own
   spec file which explicitly says Button already exists from f01 as a smoke-test
   component. review_f01.md line 25 confirms the original comment read smoke-test
   atom for f01. The feature reference was changed to f02 at some point during f02's
   import-conventions retrofit, which is now factually wrong.
   Expected behavior: revert the comment to reference f01, or drop the feature-id
   reference entirely.

## Non-blocking observations

- current.md still describes the session as being at round 12 and was not updated for
  the MuunCode Rebrand round, the Larger Icon round, or the Off-Harness Batch round
  that followed it. Process gap, not a code defect; recommend refreshing it once this
  gate closes.
- feature_list.json's f02 entry is currently in_progress, which is expected and correct
  at this point (the lead marks it done only after this full-reviewer gate approves);
  not an issue, confirmed consistent with the documented workflow.

## Alignment with CLAUDE.md Core Principles and Non-Goals

No violation found. The feature is design, markup, and i18n only, the sign-in button is
a genuine placeholder with no network call and no GitHub App code, no toolchain or
compilation logic was added, and the IDE-preview cards are inert placeholders with no
no-code or visual-builder behavior. The UI Reference Methodology is correctly treated
as not applicable, since this is a marketing and onboarding screen, not an IDE-shell
element with a direct VS Code equivalent, as the spec itself states.

## Conclusion

Three issues found, all narrow and mechanical to fix: one token addition plus one
reference swap, one id rename in a static SVG file, one comment text correction. None
require rethinking any layout, copy, or interaction decision made across the twelve
adjustment rounds. Per CLAUDE.md's workflow, the lead should launch a new Implementer
pass with these three issues, not patch the code directly, then re-run this same full
reviewer once more before marking f02 done and advancing to f03.

---

# FULL REVIEWER (final gate), Second Pass: f02_login_screen_ui

Reviewer: full, exhaustive pass, re-run after the prior full-reviewer REJECTED verdict
above (three findings). This pass re-verifies the three specific fixes directly against
current file content, not against the Implementer's report text alone, and re-confirms
the build/universal checks without repeating the entire first-pass exhaustive sweep
(per the lead's explicit scope for this round).

## Verdict

APPROVED

## Checkpoints verified (the three prior rejection issues)

- [x] Issue 1 (un-tokenized literal color in `BrowserSupportNotice.module.css`): read
      the file directly. Line 9 is now `background-color: var(--color-notice-bg);`, the
      literal `rgba(11, 210, 255, 0.06)` is gone from this file (grepped for
      `rgba(`/hex literals across the file, zero matches remain). Read `tokens.css`
      directly: `--color-notice-bg: rgba(11, 210, 255, 0.06);` exists (line 24, in the
      "Card surfaces" group), with the exact same numeric value the literal used to
      have. Read the full `tokens.css` file end to end and compared every other token
      against the values already verified in this file's prior rounds
      (`--color-bg`, `--color-neon-blue/purple/pink/green`, `--color-text*`,
      `--color-card-bg`, `--color-card-bg-blue`, `--color-card-bg-purple`,
      `--color-card-border`, `--color-scrollbar-thumb`, `--color-scrollbar-thumb-hover`,
      `--color-tech-html/css/js`, `--glow-*`, `--font-*`, `--radius-*`, `--spacing-*`):
      none of them changed value or were removed. Only the one new token was added.
- [x] Issue 2 (residual old-brand SVG ids in `front/public/icon.svg`): read the file
      directly. `hm-gradient`/`hm-glow` are gone; the linearGradient id is now
      `mc-gradient` and the filter id is now `mc-glow`, with both `url(#...)`
      references (`filter="url(#mc-glow)"`, `stroke="url(#mc-gradient)"`) updated
      consistently to match. Grepped the whole `front/` tree (source and public) for
      `hm-gradient`, `hm-glow`, and the bare `hm-`/`hm_` prefix pattern: zero matches
      anywhere. Ran a fresh `pnpm build` and read the regenerated `front/dist/icon.svg`
      directly: it is copied byte-for-byte from the fixed source, `mc-gradient`/
      `mc-glow` present there too, no stale `dist/` artifact left over from before the
      fix.
- [x] Issue 3 (inaccurate feature-id comment in `Button.tsx`): read the file directly.
      Line 9 now reads `// Smoke-test atom for f01: proves scaffold -> tokens -> CSS
      Module -> component folder works.`, correctly attributing the smoke-test origin
      to `f01`, matching `review_f01.md`'s own confirmation of the original wording. No
      other line in the file changed (props, JSX, and the rest of the file are
      byte-identical to what every prior round already approved).

## Re-confirmed scope (not fully re-litigated, per this round's narrower scope)

- [x] `pnpm build` (`tsc -b && vite build`) run fresh from `front/` in this review:
      completed cleanly, `80 modules transformed`, `built in 276ms`, zero TypeScript or
      Vite errors, `dist/` regenerated (including the corrected `dist/icon.svg`).
- [x] No em dash (`—`) in any of the three touched files, checked individually by direct
      grep: `BrowserSupportNotice.module.css`, `front/public/icon.svg`, `Button.tsx`.
      Zero matches in all three.
- [x] No other un-tokenized literal color introduced or left behind in
      `BrowserSupportNotice.module.css`: grepped the file for `rgba(`/hex-color patterns
      after the fix, zero matches (every color in the file is now a `var(--color-*)`
      reference). `icon.svg`'s hex literals (`#0BD2FF`/`#B366FF`/`#FF69B4`) are
      unaffected by this fix and remain the pre-existing, already-approved exception
      from Round 4 (a standalone static favicon file outside the React/CSS Modules
      tree, cannot consume runtime CSS custom properties or `useId()`, unlike
      `MoonOrbitLogo.tsx`'s equivalent gradient which does use
      `var(--color-neon-blue/purple/pink)` via the CSS-custom-property style exception).
      Not a new issue, not touched by this fix, still consistent with prior approval.
- [x] No relative-path import chain or barrel violation introduced by any of the three
      fixes (none of the three touch an import statement).
- [x] All code/identifiers/comments in the three touched files remain in English.

## Alignment with CLAUDE.md Core Principles and Non-Goals

No violation. These are three narrow, mechanical corrections (one token extraction, one
static-SVG id rename, one comment text correction); none change layout, copy,
interaction, or introduce any new UI pattern, toolchain reimplementation, or
no-code/visual-builder behavior.

## Conclusion

All three issues from the prior full-reviewer rejection are fixed exactly as
recommended, verified directly against the current file content (not taken on the
Implementer's word), and the fixes introduced no new regression: the build is clean,
no em dash, no stray un-tokenized literal, no broken reference. This closes the F02
final gate. The lead can now mark `.claude/feature_list.json`'s `f02` entry `done` and
advance to `f03`.
