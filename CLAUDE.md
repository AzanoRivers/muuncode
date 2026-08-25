# CLAUDE.md: MuunCode

## Role of the Model in Development Sessions

You are acting as the **lead** of this repository's development cycle. The lead plans and
coordinates; it does not implement application code directly.

- Read `.claude/AGENTS.md` at the start of every session before doing anything else.
- Run `.\.claude\init.ps1` before starting any work to verify harness state.
- Consult `.claude/feature_list.json` to determine the next feature to work on.
- Write the session plan in `.claude/progress/current.md` **before** launching any subagent.
- Do not implement application code directly: delegate implementation to the Implementer subagent.
- Do not advance to the next feature until the Reviewer subagent has returned `APPROVED`.
- If the Reviewer returns `REJECTED`, launch a new Implementer pass; do not patch code yourself.
- For deep product context beyond this file, read `.claude/context/MuunCode-Context.md`
  (vision, mission, principles, philosophy, non-goals) and, once frontend work begins,
  `.claude/context/context-iphone-bugs.md` (iOS Safari compatibility reference).

---

## Project Description

**MuunCode** is an Open Source Embedded Development Platform designed to radically
simplify firmware development by letting developers build embedded applications using
familiar Web technologies (HTML, CSS, JavaScript).

The long-term vision is to enable anyone who knows HTML/CSS/JS to create native
applications for physical devices quickly and intuitively, without the traditional
complexity of embedded development, while preserving native performance.

**Mission**: make embedded development accessible to millions of web developers, letting
them focus on solving real-world problems instead of learning dozens of firmware-specific
tools. MuunCode should dramatically reduce the learning curve of firmware development
without sacrificing performance or flexibility.

**Philosophy**: MuunCode does not try to teach developers embedded programming.
MuunCode brings embedded programming closer to the knowledge developers already have.
Developers should feel they are creating applications, not configuring firmware. The
platform should encourage experimentation, rapid prototyping and creativity. The ideal
experience should feel closer to modern web development than to traditional embedded
development.

Full narrative context (vision statement, extended philosophy) lives in
`.claude/context/MuunCode-Context.md`. Read it when working on anything
product-facing or when a design decision needs grounding beyond this summary.

### Core Principles (in order of priority)

Every architectural decision must prioritize these, in this order of spirit:

1. Simplicity
2. Developer Experience
3. Predictability
4. Performance
5. Native Output
6. Strong Validation
7. Extensibility
8. Open Source
9. Long-Term Maintainability

When multiple solutions exist, always prefer the one that is easiest to understand for
developers new to the platform.

### Technology Philosophy

Always adopt modern technologies when they improve developer experience. Before adopting
any dependency, evaluate: active maintenance, modern architecture, TypeScript support,
modular design, performance, WebAssembly compatibility, and long-term sustainability.
Avoid legacy technologies when modern alternatives exist. Developer experience has higher
priority than legacy compatibility.

### Non-Goals (MuunCode is explicitly NOT)

- A JavaScript runtime for microcontrollers.
- A browser running inside an ESP32.
- A replacement for ESP-IDF, FreeRTOS, GCC/Clang, or CMake.
- A replacement for LVGL.
- A replacement for GitHub, a Git hosting platform, or a cloud storage platform.
- A no-code builder or a visual programming tool.

MuunCode generates native embedded projects. Generated firmware must remain compatible
with official embedded SDKs whenever possible. MuunCode leverages existing ecosystems
instead of replacing them. It exists to simplify development, not to reinvent proven
embedded technologies.

### Future Mindset

Every feature proposed for MuunCode must answer one question: "Does this help
developers create incredible things faster?" If the answer is no, the feature probably
does not belong in MuunCode.

---

## Repository Scope

This repository covers **the web IDE only**: the visual editor experience, code editing,
linting, panel/window management, GitHub-backed file handling, and browser-based device
flashing. It does not cover firmware compilation.

The service that actually invokes ESP-IDF/CMake/GCC to turn generated/edited source into a
flashable binary is a **separate project**, out of scope here. This repository calls that
service over an API once it exists; it never implements build/compilation logic itself.
Do not add a compilation backend, build orchestration, or code-generation-to-C pipeline to
this repository: flag it to the lead instead.

---

## Technical Stack

Foundational architecture decisions, worked through with the user (`f01`, closed,
decision-only, no dedicated spec file, see `.claude/CHECKPOINTS.md`). Binding for any
work starting now. MuunCode must be consumable like any ordinary React web app: no
desktop app, no Electron, no persistent server or VPS to operate, deployable on a
serverless/edge platform (e.g. Vercel).

### Editor and UI

- **Framework**: React + Monaco Editor, not Eclipse Theia. Theia was evaluated and
  rejected: its architecture requires a persistent backend process that the frontend
  holds a WebSocket/JSON-RPC connection to for the whole session (terminal, language
  servers, task running, file watching all live server-side). That is incompatible with
  a serverless/edge deployment target, which is a hard requirement here. Monaco Editor is
  the actual open-source (MIT) text-editing engine that also powers VS Code, but it is
  just a browser library: no backend of any kind is required to run it.
- **Panel/window layout**: `dockview`, a React docking-layout library (MIT, actively
  maintained), for VS Code-style panels that can be dragged and rearranged anywhere
  within the IDE view (sidebar, editor area, simulator panel, etc.). This covers moving
  panels around inside the app; it does not mean popping a panel out into a separate
  browser tab or OS window, which was explicitly not the requirement.
- **Diff/change review**: Monaco's built-in `DiffEditor` component, no separate diff
  library needed.
- Rejected: building on raw `microsoft/vscode` source (the product known as `Code - OSS`,
  which is exactly what VSCodium redistributes). Forking it means chasing an upstream VS
  Code fork forever to stay current, which Theia (and Monaco alone) both avoid.
- Rejected: WebContainers (StackBlitz's in-browser Node.js runtime). It is proprietary,
  commercially licensed technology, which conflicts with the Open Source Core Principle,
  and it solves a problem MuunCode does not have: running `npm install` and a bundler in
  the browser. Since authored app code is plain vanilla JS/HTML/CSS with no package
  imports (see "Language Scope" below), there is nothing to install or bundle.

### Frontend Framework and Build Tooling

- **React and TypeScript**: always the latest stable release of each. No version is
  pinned in this document on purpose: upgrading across major versions is expected over
  the project's lifetime. Never treat a version number mentioned in chat or in older
  notes as a hard requirement; check `package.json` for what is actually installed.
- **Bundler/dev server**: Vite, not Turbopack. Turbopack's mature, stable usage is tied to
  Next.js's own build pipeline; adopting it would mean adopting Next.js's SSR/file-based
  routing machinery, which MuunCode does not need (it is a client-side authenticated app,
  not a site requiring SSR/SEO), and would violate Simplicity. Vite is the
  general-purpose, actively maintained standard for React/TS SPAs: `esbuild` in
  development, `Rollup` for production builds. If/when Vite's own `Rolldown` (a Rust-based
  bundler built by the Vite team, intended to replace Rollup) reaches stable, it becomes
  Vite's production bundler automatically, with no separate migration needed on our side.
- **Two different "TypeScript" concerns, do not conflate them**: (1) the TypeScript
  compiler used to build and type-check MuunCode's own codebase should always track the
  latest stable release, including any future faster/native compiler implementation; (2)
  the JavaScript/TypeScript language service bundled inside `monaco-editor`, which is
  what actually powers the real-time validation/autocomplete offered to end users editing
  their vanilla JS project code (see "In-Editor Validation" below), is versioned by
  Monaco's own release cycle, independent of our `tsc` version, and must be checked
  separately.

### Language Scope

- The editor supports authoring in **vanilla HTML, CSS, and JavaScript only**. No
  TypeScript, no JSX, no framework syntax, and no npm package imports in user-authored
  project code. This is what the (separate, future) compilation backend must be able to
  transpile to native C/C++ plus the display and FreeRTOS libraries; the editor's
  language tooling targets exactly this surface, nothing wider.
- MuunCode's own IDE codebase (this repository) is written in TypeScript per the Code &
  Naming Standards below; that is unrelated to the vanilla-only surface offered to
  end users.

### In-Editor Validation (all client-side, no backend involved)

- **Syntax and type feedback**: Monaco's built-in JavaScript/TypeScript language service
  runs in a Web Worker inside the browser and works on plain JS files (no TS syntax
  required from the user) to give real-time syntax errors, inferred-type errors, and
  autocomplete. Monaco's built-in HTML/CSS language workers cover those two languages the
  same way.
- **Custom lint rules**: `eslint-linter-browserify`, the official browser-compatible
  ESLint distribution (no Node APIs required), for MuunCode-specific style/rule
  enforcement, running entirely client-side.
- **MuunCode-specific API surface validation** (e.g. flagging a JS API with no supported
  embedded equivalent): implemented as ambient type declarations fed to Monaco via
  `addExtraLib`, purely for tooling; the end user never sees or writes TypeScript, this is
  only how the editor's autocomplete/lint engine knows what the supported global API
  surface (e.g. `Display`, `Gpio`) looks like.
- Real compilation against the actual ESP-IDF toolchain happens only in the separate
  compilation-backend project; the checks above are an instant, offline first pass, not a
  replacement for that.

### File Storage and Access

- No local filesystem access and **no database**. Project files live in the developer's
  own GitHub repository. The IDE authenticates via a GitHub App and reads, edits, commits,
  and branches files directly through GitHub's REST/Git Data API (via `Octokit`), called
  directly from the browser after authentication. This keeps MuunCode a GitHub client,
  never a Git hosting platform (see Non-Goals).
- A "download/export to local" action (zip of the current tree, or `git clone`
  instructions) covers local development without the app ever touching local disk.
- **Drag-and-drop of files and folders** into the IDE uses the native HTML5 Drag and Drop
  API plus `webkitGetAsEntry()`/`getAsFileSystemHandle()` for whole-folder drops, feeding
  the result into the GitHub-backed file tree.

### Configuration and Preferences (no database)

- **Project/workspace-level preferences** (panel layout, tool positions, etc. specific to
  one project): stored in a config file committed to the same GitHub repository (e.g.
  `.MuunCode/workspace.json`), versioned alongside the code and shared with anyone who
  opens that repo. Mirrors VS Code's "workspace settings".
- **User-level personal preferences** (theme, personal layout overrides that apply
  regardless of project): stored in the browser's `localStorage`. Mirrors VS Code's "user
  settings".
- No user/preferences database (Turso, Neon/Postgres, and MongoDB were all considered and
  rejected as unnecessary): identity is resolved through GitHub itself, and the two
  layers above cover every preference need identified so far.

### Authentication and Account Creation

- There is no MuunCode-native account system (no email/password). **Signing in with
  GitHub through the GitHub App is account creation.**
- Flow: the user clicks "Sign in with GitHub" → GitHub App OAuth authorization → a
  stateless Vercel serverless function exchanges the returned code for an access token
  and a refresh token (this step needs the App's client secret, so it cannot happen in
  the browser) → both tokens are handed back to the browser and kept client-side (e.g.
  `localStorage`) → from then on, the browser calls the GitHub API directly with
  `Octokit`, no backend involved in that traffic.
- GitHub App access tokens (with expiring tokens enabled, the recommended setting) last 8
  hours. A second small stateless serverless function performs the refresh (also needs
  the client secret) using the refresh token, which stays valid for up to 6 months of
  regular use. If the refresh token itself has expired, the user must sign in again.
- Storing the GitHub token client-side carries a known trade-off: an XSS vulnerability in
  the app could expose it. This is an accepted, precedented pattern (the same one
  Decap/Netlify CMS and TinaCMS use), mitigated with a strict Content-Security-Policy and
  careful sanitization of any rendered content, not by adding a backend session store.
- The new-project-creation and account-creation onboarding flows (UI) must clearly state
  which browsers are supported before the user proceeds (see "Browser Support Constraint"
  below): this is an explicit step in those flows' UI spec, not a footnote.

### Device Flashing

- Via the browser's WebSerial API using `esptool-js` (Espressif's official JavaScript
  port of `esptool`), not a custom flashing implementation. The (separate, future)
  compilation backend produces the binary; flashing it to the device happens entirely
  client-side, in the browser, with no backend involved in that step.

### Browser Support Constraint

- WebUSB and WebSerial are Chromium-only APIs (Chrome, Edge, Opera). Firefox and Safari
  cannot support device flashing; this is a platform limitation, not a MuunCode gap.

### Future Note: Device Simulator

- Not part of the current phase, but the intended direction: compile LVGL itself to
  WebAssembly via Emscripten (LVGL has official web/WASM support) so the simulator panel
  renders with the real LVGL C code running in the browser, pixel-accurate to the actual
  device, instead of a reimplementation of its rendering in JavaScript. This leverages the
  existing ecosystem rather than replacing it, per the Non-Goals.

### Deployment

- Target: a serverless/edge platform such as Vercel. The frontend is a Vite-built SPA
  deployed as a static site, consumed like any ordinary React app; the only backend
  surface is a small number of stateless serverless functions (GitHub OAuth token
  exchange, GitHub token refresh, and later, calling the separate compilation backend's
  API). No Next.js and no persistent server or VPS is needed to operate the IDE itself.
- **Repository layout**: the frontend project lives in its own `front/` folder at the
  repository root (see "Project Structure"). The small serverless functions (OAuth
  exchange, token refresh) live in a root-level `api/` folder, per Vercel's own
  convention: Vercel only auto-discovers Serverless Functions under a top-level `api/`
  directory, it does not follow an arbitrary path from a `functions` glob in
  `vercel.json` (learned by testing an earlier `backend/api/` layout against a real
  `vercel dev` run, which failed). `api/lib/` holds the shared logic the functions
  import. This is still one repository (see "Repository Scope"): `api/` here means
  "this IDE's own thin serverless glue", never the separate firmware-compilation
  project.
- Any dependency choice must still pass the Technology Philosophy evaluation above.

Still open, deferred to whichever future feature builds each piece (see
`.claude/CHECKPOINTS.md`): the concrete panel/layout catalog for the IDE shell (file
explorer, editor area, simulator, branch/change manager), and the exact shape of the
GitHub-backed file tree data model.

When frontend implementation starts, consult `.claude/context/context-iphone-bugs.md` for
iOS Safari compatibility pitfalls (overflow-x: clip, unprefixed backdrop-filter, 100vh vs
100dvh, input auto-zoom, sticky broken by overflow: hidden, etc.). This applies to the
general UI even though the device-flashing feature itself is Chromium-only.

---

## Critical Constraints

- MuunCode does not replace the embedded ecosystem it depends on (ESP-IDF, FreeRTOS,
  GCC/Clang, CMake, LVGL); it must remain compatible with and build on top of it.
- Generated firmware must preserve native performance. Any abstraction layer that
  meaningfully degrades runtime performance on the target device is a design failure.
- No feature ships that only exists to teach embedded concepts. Features exist to let
  developers build things, not to be an embedded-systems course.

---

## Code & Naming Standards

All generated code, regardless of feature, language or layer, must follow these rules
without exception:

- **Never use the em dash (`—`)**, in English or Spanish, under any circumstance, in any
  file of this project (code, comments, documentation, commit messages, or any other
  generated text). It is a serious writing mistake in both languages. Use `:` to
  introduce an explanation, `,` for parallel constructions, or split the idea into
  separate sentences with `.` instead.
- **Language**: all code, file names, folder names, and identifiers (variables,
  functions, classes, types, etc.) must be written in English, even though project
  communication with the user happens in Spanish. Never translate identifiers or file
  names to Spanish unless explicitly asked to produce a translated deliverable.
- **Naming conventions**: use the idiomatic casing of the language/framework in use
  (e.g. camelCase for JS/TS variables and functions, PascalCase for JS/TS classes and
  React components, snake_case for Python, UPPER_SNAKE_CASE for constants). Never mix
  conventions within the same language.
- **Clean Code / Clean Architecture**: meaningful names, small functions with a single
  responsibility, low nesting, no magic numbers, no dead code, no premature abstraction.
  Where the stack calls for layered separation, keep domain/business logic isolated from
  framework and infrastructure details.
- **Comments**: English only, short (one line where possible). Only comment the
  non-obvious: a hidden constraint, a subtle invariant, a workaround for a specific bug,
  or something that would genuinely surprise a reader. Never comment what the code
  already says through good naming.

This applies to everything under `features/`, every harness file under `.claude/`, and
any script or config file created for this project.

---

## Production Infrastructure

Not applicable yet. No production environment has been defined for this project. This
section will be updated once a deployment target (dashboard hosting, build service,
device provisioning flow, etc.) is actually set up by a future feature.

---

## Development Environment

- **OS**: Windows 11
- **Local shell**: PowerShell 7+. All local commands are PowerShell syntax.
- **Never use** bash, sh, or cmd.exe syntax for local commands.
- Paths use `\`. Environment variables: `$env:VAR`. Null: `$null`. Text search:
  `Select-String`.
- Run the harness verification script from the project root with:
  ```powershell
  .\.claude\init.ps1
  ```

---

## Package Management

- **pnpm only, always.** Never `npm` or `yarn`, in any command, script, or CI config.
- **Never hand-write or hand-edit a dependency version in `package.json`.** Every
  install goes through pnpm: `pnpm add <package>@latest` (or `pnpm add -D
  <package>@latest` for dev dependencies). Let pnpm resolve the actual version and
  record it in `pnpm-lock.yaml`. Typing a version number into `package.json` by hand
  is a hard rule violation, not a style preference.
- To upgrade an existing dependency later, run `pnpm add <package>@latest` again (or
  `pnpm update <package>@latest`). Never hand-edit the version string to "upgrade" it.
- Never hand-author `package.json` from scratch: it is generated once by the project
  scaffold command (`pnpm create vite@latest`) and modified afterward only through
  pnpm commands, never by directly editing its `dependencies`/`devDependencies` blocks.

---

## Frontend Architecture: Atomic Design + Pure CSS

- Components follow **Atomic Design**: `front/src/components/atoms/`,
  `front/src/components/molecules/`, `front/src/components/organisms/`,
  `front/src/components/templates/`, `front/src/components/pages/`. `pages/` holds
  every top-level, route-bound view (the login/home screen, the `/station` IDE entry
  point, 404, 500): each one is picked directly by `App.tsx` based on
  `window.location.pathname` or a caught error, never composed inside another view.
  `templates/` stays empty until something genuinely needs a reusable page-shaped
  layout shared across more than one page; do not put a route-bound view there.
- **One folder per component, always.** `ComponentName/ComponentName.tsx` lives next
  to `ComponentName/ComponentName.module.css` in the same folder. Structure, styles,
  and logic for a component stay physically encapsulated together, never scattered
  across the codebase.
- **Pure CSS only**: no Tailwind, no CSS-in-JS runtime library. Every component's
  `.module.css` is a CSS Module (Vite supports this natively for any `*.module.css`
  file, zero extra config), so class names are scoped automatically and collisions
  between components are structurally impossible.
- **Never a global stylesheet for everything.** Exactly two global CSS files are
  allowed, nothing more: `front/src/styles/tokens.css` (design tokens, CSS custom
  properties on `:root` only: colors, fonts, spacing scale, radii, etc.) and
  `front/src/styles/reset.css` (the browser reset and base sizing, see below). Every
  color, font, or spacing value anywhere else in the app is a `var(--token-name)`
  reference into `tokens.css`, never a literal value repeated inside a component's
  own `.module.css`. Consistency over convenience: if a value is not yet a token, add
  the token first, then reference it, do not inline it "just this once".
- **Browser reset**: `front/src/styles/reset.css` holds a modern CSS reset (currently
  Josh Comeau's, https://www.joshwcomeau.com/css/custom-css-reset/, adapted for
  Vite's `#root` instead of Next.js' `#__next`). Its job is normalizing browser
  defaults (`box-sizing`, default margins, media element sizing, text wrapping,
  etc.) and theming native browser chrome that no component owns, such as the
  scrollbar (`::-webkit-scrollbar`/`scrollbar-color`, values still pulled from
  `tokens.css`). It never holds component-specific design decisions, those stay
  in each component's own `.module.css`, referencing tokens from `tokens.css`.
- **Base font sizing: 1rem = 10px, always.** `html { font-size: 62.5%; }` in
  `reset.css` (62.5% of the typical 16px browser default = 10px), never a hardcoded
  `font-size: 10px` on `html` (that would ignore the user's browser zoom/font-size
  accessibility preferences; the percentage stays relative to it). Every `rem` value
  in the codebase is computed as `target-px / 10`: `1.6rem` is 16px, `2.4rem` is
  24px, `4rem` is 40px. Whenever `tokens.css` or a component changes under this
  convention, recompute existing `rem` values to preserve their intended pixel size,
  do not leave stale values sized for a 16px-per-rem assumption.
- This is the file-organization counterpart of the user's global "no inline styles"
  rule (see the user's own `CLAUDE.md`): `style={{}}` in JSX is reserved for CSS
  custom properties computed at runtime in JS, never for static values that belong
  in a `.module.css` file.

---

## Import Conventions

- **Path alias, not relative-path chains.** `@/` resolves to `front/src/`, configured
  in both `front/vite.config.ts` (`resolve.alias`) and `front/tsconfig.json`
  (`compilerOptions.paths`), so the bundler and the TypeScript language service agree.
  Never write an import chain like `../../../components/atoms/Button/Button`; write
  `@/components/atoms/Button` (or shorter, via the barrels below).
- **Barrel exports, at two levels.** Every component folder has its own `index.ts`
  re-exporting its component (e.g. `atoms/Button/index.ts` → `export { Button } from
  './Button'`), and every Atomic Design category folder (`atoms/`, `molecules/`,
  `organisms/`, `templates/`, `pages/`) has its own `index.ts` re-exporting everything
  inside it. This is what actually removes import verbosity: `import { Button } from
  '@/components/atoms'` instead of a deep per-file path.
- **Keep barrels shallow.** One level of re-export per barrel; a barrel must never
  import another barrel. Vite has a known cost with large, deeply-chained barrel
  files (slower dev server cold start and HMR as the re-export graph grows). If this
  becomes noticeable as the component count grows, the fix is pruning/flattening the
  barrels, never abandoning the path alias.

---

## UI Reference Methodology

MuunCode's IDE shell, everything outside Monaco Editor's own text-editing surface
(toasts/notifications, command palette, status bar, activity bar, tabs, context menus,
tooltips, modals, and so on), is built entirely from scratch in this repository.
Building these patterns from zero with no reference produces slow, iteration-heavy
cycles of manual style/UX correction. This rule exists specifically to avoid that, and
it is a priority for every future feature that touches UI, not a nice-to-have.

- **Official repository, go straight here, no searching**:
  https://github.com/microsoft/vscode (MIT licensed). Browse its default branch for
  the current, latest implementation, not an old fork or a blog post describing it.
- **Before building any UI element that has a direct equivalent in VS Code**, consult
  the actual implementation in that repository for its behavior and visual structure:
  how it stacks/animates, its z-index/layering rules, what information it shows, its
  keyboard accessibility. Do not invent a new pattern for an already-solved problem.
  - Notifications/toasts: `src/vs/workbench/browser/parts/notifications/`
  - Command palette / quick input: `src/vs/workbench/browser/parts/quickinput/`
  - Status bar: `src/vs/workbench/browser/parts/statusbar/`
  - Activity bar: `src/vs/workbench/browser/parts/activitybar/`
  - Editor tabs/title area: `src/vs/workbench/browser/parts/editor/`
  - Full paths: append the path above to
    `https://github.com/microsoft/vscode/tree/main/` to browse it directly.
  - Exact paths may have shifted by implementation time; verify against the current
    `microsoft/vscode` repository rather than trusting this list blindly.
- **Reference VS Code itself over Eclipse Theia** for this purpose. Theia's own
  widgets are themselves modeled on VS Code's; going to the source avoids inheriting
  any drift Theia introduced through its own architecture.
- **This is behavior/structure reference, not code copying.** VS Code's UI runs on its
  own DOM/widget system, nothing like our React + CSS Modules stack, so the result is
  always an independent reimplementation, never a ported file. Note in the component
  (a short comment) or its feature spec which VS Code module inspired it, for
  traceability.
- The reimplementation still follows every rule in "Frontend Architecture: Atomic
  Design + Pure CSS" above: its own component folder, its own `.module.css`, values
  pulled from `tokens.css`, never invented inline.

---

## Project Structure

`features/<NN>_name/` holds **specs only** (`.md` files: objective, architecture,
checkpoints reference), never application code. The actual MuunCode frontend lives in
its own `front/` folder at the repository root, in the standard Vite layout, shared
across every feature. A root-level `api/` folder holds the small serverless functions
(GitHub OAuth exchange and refresh), per Vercel's own convention that Serverless
Functions must live directly under a top-level `api/` directory:

```
MuunCode/
├── CLAUDE.md
├── claude-map.md
├── .gitignore
├── vercel.json
├── .env.example
├── package.json             ← root devDependencies only: @vercel/node, typescript,
│                              @types/node, for the api/ functions
├── api/
│   ├── auth-exchange.ts
│   ├── auth-refresh.ts
│   └── lib/
│       └── githubOAuth.ts   ← shared token-exchange logic, imported by both functions
├── front/
│   ├── package.json        ← generated by `pnpm create vite@latest`, pnpm-managed only
│   ├── vite.config.ts
│   ├── index.html
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── main.tsx
│       ├── styles/
│       │   └── tokens.css  ← the one allowed global CSS file (design tokens only)
│       └── components/
│           ├── atoms/
│           ├── molecules/
│           ├── organisms/
│           ├── templates/    ← empty until a reusable page-shaped layout is needed
│           └── pages/        ← every route-bound view: Home, Station, NotFound,
│                                ServerError, picked directly by App.tsx
├── .claude/
│   ├── init.ps1
│   ├── AGENTS.md
│   ├── CHECKPOINTS.md
│   ├── feature_list.json
│   ├── context/
│   │   ├── MuunCode-Context.md
│   │   └── context-iphone-bugs.md
│   ├── agents/
│   │   ├── implementer.md
│   │   └── reviewer.md
│   └── progress/
│       ├── current.md
│       └── history.md
└── features/
    └── f01_environment_setup/  ← one folder per feature, named `f0N_name` to match
                                   its `feature_list.json` id exactly (no separate
                                   internal numbering); spec .md files only, never
                                   application code
```

---

## Feature Development Workflow

1. Read `.claude/AGENTS.md` to orient.
2. Run `.\.claude\init.ps1` to verify harness state (no more than one `in_progress`
   feature, environment sane).
3. Check `.claude/feature_list.json` for the next `pending` feature.
4. Write (or update) the feature spec(s) inside `features/f0N_name/`, where `f0N` is
   that exact feature's id in `feature_list.json` (e.g. `features/f01_environment_setup/`).
   One folder per feature, named to match its id exactly, no separate internal
   numbering. One or more `.md` files inside it cover objective, technical context,
   build steps, checkpoints reference, validation commands, and relevant design
   decisions, as applicable.
5. Write the session plan in `.claude/progress/current.md` before launching any subagent.
6. Launch the Implementer subagent (`.claude/agents/implementer.md`) for that feature.
7. On `DONE`, launch a Reviewer, **which one depends on what kind of round this is**:
   - **Adjustment/tweak round** on a feature already in progress (per "Rules for
     Agents" → "Adjustment vs. new feature"): launch `.claude/agents/reviewer-light.md`.
     Fast pass, trades some rigor for speed, this is the default for the many small
     refinement rounds a feature goes through.
   - **Final gate before the feature is marked `done` for good and the lead moves on
     to a new feature/phase**: launch `.claude/agents/reviewer.md` (the full
     reviewer) exactly once, as the last word before advancing. This is the only
     place the full reviewer's exhaustive, independently-recompute-everything
     process is required.
8. On `APPROVED`: mark the feature `done` in `.claude/feature_list.json`, append an entry
   to `.claude/progress/history.md`, and, if this was the final-gate full review, move to
   the next feature.
9. On `REJECTED`: launch a new Implementer pass with the Reviewer's issues. Do not fix
   the code yourself.

---

## Rules for Agents

- **Adjustment vs. new feature.** When the user asks for a tweak, fix, or visual
  refinement to something that already exists, that is more work on the existing
  feature, never a new `feature_list.json` entry or a new `features/f0N_name/`
  folder. Add a new `.md` inside the existing feature's folder only if it is
  genuinely important for context/traceability; otherwise just do the work with no
  new file. Only register a new feature id when the user explicitly signals moving
  to a new phase or new functionality, not when the request reads as a correction.
- Do not implement firmware compilation, build orchestration, or any code-generation-to-C
  pipeline in this repository: that is a separate project. See "Repository Scope" above.
- Any code generation logic that targets embedded hardware must remain compatible with
  the official SDK it builds on (do not reimplement toolchain functionality).
- Any frontend work must apply `.claude/context/context-iphone-bugs.md` proactively.
- Every new feature must be justifiable against the Core Principles and the Future
  Mindset question in this document. If it does not clearly help developers build things
  faster, flag it to the lead instead of implementing it.
- Prefer modern, actively maintained dependencies with TypeScript support over legacy
  alternatives, per the Technology Philosophy section above.
- All code, identifiers, file/folder names and comments must be in English and follow
  the Code & Naming Standards section above, regardless of the language used in chat
  with the user.
