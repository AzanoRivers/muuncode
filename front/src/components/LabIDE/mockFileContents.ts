// Stand-in file content, keyed by the exact same path format IdeFileExplorer's own
// flattenTree() produces (leading slash, e.g. "/index.html"). No GitHub Contents API
// fetch exists yet (see features/f05_ide_viewer_page/file-opening-and-editor-tabs.md):
// this is only enough real text per mock file to prove Monaco actually mounts, keeps
// one model per tab, and that editing/undo/redo/clipboard genuinely work. Real,
// GitHub-backed content is what the already-planned local-storage-and-commit-model.md
// round wires in next.
// Image tabs need a real, already-in-this-repo asset URL to render, not fetched
// content: front/public/icon.svg (MuunCode's own favicon, served at /icon.svg) stands
// in for the mock tree's one image, /assets/logo.svg.
export const MOCK_IMAGE_SOURCES: Record<string, string> = {
  '/assets/logo.svg': '/icon.svg',
}

export const MOCK_FILE_CONTENTS: Record<string, string> = {
  '/.MuunCode/workspace.json': JSON.stringify(
    { muunCodeVersion: 1, name: 'project-zero-muuncode', device: null, display: null, createdAt: '2026-01-01T00:00:00.000Z' },
    null,
    2,
  ),
  '/index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My MuunCode Project</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>Hello, Moon!</h1>
    <script src="script.js"></script>
  </body>
</html>
`,
  '/style.css': `body {
  font-family: sans-serif;
  background: #041528;
  color: #f5f8ff;
}
`,
  '/script.js': `console.log('Hello from MuunCode!')
`,
  '/GREETINGS.md': `# GREETINGS / HOLA!!!

Hello! I'm AzanoRivers, and it excites me to think you're building something
incredible. Think big, build bigger.
`,
  '/README.md': `# project-zero-muuncode

[English](#english) | [Español](#español)

## English

### Purpose

_What this project does and the problem it solves._
`,
}
