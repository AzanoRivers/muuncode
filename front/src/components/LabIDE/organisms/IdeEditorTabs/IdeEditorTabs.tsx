import { useTranslation } from 'react-i18next'
import { CloseIcon, FileIcon } from '@/components/LabIDE/atoms'
import type { OpenTab } from '@/components/LabIDE/editorTabs'
import styles from './IdeEditorTabs.module.css'

interface IdeEditorTabsProps {
  tabs: OpenTab[]
  previewPath: string | null
  activePath: string | null
  onActivate: (path: string) => void
  onClose: (path: string) => void
}

// The tab strip above the editor area: one entry per OpenTab, italic while it is the
// current preview tab (recomputed from previewPath on every render, never a stored
// per-tab boolean, matching VS Code's own real redrawTabLabel, see
// features/f05_ide_viewer_page/file-opening-and-editor-tabs.md's research section).
// Click routing itself (single click -> preview/replace, double click -> pin) lives in
// IdeFileExplorer/FileTreeRow, not here: this only reflects whatever EditorTabsState
// already is and lets the user activate or close an already-open tab.
export function IdeEditorTabs({ tabs, previewPath, activePath, onActivate, onClose }: IdeEditorTabsProps) {
  const { t } = useTranslation()

  if (tabs.length === 0) return null

  return (
    <div className={styles.strip} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.path === activePath
        const isPreview = tab.path === previewPath
        const tabClassName = isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab

        return (
          <div key={tab.path} className={tabClassName} role="tab" aria-selected={isActive} onClick={() => onActivate(tab.path)}>
            <span className={styles.icon}>
              <FileIcon fileName={tab.name} size={16} />
            </span>
            <span className={isPreview ? `${styles.name} ${styles.namePreview}` : styles.name}>{tab.name}</span>
            <button
              type="button"
              className={styles.closeButton}
              aria-label={t('ideEditorTabCloseLabel')}
              onClick={(event) => {
                event.stopPropagation()
                onClose(tab.path)
              }}
            >
              <CloseIcon size={12} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
