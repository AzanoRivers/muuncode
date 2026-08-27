import styles from './IdeImagePreview.module.css'

interface IdeImagePreviewProps {
  src: string
  name: string
}

// Scoped down from VS Code's own real image preview (a full webview-based custom
// editor, see features/f05_ide_viewer_page/file-opening-and-editor-tabs.md's research
// section): no zoom controls or status bar entries yet, just the image itself,
// centered and constrained, over the same transparency checkerboard VS Code's own
// imagePreview.css uses, so a transparent PNG/SVG reads correctly instead of floating
// on a flat background.
export function IdeImagePreview({ src, name }: IdeImagePreviewProps) {
  return (
    <div className={styles.container}>
      <img src={src} alt={name} className={styles.image} />
    </div>
  )
}
