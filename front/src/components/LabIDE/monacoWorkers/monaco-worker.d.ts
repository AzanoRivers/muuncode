// monaco-editor ships every one of its deep esm/vs/* subpaths (worker entry points,
// per-language register.js/monaco.contribution.js files, editor.api itself) as plain
// compiled .js with no .d.ts of its own, and its package.json "exports" map declares
// an "import" condition for these subpaths but no matching "types" condition, so
// TypeScript's "bundler" module resolution cannot find any of them on its own; Vite 8's
// default production bundler (Rolldown) separately fails to resolve the same subpaths
// as bare package specifiers, so every import of one of these files in this project
// uses a real relative filesystem path into node_modules instead (see this folder's own
// .ts files), matched here by suffix rather than by the bare specifier prefix. None of
// these are ever used for their exports here (imported purely for side effects:
// registering a language, or bootstrapping a Worker's onmessage listener), except
// editor.api, which monacoSetup.ts casts to monaco-editor's own real, fully-typed root
// export instead of relying on this file's intentionally untyped placeholder.
declare module '*worker.js' {}
declare module '*register.js' {}
declare module '*monaco.contribution.js' {}
declare module '*editor.api' {}
