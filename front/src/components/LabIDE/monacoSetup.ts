// The core editor API only, not `monaco-editor`'s own top-level barrel
// (`monaco-editor/esm/vs/editor/editor.main.js`), which registers every language
// Monaco ships (100+, including things like COBOL and Solidity): MuunCode only ever
// opens html/css/js/json/md (see lib/fileKind.ts), so only those get registered below,
// keeping the shipped bundle to what this project actually uses instead of Monaco's
// full language catalog.
//
// Typed via a cast to the root `monaco-editor` package's own real, fully-typed export
// (a type-only import, erased entirely, costs nothing at runtime) rather than this
// subpath's own types, which TypeScript's "bundler" resolution cannot see (see
// monacoWorkers/monaco-worker.d.ts's own comment): the real runtime value still comes
// from the small `editor.api` subpath import below, only the type annotation is
// borrowed.
import * as monacoApi from '../../../node_modules/monaco-editor/esm/vs/editor/editor.api'
import type * as MonacoNamespace from 'monaco-editor'

export const monaco = monacoApi as unknown as typeof MonacoNamespace

// html/css/js/md's tokenizers (syntax highlighting); JSON has no separate "basic"
// tokenizer, its rich contribution below already covers it.
import '../../../node_modules/monaco-editor/esm/vs/languages/definitions/html/register.js'
import '../../../node_modules/monaco-editor/esm/vs/languages/definitions/css/register.js'
import '../../../node_modules/monaco-editor/esm/vs/languages/definitions/javascript/register.js'
import '../../../node_modules/monaco-editor/esm/vs/languages/definitions/markdown/register.js'

// css/html/json's own rich language contributions (validation, completions), each
// backed by its own worker (see the worker wiring below). No equivalent import for
// javascript: MuunCode's authored surface is vanilla JavaScript only (see CLAUDE.md's
// "Language Scope"), so the plain tokenizer above is what this project actually needs,
// not the full TypeScript language service `language/typescript` would pull in.
import '../../../node_modules/monaco-editor/esm/vs/language/css/monaco.contribution.js'
import '../../../node_modules/monaco-editor/esm/vs/language/html/monaco.contribution.js'
import '../../../node_modules/monaco-editor/esm/vs/language/json/monaco.contribution.js'

import EditorWorker from './monacoWorkers/editorWorker?worker'
import JsonWorker from './monacoWorkers/jsonWorker?worker'
import CssWorker from './monacoWorkers/cssWorker?worker'
import HtmlWorker from './monacoWorkers/htmlWorker?worker'

declare global {
  interface Window {
    MonacoEnvironment: { getWorker(moduleId: string, label: string): Worker }
  }
}

// Vite's own documented Monaco recipe (each language worker imported via Vite's
// `?worker` suffix), routed through this project's own local relative-path wrapper
// files (monacoWorkers/*.ts) instead of importing monaco-editor's deep subpaths
// directly: Vite 8's default production bundler (Rolldown) failed to resolve those
// bare package specifiers combined with `?worker`, but resolves a real relative
// filesystem path into node_modules just fine (see monacoWorkers/editorWorker.ts's own
// comment for the full story). Bundled locally through Vite like every other
// dependency, never loaded from an external CDN at runtime.
window.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    switch (label) {
      case 'json':
        return new JsonWorker()
      case 'css':
      case 'scss':
      case 'less':
        return new CssWorker()
      case 'html':
      case 'handlebars':
      case 'razor':
        return new HtmlWorker()
      default:
        return new EditorWorker()
    }
  },
}
