# F05: IDE Viewer Page (Stub)

## Objective

A genuinely new phase, per the user's own framing when requesting this: `/station`
has, until now, only ever been about getting a developer signed in and pointed at
a repository (auth, installation, repo selection/creation). Once a repository is
actually confirmed (selected or freshly created, see `f04`'s
`repo-creation-confirmation-flow.md`), the user needs somewhere real to land: this
feature registers that destination, `/ide`, as its own page. This round is
explicitly a **stub**: no editor, no file tree, no Monaco, no `dockview` panels.
Those are real, separately-planned future rounds of this same feature ("lo grande
y pesado que ya es el editor", in the user's own words) once this stub exists to
build them into.

## What this stub actually does

- A new route, `/ide`, added to `App.tsx`'s existing `window.location.pathname`
  based view-picking (no routing library, per this project's established
  Simplicity-driven precedent; see `Station`'s own comment on why).
- A new page component, `IdeViewer` (`front/src/components/pages/IdeViewer/`,
  matching this project's existing Atomic Design `pages/` convention), reads
  `owner`/`repo` from `window.location.search` on mount (the query-string
  contract `f04`'s confirmation flow writes when it navigates here via
  `window.location.href`; there is no client-side router to pass this through
  any other way, and no server-side session to persist it in either, per this
  project's own already-decided "no database" architecture).
- Content: this round explicitly reuses what `Station.tsx`'s `'success'` branch
  used to show above `RepoSelector` (the `"Aquí Houston, luz verde"` tagline
  `Badge` and the sign-out action), per the user's own direction to relocate
  that pairing here rather than invent new content from nothing: `BrandTitle`,
  the same tagline `Badge` (`stationSuccess` key, unchanged), a small line
  identifying which project is now open (e.g. `"Proyecto abierto: {owner}/
  {repo}"` / `"Project open: {owner}/{repo}"`, a new i18n key with
  interpolation), and the same sign-out `Button` (`handleSignOut`: clear stored
  tokens, navigate back to `/`, identical logic to `Station`'s own existing
  `handleSignOut`).
- If `owner`/`repo` are missing from the query string (someone navigated to
  `/ide` directly with no params, e.g. typed it by hand), this is a real,
  guard-worthy edge case, not a crash: fail toward `NotFound` (reuse the
  existing page as-is) rather than rendering a broken/empty stub.

## Explicitly out of scope for this round

- The actual editor: Monaco, `dockview` panel layout, file tree, GitHub
  Contents/Git Data API read/write for the open repository's files, any
  device/display selection UI (which is what `.MuunCode/workspace.json`'s
  currently-`null` `device`/`display` fields are waiting for). All of this is
  real, substantial future work belonging to later rounds of this same
  feature, once this stub page and its `owner`/`repo` contract exist to build
  on top of.
- Verifying the signed-in user's access token is still valid on this page (it
  already was, moments earlier, on `/station`, immediately before this
  navigation happened); a dedicated session-refresh concern for this page can
  be added once it actually calls any GitHub API itself.

## Checkpoints

- [ ] `App.tsx`'s `CurrentView` routes `/ide` to a new `IdeViewer` page.
- [ ] `IdeViewer` reads `owner`/`repo` from `window.location.search`; if either
      is missing, renders `NotFound` instead of a broken/empty stub.
- [ ] `IdeViewer` renders `BrandTitle`, the same `stationSuccess`-keyed tagline
      `Badge`, a new interpolated "project open" line showing `owner`/`repo`,
      and a sign-out button with the same behavior as `Station`'s existing
      `handleSignOut` (clear tokens, navigate to `/`).
- [ ] `Station.tsx`'s `'success'` branch has already dropped this same tagline/
      sign-out pairing (tracked as a shared checkpoint with `f04`'s
      `repo-creation-confirmation-flow.md`, verify both sides landed together,
      not just one).
- [ ] No em dash, no `throw`, no literal color/spacing value outside
      `tokens.css`, `@/` path alias imports with barrels (a new `pages/
      IdeViewer/index.ts`, and `pages/index.ts` re-exporting it).
- [ ] `pnpm build` and `pnpm lint` (from `front/`) pass.
