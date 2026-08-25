# F02: Login Screen UI

## Objective

Build the static, fully-styled login/welcome screen: MuunCode's entry point. This
feature is design and markup only: the visual identity, the copy, the layout, and the
i18n system. It does not implement real GitHub authentication; the "Sign in with
GitHub" button exists visually and is wired to a placeholder handler, clearly marked
as a `TODO` for the future GitHub authentication feature.

Reference: `CLAUDE.md` → "Frontend Architecture: Atomic Design + Pure CSS",
"Authentication and Account Creation", "Browser Support Constraint", and "Code &
Naming Standards".

## Visual Identity to Establish (design tokens)

Add these as CSS custom properties in `front/src/styles/tokens.css` (do not invent
different values; these are taken directly from AzanoLabs' and ModusRatio's existing,
already-shipped design systems, replicated deliberately per the user's request):

```css
:root {
  /* Background */
  --color-bg: #041528;
  --color-grid-line: rgba(255, 255, 255, 0.06);

  /* Neon accents (the MuunCode gradient is blue -> purple -> pink) */
  --color-neon-blue: #0BD2FF;
  --color-neon-purple: #B366FF;
  --color-neon-pink: #FF69B4;
  --color-neon-green: #04E9CF;

  /* Glow variants (with alpha, for box-shadow/drop-shadow/text-shadow) */
  --glow-blue: rgba(11, 210, 255, 0.8);
  --glow-purple: rgba(179, 102, 255, 0.8);
  --glow-pink: rgba(255, 105, 180, 0.7);
  --glow-white: rgba(255, 255, 255, 0.5);

  /* Typography */
  --font-display: 'Orbitron', sans-serif;
  --font-body: 'Space Grotesk', sans-serif;

  /* Spacing and radii (small, HUD-like scale) */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2.5rem;
}
```

Expand this set only when a real component needs a value not yet covered, per
`CLAUDE.md` → "Frontend Architecture": never inline a literal color/font/spacing value
in a component's `.module.css`.

### Fonts

Install via `pnpm add @fontsource/orbitron@latest @fontsource/space-grotesk@latest`
(self-hosted font files, no external Google Fonts request at runtime, matching
ModusRatio's own approach). Import the weights actually used (Orbitron 400/700,
Space Grotesk 400/500) once in `front/src/main.tsx`, alongside `tokens.css`.

### Grid background

A reusable utility class (e.g. `.gridBackground` in its own atom, see components
below) that renders the two-layer linear-gradient grid pattern over `--color-bg`,
using `--color-grid-line`, at the same responsive scale AzanoLabs uses (25px base,
larger at wider breakpoints). This is a CSS pattern, not an image asset.

### Glow effect

Any glowing border/text/logo uses layered `box-shadow` / `text-shadow` / SVG
`feGaussianBlur`, referencing the `--glow-*` tokens above. Follow the layered
multi-shadow pattern already used by AzanoLabs (several shadows at increasing
blur radius), not a single flat shadow.

## Logo: `MoonOrbitLogo`

A new atom, `front/src/components/atoms/MoonOrbitLogo/`, an inline SVG (not a static
image): a crescent moon shape with an orbit ring/ellipse crossing it. Technique,
copied deliberately from AzanoLabs' own `HomeLogo` (`modus-ratio`):

- A `<linearGradient>` with 3 stops: `--color-neon-blue` at 0%, `--color-neon-purple`
  at 50%, `--color-neon-pink` at 100%.
- The moon and orbit paths use `stroke="url(#...)"`, not `fill`.
- An SVG `<filter>` with `feGaussianBlur` + `feMerge` for the glow, applied via
  `filter="url(#...)"` on the `<g>` wrapping the paths.
- Accept a `size` prop (number, pixels) with a sensible default; no hardcoded pixel
  values scattered elsewhere, the component owns its own sizing.

This is MuunCode's placeholder brand mark for now (per the earlier product context
notes); it may be replaced by a designed asset later, that is not this feature's
concern.

## Internationalization

- Packages: `pnpm add i18next@latest react-i18next@latest
  i18next-browser-languagedetector@latest`, from inside `front/`.
- **Hard constraint: no URL-based locale routing.** Configure the language detector's
  `order` to exactly `['localStorage', 'navigator']`. Never `path`, `subdomain`,
  `htmlTag`, or `cookie`. There is exactly one URL for the whole app regardless of
  language; a manual language switch (if the UI offers one) only updates
  `localStorage` and in-memory state, never the route.
- Locale resource files: `front/src/locales/en.json` and `front/src/locales/es.json`,
  with at least these keys: `title`, `tagline`, `description`, `philosophy`,
  `signInButton`, `browserNotice`.
- Fallback language: `en`, for any key or language not present.

### Copy (put these exact values into the locale files)

`en.json`:
```json
{
  "title": "MuunCode",
  "tagline": "Build incredible things, faster.",
  "description": "The web IDE for building real software and hardware for microprocessors, fast enough to reach the Moon.",
  "philosophy": "MuunCode is built for developers who want to ship real products, not prototypes that never leave the lab. Design and code software and hardware applications for microprocessors with the same speed and tools you already know from the web, and take them all the way to the Moon.",
  "signInButton": "Sign in with GitHub",
  "browserNotice": "MuunCode's device flashing feature requires a Chromium-based browser (Chrome, Edge, or Opera). Firefox and Safari are not supported for that feature."
}
```

`es.json`:
```json
{
  "title": "MuunCode",
  "tagline": "Crea cosas increíbles, más rápido.",
  "description": "El IDE web para crear software y hardware real para microprocesadores, lo suficientemente rápido para llegar a la Luna.",
  "philosophy": "MuunCode está hecho para developers que quieren lanzar productos reales, no prototipos que nunca salen del laboratorio. Diseña y programa aplicaciones de software y hardware para microprocesadores con la misma velocidad y herramientas que ya conoces del desarrollo web, y llévalas hasta la Luna.",
  "signInButton": "Iniciar sesión con GitHub",
  "browserNotice": "La función de flasheo de dispositivos de MuunCode requiere un navegador basado en Chromium (Chrome, Edge u Opera). Firefox y Safari no son compatibles con esa función."
}
```

## Import Setup (do this before building components)

Per `CLAUDE.md` → "Import Conventions", not yet configured in `f01`, set up now:

1. In `front/vite.config.ts`, add `resolve.alias` mapping `@` to `front/src`.
2. In `front/tsconfig.json`, add the matching `compilerOptions.paths` entry
   (`"@/*": ["./src/*"]`) plus `baseUrl` if required, so the TypeScript language
   service resolves the same alias the bundler does.
3. Give every component folder its own `index.ts` barrel (including the existing
   `atoms/Button/`, retrofitted now), and give each Atomic Design category folder
   (`atoms/`, `molecules/`, `organisms/`, `templates/`) its own `index.ts` barrel
   re-exporting everything inside it. One level of re-export only, no barrel
   importing another barrel.
4. Update `front/src/App.tsx`'s existing import of `Button` (from `f01`) to use
   `@/components/atoms` instead of its current relative path.

## Components to Build (Atomic Design)

- `atoms/MoonOrbitLogo/`: described above. Include its `index.ts` barrel.
- `atoms/Button/`: already exists from `f01` as a smoke-test component. Restyle it
  (its `.module.css`) to use the new tokens instead of removing/replacing it: a
  primary CTA variant (glow on hover, `--font-display`, uppercase, per AzanoLabs'
  button treatment) is what "Sign in with GitHub" uses.
- `atoms/GridBackground/`: the reusable grid-pattern background described above.
  Include its `index.ts` barrel.
- `molecules/BrowserSupportNotice/`: a small banner/callout rendering the
  `browserNotice` copy, styled distinctly (e.g. a subtle border and icon) so it reads
  as an informational notice, not an error. Include its `index.ts` barrel.
- `templates/LoginScreen/`: composes `GridBackground`, `MoonOrbitLogo`, title,
  tagline, description, philosophy paragraph, the `Button` (sign-in CTA), and
  `BrowserSupportNotice` into the full-page layout. Centered, single-column,
  generous vertical spacing per `--spacing-lg`. Include its `index.ts` barrel.

Import each component in `App.tsx` via `@/components/<category>`, never a relative
path or a direct deep path to the component's own file.

Wire `templates/LoginScreen` into `front/src/App.tsx` as the app's current (and only)
view. There is no routing library yet; this is the sole screen.

## Explicitly Out of Scope

- Real GitHub OAuth, the GitHub App, and the serverless token-exchange functions:
  separate future feature. The sign-in button's `onClick` is a placeholder (e.g. a
  `// TODO: wire real GitHub OAuth, see CLAUDE.md -> Authentication and Account
  Creation` comment plus a no-op or `console.info` call), never a real network call.
- A manual language-switcher UI control is optional for this feature; if omitted,
  language still works correctly via automatic browser detection alone.
- The VS Code UI Reference Methodology (`CLAUDE.md` → "UI Reference Methodology")
  does not apply here: this is a marketing/onboarding screen, not an IDE-shell
  element with a direct VS Code equivalent.

## Manual Verification

- Load the page with the OS/browser set to Spanish: copy renders in Spanish.
  Set to any other language: copy renders in English (fallback).
- Switching language never changes the URL.
- Apply `.claude/context/context-iphone-bugs.md` proactively to this page's CSS
  (it is general UI, not the Chromium-only flashing feature itself).

## Checkpoints

See `.claude/CHECKPOINTS.md` → "F02: Login Screen UI" for the verifiable done-criteria
the Implementer and Reviewer use for this feature.
