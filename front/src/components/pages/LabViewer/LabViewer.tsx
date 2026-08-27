import { useEffect, useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { GridBackground } from '@/components/atoms'
import { LaunchLoader } from '@/components/molecules'
import {
  IdeCodeEditor,
  IdeContextMenu,
  IdeDeleteRepoModal,
  IdeEditorTabs,
  IdeEditorWatermark,
  IdeFileExplorer,
  IdeImagePreview,
  IdeMenuBar,
  IdeUnsupportedFileModal,
} from '@/components/LabIDE/organisms'
import { IdeModal } from '@/components/LabIDE/molecules'
import { IDE_KEYBINDINGS, matchesKeybinding } from '@/components/LabIDE/keybindings'
import { useDisableBrowserKeybindings } from '@/components/LabIDE/useDisableBrowserKeybindings'
import { getFileKind } from '@/components/LabIDE/lib/fileKind'
import { closeTab, INITIAL_EDITOR_TABS_STATE, openPinned, openPreview } from '@/components/LabIDE/editorTabs'
import type { EditorTabsState } from '@/components/LabIDE/editorTabs'
import { MOCK_FILE_CONTENTS, MOCK_IMAGE_SOURCES } from '@/components/LabIDE/mockFileContents'
import '@/components/LabIDE/ide-tokens.css'
import { clearGitHubTokens } from '@/lib/githubAuth'
import { clearActiveProject } from '@/lib/activeProject'
import { resolveSession } from '@/lib/sessionResolution'
import type { SessionResolution } from '@/lib/sessionResolution'
import styles from './LabViewer.module.css'

type ReadyResolution = Extract<SessionResolution, { status: 'ready' }>

// Shown in the title pill (IdeMenuBar) whenever no tab is open yet: the fallback
// mirrors what a fresh MuunCode project's own entry point would realistically be,
// same value this constant already held before real tab tracking existed.
const DEFAULT_OPEN_FILE_NAME = 'index.html'

// Matches LaunchLoader.module.css's exit animation duration (rocket flying up out of
// frame, box fading out), same constant Station.tsx uses for the same reason: this
// component keeps rendering LaunchLoader in its "exiting" visual state for this long
// before actually switching away from it, so the transition plays instead of the
// stub content or /station's own redirect just cutting it off mid-animation.
const EXIT_ANIMATION_MS = 700

// Matches .shell's own fadeIn animation duration (LabViewer.module.css): the blue
// GridBackground stays mounted underneath the editor shell for exactly this long
// after it appears, so the shell's dark background genuinely blends into it as it
// fades in, instead of the loader's blue cutting straight to the editor's dark with
// nothing in between.
const SHELL_FADE_IN_MS = 500

// How long the sign-out loader sits in its idle liftoff+bob state (rocket "still on
// the pad") before playing its exit animation and actually navigating away: long
// enough to read as a deliberate farewell moment, not just a flash mid-navigation.
const SIGN_OUT_DISPLAY_MS = 2000

// Renders at /lab: the real destination both the select-existing and create-new repo
// paths on /station navigate to once a repository is confirmed. Unlike its predecessor
// (IdeViewer, which read ?owner=&repo= from the URL), this reads everything from
// whatever is already stored locally via lib/sessionResolution.ts's shared state
// machine, so a direct visit to /lab works on its own: active GitHub session, a still-
// valid access token, the App installation, and which project is active. Anything short
// of every one of those being true bounces to /station, which already knows how to
// render every one of those non-ready cases (sign-in, install, error, or the repo
// picker itself); duplicating that UI here would just be two places to keep in sync.
// Explicitly still a stub round otherwise: no editor, no file tree, no Monaco, no
// dockview panels yet.
export function LabViewer() {
  const { t } = useTranslation()
  const [resolution, setResolution] = useState<ReadyResolution | null>(null)
  const [isLoaderExiting, setIsLoaderExiting] = useState(false)
  const [showTransitionBackdrop, setShowTransitionBackdrop] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isSignOutExiting, setIsSignOutExiting] = useState(false)
  const [isChangingRepo, setIsChangingRepo] = useState(false)
  const [isChangeRepoExiting, setIsChangeRepoExiting] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [openModal, setOpenModal] = useState<'commandPalette' | 'commitModal' | 'deleteRepo' | 'unsupportedFile' | null>(null)
  const [editorTabs, setEditorTabs] = useState<EditorTabsState>(INITIAL_EDITOR_TABS_STATE)
  useDisableBrowserKeybindings()

  // Wires the two keybindings that already exist (keybindings.ts's IDE_KEYBINDINGS,
  // shown in IdeEditorWatermark) to actually open something, per explicit user
  // request: 'showAllCommands' opens the palette-sized modal, 'openCommitModal' opens
  // the medium one. useDisableBrowserKeybindings already calls preventDefault() for
  // every known binding regardless, so this effect only needs to react, not suppress.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const matched = IDE_KEYBINDINGS.find((binding) => matchesKeybinding(event, binding))
      if (matched?.id === 'showAllCommands') setOpenModal('commandPalette')
      if (matched?.id === 'openCommitModal') setOpenModal('commitModal')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    let cancelled = false

    void resolveSession().then((result) => {
      if (cancelled) return

      // Either outcome leaves this loader for something else (the stub content below,
      // or a real navigation to /station), so both play the same exit first: without
      // this, the loader was just getting swapped out mid-animation, which is what made
      // the rocket look like it froze halfway instead of actually flying off.
      setIsLoaderExiting(true)
      window.setTimeout(() => {
        if (cancelled) return

        if (result.status !== 'ready') {
          window.location.href = '/station'
          return
        }

        setResolution(result)
        setShowTransitionBackdrop(true)
        window.setTimeout(() => {
          if (!cancelled) setShowTransitionBackdrop(false)
        }, SHELL_FADE_IN_MS)
      }, EXIT_ANIMATION_MS)
    })

    return () => {
      cancelled = true
    }
  }, [])

  // Reuses the same color-transition + rocket loader shown while /lab resolves the
  // session on entry, per explicit user request, instead of navigating away instantly:
  // shows "Buen viaje..." for SIGN_OUT_DISPLAY_MS, then plays the same exit animation
  // (rocket flies up, box fades out) before the actual navigation, so sign-out reads
  // as a deliberate farewell moment rather than an abrupt cut to the home screen. The
  // tokens/session are only cleared right before navigating, not before: the shell
  // behind the loader has no reason to re-render into a signed-out state mid-animation.
  const handleSignOut = () => {
    setIsSigningOut(true)
    window.setTimeout(() => {
      setIsSignOutExiting(true)
      window.setTimeout(() => {
        clearGitHubTokens()
        clearActiveProject()
        window.location.replace('/')
      }, EXIT_ANIMATION_MS)
    }, SIGN_OUT_DISPLAY_MS)
  }

  // Sends the user back to /station's repo picker (select-existing or create-new).
  // Used to navigate instantly (a bare href change), which read as a harsh, jarring
  // cut; now plays the same color-transition + rocket loader as the sign-out flow
  // instead, mirroring Station.tsx's own navigateToLab: mount the loader, wait a frame
  // so it actually renders its normal entering/idle state at least once, then play its
  // exit animation before the real navigation. Clears the active project only right
  // before navigating (not before), so Station's own resolveInstallationStatus check
  // (which redirects straight back to /lab whenever one is already stored) does not
  // immediately bounce the user right back here. Purely a stopgap to exercise this flow
  // from /lab itself: this page gets a real redesign later, this button is not meant
  // to be its final shape.
  const handleChangeRepo = () => {
    setIsChangingRepo(true)
    requestAnimationFrame(() => {
      setIsChangeRepoExiting(true)
      window.setTimeout(() => {
        clearActiveProject()
        window.location.href = '/station'
      }, EXIT_ANIMATION_MS)
    })
  }

  // Single click -> 'preview' (replaces the current preview tab in place), double
  // click -> 'pinned' (opens/promotes a permanent tab): see editorTabs.ts and
  // features/f05_ide_viewer_page/file-opening-and-editor-tabs.md for the real VS Code
  // mechanism this mirrors. An unsupported extension never touches tab state at all,
  // it only opens IdeUnsupportedFileModal.
  const handleOpenFile = (path: string, name: string, mode: 'preview' | 'pinned') => {
    const kind = getFileKind(name)
    if (kind === 'unsupported') {
      setOpenModal('unsupportedFile')
      return
    }

    setEditorTabs((current) => (mode === 'preview' ? openPreview(current, path, name, kind) : openPinned(current, path, name, kind)))
  }

  const handleActivateTab = (path: string) => {
    setEditorTabs((current) => ({ ...current, activePath: path }))
  }

  const handleCloseTab = (path: string) => {
    setEditorTabs((current) => closeTab(current, path))
  }

  // Replaces the browser's own native context menu with IdeContextMenu everywhere in
  // the editor shell, per explicit user request: an editor should own its right-click
  // menu, not defer to the browser's generic one.
  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    setContextMenuPosition({ x: event.clientX, y: event.clientY })
  }

  if (isChangingRepo) {
    return (
      <GridBackground>
        <main className={styles.content}>
          <LaunchLoader exiting={isChangeRepoExiting} instant />
          <p className={isChangeRepoExiting ? `${styles.message} ${styles.messageExiting}` : styles.message}>
            {t('labChangeRepoLabel')}
          </p>
        </main>
      </GridBackground>
    )
  }

  if (isSigningOut) {
    return (
      <GridBackground>
        <main className={styles.content}>
          <LaunchLoader exiting={isSignOutExiting} />
          <p className={isSignOutExiting ? `${styles.message} ${styles.messageExiting}` : styles.message}>
            {t('labSignOutLabel')}
          </p>
        </main>
      </GridBackground>
    )
  }

  if (!resolution) {
    return (
      <GridBackground>
        <main className={styles.content}>
          <LaunchLoader exiting={isLoaderExiting} />
          <p className={styles.message}>{t('labResolvingLabel')}</p>
        </main>
      </GridBackground>
    )
  }

  // The real editor shell: a deliberately different, VS-Code-dark look from the rest
  // of the app's marketing-site space theme (no GridBackground here on purpose, see
  // this component's own module.css). `labIdeRoot` (components/LabIDE/ide-tokens.css)
  // scopes every --ide-* token to this subtree; every component below it lives in the
  // components/LabIDE/ domain, per this project's own component architecture. First
  // rounds of features/f05_ide_viewer_page's real editor work: menu bar (which owns
  // the centered "which project/file is open" title pill itself, see IdeMenuBar), file
  // explorer (with visual-only drag and drop), and a custom right-click context menu;
  // still no dockview panel yet.
  const activeTab = editorTabs.openTabs.find((tab) => tab.path === editorTabs.activePath) ?? null
  const codeTabs = editorTabs.openTabs.filter((tab) => tab.kind === 'code')

  return (
    <>
      {/* Stays mounted for exactly SHELL_FADE_IN_MS after the shell below appears, so
          the editor's dark background genuinely fades in over this blue, instead of
          the two colors cutting between each other with nothing in between. */}
      {showTransitionBackdrop && (
        <div className={styles.transitionBackdrop}>
          <GridBackground />
        </div>
      )}
      <div className={`${styles.shell} labIdeRoot`} onContextMenu={handleContextMenu}>
        <IdeMenuBar
          repoName={resolution.project.name}
          openFileName={activeTab?.name ?? DEFAULT_OPEN_FILE_NAME}
          onChangeRepo={handleChangeRepo}
          onSignOut={handleSignOut}
          onDeleteRepo={() => setOpenModal('deleteRepo')}
        />
        <div className={styles.body}>
          <IdeFileExplorer repoName={resolution.project.name} onOpenFile={handleOpenFile} />
          <main className={styles.editorArea}>
            <IdeEditorTabs
              tabs={editorTabs.openTabs}
              previewPath={editorTabs.previewPath}
              activePath={editorTabs.activePath}
              onActivate={handleActivateTab}
              onClose={handleCloseTab}
            />
            <div className={styles.editorContent}>
              {editorTabs.openTabs.length === 0 && <IdeEditorWatermark />}
              {codeTabs.length > 0 && (
                <IdeCodeEditor
                  codeTabs={codeTabs}
                  activePath={editorTabs.activePath}
                  isVisible={activeTab?.kind === 'code'}
                  contents={MOCK_FILE_CONTENTS}
                />
              )}
              {activeTab?.kind === 'image' && (
                <IdeImagePreview src={MOCK_IMAGE_SOURCES[activeTab.path] ?? ''} name={activeTab.name} />
              )}
            </div>
          </main>
        </div>
        {contextMenuPosition && (
          <IdeContextMenu
            x={contextMenuPosition.x}
            y={contextMenuPosition.y}
            onClose={() => setContextMenuPosition(null)}
          />
        )}
        <IdeModal isOpen={openModal === 'commandPalette'} onClose={() => setOpenModal(null)} size="palette">
          <p className={styles.modalPlaceholder}>{t('ideModalCommandPalettePlaceholder')}</p>
        </IdeModal>
        <IdeModal isOpen={openModal === 'commitModal'} onClose={() => setOpenModal(null)} size="medium">
          <p className={styles.modalPlaceholder}>{t('ideModalCommitPlaceholder')}</p>
        </IdeModal>
        <IdeModal isOpen={openModal === 'deleteRepo'} onClose={() => setOpenModal(null)} size="small">
          <IdeDeleteRepoModal
            owner={resolution.project.owner}
            repoName={resolution.project.name}
            onClose={() => setOpenModal(null)}
            onDeleted={handleChangeRepo}
          />
        </IdeModal>
        <IdeModal isOpen={openModal === 'unsupportedFile'} onClose={() => setOpenModal(null)} size="small">
          <IdeUnsupportedFileModal onClose={() => setOpenModal(null)} />
        </IdeModal>
      </div>
    </>
  )
}
