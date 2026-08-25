# F04: Repository Selection UI (Mockup)

## Objective

MuunCode edits exactly one GitHub repository at a time (switchable at will, never
concurrent multi-repo). Once a user reaches `/station` with a green light ("Aqui
Houston, luz verde."), the next thing they need is a way to pick which repository to
work on, or start a brand new one from scratch. This feature builds the **static,
fully responsive mockup** of that selector/creation UI only. Stage 1, per the user's
explicit request: visuals and layout with mock data, no real GitHub API wiring, no
selection persistence, no navigation into an actual IDE. Stage 2 (wiring real
behavior) is a separate, later request the user will direct once this mockup is
approved.

## Where it lives

Inside `Station.tsx`'s existing `'success'` status branch, rendered directly under
the `t('stationSuccess')` message. Replaces that branch's current placeholder
content (just the message plus a temporary sign-out button). The sign-out button
stays, demoted to a small secondary action below the new UI: still needed for manual
testing until a real IDE view exists to navigate to instead, but no longer the only
thing on the screen.

## New components

Atomic Design placement per `CLAUDE.md`: this is the first **organism** in the
project (composes multiple molecules/atoms into one cohesive block), so
`components/organisms/` stops being empty.

- **`organisms/RepoSelector`**: the full block rendered under the success message.
  - A short heading/hint (i18n keys `repoSelectorHeading` / `repoSelectorHint`).
  - A scrollable list of mock repositories: a hardcoded array of 5-6 entries living
    directly in the component, varying name length and visibility (public/private),
    explicitly commented as temporary mockup data for this stage, replaced by a real
    `GET` call to GitHub's repos API in the later wiring stage.
  - Each entry rendered via `molecules/RepoListItem`.
  - One distinct "Crear nuevo repositorio" entry, visually different from the
    existing-repo items (its own dashed-border treatment, not just another list row),
    since selecting an existing repo and starting a new one are two different kinds
    of action, both equally prominent, per the user's own framing ("selector... o un
    boton de crear nuevo repo").
  - Selecting a repo (click) toggles a local "selected" visual state only (border/glow
    change reusing the existing neon-blue token, no side effect, no submit step yet).
    Clicking "Crear nuevo repositorio" is a no-op for now. Both handlers follow the
    same placeholder pattern `f02`'s original sign-in button used before it was wired
    (`// TODO(f04-stage-2): ...` plus `console.info`), not a bare do-nothing handler.
- **`molecules/RepoListItem`**: one row: `atoms/RepoIcon`, repo name, the existing
  `Badge` atom for Public/Private, a placeholder "updated" hint
  (`repoUpdatedPlaceholder`, one static string, not real timestamps), selectable via
  click/Enter/Space (a real button element, not a div with an onClick, for keyboard
  and screen-reader access).
- **`atoms/RepoIcon`**: small repo/folder glyph, same gradient-technique-free simple
  line-icon style as `BackIcon`/`EnterIcon` (no gradient/glow needed, this is a small
  inline glyph, not a brand mark).
- **`atoms/PlusIcon`**: simple plus glyph for the "Crear nuevo repositorio" action,
  same simple line-icon style.

## Responsive behavior

Mobile-first, matching the existing convention (base styles = mobile, `min-width:
1024px` override = desktop, no separate mid-tier breakpoint elsewhere in this
codebase):

- **Base (mobile)**: full-width stacked list, each `RepoListItem` a large tap target
  (comfortable height, generous padding, definitely no smaller than a 44px touch
  target), the whole `RepoSelector` block taking the content's full available width.
- **`min-width: 1024px` (desktop)**: `RepoSelector` centers itself with a constrained
  `max-width` (roughly `60rem`, tuned during implementation against real content so
  nothing looks stretched), more generous card padding, no layout reflow beyond that
  (still a single vertical list, not a grid: a repo picker reads better as a list at
  any width, unlike the login screen's 2-column layout).

## Explicitly out of scope for this stage

- Real GitHub repo listing (`GET /user/repos`, or the installation's actual
  repositories) via `Octokit`.
- Real repo creation through GitHub's API.
- Persisting the selected repo anywhere (`localStorage`, or a GitHub-backed
  `.MuunCode/workspace.json`, per `CLAUDE.md`'s own future note on that file).
- Navigating into an actual IDE/editor view after selecting or creating.
- Search or filter on the repo list.
- Loading/empty/error states for a real API call (there is no real call yet).

All of the above are the user's explicit next requests once this mockup lands, not
this feature's job.

## i18n

New keys in both `front/src/locales/es.json` and `en.json`:
`repoSelectorHeading`, `repoSelectorHint`, `createRepoButton`, `publicBadge`,
`privateBadge`, `repoUpdatedPlaceholder`.

## Design notes

- Outer container: existing `Card` atom, `variant="blue"` (matches the rest of the
  app's default card treatment), not a new container component.
- Visibility tag: existing `Badge` atom, not a new one; `RepoListItem` just decides
  which copy (`publicBadge`/`privateBadge`) to pass it.
- Spacing between list items: `var(--spacing-sm)`, no dividing lines, consistent with
  the rest of the app's glass-card-plus-spacing house style (no HRs anywhere else).
- "Crear nuevo repositorio" is a full `Button` (same visual weight as the GitHub
  sign-in CTA elsewhere in the app), not a minor link buried at the list's end.
- No new color tokens expected; reuses `--color-neon-blue` (or whichever token the
  existing focus/hover/selected treatment already uses elsewhere, verify against
  `tokens.css` during implementation rather than inventing a new one).

## Validation

See `.claude/CHECKPOINTS.md` -> "F04: Repository Selection UI (Mockup)" for the
concrete checklist.
