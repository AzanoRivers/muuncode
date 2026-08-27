// Not a real export: this worker's own file (editor.worker.js) has no default export,
// it just runs its own onmessage-listener setup as a top-level side effect once
// evaluated inside the Worker global scope. Vite's `?worker` transform (see
// monacoSetup.ts) only needs this file's code to run as the worker's entry point, it
// does not care what it exports.
import '../../../../node_modules/monaco-editor/esm/vs/editor/editor.worker.js'
