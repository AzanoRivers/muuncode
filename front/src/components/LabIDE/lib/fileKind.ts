export type FileKind = 'code' | 'image' | 'unsupported'

// The single source of truth for "which extensions are images", shared by FileIcon
// (icon coloring) and getFileKind below (open-in-editor routing), so the two never
// drift out of sync with each other.
export const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'])

// MuunCode's editable surface: the vanilla app-authoring languages (html/css/js, see
// CLAUDE.md's "Language Scope") plus json/md, since every real MuunCode-scaffolded
// repository also carries its own .MuunCode/workspace.json, README.md, and
// GREETINGS.md (see api/lib/repoScaffoldTemplates.ts) and those need to open too, per
// explicit user decision overriding this file's own earlier, narrower draft.
const CODE_EXTENSIONS = new Set(['html', 'css', 'js', 'json', 'md'])

export function getFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex === -1 ? '' : fileName.slice(dotIndex + 1).toLowerCase()
}

export function getFileKind(fileName: string): FileKind {
  const extension = getFileExtension(fileName)
  if (CODE_EXTENSIONS.has(extension)) return 'code'
  if (IMAGE_EXTENSIONS.has(extension)) return 'image'
  return 'unsupported'
}
