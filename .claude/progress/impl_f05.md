# Implementer report: f05 IDE Viewer Page (Stub)

## 2026-08-21: Initial stub

Spec: `features/f05_ide_viewer_page/ide-viewer-page.md`. New feature, implemented
together with `f04`'s `repo-creation-confirmation-flow.md` additional scope (see
`.claude/progress/impl_f04.md`) since both close out one cohesive user-facing flow:
`/station` confirms a repository (select-existing or create-new), then navigates here.

### Feature implemented

- A new page component, `IdeViewer` (`front/src/components/pages/IdeViewer/`), reads
  `owner`/`repo` from `new URLSearchParams(window.location.search)` synchronously at
  the top of the function body (no effect needed, no async work). If either is missing
  or empty, it renders `NotFound` instead of a broken/empty stub.
- Otherwise renders `BrandTitle`, the same `stationSuccess`-keyed tagline `Badge`
  (unchanged copy, "Aquí Houston, luz verde"/"Here, Houston, green light"), a new line
  using the new `ideProjectOpen` i18n key (interpolated with `{{owner}}`/`{{repo}}`),
  and a sign-out `Button` with the exact same behavior as `Station.tsx`'s own
  `handleSignOut` (clear tokens via `clearGitHubTokens`, then `window.location.replace
  ('/')`). Reuses `GridBackground`, matching `Station.tsx`'s own success-branch layout
  conventions, simplified for this page's much shorter content: `min-height: 100dvh`
  centered column (no fixed-height-plus-overflow-hidden scroll guard, since there is no
  scrollable list here to worry about).
- `App.tsx`'s `CurrentView` now routes `/ide` to `IdeViewer`, added between the existing
  `/station` and `/` checks.
- `front/src/components/pages/index.ts` re-exports `IdeViewer` alongside the other
  pages.
- Two new i18n keys added to both `es.json`/`en.json`: `ideProjectOpen` (this feature's
  own new copy) and the confirmation-flow keys tracked instead under `f04`'s own
  progress report, since they belong to `RepoSelector`, not this page.

### Files created

- `front/src/components/pages/IdeViewer/IdeViewer.tsx`
- `front/src/components/pages/IdeViewer/IdeViewer.module.css`
- `front/src/components/pages/IdeViewer/index.ts`

### Files modified

- `front/src/App.tsx`: added the `/ide` route to `CurrentView`.
- `front/src/components/pages/index.ts`: re-exports `IdeViewer`.
- `front/src/locales/es.json`/`en.json`: added `ideProjectOpen`.

(`Station.tsx`'s own drop of the tagline `Badge`/sign-out button pairing, the shared
checkpoint with this feature, is tracked in `.claude/progress/impl_f04.md`'s matching
dated section, implemented in the same pass.)

### Test/validation output

- `pnpm build` (from `front/`): passes (`tsc -b && vite build` completes with no
  errors).
- `pnpm lint` (from `front/`, `oxlint`): passes, no reported issues.

### Decisions made

- `IdeViewer.tsx` imports `NotFound` directly from its own component folder
  (`@/components/pages/NotFound`), not from the `pages/` category barrel
  (`@/components/pages`): that category barrel re-exports `IdeViewer` itself, so
  importing it from inside `IdeViewer.tsx` would create a circular module reference
  between `pages/index.ts` and `IdeViewer.tsx`. Importing `NotFound`'s own single-level
  component barrel avoids that entirely while still following this project's barrel
  convention (one level of re-export, per component folder).
- `IdeViewer.module.css`'s outer container uses `min-height: 100dvh` (not a fixed
  `height: 100dvh` plus `overflow: hidden`, unlike `Station.module.css`'s
  `.successContent`): this page's content is short and has no internally scrollable
  list to guard against, so the stricter scroll-lock pattern `Station`'s repo-picker
  success branch needs is not warranted here.

## Response

DONE

## 2026-08-21: Additional scope, Session Resolution State Machine + /ide -> /lab Rename

Spec: `features/f05_ide_viewer_page/session-resolution-and-lab-rename.md`. Adjustment
round on `f05` (not a new feature), per the user's explicit request.

### Feature implemented

See the spec file for the full design; summary of what changed:

- `/ide` renamed to `/lab`; `IdeViewer` renamed/moved to `LabViewer`
  (`front/src/components/pages/LabViewer/`). `App.tsx`'s `CurrentView` and the
  `pages/` barrel updated to match; the old `IdeViewer/` folder deleted (not left
  behind).
- New `front/src/lib/activeProject.ts`: `localStorage`-backed persistence
  (`muuncode.activeProject`) of `{ owner, name }`, mirroring `lib/githubAuth.ts`'s own
  pattern. `storeActiveProject`/`readActiveProject`/`clearActiveProject`, never throws
  (the one `JSON.parse` call is wrapped in `try/catch`, converted to a controlled
  `null` return, per the user's own global `CLAUDE.md` exception rule).
- New `front/src/lib/sessionResolution.ts`: `resolveSession()`, a shared state machine
  chaining `isSignedIn` -> `getAccessToken` -> `checkHasInstallation` ->
  `readActiveProject`, returning a typed `SessionResolution` discriminated union
  (`unauthenticated | needsInstall | error | noProject | ready`). Deliberately does
  NOT handle the GitHub OAuth `code` exchange itself; only resolves an
  already-stored session.
- `LabViewer` no longer reads query params: on mount it calls `resolveSession()` and
  bounces to `/station` on anything short of `ready` (which already renders every
  non-ready case), rendering its stub content (unchanged otherwise) only once `ready`.
- `Home.tsx`'s "Entrar a MuunCode" button reuses `resolveSession()` (see "Loader
  consistency" below for why this was later reverted to a plain instant navigation
  instead).
- `Station.tsx`'s existing returning-visitor flow (`resolveInstallationStatus`) now
  also checks `readActiveProject()` right after confirming the App installation, and
  redirects straight to `/lab` when a project is already active, instead of always
  loading the repo list and showing `RepoSelector`. Covers both a returning visit and
  a fresh OAuth code-exchange whose token had merely expired without an explicit
  sign-out (which is what actually clears the stored project).

### Loader consistency (found via live user testing after the above landed)

Three follow-up UX bugs, found in order:

1. **Home's button felt frozen.** Running `resolveSession()` on Home before
   navigating left the button sitting with no visual feedback for however long the
   network calls took (no loader shown at all). Reverted `handleEnterStation` to a
   plain, instant `window.location.href = '/station'`; `Station.tsx`'s own
   `resolveInstallationStatus` (already modified above) now owns deciding whether to
   bounce to `/lab`, under the rocket `LaunchLoader` `Station` already shows from
   mount, so the click itself feels instant and the real wait happens under a loader
   that was already there.
2. **Station -> /lab transition felt abrupt.** `handleConfirmExisting` and
   `handleConfirmCreate`'s success path both navigated to `/lab` with a raw
   `window.location.href` assignment, either with no loader visible at all (existing-
   repo path) or mid-loader with no exit animation played (create-new path). New
   `navigateToLab()` helper in `Station.tsx` (mirrors the existing `transitionTo`
   pattern): ensures the loader is mounted, waits one frame so it has a real "from"
   state to animate away from, triggers the exit visual, waits
   `EXIT_ANIMATION_MS` (700ms, matching `LaunchLoader.module.css`'s own exit duration),
   then navigates. Used by all three paths that reach `/lab`
   (`handleConfirmExisting`, `handleConfirmCreate`'s success branch, and the
   active-project redirect inside `resolveInstallationStatus`).
3. **`/lab`'s own loader never played its exit at all.** `LabViewer` swapped straight
   from its loading branch to either the stub content or the `/station` redirect the
   instant `resolveSession()` resolved, cutting the rocket off mid-flight. Added its
   own `isLoaderExiting` state: on resolution (either outcome), triggers the exit
   visual first, waits the same `EXIT_ANIMATION_MS`, then either renders the stub
   content or redirects.
4. **The rocket's own entrance looked wrong regardless of the above**:
   `LaunchLoader.module.css`'s `liftoff` keyframe started at `translateY(12rem)`,
   which (given `.box`'s 32rem height and the rocket's vertically centered resting
   spot) placed it visibly right at the ground on the very first frame, rather than
   truly entering from below the frame. Changed the starting offset to
   `translateY(22rem)`, past the box's own height, so it starts fully clipped by
   `.box`'s `overflow: hidden` and genuinely rises into frame. This fix is shared by
   every `LaunchLoader` usage (`Station.tsx` and `LabViewer.tsx` both), not specific
   to either page.

### Other `/lab`-specific additions

- A "Cambiar de repositorio" / "Change repository" button, before the sign-out
  button: clears the active project (so `Station.tsx`'s own active-project redirect
  does not immediately bounce right back here) then navigates to `/station`.
  Explicitly a stopgap for exercising this flow before `/lab` gets its real
  redesign, not a final UI decision.
- `labResolvingLabel` copy ("Verificando tripulación..."/"Checking crew...", matching
  this project's existing crew/space theming) shown alongside the loader while
  `resolveSession()` is in flight.

### Files created

- `front/src/lib/activeProject.ts`
- `front/src/lib/sessionResolution.ts`
- `front/src/components/pages/LabViewer/LabViewer.tsx`,
  `LabViewer.module.css`, `index.ts`
- `features/f05_ide_viewer_page/session-resolution-and-lab-rename.md`

### Files deleted

- `front/src/components/pages/IdeViewer/` (all three files, replaced by `LabViewer/`)

### Files modified

- `front/src/App.tsx`, `front/src/components/pages/index.ts`
- `front/src/components/pages/Home/Home.tsx`
- `front/src/components/pages/Station/Station.tsx` (see also `impl_f04.md`'s matching
  dated section for this file's other, unrelated changes in the same session)
- `front/src/components/molecules/LaunchLoader/LaunchLoader.module.css`
- `front/src/locales/es.json`, `en.json` (`labProjectOpen`, `labResolvingLabel`,
  `changeRepoButton`; `ideProjectOpen` removed)
- `.claude/feature_list.json` (f05's description/notes/`feature_file`, plus an
  unrelated pre-existing JSON syntax error found and fixed: a missing comma after
  f05's `notes` field)
- `.claude/progress/current.md`

### Test/validation output

- `pnpm exec tsc --noEmit -p .` (repo root): passes.
- `pnpm build`/`pnpm lint` (from `front/`): pass, no reported issues.
- Live-tested by the user across the full loop (Home -> Station -> confirm repo ->
  /lab, and /lab -> "Cambiar de repositorio" -> Station -> /lab again): confirmed
  working, including the loader consistency fixes.

### Decisions made

- `Station.tsx`'s internal returning-visitor flow was NOT refactored to call
  `resolveSession()` internally (even though it now duplicates most of that same
  check sequence): it also needs to load the repo list for `RepoSelector`, which
  `resolveSession()` has no reason to do, and refactoring it risked its
  already-approved behavior for no functional gain. Flagged to the user as an open
  question; not yet confirmed either way.
- `handleChangeRepo`'s exact button placement/behavior is explicitly a stopgap (see
  its own code comment): `/lab` is getting a real redesign once the actual editor UI
  work starts, so no more polish was put into this button's final shape.

## Response

DONE
