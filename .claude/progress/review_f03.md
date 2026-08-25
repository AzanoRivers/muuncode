# Reviewer report: f03 (github_auth)

## Verdict: APPROVED

Full final-gate review, per CLAUDE.md's Feature Development Workflow (first and only
implementation round for this feature, no prior adjustment rounds).

## Checkpoints verified against .claude/CHECKPOINTS.md, F03 section

- [x] backend/api/auth-exchange.ts exists. POST, body { code: string }, calls
      https://github.com/login/oauth/access_token with client_id/client_secret read
      from process.env.GITHUB_CLIENT_ID/process.env.GITHUB_CLIENT_SECRET (never a
      literal), returns { accessToken, refreshToken, expiresIn, refreshTokenExpiresIn }.
      Verified by reading the file and its shared helper backend/lib/githubOAuth.ts.
      No console.* call anywhere in backend/api or backend/lib; the error path
      deliberately omits the raw GitHub response body from the thrown Error, so
      nothing token-shaped can leak through a log even if one were added upstream.
- [x] backend/api/auth-refresh.ts exists. POST, body { refreshToken: string }, calls
      the same endpoint with grant_type=refresh_token, same response shape. Verified
      by reading the file.
- [x] vercel.json exists at the repo root, exact shape from the spec (buildCommand
      "cd front && pnpm build", outputDirectory "front/dist", functions entry routing
      backend/api/*.ts to "@vercel/node"). Correctly flagged by the Implementer as
      unverified against a real vercel dev/deploy, matching the spec's own explicit
      instruction not to guess a second shape.
- [x] .env.example exists at the repo root with GITHUB_CLIENT_ID= and
      GITHUB_CLIENT_SECRET=, no values. Confirmed the only .env* file anywhere in the
      repo outside node_modules is this one; no .env.local was committed.
- [x] No literal Client Secret, private key content, or access/refresh token anywhere
      in the repository. Ran exhaustive greps for a hardcoded
      GITHUB_CLIENT_SECRET=value pattern (no matches), for PEM private-key headers (no
      matches), for any *.pem file (none exist), and for the standard GitHub token
      prefixes ghp_/ghs_/gho_/github_pat_ (no matches). .gitignore still covers *.pem
      and .env/.env.local/etc.
- [x] LoginScreen.tsx's handleSignIn navigates via window.location.href set to
      https://github.com/apps/muuncode/installations/new, replacing the f02
      placeholder console.info call. Verified by reading the file.
- [x] AuthCallback (front/src/components/templates/AuthCallback/) renders at
      /auth/callback, reads code from window.location.search via URLSearchParams,
      POSTs it to /api/auth-exchange, stores tokens via storeGitHubTokens, redirects
      with window.location.replace('/'). App.tsx picks between AuthCallback and
      LoginScreen by reading window.location.pathname directly; no routing library is
      installed in front/package.json.
- [x] front/src/lib/githubAuth.ts exists. getAccessToken() transparently calls
      /api/auth-refresh and rewrites storage when the access token is within a
      5-minute safety margin of expiry. Grepped front/src for localStorage usage
      outside this file: the only references live inside githubAuth.ts itself
      (readStoredAuth/writeStoredAuth); AuthCallback.tsx imports storeGitHubTokens
      rather than touching localStorage directly.
- [x] pnpm build (from front/) completes cleanly: tsc -b && vite build, no type
      errors, output written to front/dist.
- [x] .gitignore covers *.pem and .env* files, re-confirmed.
- [ ] .claude/feature_list.json entry f03 is correctly left in_progress; flips to done
      only after this approval, per the workflow.

## Additional verification performed beyond the checkpoint list

- Ran "cd backend && npx tsc -p tsconfig.json --noEmit": clean, confirming the
  Implementer's substitute for the unusable vercel dev local test is valid. Not
  attempting an interactive vercel login was the correct call: the spec never asked
  for a real deploy/local Vercel run in this round, and unilaterally authenticating a
  CLI on the user's behalf is exactly the kind of unrequested credential action an
  Implementer should flag instead of performing. The vercel whoami failure was
  reported honestly rather than papered over with an invented workaround.
- Ran "cd front && pnpm lint" (oxlint): no findings.
- No em dash character found in any file this feature touched: backend/**,
  vercel.json, .env.example, front/src/lib/githubAuth.ts,
  front/src/components/templates/AuthCallback/**, the modified LoginScreen.tsx and
  App.tsx, and both locale files. A broader repo-wide grep for the character only
  surfaces node_modules, CLAUDE.md's own rule text (quoting the character to describe
  the rule itself), and pre-existing harness/agent files unrelated to this feature's
  diff.
- No relative-path import chains introduced anywhere in front/src. AuthCallback.tsx
  imports via the @/components/atoms and @/lib/githubAuth aliases; backend/api's two
  files import their sibling backend/lib/githubOAuth.ts via a single ../lib hop, which
  is correct since backend/ is a standalone package with no @/ alias configured and
  this is one hop, not a multi-level chain. front/src/components/templates/index.ts
  now also exports AuthCallback alongside LoginScreen; AuthCallback/index.ts
  re-exports only its own component, no barrel importing another barrel.
- No inline style object introduced by this feature. The three pre-existing
  style={{}} occurrences in MoonOrbitLogo.tsx predate this feature (from f02) and are
  CSS-custom-property usages, the documented allowed exception.
- iOS Safari check on the one new UI surface, AuthCallback.module.css: uses the
  correct min-height 100vh fallback followed by min-height 100dvh override pattern,
  matching GridBackground's existing precedent; no overflow-x clip, no unprefixed
  backdrop-filter, no sub-16px input font size since there is no input element at
  all, and no position sticky under an overflow hidden ancestor.
- Scope check against CLAUDE.md's Non-Goals and this feature's own "explicitly out of
  scope" section: grepped front/src and backend (excluding node_modules) for
  octokit, Octokit, /repos/, contents, and git/refs: no matches outside a dependency's
  own package.json metadata. No repo creation, Contents API, or Git Data API calls
  exist anywhere in the diff. The feature does not behave like a no-code or
  visual-programming tool, and does not reimplement any embedded toolchain
  functionality (not applicable to this feature's surface anyway).
- backend/package.json's @vercel/node, typescript, and @types/node devDependencies
  all carry caret-prefixed versions consistent with pnpm add <pkg>@latest, never
  hand-typed; backend/pnpm-lock.yaml is present, and pnpm install inside backend/
  reports the lockfile already up to date (the only notice is an unrelated, harmless
  esbuild build-script approval prompt, not a version mismatch).
- Minor, non-blocking observation: backend/pnpm-workspace.yaml contains a
  placeholder-looking line from pnpm's own build-script-approval flow for the esbuild
  transitive dependency. It does not violate any rule (no hand-typed version, no
  hardcoded secret) and does not affect the build; flagging only for the lead's
  awareness in case it is worth resolving with "pnpm approve-builds" in a later round.

## Issues

None found. Every checkpoint above was verified by reading the actual file or running
the actual command (build, lint, tsc, greps), not accepted at face value.
