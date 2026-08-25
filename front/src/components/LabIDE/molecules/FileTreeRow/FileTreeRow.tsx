import type { CSSProperties, DragEvent } from 'react'
import { ChevronIcon, RepoIcon } from '@/components/atoms'
import { FileIcon } from '@/components/LabIDE/atoms'
import styles from './FileTreeRow.module.css'

type DropPosition = 'before' | 'after' | 'inside'

interface FileTreeRowProps {
  name: string
  type: 'file' | 'folder'
  depth: number
  isDragging: boolean
  dropIndicator: DropPosition | null
  onDragStart: () => void
  onDragOver: (position: DropPosition) => void
  onDragLeave: () => void
  onDrop: () => void
  onDragEnd: () => void
}

// One row of IdeFileExplorer's static mock tree: no click/select interaction yet (see
// features/f05_ide_viewer_page), hover highlight is pure CSS. `depth` drives
// indentation via a CSS custom property (this project's one documented exception to
// no-inline-styles, per CLAUDE.md), matching VS Code's own per-level indent (16px,
// src/vs/workbench/contrib/files/browser). Folders always render as already-expanded
// (a static down chevron, no real collapse state); reuses RepoIcon as the folder glyph
// (already a folder-shaped icon in this codebase) rather than adding a duplicate SVG,
// recolored via .iconFolder to Material Icon Theme's own default folder color.
//
// Drag and drop is visual-only (no real move, this round's explicit scope): the sector
// math and folder-vs-file drop rule below match VS Code's own real
// FileDragAndDrop/listView.ts (per this project's UI Reference Methodology): a row is
// split into quarters by mouse Y position; a folder target always accepts a drop
// "inside" it regardless of which quarter, a file target never does; it only ever
// shows a before/after insertion line relative to itself.
export function FileTreeRow({
  name,
  type,
  depth,
  isDragging,
  dropIndicator,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: FileTreeRowProps) {
  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = 'move'
    onDragStart()
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    const relativeY = (event.clientY - rect.top) / rect.height
    const sector = Math.min(3, Math.max(0, Math.floor(relativeY / 0.25)))
    const position: DropPosition = type === 'folder' ? 'inside' : sector <= 1 ? 'before' : 'after'
    onDragOver(position)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    onDrop()
  }

  const rowClassName = [
    styles.row,
    isDragging && styles.rowDragging,
    dropIndicator === 'inside' && styles.dropInside,
    dropIndicator === 'before' && styles.dropBefore,
    dropIndicator === 'after' && styles.dropAfter,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={rowClassName}
      style={{ '--tree-depth': depth } as CSSProperties}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
      onDragEnd={onDragEnd}
    >
      <span className={styles.twistie}>{type === 'folder' && <ChevronIcon size={14} />}</span>
      <span className={type === 'folder' ? `${styles.icon} ${styles.iconFolder}` : styles.icon}>
        {type === 'folder' ? <RepoIcon size={20} /> : <FileIcon fileName={name} size={20} />}
      </span>
      <span className={styles.name}>{name}</span>
    </div>
  )
}
