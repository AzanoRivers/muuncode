# F03: GitHub Authentication

Wires the real "Iniciar con GitHub" flow, replacing the placeholder `console.info` handler
from `f02`. Implements exactly the architecture already decided in `CLAUDE.md` ->
"Authentication and Account Creation": a GitHub App, two stateless Vercel serverless
functions for the parts that need the Client Secret, and client-side token storage. No
GitHub API calls beyond the login/token flow itself in this feature (repo creation,
file read/write, etc. are separate future features).

## GitHub App (already created by the user, outside this repo)

- Name: `MuunCode`, App ID `4511196`, public page `https://github.com/apps/muuncode`.
- Permissions: `Contents: Read & write`, `Administration: Read & write` (needed by a
  later feature to create a repo from scratch; harmless to have now), `Metadata:
  Read-only` (mandatory).
- `Expire user authorization tokens`: enabled (issues a `refresh_token`).
- `Request user authorization (OAuth) during installation`: enabled (combines
  install + authorize into one step).
- Callback URL: `http://localhost:5173/auth/callback` (dev). A production callback URL
  must be added to the same App once a real domain exists (GitHub Apps support
  multiple callback URLs on one App, no separate App needed per environment).
- Client ID, Client Secret, and the private key `.pem` already exist and are held by
  the user outside this repository. Only the Client ID is safe to reference by value;
  the Client Secret is referenced only as an environment variable name, never a
  literal, anywhere in code, specs, or commits.

## Repository layout this feature introduces

`backend/` is created for the first time (per `CLAUDE.md` -> "Repository layout",
this was explicitly deferred until the feature that needed it):

```
MuunCode/
├── front/                     (unchanged)
├── backend/
│   └── api/
│       ├── auth-exchange.ts   (POST: code -> access_token + refresh_token)
│       └── auth-refresh.ts    (POST: refresh_token -> new access_token)
├── vercel.json                (new: routes Vercel's build/functions across
│                                front/ and backend/, see below)
└── .env.example                (new: documents the required env var names, no values)
```

### Why `vercel.json` is needed

Vercel's default convention expects serverless functions under `api/` at the deployed
project's root. Since the actual site (the built Vite SPA) lives in `front/`, not the
repo root, and `backend/` is a sibling of `front/` (per `CLAUDE.md`, deliberately not
nested inside `front/`), a root-level `vercel.json` is required to tell Vercel: build
`front/` as the static site (`front/dist` as the output), and treat `backend/api/*.ts`
as the serverless functions. Exact `vercel.json` shape:

```json
{
  "buildCommand": "cd front && pnpm build",
  "outputDirectory": "front/dist",
  "functions": {
    "backend/api/*.ts": { "runtime": "@vercel/node" }
  }
}
```

This has not been verified against a real Vercel deployment yet (no production deploy
exists so far). Flag to the lead if `vercel dev` or an actual deploy shows this routing
does not work as written; do not silently guess a second config shape.

## `backend/api/auth-exchange.ts`

- Method: `POST`. Body: `{ code: string }` (the `code` GitHub appended to the callback
  URL's query string).
- Calls `https://github.com/login/oauth/access_token` with `client_id`,
  `client_secret` (from `process.env.GITHUB_CLIENT_ID` /
  `process.env.GITHUB_CLIENT_SECRET`), and `code`.
- Returns `{ accessToken, refreshToken, expiresIn, refreshTokenExpiresIn }` to the
  browser (field names camelCased on our side; GitHub's own response uses
  `access_token`/`refresh_token`/`expires_in`/`refresh_token_expires_in`, this function
  translates).
- Never logs the Client Secret or either token.

## `backend/api/auth-refresh.ts`

- Method: `POST`. Body: `{ refreshToken: string }`.
- Calls the same GitHub endpoint with `grant_type=refresh_token` and
  `refresh_token=<refreshToken>`, plus the same `client_id`/`client_secret`.
- Returns the same shape as `auth-exchange.ts`.

## Frontend wiring

- `front/src/components/templates/LoginScreen/LoginScreen.tsx`: `handleSignIn` no
  longer just logs; it navigates the browser to
  `https://github.com/apps/muuncode/installations/new` (the combined install+authorize
  entry point, chosen over hand-building the OAuth `authorize` URL directly, since it
  guarantees the App is installed on at least one repo/account before any API call
  needs that access, per the note already in `icon-spacing-scrollbar-swap.md`'s prior
  research this session).
- New route/page: `front/src/components/templates/AuthCallback/` (or equivalent),
  rendered when the app loads at `/auth/callback`. Reads `code` from
  `window.location.search`, `POST`s it to `/api/auth-exchange`, stores the resulting
  tokens (and an expiry timestamp computed from `expiresIn`) in `localStorage`, then
  redirects to `/`.
- A small helper (e.g. `front/src/lib/githubAuth.ts`) that reads the stored tokens,
  and if the access token is expired (or within some safety margin of expiring),
  calls `/api/auth-refresh` before returning a usable token to callers. This is what
  every future GitHub-API-calling feature will import, not raw `localStorage` reads.
- No routing library is introduced for this (per `CLAUDE.md`'s existing "no URL-based
  locale routing" precedent and Simplicity principle): reading `window.location.pathname`
  directly to decide whether to render `LoginScreen` or `AuthCallback` is enough for
  this one route.

## Environment variables

`.env.example` at the repo root (committed, no real values):
```
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

The user creates their own `.env.local` (already covered by `.gitignore`) with the
real Client ID/Secret from the GitHub App they created. Local testing of the two
serverless functions requires the Vercel CLI (`vercel dev`), since Vite's own dev
server does not execute `backend/api/*.ts`. If `vercel dev` is not already installed/
configured when this feature is implemented, flag that to the lead rather than
inventing an alternative local-testing shortcut that would diverge from how it
actually runs in production.

## Explicitly out of scope for this feature

- Creating a repository from scratch after login (a real, wanted feature, discussed
  with the user, and the reason `Administration` was added to the GitHub App's
  permissions now) is its own future feature, built once login itself works end to
  end.
- Any actual GitHub Contents/Git Data API usage (file read/write, commits, branches).
- A production deploy / real Vercel project (this feature only prepares the code and
  config for one).

## Checkpoints

See `.claude/CHECKPOINTS.md` -> "F03: GitHub Authentication".
