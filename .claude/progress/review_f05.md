# Review: f05 IDE Viewer Page (final gate, full reviewer)

Date: 2026-08-21. Covers impl_f05.md's initial stub plus the "Session
Resolution State Machine + /ide -> /lab Rename" round, read against
CHECKPOINTS.md's F05 section and the two spec files under
features/f05_ide_viewer_page/. Reviewed together with f04 in the same
session (see review_f04.md); shared components (LaunchLoader, StatusScreen,
RepoSelector) and the actual handoff from Station to /lab are covered here
since this file owns the /lab side of that handoff.

## Verdict: APPROVED

The rename and the new session-resolution/active-project persistence layer
work correctly end to end, verified live by the user across the full loop
(Home -> Station -> confirm repo -> /lab, and /lab -> change repository ->
Station -> /lab again) and independently re-verified in this review by
reading the current code and running the build/lint/typecheck gates. One
real architectural gap is called out below: it does not fail any written
checkpoint (because CHECKPOINTS.md itself was never updated for this round,
see the dedicated section below), but it is exactly the kind of thing worth
resolving before the real Monaco/dockview editor shell gets built on top of
this page.

## Verification performed

- Read impl_f05.md in full, including the "Loader consistency" bug list and
  the "Decisions made" section that explicitly flags an open, unconfirmed
  design question about Station.tsx and sessionResolution.ts.
- Read the actual current code, not just the impl report's prose:
  front/src/lib/sessionResolution.ts, front/src/lib/activeProject.ts,
  front/src/components/pages/LabViewer/LabViewer.tsx and .module.css,
  front/src/components/pages/Home/Home.tsx,
  front/src/components/pages/Station/Station.tsx,
  front/src/components/molecules/LaunchLoader/LaunchLoader.module.css,
  front/src/App.tsx, front/src/components/pages/index.ts, and both locale
  files.
- Grepped front/src for any remaining IdeViewer or /ide reference: found
  exactly one hit, a historical code comment inside LabViewer.tsx explaining
  what it replaced ("Unlike its predecessor (IdeViewer, which read
  ?owner=&repo= from the URL)..."), not a live reference. The old
  IdeViewer folder itself no longer exists on disk.
- Ran, for real: ./node_modules/.bin/tsc --noEmit -p . from the repo root
  (exit 0), pnpm build and pnpm lint from front/ (both pass, oxlint exit 0).
- Diffed en.json against es.json programmatically: 56 keys each side, no
  key present in only one file, including labProjectOpen, labResolvingLabel,
  and changeRepoButton (the ideProjectOpen key from the original stub is
  fully removed from both files, not left dangling).
- Checked every 100vh usage in front/src for its 100dvh pair (LabViewer's
  own .content included), and every backdrop-filter usage for its
  -webkit- prefix: both come back clean project-wide.

## Checkpoints verified

- [x] App.tsx's CurrentView routes /lab (not the stale /ide from
  CHECKPOINTS.md's own text) to LabViewer; the pages/ barrel re-exports
  LabViewer, not IdeViewer.
- [x] LabViewer no longer reads owner/repo from window.location.search (the
  original stub's design): it calls resolveSession() on mount and reads the
  active project from the resolved, typed 'ready' union member instead.
- [x] LabViewer renders BrandTitle, the stationSuccess-keyed tagline Badge,
  an interpolated "project open" line (labProjectOpen, with owner/repo
  interpolation), and a sign-out button matching Station's own
  clearGitHubTokens-then-redirect-home behavior, plus a real, explicitly
  labeled stopgap "change repository" action.
- [x] Station.tsx's 'success' branch has dropped the tagline Badge and
  sign-out button pairing (moved to LabViewer, confirmed by reading the
  current file: the 'success' branch now renders only BrandTitle and
  RepoSelector).
- [x] No em dash, no throw, no literal color/spacing value outside
  tokens.css, @/ path alias imports with barrels, in any file this feature
  touched.
- [x] pnpm build and pnpm lint pass; root tsc --noEmit passes.
- [x] Both confirmed-repo paths (select-existing, create-new) navigate to
  /lab (not /ide), and both play LaunchLoader's exit animation before the
  real navigation fires (handleConfirmExisting / handleConfirmCreate's
  success branch both go through Station's navigateToLab helper).
- [x] LabViewer's own loader plays its exit animation too before either
  showing the stub content or redirecting to /station on a non-ready
  resolution (isLoaderExiting state, gated by the same EXIT_ANIMATION_MS
  constant Station.tsx uses).
- [x] LaunchLoader's liftoff keyframe starts at translateY(22rem), past the
  .box's own 32rem height, so the rocket genuinely rises into frame instead
  of already sitting visible at the ground on the first frame. This fix is
  shared by both Station and LabViewer, confirmed by reading the one shared
  LaunchLoader.module.css file both consume.

## Architectural soundness for the upcoming Monaco/dockview work

This was explicitly called out as the reason for running the full reviewer
now rather than reviewer-light, so it gets its own section.

sessionResolution.ts itself is well-designed: a small, pure, typed
discriminated union (unauthenticated, needsInstall, error, noProject,
ready), composing the existing githubAuth.ts/githubInstallation.ts/
activeProject.ts helpers, never throwing, easy to extend with a new status
later (e.g. a future "workspace config invalid" status once the real IDE
shell needs to validate .MuunCode/workspace.json itself). That part is
genuinely reusable as designed.

What is NOT yet reusable in practice: only one real call site,
LabViewer.tsx, actually calls resolveSession(). Home.tsx's button was
reverted to a plain window.location.href navigation (a deliberate, well-
reasoned UX fix, not a mistake) and no longer calls it at all. Station.tsx,
which needs almost the exact same isSignedIn -> getAccessToken ->
checkHasInstallation -> readActiveProject sequence for its own returning-
visitor flow, still hand-rolls its own separate copy of that sequence
inline in its mount effect (verifyExistingSession/resolveInstallationStatus)
rather than calling the shared helper. This is not a bug today, both copies
currently agree, but it is a real, already-acknowledged drift risk: the
implementer's own "Decisions made" section in impl_f05.md explicitly flags
this as flagged to the user as an open question, not yet confirmed either
way. Confirmed by reading Station.tsx's current mount effect directly:
it duplicates isSignedIn(), getAccessToken(), checkHasInstallation(), and
readActiveProject() calls in its own control flow, none of them going
through resolveSession().

Why this matters for the next phase specifically: the real editor shell
will very likely need this exact same resolution sequence again (deciding
what to render on a raw page load/refresh of whatever route hosts Monaco/
dockview), and today there is already a fork in the road, one path that
uses the shared helper and one that does not. Before more code gets built
on top of /lab, this fork should be resolved in one direction (either
Station.tsx adopts resolveSession() for its own returning-visitor branch,
accepting that it still needs its own extra repo-list-loading logic on top,
or the shared helper is deliberately scoped down to "only for entry points
with nothing extra to load" and documented as such), rather than carrying
two independently-maintained copies of the same security-relevant check
sequence into a much bigger surface area.

Separately, LabViewer's own stub content (BrandTitle, a Badge, one
interpolated line, two demoted buttons) is intentionally throwaway per its
own code comments ("this page gets a real redesign later, this button is
not meant to be its final shape"), so no structural concern there: it will
be fully replaced, not incrementally extended, once Monaco/dockview work
starts.

## Other findings (non-blocking)

1. Writing-standard violation, non-code: .claude/progress/current.md
   (around its line 56, in the session-plan item about reconciling
   CHECKPOINTS.md) contains a literal em dash. CLAUDE.md's Code and Naming
   Standards states this rule applies to every harness file under .claude/,
   so this is a real violation even though current.md is an overwritable
   session-state file, not application code. Filed here rather than in
   review_f04.md since current.md tracks both features together, not
   either one specifically; a matching, separate em dash violation specific
   to f04's own spec file is filed in review_f04.md instead.
2. LabViewer's handleChangeRepo (the "Cambiar de repositorio" button) is
   explicitly marked in its own code comment as a stopgap, not a final UI
   decision, consistent with what impl_f05.md's "Decisions made" section
   says. No action needed now, just confirming this was a deliberate,
   already-acknowledged scope boundary rather than an oversight.
3. LabViewer.module.css's own doc comment doubles as both the stub content
   layout and the resolving/loading layout ("Also doubles as the resolving/
   loading layout while lib/sessionResolution.ts's check is still in
   flight"): confirmed this is accurate by reading LabViewer.tsx, the same
   .content class wraps both the loader branch and the ready-state branch.
   No issue, just noting the comment is trustworthy on inspection, which is
   exactly what CLAUDE.md's Universal Checks ask this review to verify
   rather than accept at face value.

## Gap in CHECKPOINTS.md itself (flagged, not silently ignored)

CHECKPOINTS.md's F05 section still describes the original, now fully
superseded design: it says IdeViewer reads owner/repo from
window.location.search and routes at /ide. Neither is true in the current
code: the route is /lab, the component is LabViewer, and it resolves state
via lib/sessionResolution.ts and lib/activeProject.ts instead of a query
string. This entire "Session Resolution State Machine + /ide -> /lab
Rename" round (a real, substantial piece of this session's work) has no
corresponding checkpoint entry in CHECKPOINTS.md at all, only its own spec
file (session-resolution-and-lab-rename.md) and impl_f05.md's dated section
describe it. This review verified that round's actual behavior directly
against the current source code and the user's own live end-to-end test
report, not against a written checkpoint list, because none exists yet.
CHECKPOINTS.md should gain a matching F05 section (superseding, not just
appending to, the current /ide-based text) before this feature is
considered fully closed out administratively, independent of this review's
APPROVED verdict on the actual code.

---

# Review: f05 additional scope, Delete Repository (fast pass, reviewer-light)

Date: 2026-08-25. Covers the "Delete Repository" adjustment round described
in `.claude/progress/current.md`'s Session Plan item 6 (no dedicated spec
`.md`, an adjustment/tweak round on the already-in-progress `f05` feature
per `CLAUDE.md` -> "Adjustment vs. new feature"). No dedicated CHECKPOINTS.md
section exists for this round yet (consistent with the rest of this
session's un-reviewed adjustment streak, see the "Gap in CHECKPOINTS.md
itself" section above); reviewed directly against this prompt's own
described scope instead.

## Verdict: APPROVED

## Checkpoints / claims spot-checked

- `front/src/components/LabIDE/organisms/IdeDeleteRepoModal/{IdeDeleteRepoModal.tsx,IdeDeleteRepoModal.module.css,index.ts}`
  exist, own folder, barrel present and re-exported from
  `front/src/components/LabIDE/organisms/index.ts`. All imports use the `@/`
  alias, no relative-path chains.
- `IdeDeleteRepoModal.module.css` uses only `var(--token-name)` values
  (`--ide-*`, the new `--ide-color-danger*`, and the pre-existing
  `--spacing-*`/`--radius-*`/`--font-size-*` tokens); no literal
  color/spacing/radius value found.
- `front/src/components/LabIDE/ide-tokens.css` gained exactly
  `--ide-color-danger: #F14C4C`, `--ide-color-danger-bg: #5A1D1D`,
  `--ide-color-danger-border: #BE1100` (VS Code Dark+ error-red values), no
  other token changed.
- `IdeMenuList.tsx`/`IdeMenuList.module.css`: new `danger?: boolean` on
  `IdeMenuListItem`, `.itemDanger` styled from the new danger tokens only,
  applied conditionally via a plain className ternary, not an inline style.
- `IdeMenuBar.tsx`: `fileItems` is built as `[...fileMenu.items, {...}]`,
  spreading the pre-existing static 4-item `file` entry from `MENUS` rather
  than redefining those 4 items; the new `deleteRepo` entry is the only
  closure-based one added, matches the pre-existing `settingsItems` pattern
  used for the same reason (closing over a prop callback). No drift from
  the original static definitions.
- `IdeDeleteRepoModal.tsx`'s `handleConfirm`: confirm button's `disabled`
  is `!isConfirmed || isDeleting`, and `isConfirmed` is a strict
  `confirmText === repoName` check, both as the `disabled` attribute and
  (via `opacity`) visually in `.confirmButton`/`.confirmButton:not(:disabled)`.
  Both `getAccessToken()` returning falsy and `deleteRepo()` returning
  `{ ok: false }` are handled explicitly (`setStatus('error')`, then
  `return`); confirmed `getAccessToken()` (`front/src/lib/githubAuth.ts`)
  never throws (file's own top comment plus no `throw` in its body). No
  unhandled-rejection path found.
- `front/src/lib/githubRepos.ts`'s new `deleteRepo()`: `.catch(() => null)`
  on the `fetch` call, controlled `{ ok, error }` return on every path,
  consistent with every sibling function in the same file (`listRepos`,
  `createBareRepo`, `scaffoldRepo`). No `throw`.
- `api/delete-repo.ts`: `applyDevCors` first, `POST`-only check, body
  validation (`accessToken`/`owner`/`name`), controlled JSON error
  responses (`400`/`502`), no `throw`, matches `api/create-repo.ts`/
  `api/scaffold-repo.ts`'s exact shape.
- `front/src/components/pages/LabViewer/LabViewer.tsx`: `openModal` state
  gained `'deleteRepo'`, wired to `IdeMenuBar`'s new `onDeleteRepo` prop and
  a new `IdeModal size="small"` rendering `IdeDeleteRepoModal`; `onDeleted`
  is the pre-existing `handleChangeRepo`, which clears the active project
  and navigates to `/station` under the same color-transition/rocket-loader
  sequence already used for the "change repository" action, correct reuse
  for a post-deletion "go back to the picker" transition since the deleted
  repo can no longer be the active project either way.
- `front/src/locales/es.json`/`en.json`: `ideMenuFileDeleteRepo` and the 7
  `ideDeleteRepo*` keys exist in both files, one-to-one, no key present in
  one but missing from the other. `cancelButton` reused as claimed, no new
  duplicate key added for it.
- No em dash found in any file this round touched (`Select-String`/grep
  pass across every file listed in current.md's Session Plan item 6).
- All identifiers, file/folder names, and comments in the touched files are
  in English.
- `cd front; pnpm build` ran clean (176 modules transformed, no errors).
- `cd front; pnpm lint` (`oxlint`) ran clean, no warnings or errors.
- `pnpm exec tsc --noEmit -p .` from the repo root ran clean (covers
  `api/delete-repo.ts` and `api/lib/githubDeleteRepo.ts`).

## Non-blocking finding (does not change the verdict)

- `api/lib/githubDeleteRepo.ts`'s top comment is now stale: it still reads
  "Only ever called from api/scaffold-repo.ts, and only when the scaffold
  commit itself failed", which was true before this round but is no longer
  accurate now that `api/delete-repo.ts` also calls it as a real,
  user-facing entry point (this is even called out correctly in
  `api/delete-repo.ts`'s own comment one file over: "which until now was
  only ever called internally by scaffold-repo.ts's own rollback path;
  this is its first real, user-facing entry point"). Worth a one-line
  comment fix in `api/lib/githubDeleteRepo.ts` itself in the next round
  touching that file, so the two files' comments do not contradict each
  other; not worth a rejection on its own since it is a doc-accuracy issue,
  not a behavior or checkpoint failure.
