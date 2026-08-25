# Implementer report: f03 (github_auth)

## Feature implemented

Wires the real "Iniciar con GitHub" flow per `features/f03_github_auth/github-auth.md`:
a GitHub App OAuth flow via two stateless Vercel serverless functions, client-side token
storage with transparent refresh, and a `/auth/callback` view selected without any
routing library.

## Files created

- `backend/package.json`, `backend/pnpm-lock.yaml`: new pnpm-managed package for the
  serverless functions. Generated via `pnpm init` then `pnpm add -D @vercel/node@latest`,
  `pnpm add -D typescript@latest`, `pnpm add -D @types/node@latest` (all through pnpm,
  no hand-typed versions). `@vercel/node` is the official types package for Vercel's
  Node.js runtime (`VercelRequest`/`VercelResponse`); `typescript`/`@types/node` are
  dev-only, used to type-check the two functions locally (see Validation below), not
  required at Vercel's own build/runtime.
- `backend/tsconfig.json`: local-only type-check config for `backend/api` and
  `backend/lib` (`bundler` module resolution, matching how Vercel's own build bundles
  each function; `nodenext` was tried first and rejected, see Decisions below).
- `backend/lib/githubOAuth.ts`: shared helper (`exchangeCodeForTokens`,
  `refreshGitHubTokens`) wrapping the single GitHub token endpoint call both functions
  need, to avoid duplicating the `fetch`/env-var/error-mapping logic. Not under
  `backend/api/`, so it is never picked up as its own route.
- `backend/api/auth-exchange.ts`: `POST { code }` -> exchanges it for tokens via
  `exchangeCodeForTokens`, returns `{ accessToken, refreshToken, expiresIn,
  refreshTokenExpiresIn }` or a generic `502` on failure. Never logs the secret or
  either token (the shared helper's error path also deliberately omits the raw GitHub
  response body from its thrown `Error`, so nothing token-shaped ever reaches a log).
- `backend/api/auth-refresh.ts`: `POST { refreshToken }` -> same response shape via
  `refreshGitHubTokens` (adds `grant_type=refresh_token`).
- `vercel.json` (repo root): exactly the shape given in the spec (`buildCommand: "cd
  front && pnpm build"`, `outputDirectory: "front/dist"`,
  `functions: { "backend/api/*.ts": { "runtime": "@vercel/node" } }`).
- `.env.example` (repo root): `GITHUB_CLIENT_ID=` / `GITHUB_CLIENT_SECRET=`, no values.
- `front/src/lib/githubAuth.ts`: `storeGitHubTokens`, `clearGitHubTokens`,
  `isSignedIn`, and `getAccessToken` (the one function meant to be imported by every
  future GitHub-API-calling feature). Stores `{ accessToken, refreshToken, expiresAt,
  refreshTokenExpiresAt }` under a single `localStorage` key
  (`muuncode.githubAuth`); `expiresAt`/`refreshTokenExpiresAt` are computed once at
  storage time from the API's `expiresIn`/`refreshTokenExpiresIn` seconds-durations.
  `getAccessToken` transparently calls `/api/auth-refresh` and rewrites storage when
  the access token is within a 5-minute safety margin of expiring.
- `front/src/components/templates/AuthCallback/AuthCallback.tsx`,
  `AuthCallback.module.css`, `index.ts`: renders at `/auth/callback`. Reads `code`
  from `window.location.search`, `POST`s it to `/api/auth-exchange`, calls
  `storeGitHubTokens`, then `window.location.replace('/')`. Shows a
  `authCallbackSigningIn`/`authCallbackError` message via `GridBackground` (reused
  atom, already handles `min-height: 100dvh`/`overflow-x: hidden` per the iOS
  guidance). Guards the exchange with a `useRef` flag so React 19 `StrictMode`'s
  dev-only double effect invocation cannot send GitHub's single-use `code` twice.

## Files modified

- `front/src/App.tsx`: reads `window.location.pathname` directly to render
  `AuthCallback` at `/auth/callback` or `LoginScreen` otherwise; no routing library.
- `front/src/components/templates/index.ts`: barrel now also exports `AuthCallback`.
- `front/src/components/templates/LoginScreen/LoginScreen.tsx`: `handleSignIn` now
  navigates to `https://github.com/apps/muuncode/installations/new` (`window.location.href`)
  instead of the `f02` placeholder `console.info`.
- `front/src/locales/en.json`, `front/src/locales/es.json`: added
  `authCallbackSigningIn`/`authCallbackError` keys.
- `.claude/CHECKPOINTS.md`: checked every "F03: GitHub Authentication" item that is
  actually met; left the `feature_list.json` status item unchecked (see Decisions).

## Test/validation output

- `cd front; pnpm build` (twice, before and after the `AuthCallback` `StrictMode`
  guard): both succeeded, `tsc -b && vite build` clean, no type errors.
- `cd front; pnpm lint` (`oxlint`): no findings, before and after the guard change.
- `cd backend; npx tsc -p tsconfig.json --noEmit`: clean, no errors. This is a
  local-only sanity check I added (not part of any checkpoint), since `vercel dev`
  itself was not usable here (see below).
- Grepped the whole repo (excluding `node_modules`) for a literal em dash and for any
  `GITHUB_CLIENT_SECRET=<value>` pattern: no matches in anything I authored; no `.pem`
  file exists anywhere.
- `vercel dev` / real functions test: **not run**. The Vercel CLI is installed
  (`v54.18.7`) but `vercel whoami` fails ("The specified token is not valid. Use
  `vercel login` to generate a new token."), i.e. it is installed but not configured
  in this environment, and logging in requires an interactive browser flow I should
  not perform unilaterally. Per the spec's own instruction ("if `vercel dev` is not
  already installed/configured when this feature is implemented, flag that to the
  lead rather than inventing an alternative local-testing shortcut"), I am flagging
  this instead of substituting a workaround. The two functions were only validated by
  local `tsc` type-checking and manual code review against GitHub's documented OAuth
  token-exchange contract, not by an actual HTTP round trip.

## Decisions made

- **`@vercel/node` as a `backend/package.json` devDependency**: the spec's file layout
  didn't mention a `package.json` for `backend/`, but Vercel's own documented pattern
  for standalone (non-Next.js) TypeScript serverless functions is to type
  `(req: VercelRequest, res: VercelResponse)` from that official package. Installing it
  (via `pnpm init` + `pnpm add`, never hand-typed) follows the "prefer the official
  SDK over a hand-rolled reimplementation" principle instead of inventing a local
  `IncomingMessage`/`ServerResponse` shim. `typescript`/`@types/node` were added
  alongside purely so I could run a real type-check locally, given `vercel dev` was
  unavailable; none of the three affect what actually ships (Vercel's own build strips
  types and does not read `backend/node_modules`'s dev tooling).
- **`backend/tsconfig.json` uses `moduleResolution: "bundler"`, not `"nodenext"`**: I
  tried `nodenext` first (matching `.ts`'s literal Node ESM semantics) and it rejected
  the plain `'../lib/githubOAuth'` import, demanding an explicit `.js` extension.
  Vercel's Node function builder bundles each function (esbuild-based), the same way
  `front/tsconfig.app.json` already uses `"bundler"` for Vite's bundler, so I matched
  that existing convention instead of littering extensionless-import workarounds.
- **Shared `backend/lib/githubOAuth.ts` helper**: the spec describes both functions
  inline without mandating a shared module, but they call the identical GitHub
  endpoint with only the grant params differing; factoring the `fetch`/env-var/error
  handling into one place avoids duplicating the exact code path that touches the
  Client Secret. It lives outside `backend/api/`, so it is not treated as its own route.
- **`vercel.json`'s `functions.runtime` value (`"@vercel/node"`)**: copied verbatim
  from the spec, which itself already flags this shape as unverified against a real
  deployment. I did not substitute a different value (e.g. a Node version string like
  `"nodejs20.x"`), per the spec's explicit instruction not to guess a second shape.
  Flagging this again here since it is the single biggest unverified piece of this
  feature.
- **`front/src/lib/githubAuth.ts` storage shape**: one `localStorage` key holding a
  single JSON object (`accessToken`, `refreshToken`, `expiresAt`,
  `refreshTokenExpiresAt`) rather than four separate keys, so a corrupt/partial read
  can only ever be all-or-nothing (`JSON.parse` failure returns `null` for the whole
  object). Not specified in the spec at that level of detail, called out here for
  traceability.
- **`StrictMode` double-invoke guard in `AuthCallback`**: added a `useRef` flag around
  the exchange call. Not explicitly required by the checkpoint, but `main.tsx` already
  wraps `<App />` in `<StrictMode>` (from `f01`), whose dev-only double effect
  invocation would otherwise fire the single-use GitHub `code` exchange twice.
  Prioritized per the Predictability principle; flagging it here in case the Reviewer
  wants a second opinion on the approach.

## Not implemented (explicitly out of scope, per the spec)

No repo creation, Contents/Git Data API usage, or any file read/write flow: all left
untouched, as instructed.
