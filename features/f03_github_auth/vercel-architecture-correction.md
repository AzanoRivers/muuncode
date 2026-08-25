# Additional scope: Vercel Architecture Correction

Written retroactively: this round happened live, off-harness, while the lead helped
the user actually run `vercel dev` for the first time against a real GitHub App.
`github-auth.md`'s original plan (`backend/api/*.ts` + a `functions` glob in
`vercel.json`) never worked once tested for real. This documents what actually ships.

## What was wrong, and the real fix

Vercel only auto-discovers Serverless Functions under a **root-level `api/`
directory**. It does not follow an arbitrary path from a `functions` glob in
`vercel.json`, no matter how that glob is written. Running `vercel dev` against the
original layout failed twice in a row:

1. `"functions": { "backend/api/*.ts": { "runtime": "@vercel/node" } }` → `Error:
   Function Runtimes must have a valid version` (`"@vercel/node"` is the old
   `now.json`-era builder syntax, invalid in current `vercel.json`).
2. After removing `runtime`: `Error: The pattern "backend/api/*.ts" defined in
   functions doesn't match any Serverless Functions inside the api directory` → the
   real, final diagnosis: the directory itself was wrong, not just the runtime value.

## The corrected layout

```
MuunCode/
├── package.json        ← root devDependencies only: @vercel/node, typescript,
│                          @types/node, so api/*.ts type-checks and resolves at all
├── tsconfig.json        ← root, include: ["api"]
├── vercel.json
├── api/
│   ├── auth-exchange.ts
│   ├── auth-refresh.ts
│   ├── check-installation.ts   (added in a later round, see
│   │                             session-lifecycle-and-sign-in-flow.md)
│   └── lib/
│       ├── githubOAuth.ts      ← shared token-exchange logic
│       └── devCors.ts          ← see "Dev/prod split" below
└── front/                       (unchanged shape)
```

`backend/` no longer exists at all: it was a dead end, not a real architecture
decision to preserve. `vercel.json`'s `functions` entry is now:

```json
"functions": {
  "api/*.ts": { "maxDuration": 10 }
}
```

No `runtime` key: that field is only for pinning a non-default runtime; omitting it
lets Vercel use its own default Node runtime, which is what every real minimal Vercel
project actually does.

## Dev/prod split: two servers, two origins

`vercel dev` (needed for `/api/*`) and `pnpm dev` (fast Vite HMR for everything else)
are two separate local servers once `vercel.json` lives at the repo root with no
detected framework: `vercel dev` does not get Vite's own dev server /HMR, it builds
once and serves the static output. Rather than forcing the user to stop one and start
the other every time they want to test the GitHub flow, both now run at once, on two
different ports:

- `pnpm dev` (from `front/`): the usual Vite dev server, e.g. `localhost:5173`.
- `vercel dev` (from the repo root): serves `/api/*`, e.g. `localhost:3000`.

This needs two things to actually work across two origins:

- **`front/.env`**: `VITE_API_BASE_URL=http://localhost:3000`. `front/src/lib/apiUrl.ts`
  reads it only in dev (`import.meta.env.DEV`); in production, front and `/api/*` are
  deployed together on the same origin, so a plain relative path is used instead, no
  base URL needed at all.
- **`api/lib/devCors.ts`**: `auth-exchange.ts`/`auth-refresh.ts`/`check-installation.ts`
  all call `applyDevCors(req, res)` first. It only ever allows a `localhost:<port>`
  origin (never a wildcard), and handles the OPTIONS preflight the browser sends for a
  cross-origin `POST` with a JSON body. In production there is no cross-origin request
  to allow, so this is a no-op there.

## `.env` vs `.env.local`, and the root/front split

Per the user's standing global preference, this project uses plain `.env` files
(gitignored) for local secrets, never `.env.local`. There are two, in two different
runtimes, each with its own `.env.example` template:

- Root `.env`: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (server-only, read by
  `api/lib/githubOAuth.ts`; the secret is never exposed to the browser).
- `front/.env`: `VITE_API_BASE_URL`, `VITE_GITHUB_CLIENT_ID` (Vite only exposes
  `VITE_`-prefixed vars to the client bundle; the Client ID is not secret, safe here).

In actual production on Vercel, neither `.env` file is deployed: the real values are
set in the Vercel project's own Environment Variables dashboard instead.

## Error handling: no `throw`, ever

Per the user's standing global rule (`throw` only for a truly unavoidable case,
wrapped and converted immediately, never left to propagate), `api/lib/githubOAuth.ts`
returns an explicit `GitHubOAuthResult` (`{ ok: true, tokens } | { ok: false, error }`)
instead of throwing on a failed GitHub token exchange. `front/src/lib/githubAuth.ts`
mirrors this with plain `null`/`false` returns. The one remaining `try/catch` in the
whole auth codebase (`JSON.parse` in `githubAuth.ts`'s `readStoredAuth`) exists only
because `JSON.parse` is synchronous with no non-throwing alternative, and it is
caught immediately and converted to `null`, never rethrown.

## Checkpoints

- [x] `api/` exists at the repo root (not `backend/api/`); `backend/` does not exist.
- [x] `api/lib/githubOAuth.ts` and `api/lib/devCors.ts` hold the shared logic used by
      all three functions; each function file itself stays a thin HTTP handler.
- [x] Root `package.json`/`tsconfig.json` exist for `api/*.ts` only (`@vercel/node`,
      `typescript`, `@types/node`); `pnpm exec tsc --noEmit` from the repo root passes.
- [x] `vercel.json`'s `functions` entry has no `runtime` key.
- [x] `front/.env`/`.env.example` hold `VITE_API_BASE_URL`/`VITE_GITHUB_CLIENT_ID`;
      root `.env`/`.env.example` hold `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`. No
      `.env.local` anywhere.
- [x] `api/lib/devCors.ts` only allows `localhost:<port>` origins, never a wildcard.
- [x] No `throw` in `api/lib/githubOAuth.ts` or `front/src/lib/githubAuth.ts`, other
      than the single, immediately-caught `JSON.parse` case.
- [x] `pnpm build` and `pnpm lint` (from `front/`) pass; `pnpm exec tsc --noEmit`
      (from the repo root) passes.
