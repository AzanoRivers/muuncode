# Additional scope: New Repository Scaffold

Additional round on `f04`, not a new feature, per `CLAUDE.md`'s adjustment-vs-new-
feature rule: this extends `api/create-repo.ts` (already built in
`real-github-repo-data.md`) so a freshly created repository comes out already
matching the "MuunCode project" shape `list-repos.ts` filters for (per
`real-github-repo-data.md`'s Round 3), instead of being an empty shell that would
not even show up in the user's own repo list on a future visit.

## What gets created, and why

Three files, committed right after `POST /user/repos` succeeds:

1. **`.MuunCode/workspace.json`**: the same project-config file
   `real-github-repo-data.md`'s Round 3 already filters the existing-repo list by
   (per `CLAUDE.md` -> "Configuration and Preferences"). Its presence is what makes
   this new repo immediately show up as a MuunCode project on a future visit.
   Content is deliberately minimal for this round: device/display selection is not
   a feature that exists yet (no IDE view to configure them in), so this file only
   needs a valid, versioned skeleton future features can read and extend, not a
   fully-populated schema built ahead of the feature that will actually need it
   (no premature abstraction):
   ```json
   {
     "muunCodeVersion": 1,
     "name": "<repo name>",
     "device": null,
     "display": null,
     "createdAt": "<ISO timestamp of creation>"
   }
   ```
2. **`README.md`**: replaces GitHub's own default `auto_init` README entirely (see
   "Architecture" below: this round stops using `auto_init: true`). A bilingual
   template, English primary section first, Spanish secondary section second (per
   the user's explicit reasoning: English first as the primary audience, Spanish
   second for MuunCode's own large Spanish-speaking community), with a small
   in-page index linking both sections, and prompts under each heading (not blank
   headings) inviting the user to actually fill in their project's specifics:
   which device/board this targets, what the final display/screen looks like, and
   the project's purpose. The repo's own `name` becomes the H1; if the user typed a
   `description` in `CreateRepoForm`, it becomes a tagline right under the H1;
   if left blank, that line is simply omitted (never a literal "undefined" or
   empty placeholder line).
3. **`GREETINGS.md`**: a fixed, unchanging welcome note, identical across every
   new project (not interpolated with any per-project data, unlike `README.md`).
   English translation first, the founder's own original Spanish text second
   (mirroring `README.md`'s English-primary/Spanish-secondary order for
   consistency across the scaffold, even though the original note was written in
   Spanish first). Exact Spanish text, verbatim, byte-for-byte as given by the
   user:
   > Hola! Soy AzanoRivers y me emociona pensar que estás construyendo algo
   > increible. MuunCode está pensado para ayudar a personas que quieran crear
   > tecnología y ponerla a manos de todos, de forma tan rapida que salga de
   > nuestro planeta y llegue a la luna. El cielo no es el limite, pero sí las
   > tecnologías actuales, son lentas, dificiles de aprender, de manejar, por eso
   > MuunCode está diseñado para que con tecnologías web, faciles e intuitivas de
   > usar, puedas construir soluciones que puedan llegar a todos los sectores.
   >
   > Te deseo muchos exítos en lo que sea que estés construyendo, piensa alto,
   > construye en grande. Con Corazón Colombiano, AzanoRivers.

   English version (a faithful translation, not present anywhere yet, written for
   this round): "Hello! I'm AzanoRivers, and it excites me to think you're
   building something incredible. MuunCode exists to help people who want to
   create technology and put it in everyone's hands, fast enough to leave our
   planet and reach the Moon. The sky isn't the limit, but today's technologies
   are: slow, hard to learn, hard to work with. That's why MuunCode is built so
   that, with easy and intuitive web technologies, you can build solutions that
   can reach every sector. I wish you great success in whatever you're building:
   think big, build bigger. With Colombian heart, AzanoRivers."

## Architecture: stop using `auto_init`, commit the scaffold files directly

`real-github-repo-data.md`'s Round 1 set `auto_init: true` specifically so the new
repo would not be a zero-commit, branch-less shell. This round supersedes that
choice: since real content is being committed immediately anyway, `auto_init`
becomes `false`, and the three files above are written via GitHub's Contents API
(`PUT /repos/{owner}/{repo}/contents/{path}`, one call per file, each with
base64-encoded content and a commit message) right after creation. Creating a
file via this endpoint on a repository with no branches yet automatically creates
the default branch on that first commit, so this achieves the exact same
"never an empty shell" outcome the original `auto_init: true` choice was for,
just with MuunCode's own scaffold as the initial content instead of GitHub's
generic default README. All three PUTs use the user's own OAuth access token
(the same one `api/create-repo.ts` already has, a plain user-to-server call, no
installation token needed for this, same as the repo-creation call itself).

## New/changed files

- `api/lib/repoScaffoldTemplates.ts` (new): exports `buildWorkspaceConfig({ name,
  createdAt })`, `buildReadme({ name, description })`, and a fixed
  `GREETINGS_MD` string constant, each returning the exact file content (as a
  string) to commit. Keeps this static template content out of
  `create-repo.ts` itself, which stays focused on orchestrating the actual API
  calls.
- `api/lib/githubContentCommit.ts` (new): wraps a single `PUT /repos/{owner}/
  {repo}/contents/{path}` call (`{ message, content: <base64> }` in the body),
  used three times by `create-repo.ts`. Returns `true`/`false` (never throws),
  following this project's existing `api/lib/*.ts` pattern (see
  `githubAppAuth.ts`/`githubInstallationId.ts` for the exact shape/tone to
  match).
- `api/create-repo.ts`: change `auto_init: true` to `auto_init: false`; after a
  successful `POST /user/repos`, commit the three scaffold files in sequence
  (order: `.MuunCode/workspace.json` first, so the repo qualifies as a MuunCode
  project from its very first commit onward, then `README.md`, then
  `GREETINGS.md`) using the repo's own `owner`/`name` from the creation response.
  If any of the three commits fails, this is a real problem (the repo now exists
  on GitHub but is missing part of its expected scaffold): respond with a clear
  error status rather than silently reporting success, but do NOT attempt to
  delete/roll back the already-created repository (deleting a user's repository
  automatically, without their explicit action, is exactly the kind of
  destructive, hard-to-reverse operation this project's own safety guidance
  avoids taking unilaterally); the existing "add to installation" step (from
  Round 1) still runs after the scaffold commits, tolerated as a no-op exactly as
  it already is today.

## Explicitly out of scope for this round

- Any real device/display selection UI or logic: `.MuunCode/workspace.json`'s
  `device`/`display` fields stay `null` until that future feature exists.
  Because of this, this repo will not need to be handled specially by the
  filter in Round 3 (a `null` device/display does not affect whether the file
  exists, and existence is Round 3's whole check).
- Retroactively scaffolding this structure into repositories that already exist
  on the user's GitHub account (this round only affects newly created repos
  going forward).
- Any UI change to `CreateRepoForm` itself: it already collects `name`/
  `description`/`isPrivate`, all this round needs.

## Checkpoints

- [ ] `api/lib/repoScaffoldTemplates.ts` exists with the three exports described
      above; `GREETINGS_MD`'s content matches the user's original Spanish text
      verbatim (no wording changes) plus the English translation given above,
      English section first.
- [ ] `api/lib/githubContentCommit.ts` exists, wraps a single Contents-API PUT
      call, returns `true`/`false`, never throws.
- [ ] `api/create-repo.ts` uses `auto_init: false` (no longer `true`); commits
      `.MuunCode/workspace.json`, then `README.md`, then `GREETINGS.md`, in that
      order, using the user's own access token.
- [ ] `.MuunCode/workspace.json`'s content matches the schema above exactly
      (`muunCodeVersion`, `name`, `device: null`, `display: null`, `createdAt`).
- [ ] `README.md` has the repo name as its H1, the user's description as an
      optional tagline directly under it (omitted cleanly if blank, no literal
      empty/undefined line), an index linking both language sections, English
      section first with prompts under each heading (device/display/purpose),
      Spanish section second mirroring the same structure.
- [ ] A failure partway through committing the three scaffold files results in
      a clear error response, not a silently-reported success; the repository
      itself is never deleted/rolled back automatically.
- [ ] The existing "add repo to installation" step (Round 1) still runs after
      the scaffold commits.
- [ ] No em dash, no `throw`, no new literal color/spacing value (this round is
      backend-only, no new UI), no new runtime dependency (base64 encoding is
      built into Node's `Buffer`, already available in the Vercel Node runtime).
- [ ] `pnpm build` and `pnpm lint` (from `front/`) pass; root `pnpm exec tsc
      --noEmit` passes.
