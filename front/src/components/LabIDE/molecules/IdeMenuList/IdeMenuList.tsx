import { useTranslation } from 'react-i18next'
import styles from './IdeMenuList.module.css'

export interface IdeMenuListItem {
  key: string
  labelKey: string
  onClick?: () => void
  // Visually flags a destructive action (e.g. File menu's "Delete Repository"): styled
  // with --ide-color-danger instead of the default menu-selection hover, per this
  // project's token-driven color rule (see IdeMenuList.module.css).
  danger?: boolean
}

interface IdeMenuListProps {
  items: IdeMenuListItem[]
}

// The list-of-items part shared by IdeMenuBar's own dropdowns (both File/Edit/... and
// the settings menu) and IdeContextMenu: VS Code itself reuses one real `Menu` widget
// (src/vs/base/browser/ui/menu/menu.ts) for both its menu bar dropdowns and its
// right-click context menus, so this project mirrors that instead of keeping several
// separate item-list implementations in sync by hand. Items with no `onClick` are
// still static, non-functional mocks (this round is visual-design-only for those, see
// features/f05_ide_viewer_page); items that do provide one (e.g. the settings menu's
// "change repository"/"sign out") render as a real, focusable, keyboard-activatable
// `button` instead of an inert `div`.
export function IdeMenuList({ items }: IdeMenuListProps) {
  const { t } = useTranslation()

  return (
    <div role="menu">
      {items.map((item) => {
        const className = item.danger ? `${styles.item} ${styles.itemDanger}` : styles.item
        return item.onClick ? (
          <button key={item.key} type="button" className={className} role="menuitem" onClick={item.onClick}>
            {t(item.labelKey)}
          </button>
        ) : (
          <div key={item.key} className={className} role="menuitem">
            {t(item.labelKey)}
          </div>
        )
      })}
    </div>
  )
}
