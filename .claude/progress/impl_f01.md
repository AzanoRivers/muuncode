# Implementation Report: F01 Environment Setup

## Feature implemented

Scaffolded the MuunCode frontend skeleton inside `front/` at the repository root:
Vite + React + TypeScript project, Vite default boilerplate removed, temporary
AzanoLabs favicon set, Atomic Design folder skeleton created, single global
`tokens.css` design-tokens file created and imported once, and a smoke-test
`Button` atom rendered from `App.tsx` to prove the scaffold -> tokens -> CSS
Module -> component folder chain works end to end. No feature-specific
dependencies (Monaco, dockview, Octokit, esptool-js, eslint-linter-browserify)
were installed, per spec step 7.

## Files created/modified

Created by `pnpm create vite@latest front -- --template react-ts` + `pnpm install`
(untouched afterward except where noted):
- `front/package.json`, `front/pnpm-lock.yaml`, `front/vite.config.ts`,
  `front/tsconfig.json`, `front/tsconfig.app.json`, `front/tsconfig.node.json`,
  `front/.gitignore`, `front/README.md`

Modified:
- `front/index.html`: favicon `<link>` now points to `/favicon.ico`
  (`type="image/x-icon"`), title changed from `front` to `MuunCode`.
- `front/src/App.tsx`: removed the default counter demo; now renders the
  smoke-test `Button` atom inside a `<main>`.
- `front/src/main.tsx`: now imports `./styles/tokens.css` instead of the
  deleted `./index.css`.

Created (new, by hand, following the Atomic Design + tokens rules):
- `front/src/styles/tokens.css`: the one allowed global stylesheet, `:root`
  custom properties only (colors, one font-family stack, spacing scale, radii).
- `front/src/components/atoms/Button/Button.tsx` and
  `front/src/components/atoms/Button/Button.module.css`: smoke-test atom,
  its module CSS references `var(--font-family-sans)`, `var(--font-size-base)`,
  `var(--space-sm)`, `var(--space-md)`, `var(--radius-md)`, `var(--color-border)`,
  `var(--color-accent)`, `var(--color-accent-hover)`, `var(--color-background)`.
- `front/src/components/molecules/.gitkeep`,
  `front/src/components/organisms/.gitkeep`,
  `front/src/components/templates/.gitkeep`: empty folders tracked, no
  placeholder components. (`atoms/` was left without a `.gitkeep` since it is
  no longer empty, it holds `Button/`.)
- `front/public/favicon.ico`: literal copy of
  `C:\DevCode\Repositories\01_AzanoLabs\azanolabs-web\app\favicon.ico`. This is
  explicitly a placeholder until MuunCode has its own logo.

Deleted (Vite default boilerplate, and files superseded by the Atomic Design
structure per spec step 2):
- `front/src/assets/react.svg`, `front/src/assets/vite.svg`,
  `front/src/assets/hero.png` (the empty `front/src/assets/` folder itself was
  also removed once emptied).
- `front/public/favicon.svg`, `front/public/icons.svg` (this Vite version's
  default placeholder assets; replaced by `favicon.ico`).
- `front/src/App.css` (the counter demo's stylesheet).
- `front/src/index.css` (the scaffold's own global stylesheet with element
  selectors; not compatible with the "tokens.css is the only global stylesheet,
  custom properties only" rule, so it was removed rather than kept alongside
  `tokens.css`).

## Test/validation output

`pnpm build` (from `front/`):
```
$ tsc -b && vite build
vite v8.2.0 building client environment for production...
transforming...v 18 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.45 kB . gzip:  0.29 kB
dist/assets/index-B5tEeY9F.css    0.68 kB . gzip:  0.33 kB
dist/assets/index-DXH71V2V.js   190.53 kB . gzip: 60.01 kB
v built in 322ms
```

`pnpm install --frozen-lockfile` (from `front/`), to confirm no version was
hand-typed and the lockfile is in sync:
```
Already up to date
Done in 32ms using pnpm v11.15.1
```

`pnpm dev` (from `front/`), started in the background, then requested
`http://localhost:5173/` and inspected the response, then stopped the process:
```
VITE v8.2.0  ready in 346 ms
Local:   http://localhost:5173/
```
Response body confirmed `<link rel="icon" type="image/x-icon" href="/favicon.ico" />`,
`<title>MuunCode</title>`, and the Vite/React dev client injected with no
transform errors. No leftover `node` process remained after stopping the job.

Repository-wide check confirmed no `package-lock.json` or `yarn.lock` exists
anywhere, and `front/pnpm-lock.yaml` exists.

## Decisions made (ambiguity encountered)

- The Vite CLI scaffolded a newer default template than the one the spec's
  boilerplate list (`react.svg`, `vite.svg` in `public/`) assumed: this
  version ships `front/src/assets/{react.svg,vite.svg,hero.png}` and
  `front/public/{favicon.svg,icons.svg}` instead. Per the spec's own escape
  clause ("that exact flag spelling is not the point, landing on a React + TS
  Vite project inside `front/` is"), I applied the same intent to the
  boilerplate-removal step: every default demo asset and the counter markup
  were removed regardless of the exact filenames the current scaffold
  version produced, so the checkpoint's literal file paths correctly report
  as "do not exist" for a different reason (this Vite version never created
  them at those exact paths, and the equivalent files it did create are gone).
- `front/src/index.css` (the scaffold's own global stylesheet, which targets
  `#root`, `body`, `h1`, `h2`, `code`, etc.) was deleted rather than kept
  alongside `tokens.css`, since the checkpoint requires tokens.css to be the
  only global CSS file and to contain no selectors targeting actual
  elements/classes. `App.tsx` needed no replacement styling since its only
  content is the smoke-test `Button`, whose own styling lives in
  `Button.module.css`.
- Set `front/index.html`'s `<title>` to `MuunCode` (was `front`, the scaffold
  default) since it costs nothing and is not specified as forbidden; not a
  checkpoint requirement, purely a small DX improvement.
- Token names picked for `tokens.css` (`--color-*`, `--font-family-sans`,
  `--font-size-base`, `--space-*`, `--radius-*`) are a minimal starter set per
  spec step 5's guidance ("populate it with a minimal, sensible starter set");
  no existing design system was specified to constrain the exact names.

## Verdict

DONE
