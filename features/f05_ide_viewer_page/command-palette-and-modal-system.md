# Additional scope: Reusable Modal System + Command Palette / Commit Modal Wiring

No dedicated spec file existed before this round. Builds the generic `IdeModal`
molecule (`front/src/components/LabIDE/molecules/IdeModal/`) and wires two of
`keybindings.ts`'s existing `IDE_KEYBINDINGS` (`showAllCommands`, `openCommitModal`)
to actually open it, with placeholder content: proves the keybinding -> modal wiring,
not either modal's real content (see
`local-storage-and-commit-model.md` for what the commit modal will eventually need).

## Four sizes, real VS Code reference per size

Per `CLAUDE.md`'s UI Reference Methodology, researched directly against
`microsoft/vscode` (main branch) rather than invented:

- **`palette`**: modeled on Quick Input / the Command Palette
  (`src/vs/platform/quickinput/browser/`, `media/quickInput.css`). Real values used:
  `width: 600px`, positioned near the top of the viewport (not vertically centered),
  no dimmed backdrop behind it.
- **`small` / `medium` / `large`**: sizes themselves (`small` 40rem/24rem min-height,
  `medium` 70rem/40rem min-height, `large` 80vw/80vh) are this project's own, VS Code
  has no equivalent named-size system. `medium` was originally 56rem (closer to the
  real Dialog widget's own `min-width: 480px`/48rem) but that made it read as barely
  bigger than, or even smaller than, `palette` (60rem wide, no min-height) once both
  only held short placeholder content; widened to 70rem with a real min-height so the
  size difference is visually obvious regardless of content length. **Superseded**:
  this round initially
  modeled these three on VS Code's real Dialog (`src/vs/base/browser/ui/dialog/
  dialog.ts`, `dialog.css`), which does have a dimmed backdrop and does not close on
  a backdrop click. The user explicitly rejected the backdrop after seeing it ("no
  quiero overlays"): every size now behaves like the palette instead, no dimming, an
  invisible centering layer only (`pointer-events: none`, never intercepts a click
  itself), closing on Escape or an outside click for every size, no exception.
- Assigned so far: `showAllCommands` -> `palette`, `openCommitModal` -> `medium`, both
  per explicit user request.

## The one deliberate deviation from real VS Code: a shared transition

VS Code's real Quick Input DOES have a CSS open/close animation (confirmed in
`media/quickInput.css`): 250ms open / 150ms close, `cubic-bezier(0.22, 1, 0.36, 1)`,
opacity + `transform: scale(0.97/0.99)`, `transform-origin: top center`. VS Code's
real Dialog has none at all, it appears/disappears instantly. Per explicit user
request ("esa es la transición... que quiero que hagamos"), `IdeModal` applies the
Quick Input transition to every size uniformly. This is the one place this round's
implementation is a deliberate stylistic choice over the literal source, not a
faithful match; documented here so it does not read as a research mistake later.

## Component shape

`IdeModal({ isOpen, onClose, size, children })`: the parent always keeps both modal
instances mounted in JSX (never `{condition && <IdeModal />}`), controlling visibility
through the `isOpen` prop instead. `IdeModal` tracks its own `shouldRender`/`isClosing`
state internally so the 150ms close animation actually gets to play before the
component unmounts; conditionally unmounting it at the call site would cut that
animation off immediately. Closes on Escape or an outside click, every size, no
exception (see "Superseded" note above): a single document-level containment check
handles this uniformly, there is no separate backdrop-click handler.

## Tokens

Reuses existing tokens for the modal surface (`--ide-color-menu-bg`,
`--ide-color-menu-border`, `--radius-md`) rather than adding near-duplicates. No
backdrop-dimming token exists (an earlier `--ide-color-overlay-backdrop` was added
and then removed once the backdrop itself was rejected, see "Superseded" above).

## Explicitly out of scope for this round

- The command palette's real content (a search input, a filtered command list):
  placeholder text only for now.
- The commit modal's real content (dirty-file list with checkboxes, commit message
  field, the actual `commitFiles` call): see `local-storage-and-commit-model.md`,
  none of that layer exists yet either.
- Wiring the `IdeMenuBar`/`IdeContextMenu` mock menu items (e.g. "View > Command
  Palette...") to also open these modals: only the keyboard shortcuts were asked for
  and wired this round; those menu items stay inert mocks, unchanged from earlier
  rounds.
- `small`/`large` sizes are not used by anything yet (no real feature has claimed
  them); they exist now so `IdeModal` does not need a breaking API change once one
  does.

## Checkpoints

- [x] `IdeModal` exists in `components/LabIDE/molecules/`, exported from that
      category's barrel, supporting exactly the four sizes above.
- [x] No size has a dimmed backdrop; every size closes on Escape or an outside click
      (superseded from this round's initial Dialog-matched design, see above).
- [x] Every size shares the same open (250ms) / close (150ms) animation, respecting
      `prefers-reduced-motion: reduce`.
- [x] `showAllCommands` opens the `palette` modal, `openCommitModal` opens the
      `medium` modal, both via the existing `keybindings.ts` definitions (no
      duplicated key-matching logic).
- [x] No em dash, no `throw`, no new literal color/spacing value outside
      `ide-tokens.css`, no new runtime dependency.
- [x] `pnpm build` and `pnpm lint` (from `front/`) pass; root `pnpm exec tsc
      --noEmit` passes.
