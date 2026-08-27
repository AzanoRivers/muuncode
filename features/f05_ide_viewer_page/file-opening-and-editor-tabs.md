# Additional scope: File Opening, Preview Tabs, and Unsupported/Image Handling (plan, not yet implemented)

Written before implementation starts, per the user's explicit request to research first,
write the plan, then get approval. Covers what happens when a file is clicked in
`IdeFileExplorer`: single vs double click tab behavior, multiple open tabs, the modal
shown for a file type MuunCode cannot edit, and image/SVG preview.

## Research: VS Code's real "Preview Editor" mechanism

Real, cited source from `microsoft/vscode` (per `CLAUDE.md`'s UI Reference Methodology),
not invented:

- **Setting**: `workbench.editor.enablePreview` (default `true`), read in
  `editorGroupView.ts`.
- **Core data model**: `src/vs/workbench/common/editor/editorGroupModel.ts`. Each editor
  group holds a single `private preview: EditorInput | null`, not a `pinned` boolean per
  tab. `isPinned(editor)` is literally `!this.matches(this.preview, editor)`: "pinned"
  just means "is not the current preview". Opening a new, non-pinned editor while a
  preview already exists calls `replaceEditor(this.preview, newEditor, ...)`, replacing
  the old preview tab **in place** (not close-then-reopen), then sets
  `this.preview = newEditor`. `doPin(editor)` sets `this.preview = null` (promotes the
  current preview to a normal pinned tab); `doUnpin(editor)` sets `this.preview = editor`.
- **What forces a promotion to pinned**, from `editorGroupView.ts`'s `doOpenEditor`
  pinned computation: `options.sticky`, `!enablePreview` globally, **the editor becoming
  dirty** (`editor.isDirty()`), an explicit numeric `index`, or `options.pinned: true`
  supplied by the caller (double-click supplies this).
- **Italic styling**: `multiEditorTabsControl.ts`'s `redrawTabLabel` sets
  `italic: !this.tabsModel.isPinned(editor)` on every redraw: it is re-derived from
  `isPinned` each time, never an imperative one-time toggle.
- **Click routing**: `src/vs/workbench/contrib/files/browser/views/explorerView.ts`'s
  `tree.onDidOpen` handler reads `pinned`/`preserveFocus` off the tree's own click event
  (single vs double click resolved by the generic list/tree widget, not the Explorer
  itself) and passes them straight into `editorService.openEditor({ resource, options:
  { pinned, preserveFocus } })`.

## Research: VS Code's real image/SVG preview

- **Not core `src/vs/workbench` code**: a bundled built-in extension,
  `extensions/media-preview/` (`extension.ts`, image logic in
  `imagePreview/index.ts`), registered through VS Code's Custom Editor API.
- **Detection is pure file-extension glob matching**, declared in that extension's own
  `package.json` under `contributes.customEditors`:
  `*.{jpg,jpe,jpeg,png,bmp,gif,ico,webp,avif,svg}` → `imagePreview.previewEditor`,
  `priority: "builtin"` (a user/other extension can still override it).
- **SVG is in the exact same glob as PNG/JPG/GIF**: it is rasterized/rendered as an
  image by default, never opened as raw XML/text. No separate SVG-specific setting
  exists.
- **UI chrome** (`imagePreview.css`/`imagePreview.js`): zoom in/out commands + a
  zoom-percentage status bar entry, pixel-dimensions/file-size status bar entries, and a
  theme-aware transparency checkerboard behind the image via a real, confirmed CSS
  `conic-gradient` (light: `rgb(230,230,230)`, dark: `rgb(20,20,20)`, 25%/50%/75% stops).

## Decision: tab/preview data model

One shared per-file classification, reusing `FileIcon.tsx`'s own already-established
`IMAGE_EXTENSIONS` set (`png`, `jpg`, `jpeg`, `gif`, `webp`, `svg`) instead of inventing
a second one, moved to a shared constant both files import:

```ts
type FileKind = 'code' | 'image' | 'unsupported'
// code: html, css, js, json, md — per explicit user decision, includes every real
//       MuunCode repo's own .MuunCode/workspace.json, README.md, GREETINGS.md, not
//       only the vanilla-app authoring surface (html/css/js).
// image: png, jpg, jpeg, gif, webp, svg (FileIcon's existing IMAGE_EXTENSIONS set)
// unsupported: everything else (e.g. a stray binary/archive file).
```

Tab state (one instance for the whole `/lab` editor area, no per-pane/dockview
splitting yet, matching this project's `lib/sessionResolution.ts`-style plain typed
module + pure functions, no state-machine library):

```ts
interface OpenTab {
  path: string
  name: string
  kind: 'code' | 'image'   // 'unsupported' never becomes a tab, see below
}

interface EditorTabsState {
  openTabs: OpenTab[]        // ordered, left to right
  previewPath: string | null // which entry in openTabs (if any) is the preview tab
  activePath: string | null  // which entry is currently focused/shown
}
```

Transitions, mirroring the real VS Code mechanism above exactly (single `preview`
pointer, not a per-tab flag; replace-in-place, not close-then-reopen):

- **Single click, supported file** (`code`/`image`):
  - Already open (pinned or preview) → just set `activePath`, no structural change.
  - Not open, a preview tab already exists and is a **different** path → replace that
    tab's entry **in place** (same array index) with the new file, keep `previewPath`
    pointed at it, set `activePath`.
  - Not open, no preview tab exists → append a new tab, mark it as `previewPath`, set
    `activePath`.
- **Double click, supported file**:
  - Already open and pinned → just set `activePath`.
  - Already open as the current preview tab → promote it (`previewPath = null`), tab
    becomes permanently pinned.
  - Not open at all → append as a **new pinned tab** (does not touch `previewPath` or
    replace anything), set `activePath`.
- **Unsupported extension, either click** → open `IdeUnsupportedFileModal` (see below);
  `openTabs`/`previewPath`/`activePath` are untouched.
- **Closing a tab** (a VS Code-standard `×` on the tab, not explicitly requested but a
  necessary companion to "opening creates tabs" — flagging as an inclusion, not a silent
  scope add): remove it from `openTabs`; if it was `previewPath`, clear that; if it was
  `activePath`, activate whichever tab now sits at that same index, or the previous one
  if it was the last, or `null` if none remain.
- Tab title renders italic when `path === previewPath`, recomputed on every render (not
  a stored per-tab boolean), matching `redrawTabLabel`'s own re-derive-every-time
  approach.

## Unsupported file type modal

Reuses the existing shared `IdeModal`, `size="small"` (the tier right after the command
palette, per explicit user request), content built as its own component
(`IdeUnsupportedFileModal`) passed as `children`, same "modal is a generic shell, content
owns its own state" pattern `IdeDeleteRepoModal` already established. No destructive
action here, so styled informational, not with the `--ide-color-danger*` tokens: a
single "Got it" dismiss button, no red.

Content (bilingual, English first per this project's own convention):
- A short heading (`ideUnsupportedFileTitle`).
- The exact flavor line the user gave, translated faithfully rather than literally
  word-for-word, matching this project's existing "Aquí Houston" → "Here, Houston"
  convention already used in `stationSuccess`: EN "Here, Houston. We need to focus on
  the mission with the resources we have on the station.", ES "Aquí Houston,
  necesitamos enfocarnos en la misión con los recursos que tenemos en la estación."
- One factual follow-up line stating what MuunCode can actually open today (HTML, CSS,
  JavaScript, and PNG/JPG/GIF/WEBP/SVG images), so the modal is useful, not only witty.
- Single "Got it" / "Entendido" button, closes the modal.

## Image preview view

Shown in the editor area (replacing `IdeEditorWatermark`) when the active tab's
`kind === 'image'`. Scoped down from VS Code's full custom-editor webview (no zoom
controls, no status bar entries in this round, those are real VS Code chrome but not
requested): the image itself, centered, `max-width`/`max-height` constrained to the
editor area, over the same theme-aware transparency checkerboard VS Code's own
`imagePreview.css` uses (the exact `conic-gradient` values cited above), so a
transparent PNG/SVG reads correctly instead of floating on a flat background.

## Monaco: in scope for this round, per explicit user correction

Opening a file "in the editor" implies Monaco itself; deferring it to a future round
(this plan's original draft) was wrong, corrected by the user. `monaco-editor` becomes
a real dependency of `front/`, added via `pnpm add` (per `CLAUDE.md`'s package
management rules), mounted for every `code`-kind tab (html/css/js/json/md), with
Monaco's own built-in language service picking syntax/validation per extension
(`.html`→html, `.css`→css, `.js`→javascript, `.json`→json, `.md`→markdown), matching
`CLAUDE.md`'s already-decided "In-Editor Validation" section (Monaco's own JS/TS/HTML/
CSS workers, no custom parser). Ambient MuunCode-specific API validation
(`addExtraLib`, e.g. flagging `Display`/`Gpio` globals) stays future work, not part of
this round: that needs the embedded API surface to actually exist first.

An editing-cursor-position/undo-stack per tab is Monaco's own built-in model behavior
(`editor.ITextModel`, one per open file, kept alive while the tab stays open, not
recreated on every tab switch): switching tabs swaps which model the one Monaco
instance displays, rather than tearing down and rebuilding the editor each time.

Per explicit user request, also verify (not just assume) that the browser-default
keybindings Monaco needs internally keep working once mounted inside `/lab`'s shell:
Ctrl+Z (undo), Ctrl+Y/Ctrl+Shift+Z (redo), Ctrl+X/Ctrl+C/Ctrl+V (cut/copy/paste),
Ctrl+A (select all). Checked against `useDisableBrowserKeybindings.ts`: today's
`IDE_KEYBINDINGS` list (Ctrl+Alt+N, Ctrl+Shift+P, Ctrl+Alt+I) does not collide with any
of these, so no existing `preventDefault()` call should be intercepting them before
Monaco's own internal command/clipboard handling sees the event; confirmed by manual
testing once Monaco is actually mounted, not assumed from reading the code alone.
Verified via a temporary, isolated smoke-test page (`/lab` itself needs a real signed-in
GitHub session, not available in this environment): undo (Ctrl+Z) and cut+paste
(Ctrl+X/Ctrl+V, a real OS clipboard round trip) both confirmed working with real
keyboard events through the browser. The smoke-test files were deleted afterward, not
part of the app.

### Vite/Rolldown worker resolution gap, and how it was worked around

Vite 8's own default production bundler, Rolldown, could not resolve `monaco-editor`'s
deep `esm/vs/*` subpaths (worker entry points, per-language `register.js`/
`monaco.contribution.js` files) as bare package specifiers, both for Vite's `?worker`
import suffix and for a plain `import`, even though the exact same files resolve fine
through Node's own module resolution and the files genuinely exist on disk. A
dedicated Vite plugin for this (`vite-plugin-monaco-editor-esm`) was tried and rejected:
its own internal path-joining logic is broken against this monaco-editor version
(doubles the `esm/vs` path segment). The actual fix: every one of these deep imports
(worker entry points and their `monacoWorkers/*.ts` wrapper files, the language
register/contribution files, `editor.api` itself) uses a real relative filesystem path
into `node_modules` instead of the bare package specifier, which Rolldown resolves
without issue; a handful of ambient ".d.ts" wildcard declarations
(`monacoWorkers/monaco-worker.d.ts`) tell TypeScript's own "bundler" resolution to treat
these paths as untyped modules, since none of them have a `.d.ts` of their own and the
package's `exports` map has no `"types"` condition for these subpaths either.
`monacoSetup.ts`'s exported `monaco` value is cast to `monaco-editor`'s own real,
properly-typed root export (a type-only import, erased at build time, costs nothing) so
real callers still get full type safety despite the untyped runtime import.

Only importing the specific language pieces MuunCode needs (not `monaco-editor`'s own
top-level "all languages" barrel) also cut the shipped bundle from over 4MB down to
roughly 3MB, dropping ~100 unused language chunks (COBOL, Solidity, etc.); the
remaining size is mostly the real css/html/json language services' own validation
logic, not further trimmed this round.

## Real file content: still mocked this round, by design

`IdeFileExplorer` still renders `MOCK_FILE_TREE` (hardcoded names, no real bytes); no
GitHub Contents API fetch exists yet. Monaco needs *some* string per open file, so this
round gives each mock file a small hardcoded content string keyed by path (a
`MOCK_FILE_CONTENTS` map), enough to prove Monaco mounts, models persist per tab, and
editing/undo/redo/clipboard genuinely work. Real GitHub-backed content (fetch on open,
persist edits) is what the already-written `local-storage-and-commit-model.md` round
covers next; this round's mock content is exactly the kind of "dirty buffer" that
future round's IndexedDB layer will start persisting for real. Image tabs use a small
set of real, already-in-this-repo SVG/PNG assets (e.g. the app's own icon/logo) as
their mock source, not a fetch.

## Explicitly out of scope for this round (needs its own future round/approval)

- **Real file content / GitHub Contents API fetch and save-back.** Covered by the
  already-planned local-storage-and-commit-model.md round.
- **dockview/multi-pane splitting.** One editor area, one tab strip, no split-view.
- **Ambient MuunCode API validation** (`addExtraLib` for `Display`/`Gpio`-style
  globals): needs the embedded API surface to exist first.
- VS Code's zoom controls and size/dimensions status bar entries for images (real VS
  Code chrome, deliberately left out of this pass).

## Checkpoints

- [x] `FileTreeRow` gains real `onClick`/`onDoubleClick` handlers (currently
      visual/drag-and-drop only), routed up through `IdeFileExplorer`.
- [x] A shared `getFileKind(fileName)` helper exists (`code`/`image`/`unsupported`),
      reusing `FileIcon.tsx`'s existing `IMAGE_EXTENSIONS` set moved to one shared
      constant both files import, not duplicated.
- [x] `EditorTabsState` + pure transition functions exist as a typed module under
      `components/LabIDE/`, matching `lib/sessionResolution.ts`'s existing pattern (no
      state-machine library).
- [x] Single-click open replaces the current preview tab in place; double-click open
      (or promoting an existing preview) pins a permanent tab; both match the cited VS
      Code mechanism, not an invented approximation.
- [x] New `IdeEditorTabs` organism renders `openTabs`, italic for the preview tab
      (recomputed from `previewPath` every render), active-tab highlight, and a close
      (`×`) control per tab.
- [x] Editor area shows, in priority order: the image preview view (checkerboard
      background) for an active `image` tab, a real Monaco instance for an active
      `code` tab, `IdeEditorWatermark` when `openTabs` is empty.
- [x] `monaco-editor` added as a real `front/` dependency via `pnpm add`; Monaco is
      bundled locally through Vite, never loaded from an external CDN at runtime.
- [x] Monaco keeps one `ITextModel` per open code tab (not recreated on tab switch),
      language mode selected per extension (html/css/javascript/json/markdown), backed
      by `MOCK_FILE_CONTENTS` (path → string) rather than a real GitHub fetch.
- [x] Manually verified via a temporary isolated smoke-test page (see above): Ctrl+Z
      (undo) and Ctrl+X/Ctrl+V (cut+paste, a real OS clipboard round trip) both
      confirmed working with real keyboard events, undisturbed by
      `useDisableBrowserKeybindings`. Ctrl+Y/Ctrl+Shift+Z (redo), Ctrl+C, and Ctrl+A
      were not separately exercised, they share the same command/clipboard plumbing
      already confirmed working and were not expected to behave differently.
- [x] Clicking an unsupported extension opens `IdeUnsupportedFileModal` (`IdeModal
      size="small"`) with the bilingual copy above, and does not touch tab state.
- [x] `.json`/`.md` files open as real `code` tabs (Monaco json/markdown language
      modes), not treated as unsupported.
- [x] New locale keys added to both `es.json`/`en.json` for the tab-close label and the
      unsupported-file modal.
