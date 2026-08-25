import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GitHubIcon, MoonOrbitLogo } from '@/components/atoms'
import { GearIcon } from '@/components/LabIDE/atoms'
import { IdeMenuList } from '@/components/LabIDE/molecules'
import type { IdeMenuListItem } from '@/components/LabIDE/molecules'
import { truncateIdeFileName, truncateIdeLabel } from '@/components/LabIDE/lib/truncateIdeLabel'
import styles from './IdeMenuBar.module.css'

// Character caps for the title pill's two labels, independent from one another since a
// long repo name should not eat into the file name's own budget or vice versa. The
// pill's CSS max-width (.titlePill) is the real collision guard against the left/right
// toolbars; these caps just keep the common case short before that limit ever kicks in.
const REPO_NAME_MAX_LENGTH = 24
const FILE_NAME_MAX_LENGTH = 20

interface IdeMenuBarProps {
  repoName: string
  openFileName: string
  onChangeRepo: () => void
  onSignOut: () => void
  onDeleteRepo: () => void
}

const SETTINGS_MENU_KEY = 'settings'

// Menu key -> its own items. Mirrors VS Code's real top-level menu bar
// (src/vs/workbench/browser/parts/titlebar), trimmed to the six menus this round asked
// for; every item is a static, non-functional mock (this round is visual-design-only,
// see features/f05_ide_viewer_page): no onClick beyond closing the menu.
const MENUS: { key: string; labelKey: string; items: IdeMenuListItem[] }[] = [
  {
    key: 'file',
    labelKey: 'ideMenuFile',
    items: [
      { key: 'newFile', labelKey: 'ideMenuFileNewFile' },
      { key: 'openFile', labelKey: 'ideMenuFileOpenFile' },
      { key: 'save', labelKey: 'ideMenuFileSave' },
      { key: 'saveAll', labelKey: 'ideMenuFileSaveAll' },
    ],
  },
  {
    key: 'edit',
    labelKey: 'ideMenuEdit',
    items: [
      { key: 'undo', labelKey: 'ideMenuEditUndo' },
      { key: 'redo', labelKey: 'ideMenuEditRedo' },
      { key: 'cut', labelKey: 'ideMenuEditCut' },
      { key: 'copy', labelKey: 'ideMenuEditCopy' },
      { key: 'paste', labelKey: 'ideMenuEditPaste' },
    ],
  },
  {
    key: 'view',
    labelKey: 'ideMenuView',
    items: [
      { key: 'explorer', labelKey: 'ideMenuViewExplorer' },
      { key: 'terminal', labelKey: 'ideMenuViewTerminal' },
      { key: 'commandPalette', labelKey: 'ideMenuViewCommandPalette' },
    ],
  },
  {
    key: 'run',
    labelKey: 'ideMenuRun',
    items: [
      { key: 'start', labelKey: 'ideMenuRunStart' },
      { key: 'debug', labelKey: 'ideMenuRunDebug' },
    ],
  },
  {
    key: 'terminal',
    labelKey: 'ideMenuTerminal',
    items: [
      { key: 'new', labelKey: 'ideMenuTerminalNew' },
      { key: 'split', labelKey: 'ideMenuTerminalSplit' },
    ],
  },
  {
    key: 'help',
    labelKey: 'ideMenuHelp',
    items: [
      { key: 'docs', labelKey: 'ideMenuHelpDocs' },
      { key: 'about', labelKey: 'ideMenuHelpAbout' },
    ],
  },
]

// The top chrome bar of /lab's editor shell: File/Edit/View/Run/Terminal/Help on the
// left, each toggling a dropdown on click (no hover-switch, no animation, per this
// round's own scope: prove the toggle mechanism, nothing inside those menus does
// anything yet); a centered title pill showing which project/file is open (replacing
// the former separate IdePathBar row entirely, per explicit user request to save
// vertical space, modeled on VS Code's real Command Center pill filled with its real
// window-title text format instead: see .titlePill's own comment); and a settings
// (gear) menu on the right sharing the exact same open/close mechanism as the other
// menus, whose two items ARE real, working actions (change repository, sign out)
// rather than mocks, per explicit user request to move them off their own standalone
// buttons and into this dropdown instead.
export function IdeMenuBar({ repoName, openFileName, onChangeRepo, onSignOut, onDeleteRepo }: IdeMenuBarProps) {
  const { t } = useTranslation()
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  // MuunCode's own wordmark, the "o" replaced by MoonOrbitLogo, same composition as
  // BrandTitle (see components/atoms/BrandTitle), sized down for this bar. Unlike
  // BrandTitle, opens in a new tab (per explicit request: clicking it should not
  // navigate away from the editor itself) and disables text selection (.brand's own
  // user-select: none), so it reads as a logo/wordmark, not copyable text.
  const title = t('title')
  const brandPrefix = title.slice(0, 5)
  const brandSuffix = title.slice(6)

  // File menu's static mocks (newFile/openFile/save/saveAll, defined in MENUS above)
  // plus one real, working item: unlike those, "Delete Repository" closes over
  // onDeleteRepo, so it cannot live in MENUS' own module-level, closure-free array,
  // same reason settingsItems below is built here instead of there. danger: true
  // styles it as destructive (see IdeMenuList.module.css), since this permanently
  // deletes the actual GitHub repository, not a MuunCode-only concept.
  const fileMenu = MENUS.find((menu) => menu.key === 'file')!
  const fileItems: IdeMenuListItem[] = [
    ...fileMenu.items,
    {
      key: 'deleteRepo',
      labelKey: 'ideMenuFileDeleteRepo',
      danger: true,
      onClick: () => {
        setOpenMenuKey(null)
        onDeleteRepo()
      },
    },
  ]

  const settingsItems: IdeMenuListItem[] = [
    {
      key: 'changeRepo',
      labelKey: 'changeRepoButton',
      onClick: () => {
        setOpenMenuKey(null)
        onChangeRepo()
      },
    },
    {
      key: 'signOut',
      labelKey: 'signOutButton',
      onClick: () => {
        setOpenMenuKey(null)
        onSignOut()
      },
    },
  ]

  // Closes whichever menu is open on any click outside the bar, or on Escape: the same
  // two mechanisms VS Code's own real Menu widget uses (a document-level listener
  // checking element containment, plus a keydown check), per this project's UI
  // Reference Methodology.
  useEffect(() => {
    if (!openMenuKey) return

    function handleMouseDown(event: MouseEvent) {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setOpenMenuKey(null)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenMenuKey(null)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openMenuKey])

  return (
    <div className={styles.bar} ref={barRef}>
      <div className={styles.left}>
        <a href="/" target="_blank" rel="noopener noreferrer" className={styles.brand}>
          <span>{brandPrefix}</span>
          <MoonOrbitLogo size={16} />
          <span>{brandSuffix}</span>
        </a>
        {MENUS.map((menu) => (
          <div key={menu.key} className={styles.menuWrapper}>
            <button
              type="button"
              className={openMenuKey === menu.key ? styles.menuButtonOpen : styles.menuButton}
              onClick={() => setOpenMenuKey((current) => (current === menu.key ? null : menu.key))}
            >
              {t(menu.labelKey)}
            </button>
            {openMenuKey === menu.key && (
              <div className={styles.dropdown}>
                <IdeMenuList items={menu.key === 'file' ? fileItems : menu.items} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={styles.center}>
        <span className={styles.titlePill}>
          <GitHubIcon size={13} />
          {truncateIdeLabel(repoName, REPO_NAME_MAX_LENGTH)} / {truncateIdeFileName(openFileName, FILE_NAME_MAX_LENGTH)}
        </span>
      </div>
      <div className={styles.right}>
        <div className={styles.menuWrapper}>
          <button
            type="button"
            aria-label={t('ideSettingsButtonLabel')}
            className={openMenuKey === SETTINGS_MENU_KEY ? styles.menuButtonOpen : styles.menuButton}
            onClick={() => setOpenMenuKey((current) => (current === SETTINGS_MENU_KEY ? null : SETTINGS_MENU_KEY))}
          >
            <GearIcon size={20} />
          </button>
          {openMenuKey === SETTINGS_MENU_KEY && (
            <div className={`${styles.dropdown} ${styles.dropdownRight}`}>
              <IdeMenuList items={settingsItems} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
