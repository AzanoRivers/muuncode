import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { IdeMenuList } from '@/components/LabIDE/molecules'
import type { IdeMenuListItem } from '@/components/LabIDE/molecules'
import styles from './IdeContextMenu.module.css'

interface IdeContextMenuProps {
  x: number
  y: number
  onClose: () => void
}

// Static, non-functional mock items for now (this round is visual-design-only, see
// features/f05_ide_viewer_page): a plausible right-click set for a file explorer/
// editor, not yet wired to anything real.
const ITEMS: IdeMenuListItem[] = [
  { key: 'newFile', labelKey: 'ideContextMenuNewFile' },
  { key: 'newFolder', labelKey: 'ideContextMenuNewFolder' },
  { key: 'rename', labelKey: 'ideContextMenuRename' },
  { key: 'delete', labelKey: 'ideContextMenuDelete' },
  { key: 'copyPath', labelKey: 'ideContextMenuCopyPath' },
]

// The /lab editor shell's own right-click menu, replacing the browser's native one
// (see LabViewer.tsx's onContextMenu, which calls preventDefault() before rendering
// this). Reuses IdeMenuList for its items: VS Code itself reuses one real `Menu`
// widget for both its menu-bar dropdowns and its context menus
// (src/vs/base/browser/ui/menu/menu.ts), so this project mirrors that instead of a
// second, separately-maintained item-list implementation. Positioned at the click
// coordinates, then flipped left/up if it would otherwise overflow the viewport, the
// same real mechanism VS Code's own contextview.ts uses (measure the menu after it
// mounts, flip if it does not fit), reimplemented from scratch per this project's UI
// Reference Methodology. Closes on outside click or Escape, matching IdeMenuBar's own
// dropdown and VS Code's real Menu widget.
export function IdeContextMenu({ x, y, onClose }: IdeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: y, left: x })

  useLayoutEffect(() => {
    const menu = menuRef.current
    if (!menu) return

    const rect = menu.getBoundingClientRect()
    const left = x + rect.width > window.innerWidth ? Math.max(0, x - rect.width) : x
    const top = y + rect.height > window.innerHeight ? Math.max(0, y - rect.height) : y
    setPosition({ top, left })
  }, [x, y])

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      style={{ '--context-menu-top': `${position.top}px`, '--context-menu-left': `${position.left}px` } as CSSProperties}
    >
      <IdeMenuList items={ITEMS} />
    </div>
  )
}
