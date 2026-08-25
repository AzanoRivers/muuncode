interface FileIconProps {
  fileName: string
  size?: number
}

interface FileTypeStyle {
  color: string
  glyph: string
}

// Colors match the "Material Icon Theme" VS Code extension (github.com/PKief/
// vscode-material-icon-theme, MIT), per explicit user request over the built-in Seti
// theme: real hex values (see ../../ide-tokens.css's --ide-color-file-* section) read
// directly from that extension's own source, not invented. Unlike Seti, every
// extension here gets its own distinct color (JS and JSON no longer share one). The
// page shape and glyphs below are original artwork, never a ported/traced asset, per
// CLAUDE.md's UI Reference Methodology.
const FILE_TYPE_STYLES: Record<string, FileTypeStyle> = {
  html: { color: 'var(--ide-color-file-html)', glyph: '</>' },
  css: { color: 'var(--ide-color-file-css)', glyph: '#' },
  js: { color: 'var(--ide-color-file-js)', glyph: 'JS' },
  json: { color: 'var(--ide-color-file-json)', glyph: '{ }' },
  md: { color: 'var(--ide-color-file-markdown)', glyph: 'M' },
}

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'])

function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex === -1 ? '' : fileName.slice(dotIndex + 1).toLowerCase()
}

const PAGE_PATH = 'M3.5 1.5h5.5l3.5 3.5v9a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-11.5a1 1 0 0 1 1-1z'
const FOLD_PATH = 'M9 1.5v3.5h3.5z'

// A flat "page with a folded corner" silhouette, the same shape every file gets. Known
// project languages (HTML/CSS/JS/JSON/Markdown) get a solid, fully colored page (a
// bolder, more colorful treatment than Seti's thin outline, matching Material Icon
// Theme's own visual weight) with a small white monogram; images get a picture glyph
// instead. Anything else falls back to a plain, uncolored outline page.
export function FileIcon({ fileName, size = 16 }: FileIconProps) {
  const extension = getExtension(fileName)
  const isImage = IMAGE_EXTENSIONS.has(extension)
  const style = FILE_TYPE_STYLES[extension]
  const color = isImage ? 'var(--ide-color-file-image)' : style?.color

  if (!color) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" role="img" aria-hidden="true">
        <path d={PAGE_PATH} fill="none" stroke="var(--ide-color-file-outline)" strokeWidth="1" strokeLinejoin="round" />
        <path d="M9 1.5v3.5h3.5" fill="none" stroke="var(--ide-color-file-outline)" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" role="img" aria-hidden="true">
      <path d={PAGE_PATH} fill={color} />
      <path d={FOLD_PATH} fill="var(--ide-color-file-fold)" />
      {isImage ? (
        <g fill="var(--ide-color-file-glyph)">
          <circle cx="6" cy="8.6" r="1" />
          <path d="M3.8 12.2l2.1-2.4 1.5 1.5 2.4-2.8 2.2 3.7z" />
        </g>
      ) : (
        <text
          x="7.5"
          y="12.2"
          textAnchor="middle"
          fontSize={style.glyph === '{ }' ? 5 : 5.6}
          fontWeight="700"
          fontFamily="var(--ide-font-ui)"
          fill="var(--ide-color-file-glyph)"
        >
          {style.glyph}
        </text>
      )}
    </svg>
  )
}
