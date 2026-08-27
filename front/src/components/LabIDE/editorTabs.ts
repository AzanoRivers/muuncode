import type { FileKind } from './lib/fileKind'

export interface OpenTab {
  path: string
  name: string
  kind: Extract<FileKind, 'code' | 'image'>
}

export interface EditorTabsState {
  openTabs: OpenTab[]
  previewPath: string | null
  activePath: string | null
}

export const INITIAL_EDITOR_TABS_STATE: EditorTabsState = {
  openTabs: [],
  previewPath: null,
  activePath: null,
}

function findTab(state: EditorTabsState, path: string): OpenTab | undefined {
  return state.openTabs.find((tab) => tab.path === path)
}

// Single click: mirrors VS Code's own real "Preview Editor" mechanism (see
// features/f05_ide_viewer_page/file-opening-and-editor-tabs.md for the cited source),
// one preview pointer per editor area, not a flag on each tab. An already-open file
// (pinned or preview) just gets focused; a new file replaces the current preview tab
// in place instead of growing the tab strip, unless there is no preview tab yet.
export function openPreview(state: EditorTabsState, path: string, name: string, kind: OpenTab['kind']): EditorTabsState {
  if (findTab(state, path)) {
    return { ...state, activePath: path }
  }

  if (state.previewPath) {
    const openTabs = state.openTabs.map((tab) => (tab.path === state.previewPath ? { path, name, kind } : tab))
    return { openTabs, previewPath: path, activePath: path }
  }

  return { openTabs: [...state.openTabs, { path, name, kind }], previewPath: path, activePath: path }
}

// Double click, or promoting the current preview once it becomes dirty (VS Code
// promotes on `editor.isDirty()` too, see the spec's research section): opens a
// genuinely new, permanent tab, or pins the existing preview tab in place without
// moving or replacing anything else in the strip.
export function openPinned(state: EditorTabsState, path: string, name: string, kind: OpenTab['kind']): EditorTabsState {
  if (findTab(state, path)) {
    const previewPath = state.previewPath === path ? null : state.previewPath
    return { ...state, previewPath, activePath: path }
  }

  return {
    openTabs: [...state.openTabs, { path, name, kind }],
    previewPath: state.previewPath,
    activePath: path,
  }
}

// Closing activates whichever tab now sits at the closed one's own index, or the
// previous one if it was the last tab, or nothing if the strip is now empty.
export function closeTab(state: EditorTabsState, path: string): EditorTabsState {
  const index = state.openTabs.findIndex((tab) => tab.path === path)
  if (index === -1) return state

  const openTabs = state.openTabs.filter((tab) => tab.path !== path)
  const previewPath = state.previewPath === path ? null : state.previewPath

  let activePath = state.activePath
  if (state.activePath === path) {
    const nextTab = openTabs[index] ?? openTabs[index - 1]
    activePath = nextTab ? nextTab.path : null
  }

  return { openTabs, previewPath, activePath }
}
