# Additional scope: Session Lifecycle and Sign-In Flow Correctness

Written retroactively. Three real bugs, found by the user actually clicking through
the flow (not by guessing), each fixed with an empirically-verified root cause rather
than a second guess.

## Bug 1: signing back in after sign-out reached GitHub's installation-management page

`handleSignIn` originally always pointed at
`https://github.com/apps/muuncode/installations/new`. That URL combines install +
authorize, but only usefully so the *first* time: once the App is already installed
for a GitHub account, hitting it again does not repeat the OAuth handshake, it just
shows GitHub's own "manage this installation" page (with an uninstall button) instead
of redirecting back with a fresh `code`. Signing out of MuunCode only clears local
tokens, it does not uninstall the App on GitHub's side, so this bug reproduced every
time.

The correct GitHub endpoint for "just sign in again, don't touch the installation" is
the plain OAuth authorize endpoint, which always re-issues a `code` regardless of
installation state:

```
https://github.com/login/oauth/authorize?client_id=<CLIENT_ID>&redirect_uri=<REDIRECT_URI>
```

## Bug 2: that fix alone would have broken on a second device/browser

An earlier version of this fix decided which URL to use based on a flag stored in
`localStorage` ("has this browser ever completed the combined flow before"). That is
wrong: installation state lives on GitHub's account, not in one browser's storage. A
different browser, a different computer, or a cleared `localStorage` would all look
like "never installed" even when the GitHub account genuinely already has the App
installed, reproducing bug 1 again on any second device.

The real fix removes that local heuristic entirely. `front/src/lib/githubSignInUrl.ts`
now **always** points at the plain authorize endpoint. Whether the user still needs to
install the App is answered by asking GitHub directly, described next.

## Bug 3: verifying the session must ask GitHub for real, not just check a timestamp

`front/src/lib/githubAuth.ts`'s `isSignedIn()` only checked whether *something* was
stored, with no expiry check at all. Fixed to compare against the stored
`refreshTokenExpiresAt` (GitHub App refresh tokens last up to 6 months of regular use,
access tokens only 8 hours) and clear the stored session if it has passed. This is
still only a cheap, local, no-network check, good enough for deciding what a button
should say, never proof the session actually still works: GitHub can revoke it
server-side at any time (e.g. the user uninstalls the App), which no local timestamp
can see. `Station.tsx`'s no-`code` branch (an already-signed-in user landing on
`/station` directly) calls `getAccessToken()` for real (which attempts a refresh) to
get a genuine answer before ever showing the success screen.

## New: does this GitHub account actually have the App installed?

Neither of the above proves the App has repo access. `api/check-installation.ts`
(no Client Secret needed, just the user's own access token) calls GitHub's
`GET /user/installations` and returns `{ hasInstallation: boolean }`.
`front/src/lib/githubInstallation.ts`'s `checkHasInstallation()` wraps that call for
the front. `Station.tsx` calls it after every successful token acquisition (fresh
exchange or existing-session refresh) and branches:

- `hasInstallation: true` → the real success screen ("Houston, luz verde.").
- `hasInstallation: false` → a distinct "one step left" screen prompting the user to
  install the App (`GITHUB_INSTALL_URL`, the same `/installations/new` URL, correctly
  used here since an installation genuinely does not exist yet).
- the check itself failing (network error) → the error screen, never a silent
  false-success.

## Checkpoints

- [x] `githubSignInUrl()` always returns the plain
      `https://github.com/login/oauth/authorize` URL; no `localStorage`-based
      heuristic decides between "install" and "authorize" URLs.
- [x] `GITHUB_INSTALL_URL` (`/installations/new`) is only ever used on the dedicated
      "needs install" screen, confirmed by `api/check-installation.ts`'s real answer,
      never on the general sign-in button.
- [x] `isSignedIn()` checks `refreshTokenExpiresAt` and clears the stored session if
      it has passed; it is documented as a cheap local check, not proof the session
      works.
- [x] `Station.tsx` always calls `checkHasInstallation()` after acquiring a token
      (fresh exchange or existing-session path) before ever reaching the success
      screen.
- [x] `api/check-installation.ts` goes through `applyDevCors` like the other two
      functions, and never receives or needs the Client Secret.
- [x] `pnpm build` and `pnpm lint` pass.
