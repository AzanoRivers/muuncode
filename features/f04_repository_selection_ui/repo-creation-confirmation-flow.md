# Additional scope: Repository Creation Confirmation Flow

Additional round on `f04`, not a new feature, per `CLAUDE.md`'s adjustment-vs-new-
feature rule: this closes out the repository-creation experience (confirmation
step before actually creating, a real two-phase loading sequence for the
creation itself, a single consolidated commit with a proper message) and, for
both the create-new and select-existing paths, hands off to the new destination
registered as feature `f05` (`features/f05_ide_viewer_page/ide-viewer-page.md`):
once a repo is confirmed, the user leaves `/station` entirely and lands on
`/ide`. The user confirmed both paths (select existing, create new) should reach
the same destination once confirmed, for consistency.

## 1. Confirmation step before creating (create-new path only)

Clicking `Siguiente` while the create-new tab is active and the form is valid no
longer calls the creation API immediately. `RepoSelector` instead hides both
accordion sections and shows a small confirmation summary in their place, inside
the same card:

- Tagline/title: "Solicitando confirmación" / "Requesting confirmation".
- Body text (interpolating the typed repo name): "Se creará el siguiente
  repositorio, con el nombre "{name}" y con la estructura de MuunCode. Este
  repositorio podrá eliminarse sin problema desde tu cuenta de GitHub si así lo
  deseas." / "The following repository will be created, named "{name}", with
  MuunCode's own structure. This repository can be deleted from your GitHub
  account at any time without any problem."
- A warning line, using the actual folder name as it exists in the created repo
  (`.MuunCode`, matching `new-repo-scaffold.md`'s real casing, not a lowercase
  guess): "Si eliminas la carpeta .MuunCode, no podrás acceder a este
  repositorio desde MuunCode IDE." / "If you delete the .MuunCode folder, you
  will not be able to open this repository from MuunCode IDE."
- Two actions: `Crear`/`Create` (proceeds), and a smaller secondary `Cancelar`/
  `Cancel` action returning to the normal accordion view without losing the
  already-typed form values (the form's own local state is untouched by this
  toggle, only which VIEW is shown changes).

Selecting an existing repo does NOT get this confirmation step (nothing is being
created, there is nothing irreversible to confirm before), it proceeds straight
to the handoff described in section 3.

## 2. Real two-phase loading, one real network boundary per message

Clicking `Crear` triggers the actual creation, shown via the SAME full-screen
`LaunchLoader` sequence `Station.tsx` already uses for sign-in and the initial
repo-list fetch (not a small in-card spinner): `RepoSelector` unmounts entirely
while this runs, exactly like it already does today whenever `Station`'s status
leaves `'success'`. Two distinct messages, each tied to a REAL, separate network
call boundary (matching this project's own established principle from Round 2 of
`real-github-repo-data.md`: loader text always reflects an actual phase, never a
fabricated timer):

- `"Creando el repositorio..."` / `"Creating the repository..."` while
  `api/create-repo.ts` (see section 4, now doing only the bare `POST
  /user/repos` call) is in flight.
- `"Ajustando parámetros lunares..."` / `"Adjusting lunar parameters..."` while
  the new `api/scaffold-repo.ts` (see section 4) is in flight.

A failure at either phase transitions `Station` to its existing full-screen
`'error'` status (no new error UI needed). Success proceeds to section 3's
handoff.

## 3. Handoff to `/ide` (feature `f05`)

Both paths end the same way once confirmed successful: a real, full-page
navigation (`window.location.href`, this project's only navigation mechanism,
no client-side router) to `/ide?owner={owner}&repo={name}` (both URL-encoded).
This is the contract `f05`'s `IdeViewer` page reads on its own mount (see that
feature's spec for what it does with these two values). `Station.tsx`'s
`'success'` branch stops rendering the `"Aquí Houston, luz verde"` tagline
`Badge` and the sign-out `Button`: that pairing was explicitly commented in the
existing code as "still needed for manual testing until a real IDE view exists
to navigate to instead" -- that real destination now exists, so this pairing
moves to become `f05`'s own initial stub content instead (see that feature's
spec), and `Station`'s `'success'` branch becomes just `BrandTitle` +
`RepoSelector`, nothing else.

Because of this, `Repo` (the shared frontend type in `front/src/lib/
githubRepos.ts`) needs an `owner: string` field it does not have today: both
`api/list-repos.ts` and `api/create-repo.ts` already have this value available
from GitHub's own response (each repository object includes an `owner.login`),
they simply are not including it in their own trimmed response shape yet.

## 4. Backend: split `create-repo.ts` in two, consolidate the scaffold into one real commit

`api/create-repo.ts` currently does everything in one request: create the bare
repo, commit the three scaffold files as three separate Contents-API commits,
then attempt to add the repo to the installation. This round splits it into two
endpoints, matching the two loader phases in section 2 (the frontend needs two
separate awaited calls to actually show two distinct, honest loading phases):

- **`api/create-repo.ts`** (trimmed down): only `POST /user/repos` (still
  `auto_init: false`, unchanged from `new-repo-scaffold.md`) with `{ name,
  description, private: isPrivate }`. Responds with `{ id, name, owner, private,
  pushedAt, defaultBranch }` (adds `owner`/`defaultBranch` to what it already
  returns; `defaultBranch` comes from GitHub's own creation response, e.g.
  `"main"`, needed by the next endpoint so it does not need a second GitHub
  round-trip just to look this up).
- **`api/scaffold-repo.ts`** (new): body `{ accessToken, owner, name,
  description, defaultBranch }`. Does everything `create-repo.ts` used to do
  AFTER creation:
  1. Commits `.MuunCode/workspace.json`, `README.md`, and `GREETINGS.md` as
     **one single real git commit**, not three separate ones, via GitHub's Git
     Data API (this repo has zero commits yet, so there is no `base_tree` to
     build on): `POST .../git/blobs` once per file (base64 content) -> `POST
     .../git/trees` with all three blob entries, no `base_tree` -> `POST
     .../git/commits` with that tree and no `parents` (this is the very first
     commit) -> `POST .../git/refs` creating `refs/heads/{defaultBranch}`
     pointing at that commit (there is no existing ref to `PATCH`, since the
     repository had no commits before this). The commit message, exactly:
     `"MuunCode: Foundation - Houston, repo {name} successfully created"` (the
     user's own wording had "Fundation", corrected to "Foundation" here since
     this becomes permanent, repeated text in every single MuunCode project's
     git history, unlike `GREETINGS.md`'s personal, one-off authored voice
     which stays exactly as originally written).
  2. The existing "add repo to installation" step (unchanged logic, just moved
     here from the old single-endpoint version), still tolerated as a no-op
     when the installation already covers all repositories.
  A failure at the git-commit step or the installation-add step responds with a
  clear error status (502, matching this project's existing pattern), never a
  thrown exception, and never attempts to delete the already-created repository
  (creating this repo was already confirmed by the user in section 1; an
  incomplete scaffold is a real problem to surface, not to silently paper over
  or to "fix" by deleting something the user explicitly asked for).
- `api/lib/repoScaffoldTemplates.ts`/`api/lib/githubContentCommit.ts` (from
  `new-repo-scaffold.md`): `githubContentCommit.ts`'s single-file-PUT approach
  is superseded by the new Git Data API flow above; a new `api/lib/
  githubGitDataCommit.ts` (or similar) replaces it, exporting the blob/tree/
  commit/ref sequence as one function, e.g. `commitFiles(accessToken, owner,
  repo, defaultBranch, message, files: { path: string; content: string }[]):
  Promise<boolean>`. `repoScaffoldTemplates.ts`'s three template-building
  functions are unaffected (only how their output gets committed changes).

## Explicitly out of scope for this round

- Anything about what `/ide` actually shows beyond its stub content: that is
  `f05`'s own, separate spec.
- Retrying a failed creation without losing the confirmation step's already-
  typed values (a failure just returns to the full-screen error screen with its
  existing "sign in again" / "back" actions, same as any other Station error
  today; a more targeted "try again with the same values" flow is a possible
  future polish, not required now).

## Checkpoints

- [ ] Clicking `Siguiente` in create mode shows the confirmation summary
      (tagline, interpolated body text, the `.MuunCode` warning, `Crear`/
      `Cancelar` actions) instead of immediately calling the creation API;
      `Cancelar` returns to the accordion view without losing the form's
      already-typed values.
- [ ] Clicking `Crear` shows `Station`'s existing full-screen `LaunchLoader`
      (RepoSelector unmounts), with the message switching between `"Creando el
      repositorio..."` and `"Ajustando parámetros lunares..."` at the real
      boundary between the two backend calls, not on a fixed timer.
- [ ] `api/create-repo.ts` only creates the bare repository now; `api/scaffold-
      repo.ts` (new) commits all three scaffold files as ONE real git commit via
      the Git Data API (blob x3 -> tree -> commit -> ref), with the exact
      message `"MuunCode: Foundation - Houston, repo {name} successfully
      created"`, then performs the existing "add to installation" step.
- [ ] A failure in either endpoint reaches `Station`'s existing full-screen
      `'error'` status. Superseded: a scaffold-commit failure specifically now
      DOES delete the created repository automatically (explicit user decision,
      overriding this round's original choice not to, see
      `api/lib/githubDeleteRepo.ts`), since a repo with zero MuunCode structure
      is orphaned clutter with no path back into the app's own repo list.
- [ ] `Repo`'s type (and both API endpoints' responses) include `owner`;
      selecting an existing repo and confirming a new one both end in the same
      real navigation to `/ide?owner={owner}&repo={name}` (URL-encoded).
- [ ] `Station.tsx`'s `'success'` branch no longer renders the `"Aquí Houston,
      luz verde"` tagline `Badge` or the sign-out button; both move to become
      `f05`'s `IdeViewer` stub content instead (verify against that feature's
      own checkpoints).
- [ ] No em dash, no `throw`, no new literal color/spacing value outside
      `tokens.css`, no new runtime dependency.
- [ ] `pnpm build` and `pnpm lint` (from `front/`) pass; root `pnpm exec tsc
      --noEmit` passes.
