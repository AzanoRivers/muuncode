# Additional scope: Session Resolution State Machine + /ide -> /lab Rename

Additional round on `f05`, not a new feature, per `CLAUDE.md`'s adjustment-vs-new-
feature rule: renames the stub route/page from this feature's original round
(`/ide` / `IdeViewer`) to `/lab` / `LabViewer`, and introduces a shared,
reusable "given whatever is already stored locally, what screen does this land
on" state machine, per the user's explicit request.

## 1. The problem with the original `/ide` round

`IdeViewer` read `?owner=&repo=` from the URL, written there by `Station.tsx`'s
own full-page navigation. This only worked as the tail end of that one
navigation; a direct visit to `/ide` (bookmarked, reloaded, typed manually)
had no way to know which project was active, and Home's own "Entrar a
MuunCode" button had no way to skip `/station` even when the user's session,
installation, and active project were all already valid.

## 2. `lib/activeProject.ts`: persisting the active project client-side

Mirrors `lib/githubAuth.ts`'s own pattern (client-side only, no database, per
`CLAUDE.md` -> "Configuration and Preferences"): `localStorage` key
`muuncode.activeProject`, storing `{ owner, name }`. `storeActiveProject`
(called by `Station.tsx` right before navigating, both on select-existing and
on a successful create-new), `readActiveProject` (parses defensively, `null`
on anything malformed, never throws), `clearActiveProject` (called on sign-out
alongside `clearGitHubTokens`, so a signed-out session never leaves a stale
active project behind for the next sign-in).

## 3. `lib/sessionResolution.ts`: the shared state machine

`resolveSession(): Promise<SessionResolution>` chains exactly the sequence
`Station.tsx`'s own returning-visitor branch already ran ad hoc:

1. `isSignedIn()` (cheap, local expiry check) -> `unauthenticated` if it fails.
2. `getAccessToken()` (forces a real refresh attempt) -> `unauthenticated` if
   it fails.
3. `checkHasInstallation(accessToken)` -> `error` on a network/parse failure,
   `needsInstall` if the App genuinely is not installed.
4. `readActiveProject()` -> `noProject` if nothing is stored yet.
5. Otherwise `ready`, carrying both `accessToken` and the resolved `project`.

A discriminated union (`SessionResolution`), not a bare boolean/string, so
every caller gets exactly the data it needs for whichever branch it lands on,
typed. Never throws, same convention as the modules it composes
(`githubAuth.ts`/`githubInstallation.ts`).

Explicitly does NOT handle the GitHub OAuth `code` exchange itself (the
one-time redirect back from GitHub): only `Station.tsx`'s own mount effect
ever sees that `code`, and it is fundamentally a one-shot event, not a
"resolve whatever is already stored" check. `Station.tsx`'s own internal
flow was intentionally left as-is rather than refactored to call
`resolveSession()` internally, to avoid risking its already-approved
behavior; it also still needs to load the repo list for `RepoSelector`, which
`resolveSession()` has no reason to do.

## 4. `/ide` -> `/lab`, `IdeViewer` -> `LabViewer`

- Folder renamed: `components/pages/IdeViewer/` -> `components/pages/LabViewer/`.
- `App.tsx`'s route check: `/ide` -> `/lab`.
- `LabViewer` no longer reads query params. On mount, calls `resolveSession()`:
  anything short of `ready` bounces to `/station` (which already renders every
  non-ready case: sign-in, install, error, or the repo picker itself, so
  `LabViewer` never needs to duplicate that UI). `ready` renders the same
  stub content as before (tagline badge, "Proyecto abierto: owner/repo" line,
  sign-out button), now reading `owner`/`name` from the resolved project
  instead of the URL.
- Locale keys: `ideProjectOpen` -> `labProjectOpen`; new `labResolvingLabel`
  ("Verificando sesión..." / "Checking session...") for the brief resolving
  state before the stub content (or the bounce to `/station`) is decided.

## 5. Home's "Entrar a MuunCode" button

`handleEnterStation` is now async: on click, runs `resolveSession()` and
navigates to `/lab` only if the result is `ready` (session + token +
installation + an already-active project, all valid); every other outcome
goes to `/station` instead, exactly like before. The button disables itself
while resolving (`isResolving` state) so a slow network can't be clicked
twice. The existing cheap `isSignedIn()` check still decides which
label/icon to show (sign-in vs enter); it does not by itself decide the
destination anymore, `resolveSession()` does that for real on click.

## Explicitly out of scope for this round

- Refactoring `Station.tsx`'s own returning-visitor branch to call
  `resolveSession()` internally (see section 3's reasoning).
- Anything about what `/lab` actually shows beyond this stub content: still
  this feature's own separate, later work (Monaco/dockview/file tree).

## Checkpoints

- [x] `lib/activeProject.ts` exists (`storeActiveProject`/`readActiveProject`/
      `clearActiveProject`), `localStorage` key `muuncode.activeProject`,
      never throws.
- [x] `lib/sessionResolution.ts` exists, exports `resolveSession()` returning
      the 5-state discriminated union described above, never throws.
- [x] `/ide` route and `IdeViewer` folder no longer exist; `/lab` and
      `LabViewer` exist in their place, registered in `App.tsx` and the
      `pages/` barrel.
- [x] `LabViewer` reads no query params; resolves via `resolveSession()` on
      mount, bounces to `/station` on anything short of `ready`.
- [x] `Station.tsx` calls `storeActiveProject` before both navigations to
      `/lab` (select-existing, create-new); `handleSignOut`-equivalent paths
      (`LabViewer`'s own sign-out) call `clearActiveProject` alongside
      `clearGitHubTokens`.
- [x] Home's `handleEnterStation` is async, calls `resolveSession()`, and
      only reaches `/lab` on `ready`.
- [x] No em dash, no `throw`, no new literal color/spacing value, no new
      runtime dependency.
- [x] `pnpm build` and `pnpm lint` (from `front/`) pass; root `pnpm exec tsc
      --noEmit` passes.
