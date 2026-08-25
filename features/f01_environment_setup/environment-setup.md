# F01: Environment Setup

## Objective

Scaffold the MuunCode frontend so implementation of real features can begin:
initialize the Vite + React + TypeScript project inside a dedicated `front/` folder at
the repository root, remove Vite's default boilerplate, set up the Atomic Design folder
skeleton, create the single global CSS design-tokens file, and set a temporary favicon.
This feature produces the empty skeleton only. It does not build the editor, the file
explorer, or any other IDE feature; those are separate features that build on top of
this one.

Reference: `CLAUDE.md` → "Frontend Framework and Build Tooling", "Package Management",
"Frontend Architecture: Atomic Design + Pure CSS", and "Project Structure".

## Repository Layout Rule

Everything in this feature goes inside a new `front/` folder at the repository root, not
directly at the repository root and not inside `features/` (which is spec-only). A
sibling `backend/` folder for the small serverless functions (GitHub OAuth exchange and
refresh) is added later, by a future feature; do not create it now.

## Package Manager Rule (hard constraint, no exceptions)

- **pnpm only.** Never `npm` or `yarn` in any command shown in this spec or written
  during implementation.
- **Never hand-write a version number into `package.json`.** Every dependency is added
  with `pnpm add <package>@latest` (or `pnpm add -D <package>@latest` for dev
  dependencies). `front/package.json` is generated once by the scaffold command below
  and touched afterward only through pnpm commands, never edited by hand.
- Always install the `@latest` tag explicitly (do not rely on a bare `pnpm add
  <package>` picking up a stale cached version).

## Steps

1. **Scaffold the project inside `front/`**:
   ```powershell
   pnpm create vite@latest front -- --template react-ts
   cd front
   pnpm install
   ```
   If the current Vite CLI's flags differ from `--template react-ts` at implementation
   time, use whatever the latest Vite scaffolding invocation is for the React + TypeScript
   template, that exact flag spelling is not the point, landing on a React + TS Vite
   project inside `front/` is.

2. **Remove Vite's default boilerplate.** After scaffolding, delete:
   - `front/src/assets/react.svg`
   - `front/public/vite.svg`
   - The default counter demo markup/logic inside `front/src/App.tsx` and the associated
     `front/src/App.css` (both get replaced by the Atomic Design structure in step 4; do
     not keep the demo counter around "just in case").
   - Any other placeholder logo/asset the scaffold generated that is not referenced by
     anything MuunCode actually needs.

3. **Set a temporary favicon.** MuunCode does not have its own brand asset yet. Copy
   `favicon.ico` from `C:\DevCode\Repositories\01_AzanoLabs\azanolabs-web\app\favicon.ico`
   into `front/public/favicon.ico`, replacing Vite's default. Update the
   `<link rel="icon" ...>` reference in `front/index.html` if the filename or path
   changed. This is explicitly a placeholder until MuunCode has its own logo, note that
   in the commit/PR description so nobody mistakes it for a final asset.

4. **Create the Atomic Design folder skeleton** under `front/src/components/`:
   ```
   front/src/components/
   ├── atoms/
   ├── molecules/
   ├── organisms/
   └── templates/
   ```
   Leave these empty (no placeholder components) except for a `.gitkeep` in each so
   the empty folders are tracked. Do not invent example components "to show the
   pattern": the pattern is documented here and in `CLAUDE.md`, an empty folder is
   enough.

5. **Create the single allowed global CSS file**: `front/src/styles/tokens.css`,
   containing only CSS custom properties on `:root` (colors, font families, spacing
   scale, etc.). Populate it with a minimal, sensible starter set (e.g. a couple of
   neutral colors, one font-family stack, a small spacing scale) rather than leaving it
   empty; expand it token-by-token as real components need new values, never with a
   literal value typed directly into a component's `.module.css` first and "tokenized
   later". Import it once in `front/src/main.tsx`, before anything else renders.

6. **Verify the CSS Modules convention works out of the box.** Vite supports
   `*.module.css` natively; confirm this by creating one trivial atom (e.g. a basic
   `Button` in `front/src/components/atoms/Button/Button.tsx` with
   `front/src/components/atoms/Button/Button.module.css` importing a token from
   `tokens.css` via `var(--token-name)`) and rendering it once from `front/src/App.tsx`
   to prove the whole chain (scaffold → tokens → CSS Module → component folder) works
   end to end. This one component is a smoke test for this feature, not the start of
   the real UI; subsequent features are free to replace or remove it.

7. **Do not install feature-specific dependencies in this feature.** Monaco Editor,
   `dockview`, `Octokit`, `esptool-js`, and `eslint-linter-browserify` are each installed
   later, by the specific feature that actually uses them, with `pnpm add
   <package>@latest` at that time, from inside `front/`. Installing them speculatively
   now, before any code uses them, is not in scope here.

## Checkpoints

See `.claude/CHECKPOINTS.md` → "F01: Environment Setup" for the verifiable done-criteria
the Implementer and Reviewer use for this feature.
