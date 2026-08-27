import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronIcon } from '@/components/atoms'
import { BranchIcon } from '@/components/LabIDE/atoms'
import { FileTreeRow } from '@/components/LabIDE/molecules'
import styles from './IdeFileExplorer.module.css'

interface IdeFileExplorerProps {
  repoName: string
  // Not read from anywhere real yet (no branch data is fetched or persisted in
  // ActiveProject, see lib/activeProject.ts): defaults to "master" so every repo shows
  // something plausible today. Visual only for now, per explicit scope; this prop is
  // the intended seam for a future branch switcher once the app actually tracks the
  // repo's real current branch.
  branchName?: string
  // Single click -> 'preview' (replaces the current preview tab), double click ->
  // 'pinned' (opens/promotes a permanent tab). Only ever called for a file row, never
  // a folder: LabViewer owns file-kind classification (code/image/unsupported) and
  // what each mode actually does to EditorTabsState, this component only reports which
  // path was clicked and how.
  onOpenFile: (path: string, name: string, mode: 'preview' | 'pinned') => void
}

interface FileTreeNode {
  name: string
  type: 'file' | 'folder'
  children?: FileTreeNode[]
}

interface FlatTreeRow {
  key: string
  name: string
  type: 'file' | 'folder'
  depth: number
}

type DropPosition = 'before' | 'after' | 'inside'

interface DropTarget {
  key: string
  position: DropPosition
}

// Hardcoded mock tree, standing in for a real GitHub Contents API file listing (not
// wired up yet, see features/f05_ide_viewer_page): shaped after what
// new-repo-scaffold.md's real scaffold actually commits (.MuunCode/workspace.json,
// README.md, GREETINGS.md) plus the html/css/js/image files a real project will have,
// so every file-type icon this round asked for has something to render.
const MOCK_FILE_TREE: FileTreeNode[] = [
  { name: '.MuunCode', type: 'folder', children: [{ name: 'workspace.json', type: 'file' }] },
  { name: 'assets', type: 'folder', children: [{ name: 'logo.svg', type: 'file' }] },
  { name: 'index.html', type: 'file' },
  { name: 'style.css', type: 'file' },
  { name: 'script.js', type: 'file' },
  { name: 'GREETINGS.md', type: 'file' },
  { name: 'README.md', type: 'file' },
]

function flattenTree(nodes: FileTreeNode[], depth: number, parentPath: string): FlatTreeRow[] {
  return nodes.flatMap((node) => {
    const path = `${parentPath}/${node.name}`
    const row: FlatTreeRow = { key: path, name: node.name, type: node.type, depth }
    return node.children ? [row, ...flattenTree(node.children, depth + 1, path)] : [row]
  })
}

// /lab's left sidebar: the repo's file tree, VS Code's own explorer structure and
// sizing (row height, indent, icon size, all real values from
// src/vs/workbench/contrib/files/browser, see this round's own research), reimplemented
// from scratch in React + CSS Modules per CLAUDE.md's UI Reference Methodology. Static
// otherwise: no select/open interaction beyond hover, per this round's scope. Drag and
// drop state (which row is being dragged, which row/position is the current drop
// target) lives here rather than in each FileTreeRow, since the drop indicator on one
// row depends on what is being dragged elsewhere in the same tree; visual-only, no
// actual reordering of MOCK_FILE_TREE happens on drop.
export function IdeFileExplorer({ repoName, branchName = 'master', onOpenFile }: IdeFileExplorerProps) {
  const { t } = useTranslation()
  const [draggedKey, setDraggedKey] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const rows = flattenTree(MOCK_FILE_TREE, 0, '')

  const clearDragState = () => {
    setDraggedKey(null)
    setDropTarget(null)
  }

  const handleDragOver = (key: string, position: DropPosition) => {
    if (key === draggedKey) return
    setDropTarget({ key, position })
  }

  const handleDragLeave = (key: string) => {
    setDropTarget((current) => (current?.key === key ? null : current))
  }

  return (
    <nav className={isCollapsed ? `${styles.explorer} ${styles.collapsed}` : styles.explorer} aria-label={t('ideExplorerLabel')}>
      {/* Fades out fast (before/at the very start of the width shrink) when collapsing,
          and only fades back in once the width has mostly finished growing back on
          expand: both timings come from IdeFileExplorer.module.css's own transition
          rules, not JS, so there is no awkward moment where this content is still
          visible while the panel around it is mid-shrink. aria-hidden removes it from
          the accessibility tree too while collapsed, not just visually. */}
      <div className={styles.content} aria-hidden={isCollapsed}>
        <p className={styles.sectionHeader}>{t('ideExplorerLabel')}</p>
        <p className={styles.repoName}>{repoName}</p>
        <div className={styles.tree}>
          {rows.map((row) => (
            <FileTreeRow
              key={row.key}
              name={row.name}
              type={row.type}
              depth={row.depth}
              isDragging={draggedKey === row.key}
              dropIndicator={dropTarget?.key === row.key ? dropTarget.position : null}
              onDragStart={() => setDraggedKey(row.key)}
              onDragOver={(position) => handleDragOver(row.key, position)}
              onDragLeave={() => handleDragLeave(row.key)}
              onDrop={clearDragState}
              onDragEnd={clearDragState}
              onClick={row.type === 'file' ? () => onOpenFile(row.key, row.name, 'preview') : undefined}
              onDoubleClick={row.type === 'file' ? () => onOpenFile(row.key, row.name, 'pinned') : undefined}
            />
          ))}
        </div>
      </div>
      <div className={styles.bottomBar}>
        <span className={styles.branchLabel}>
          <BranchIcon size={15} />
          {branchName}
        </span>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={t(isCollapsed ? 'ideExplorerExpandLabel' : 'ideExplorerCollapseLabel')}
          onClick={() => setIsCollapsed((current) => !current)}
        >
          <ChevronIcon size={14} />
        </button>
      </div>
    </nav>
  )
}
