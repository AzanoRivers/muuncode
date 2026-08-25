# Review: f04 Repository Selection UI (final gate, full reviewer)

Date: 2026-08-21. Covers every round recorded in impl_f04.md, read against
CHECKPOINTS.md's F04 sections and the spec files under
features/f04_repository_selection_ui/. Reviewed together with f05 in the same
session (see review_f05.md); shared/cross-cutting findings that are really
about the /lab handoff or sessionResolution.ts are filed there instead of
duplicated here.

## Verdict: APPROVED

The feature is functionally sound, passes every automated gate, and the repo
creation backend (the riskiest part of this session's work) has been hardened
against every real bug the user hit while live-testing. A few non-blocking
gaps are called out below and should be picked up as quick follow-ups, not as
a reason to reject this final gate.

## Verification performed

- Read every dated section of impl_f04.md (all rounds, visual-refinements.md
  through repository-creation-accordion.md, real-github-repo-data.md,
  new-repo-scaffold.md, repo-creation-confirmation-flow.md, and the
  undocumented-in-a-spec-file "Repo Creation Backend Hardening" round).
- Read the actual current code for every file involved, not just the impl
  report's prose: api/create-repo.ts, api/scaffold-repo.ts, api/list-repos.ts,
  api/check-installation.ts, api/lib/githubAppAuth.ts,
  api/lib/githubInstallationId.ts, api/lib/githubApiRequest.ts,
  api/lib/githubGitDataCommit.ts, api/lib/githubBootstrapBranch.ts,
  api/lib/githubDeleteRepo.ts, api/lib/repoScaffoldTemplates.ts,
  api/lib/devCors.ts, front/src/lib/githubRepos.ts,
  front/src/components/organisms/RepoSelector, and the AccordionPanel,
  CreateRepoForm, RepoListItem molecules, the VisibilityTag, RocketIcon,
  ChevronIcon, RepoIcon, PlusIcon atoms, StatusScreen, tokens.css, and both
  locale files.
- Ran, for real, from the repo root: ./node_modules/.bin/tsc --noEmit -p .
  (exit 0, no errors; covers every api/*.ts file including this session's new
  ones). From front/: pnpm build (passes, tsc -b && vite build completes) and
  pnpm lint (oxlint, exit 0, no reported issues).
- Diffed en.json against es.json programmatically: 56 keys each side, zero
  keys present in only one file.
- Grepped the live app/api source (excluding node_modules, .vercel, and
  progress docs) for throw, inline style objects, deep relative import
  chains, em dash, overflow-x: clip, unprefixed backdrop-filter/clip-path,
  bare 100vh without a 100dvh pair, position: sticky, and input/textarea
  font-size below 16px. See findings below for the one real hit (em dash, in
  a spec file, not app code).

## Checkpoints verified

### F04 stage 1 (mockup) through "Repository Creation Confirmation Flow"

All checkpoints in CHECKPOINTS.md for these rounds were already checked off; I
re-verified the ones a later round could plausibly have silently broken:

- [x] RepoSelector, RepoListItem, AccordionPanel, CreateRepoForm all exist
  with their own folder, tsx+module.css(+index.ts) pair, wired through
  barrels only, no barrel importing another barrel.
- [x] RepoListItem is a real button element, keyboard reachable, min-height
  6.4rem (well above the 44px floor).
- [x] No em dash, no throw, no inline dynamic-style object outside the
  documented accordion-content-height custom-property exception, no literal
  color/spacing value outside tokens.css, in any live app/api file this
  feature touched.
- [x] pnpm build / pnpm lint pass; root tsc --noEmit passes (verified
  directly by this pass, not only trusted from the impl report).
- [x] The accordion's steady-state sizing bug (the Round 3/4 saga) is
  resolved in the direction Round 4 settled on: panelExpanded/panelCollapsed
  restored as two distinct flex modes, listWrapper/list both flex 1,
  min-height 0 again, no static max-height anywhere in
  RepoSelector.module.css. Confirmed by reading the current file, not the
  historical narration alone.
- [x] AccordionPanel carries an explicit code comment naming its VS Code
  reference (the explorer tree "twisty" header module under
  src/vs/workbench/browser/parts/views), satisfying CLAUDE.md's UI
  Reference Methodology.

### Real GitHub Repository Data (Rounds 1-3) and New Repository Scaffold

- [x] list-repos.ts and create-repo.ts follow check-installation.ts's shape
  (applyDevCors first, POST-only, no Client Secret).
- [x] @octokit/auth-app is a real pnpm-add-installed dependency, present in
  root package.json's dependencies and pnpm-lock.yaml, never hand-typed.
- [x] Neither the App's private key nor the Client Secret is ever sent to
  the browser or logged (grepped api/ for console log/info/error/warn
  calls: zero hits anywhere in this feature's backend code).
- [x] Repos sorted by pushed_at descending, real relative-time labels via
  Intl.RelativeTimeFormat, no new runtime dependency.
- [x] Only repos with an already-committed .MuunCode/workspace.json are
  listed; repos older than one year are filtered out first. A genuinely
  empty result renders the warning-toned empty state scoped to the
  existing-repo accordion section, not a full-page error.

### Repository Creation Confirmation Flow and Repo Creation Backend Hardening

- [x] create-repo.ts only creates the bare repo (auto_init false) and
  returns id, name, owner, private, pushedAt, defaultBranch, with
  defaultBranch always hardcoded to master regardless of GitHub's own
  account-level default branch setting.
- [x] scaffold-repo.ts runs addRepoToInstallation before the git-data
  commit (confirmed by reading the current file's call order), the
  corrected order from the "wrong call order" bug.
- [x] githubBootstrapBranch.ts uses the Contents API targeting the branch
  explicitly; githubGitDataCommit.ts's commitFiles force-updates that same
  ref with a real, parent-less commit right after, so the bootstrap commit
  never appears in the visible history.
- [x] A failure in either bootstrapEmptyRepoBranch or commitFiles triggers
  deleteRepo (confirmed both failure branches in scaffold-repo.ts call it
  and report repoDeleted back), matching the explicit user decision
  recorded in impl_f04.md.
- [x] githubRepos.ts's createBareRepo and scaffoldRepo return a controlled
  ok-based result, never null, never throw; Station.tsx handles both
  branches of each exhaustively.
- [x] RepoSelector.tsx's isConfirmingExisting guard (set once, never reset)
  correctly prevents a double click on Siguiente from firing
  onConfirmExisting twice.
- [x] pnpm build and pnpm lint pass; root tsc --noEmit passes, verified
  directly by this pass.

## Issues found (non-blocking, does not change the APPROVED verdict)

1. Dead code and a now-false comment in api/lib/githubInstallationId.ts.
   getInstallationInfo still resolves and returns accountLogin (plus the
   whole account null-check machinery needed to get it), with a comment
   claiming it is needed by list-repos.ts to scope a Code Search call and
   that the helper is shared by list-repos.ts and create-repo.ts. Neither
   is true anymore: list-repos.ts's Code Search approach was replaced by
   the Backend Hardening round's Contents API check, which needs no
   account login at all, and create-repo.ts never imports this module any
   more, only scaffold-repo.ts does. Grepped accountLogin across api/:
   written in one place, read nowhere. This is a real Clean Code violation
   (dead code), and not purely cosmetic: if firstInstallation.account is
   ever null in a real response, getInstallationInfo returns null and
   fails the whole request even though installationId (the only thing any
   current caller reads) was available. Fix: drop accountLogin, the
   account field/type, and its null-check; correct the stale comment.
2. api/list-repos.ts's GET /installation/repositories call has no
   pagination (no per_page or page param). GitHub paginates this endpoint
   by default; an installation covering more than one page of repositories
   will silently never see the extra ones reach the one-year filter or the
   MuunCode-project check, they simply never appear in the picker. Not an
   issue for accounts tested so far, a real latent gap for larger accounts.
3. Same file, unbounded concurrency: the per-repo Contents API existence
   check fires via a single Promise.all with no batching or concurrency
   cap. Fine at today's expected usage, a real scalability/rate-limit risk
   for accounts with many repos covered by the installation.
4. Writing-standard violation, non-code: the real-github-repo-data.md spec
   file (under features/f04_repository_selection_ui/) contains a literal
   em dash around its line 128. CLAUDE.md's Code and Naming Standards
   explicitly states this rule applies to everything under features/, so
   this is a real violation even though it is a spec file, not application
   code. A matching violation in the shared current.md progress file is
   filed once, cross-referenced from review_f05.md, since that file is not
   specific to either feature.

## Gap in CHECKPOINTS.md itself (flagged, not silently ignored)

CHECKPOINTS.md's F04 section has no checkpoint block at all for the "Repo
Creation Backend Hardening" round (bootstrap-empty-repo workaround, forced
master, auto-delete-on-failure, the Code-Search-to-Contents-API swap, the
one-year filter, the double-click guard). The last recorded fast-pass entry
is for "Repository Creation Confirmation Flow" (2026-08-21). This round's
real bug fixes were verified in this review directly against the current
source code and the live end-to-end test the user ran (per impl_f04.md's own
Test/validation output section), not against a written checkpoint list,
because none exists yet for it. CHECKPOINTS.md should gain a matching
section before this feature is considered fully closed out
administratively, independent of this review's APPROVED verdict on the
actual code.
