# Active Session State
> Overwritable. See history.md for the permanent record.

## Current Session
**Active features**: f05 (ide_viewer_page)
**Status**: Since the 2026-08-21 full `reviewer` pass (APPROVED, see
`review_f04.md`/`review_f05.md`), this session has done a long, un-reviewed
adjustment streak directly on `/lab`'s real editor shell (no `.md` spec files
written for most of it, no Implementer delegation either, several rounds
driven straight from live user feedback): the `LabIDE` component domain
restructure, `IdeMenuBar` (menu dropdowns, centered title pill, settings
menu), `IdeFileExplorer` (collapsible sidebar, drag-and-drop visuals, branch
label), `IdeContextMenu`, `IdeModal` (4 sizes, no backdrop), the sign-out and
change-repository color-transition loaders, global white-flash/View-Transition
fixes (`reset.css`, `index.html`), and, most recently, a "Delete Repository"
feature (File menu -> `IdeModal size="small"` -> new `IdeDeleteRepoModal`
organism, typed-confirmation delete, new `api/delete-repo.ts` endpoint, new
`--ide-color-danger*` tokens). `reviewer-light` ran on the Delete Repository round: **APPROVED** (see
`review_f05.md`'s latest section), one non-blocking finding (stale comment
in `api/lib/githubDeleteRepo.ts`) fixed immediately after. The rest of this
streak (menu bar, file explorer, modals, transitions) still needs its own
doc/review catch-up later.

**2026-08-27**: also shipped the deploy pipeline itself (`git init`, first
commit, `pnpm dev`/build fixes for a real pnpm workspace + Vercel monorepo
build, `api/lib` -> `api/_lib` rename to stay under the Hobby plan's 12
function limit, README with badges), all pushed to
`github.com/AzanoRivers/muuncode` and live on Vercel. Then a real, planned
feature round: file opening + editor tabs + Monaco, per
`features/f05_ide_viewer_page/file-opening-and-editor-tabs.md` (research into
real VS Code preview-tab/image-preview mechanisms first, plan written and
approved, then implemented: single/double-click preview-vs-pinned tabs,
`EditorTabsState` typed module, a real Monaco instance scoped to only the
html/css/js/json/md languages MuunCode needs, an unsupported-file-type modal,
and an image preview view). Worked through a genuine Vite 8/Rolldown
resolution gap for `monaco-editor`'s own deep worker/language subpaths (see
that spec file's own "Vite/Rolldown worker resolution gap" section for the
fix). `pnpm build`/`pnpm lint` (`front/`) and root `pnpm exec tsc --noEmit`
all pass; Ctrl+Z/Ctrl+X/Ctrl+V manually verified working inside Monaco via a
temporary isolated smoke-test page (`/lab` itself needs a real GitHub
session, not available in this environment). Not yet run through
`reviewer-light`.
**Last updated**: 2026-08-27

## Session Plan
1. `f04` backend fixes (in the order they were actually found, live-tested by
   the user against the real GitHub API): opaque errors now forward GitHub's
   real detail; `addRepoToInstallation` reordered before the git-data commit;
   default branch forced to `master`; a bootstrap commit (Contents API)
   works around the Git Data API rejecting writes on a zero-ref repo; a
   scaffold failure now auto-deletes the orphaned bare repo (explicit user
   decision); `list-repos.ts`'s MuunCode-project filter switched from a
   lag-prone Code Search call to a direct Contents API existence check, plus
   a 1-year inactivity cutoff. Full detail in `impl_f04.md`'s dated sections.
2. `f05` renamed `/ide`/`IdeViewer` to `/lab`/`LabViewer`, gained
   `lib/sessionResolution.ts` (session/token/installation/project state
   machine) and `lib/activeProject.ts` (localStorage-persisted active
   project). Loader-consistency follow-up: `LaunchLoader`'s entrance keyframe
   now starts below frame, and both `Station.tsx`/`LabViewer.tsx` wait for
   the exit animation before navigating/swapping content. Full detail in
   `impl_f05.md`'s dated sections and
   `features/f05_ide_viewer_page/session-resolution-and-lab-rename.md`.
3. Full `reviewer` pass (2026-08-21, covering both features together since
   this session's work interleaved them): APPROVED both, with non-blocking
   findings. All addressed in a follow-up round the same day:
   - `Station.tsx`'s returning-visitor flow now calls
     `resolveSession()`/`resolveSessionFromToken()` instead of hand-rolling
     its own copy of the same check sequence (the architectural-drift
     finding).
   - `api/lib/githubInstallationId.ts`'s unused `accountLogin` field/null
     check removed.
   - `api/list-repos.ts` now paginates (`page` param, `hasMore` from GitHub's
     `total_count`); `RepoSelector` implements infinite scroll and shows a
     "max 1 year inactivity" notice.
   - The per-repo Contents-API membership check now runs in
     concurrency-limited batches (10 at a time), not one unbounded
     `Promise.all`.
   - `CHECKPOINTS.md` gained sections for the Backend Hardening round and the
     Session Resolution/`/lab`-rename round (both previously undocumented
     there), plus this unification/pagination/cleanup round.
   - Both flagged em dash violations fixed
     (`real-github-repo-data.md`, this file).
4. Fixed a pre-existing JSON syntax error in `feature_list.json` (missing
   comma after f05's `notes` field) found while updating it earlier this
   session.
5. Next: the user wants to start building the real `/lab` editor UI
   (Monaco/dockview/file tree) once this round's fixes are confirmed. A
   fresh `reviewer-light` (or another full `reviewer`, user's call) pass on
   this latest round is the natural next step before that work starts.
6. 2026-08-23: "Delete Repository" round, `reviewer-light` requested now.
   Files touched: `front/src/components/LabIDE/organisms/IdeDeleteRepoModal/`
   (new: `.tsx`, `.module.css`, `index.ts`), `front/src/components/LabIDE/
   organisms/IdeMenuBar/IdeMenuBar.tsx` (new `onDeleteRepo` prop, inline
   `fileItems` closing over it), `front/src/components/LabIDE/molecules/
   IdeMenuList/{IdeMenuList.tsx,IdeMenuList.module.css}` (new `danger?:
   boolean` on `IdeMenuListItem`), `front/src/components/LabIDE/
   organisms/index.ts` (barrel export), `front/src/components/LabIDE/
   ide-tokens.css` (new `--ide-color-danger*` tokens, real VS Code Dark+
   values), `front/src/components/pages/LabViewer/LabViewer.tsx` (new
   `'deleteRepo'` modal state, wired to `IdeMenuBar`/`IdeModal size="small"`,
   `onDeleted` reuses the existing `handleChangeRepo` color-transition),
   `front/src/lib/githubRepos.ts` (new `deleteRepo()` fetcher, `DeleteRepoResult`
   type), `api/delete-repo.ts` (new endpoint, thin wrapper around the
   pre-existing `api/lib/githubDeleteRepo.ts`), `front/src/locales/{es,en}.json`
   (new `ideMenuFileDeleteRepo`, `ideDeleteRepo*` keys). No spec `.md` written
   for this round (a tweak/adjustment round on an already-in-progress feature,
   per `CLAUDE.md` -> "Adjustment vs. new feature"). `pnpm build`/`pnpm lint`
   (`front/`) and root `pnpm exec tsc --noEmit` all passed before requesting
   this review.

## Decisions Made
_(log for this session, moved to history.md when the session closes)_

- 2026-08-21: Both confirmed-repo paths (select existing, create new)
  navigate to `/lab` (was `/ide`).
- 2026-08-21: The commit message's "Fundation" typo corrected to "Foundation"
  (a permanent, repeated string in every project's git history, unlike
  `GREETINGS.md`'s preserved personal voice).
- 2026-08-21: Default branch is always `master`, never whatever the signed-in
  GitHub account's own default-branch-name setting would otherwise produce.
- 2026-08-21: A scaffold-commit failure now automatically deletes the
  orphaned bare repository (explicit user decision, overriding this round's
  own earlier documented choice not to).
- 2026-08-21: `/ide` renamed to `/lab`, `IdeViewer` to `LabViewer`; direct
  visits and Home's "Entrar a MuunCode" now resolve session state from
  `localStorage` via `lib/sessionResolution.ts` instead of depending on a
  `?owner=&repo=` query string written by a prior navigation.
- 2026-08-21: Reverted Home's button to a plain, instant navigation to
  `/station` (no async `resolveSession()` call on Home itself): running that
  check before navigating left the button sitting with no feedback for
  however long the network calls took. `Station.tsx`'s own returning-visitor
  flow does that check instead, under the rocket `LaunchLoader` it already
  shows from mount.
- 2026-08-21: After the full `reviewer` pass, `Station.tsx` was refactored to
  call `lib/sessionResolution.ts` directly (via a new `resolveSessionFromToken`
  export for the fresh-OAuth-code path) instead of keeping its own parallel
  copy of the same check sequence: one shared implementation, not two kept in
  sync by hand.
- 2026-08-21: Repo list pagination uses real infinite scroll (scroll-position
  threshold in `RepoSelector`, not a "load more" button), per explicit user
  request, and the per-repo membership check is batched in groups of 10 to
  stay well clear of GitHub's abuse rate limiting on accounts with many repos
  per page.
