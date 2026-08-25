# Additional scope: Local Storage and Commit Model (design decision, not yet implemented)

No dedicated implementation round yet: this file records the storage architecture
decided with the user for how `/lab` will hold in-progress edits before they become a
real GitHub commit. Implementation (the actual IndexedDB layer, wiring real file
content into it, the commit modal's real "push to GitHub" action) is deliberately
deferred to a later round; this round only builds the reusable `IdeModal` shell and
wires two keybindings to open it (see `command-palette-and-modal-system.md`, once that
round lands). Written down now so the decision itself does not get lost while the
modal system is being built first.

## The problem

MuunCode has no backend and no database (per `CLAUDE.md`): the user's code lives only
in their own GitHub repository, read/written via Octokit directly from the browser. The
editor cannot commit on every keystroke (rate limits, one commit per edit would be
noise, and the whole point of a code editor is editing without needing a network round
trip per change). Something has to hold in-progress edits between "the user typed
something" and "the user explicitly chose to commit."

## Research: how other browser-only, no-real-filesystem web IDEs solve this

Real precedent, not invented (per `CLAUDE.md`'s general research discipline, same
spirit as the UI Reference Methodology applied elsewhere in this project):

- **github.dev / vscode.dev** (the most directly comparable case: also no backend of
  its own, also edits a GitHub repo directly through GitHub's API, no real disk):
  every open file is an `IWorkingCopy` with a "dirty" flag (`onDidChangeDirty`,
  `onDidChangeContent`, `onDidSave`). Any content change triggers a backup of the full
  buffer (not a diff) through `IWorkingCopyBackupService`, restorable via `resolve()`
  after a reload; the backup is only cleared once the working copy is actually saved.
  VS Code's own docs explicitly warn that the web build cannot rely on the
  `beforeunload` tab-close event as a real save mechanism, only as a last-resort net.
  `RemoteHub` (the extension github.dev/vscode.dev use to browse a GitHub repo) backs
  its file tree with an in-memory `FileSystemProvider`, not a real disk. If the remote
  repo moved on GitHub while local uncommitted changes exist, VS Code does NOT
  silently overwrite either side: `remoteHub.uncommittedChangesOnEntry` prompts the
  user to reconcile manually.
- **StackBlitz**: a real, documented cautionary example, not a pattern to copy. Users
  have reported StackBlitz doing a silent hard pull on reopen that discarded their
  uncommitted local changes with no warning (github.com/stackblitz/core issues #1822,
  #2725, #936). The lesson: never silently overwrite local edits with remote state.
- **CodeSandbox**: runs in a real VM with a real disk (not comparable to MuunCode's
  constraint directly), but its UX split is still instructive: "Commit" writes to a
  real local git repo inside its own VM; a separate, explicit "Sync changes" action is
  what actually pushes that commit to GitHub. Two distinct steps, not one.
- **localStorage vs IndexedDB**: localStorage caps around 5 MiB per origin and its API
  is synchronous (blocks the main thread on every read/write); IndexedDB's quota is
  far larger (typically hundreds of MB+, browser-managed) and its API is async. This is
  why VS Code web uses IndexedDB for this kind of persistence, never localStorage.

## Decision: per-file "dirty buffer" model in IndexedDB

- One IndexedDB store, one entry per edited file, shaped as:
  ```ts
  interface DirtyFileEntry {
    owner: string
    repo: string
    path: string
    content: string
    baseSha: string // the blob sha this file had when it was last loaded/committed
    updatedAt: string // ISO timestamp
  }
  ```
- Writes to IndexedDB are debounced (not on every keystroke): matches the real
  precedent above, and avoids the perf cost of writing on every character.
- `baseSha` is what makes conflict detection possible: before committing, MuunCode
  re-fetches the branch's current HEAD. If it moved since `baseSha` was captured
  (someone else pushed, or the same user edited from another device/tab), the user is
  warned and asked to reconcile manually, the same posture VS Code's own
  `uncommittedChangesOnEntry` takes, never StackBlitz's silent overwrite.
- Reopening `/lab` for the same repo restores every dirty entry automatically:
  IndexedDB survives a tab close/reload, so the tab-close event is never the only
  thing standing between an edit and losing it, matching VS Code's own explicit
  warning about `beforeunload` not being trustworthy alone.
- Committing reuses this project's own existing git-commit machinery
  (`api/lib/githubGitDataCommit.ts`'s `commitFiles`: blob-per-file -> tree -> commit ->
  ref, already built and proven for `api/scaffold-repo.ts`'s scaffold commit), just
  generalized to accept whatever set of dirty files the commit modal is asked to push,
  instead of the three fixed scaffold files. No new backend commit logic needed.

## Performance & reliability: researched 2025-2026 standards, not guesses

Before building anything, researched what "fast, low-overhead, nearly invisible to the
user" actually means today, with real sources (not general web-dev folklore):

- **IndexedDB confirmed over OPFS** (Origin Private File System,
  `navigator.storage.getDirectory()`). OPFS's synchronous access handles are real and
  measurably faster (a cited benchmark: ~90ms vs ~850ms writing a 100MB buffer), but
  that gain shows up on large/binary payloads (SQLite/DuckDB-shaped workloads); a
  project's own text source files (KB-sized) would not feel it. OPFS's sync API also
  only exists inside a dedicated Web Worker, and has a real, reported reliability gap
  writing files/folders in Safari (eclipse-theia/theia#16107). Not worth the added
  complexity and cross-browser risk for this project's actual file sizes.
- **Never rely on `beforeunload`/`unload` as the save trigger.** Chrome's own Page
  Lifecycle API guidance is explicit: "Never use the `unload` event on modern
  browsers"; `beforeunload` is unreliable, especially on mobile, where a user can
  close the tab/app without any of `beforeunload`, `pagehide`, or `unload` ever
  firing. The real, reliable "flush now" signal is `visibilitychange` transitioning
  to `hidden` (the last reliably observable app state), with `pagehide` as a backup
  for cases `visibilitychange` does not cover. `beforeunload` is only ever attached
  conditionally (while there are unsaved changes) purely as a "you have unsaved
  changes" prompt, never as the save mechanism itself, and removed immediately after
  saving (it also disables the back/forward cache while attached).
- **Debounce: 1000ms**, a real value read directly from VS Code's own current source
  (`workingCopyBackupTracker.ts`'s `DEFAULT_BACKUP_SCHEDULE_DELAYS.default`), not
  invented. (VS Code uses 2000ms only in a specific auto-save-with-short-delay
  configuration, to avoid a race with that separate save path; not relevant here.)
- **Call `navigator.storage.persist()` once when `/lab` loads.** Reduces the risk of
  the browser evicting this origin's storage under disk-space pressure. No user
  gesture needed on Chrome/Safari (both silently approve or reject it based on the
  site's own engagement heuristic); Firefox is the only one that shows an explicit
  prompt. Cheap, fire-and-forget, no UI needed either way.
- Explicitly left out for now (lower priority, no change to this decision):
  `CompressionStream`-based compression before storing, and `scheduler.postTask()`
  for background-priority write scheduling. Both have real 2023+ browser support, but
  add complexity this project's current file sizes and write volume do not yet need;
  revisit if either becomes a real bottleneck later.
- A dedicated Web Worker for the actual IndexedDB write calls: IndexedDB is already
  async and does not block the main thread by itself, but funneling every write
  through a Worker keeps transaction bookkeeping off the main thread and costs little
  to build now, avoiding a refactor later if write volume grows. Adopted, not just
  considered: this project's IndexedDB writes go through a Worker from the start.

## A shared, reusable save-state machine (same pattern as `lib/sessionResolution.ts`)

Per explicit user request: this is not ad hoc `useState` scattered per component, it
is a typed, pure, discriminated-union state machine, the same shape this project
already established for session resolution, so any future persisted concern in the
editor (not just file content) can reuse it instead of re-deriving its own save
lifecycle.

Two separate machines, because they run at genuinely different cadences and answer
different questions:

1. **Per-file buffer state** (`FileBufferStatus`), one instance per open/edited file,
   driven by the debounce + Page Lifecycle triggers above:
   ```ts
   type FileBufferStatus =
     | { status: 'clean' }
     | { status: 'dirty' }
     | { status: 'saving' }
     | { status: 'error'; reason: string }
   ```
   `clean -> dirty` on edit; `dirty -> saving` when the 1000ms debounce fires OR a
   `visibilitychange`/`pagehide` flush is forced early; `saving -> clean` once the
   Worker confirms the IndexedDB write; `saving -> error` on a write failure (e.g.
   quota exceeded), `error -> dirty` on the next edit or an explicit retry. This
   machine only answers "is this file's content safely in IndexedDB", nothing about
   GitHub.
2. **Commit/sync state** (`CommitStatus`), one instance for the commit modal's own
   action, a separate concern answering "can/did the checked subset of dirty files
   become a real GitHub commit":
   ```ts
   type CommitStatus =
     | { status: 'idle' }
     | { status: 'checkingConflicts' }
     | { status: 'conflict'; paths: string[] }
     | { status: 'committing' }
     | { status: 'committed'; commitSha: string }
     | { status: 'error'; reason: string }
   ```
   `checkingConflicts` re-fetches the branch HEAD and compares it against every
   checked file's `baseSha` (see above); a mismatch moves to `conflict` (blocking,
   never a silent overwrite) instead of straight to `committing`.

Both live in `components/LabIDE/` (this is an editor-domain concern, not app-wide),
as plain typed modules + pure transition functions, no state-machine library
dependency: consistent with this project's existing `lib/sessionResolution.ts`
precedent and its general Technology Philosophy bar for adopting a new runtime
dependency.

## Commit modal UX: decided, a hybrid of the two options considered

Settled with the user: option 1 (all-or-nothing) as the base shape, merged with
option 2's per-file checkboxes, rather than either extreme:

- One commit message field, one action, still a single commit, same as pure
  all-or-nothing: no full Source-Control-view-style staging area, no per-file commit
  messages, no multiple commits from one modal session.
- Every dirty file for the active repo is listed with its own checkbox, checked by
  default (so the common case, committing everything, stays a single click). Unchecking
  a file excludes it from THIS commit only; it stays dirty in IndexedDB for a later
  commit, it is never discarded by unchecking it.
- The generalized `commitFiles` call (see above) only receives the checked subset, not
  unconditionally every dirty entry.
- This is deliberately simpler than VS Code's own Source Control view (no staged/
  unstaged distinction, no per-file diffs shown in this modal, no partial-file/hunk
  staging): just enough selectivity to leave an unfinished file out of a given commit,
  without the complexity of real staging.

## Explicitly out of scope for this round

- The actual IndexedDB read/write layer itself (no `lib/dirtyFileStore.ts` or
  equivalent exists yet).
- Wiring real file content into the editor at all (there is no real editor surface
  yet, `IdeEditorWatermark` is still the only thing shown in the editor area).
- The commit modal's real content (file list, commit message field, the actual
  generalized `commitFiles` call): the modal this round only opens an empty/placeholder
  medium-sized `IdeModal`, proving the keybinding -> modal wiring, not the commit flow
  itself.
- Conflict-reconciliation UI (the warning dialog when `baseSha` has moved): designed
  above, not built.
- The Web Worker that owns the actual IndexedDB write calls, and the
  `FileBufferStatus`/`CommitStatus` state machine modules themselves: decided and
  fully specified above, not built.
- `CompressionStream` and `scheduler.postTask()`: explicitly deprioritized, see
  "Performance & reliability" above.

## Checkpoints

- [ ] (Future round) `lib/dirtyFileStore.ts` (or equivalent) exists, backed by
      IndexedDB, one entry per `{ owner, repo, path }`, writes performed inside a
      dedicated Web Worker, debounced 1000ms after the last edit.
- [ ] (Future round) `components/LabIDE/`'s `FileBufferStatus`/`CommitStatus` state
      machines exist as typed discriminated unions + pure transition functions (no
      state-machine library dependency), matching `lib/sessionResolution.ts`'s
      existing pattern.
- [ ] (Future round) A `visibilitychange` (`hidden`) listener force-flushes any
      pending debounced write immediately, with `pagehide` as a secondary fallback;
      `beforeunload` is only ever attached while a file is dirty, purely as a warning
      prompt, and removed right after saving. No code relies on `unload`.
- [ ] (Future round) `navigator.storage.persist()` is called once on `/lab` mount,
      fire-and-forget, no UI gated on its result.
- [ ] (Future round) Opening a file with an existing dirty entry restores it instead of
      re-fetching from GitHub.
- [ ] (Future round) The commit modal lists every dirty file with a checkbox, checked
      by default; only the checked subset is passed to `commitFiles`, unchecked files
      stay dirty in IndexedDB rather than being discarded.
- [ ] (Future round) Committing transitions `CommitStatus` through
      `checkingConflicts` first, re-checking the branch HEAD against every checked
      file's `baseSha`; a moved HEAD moves to `conflict` (blocking, prompts the user)
      instead of silently overwriting.
- [ ] (Future round) A successful commit clears the dirty entries that were actually
      included in the commit (not the unchecked ones) and updates their `baseSha` to
      the new commit's blob shas.
