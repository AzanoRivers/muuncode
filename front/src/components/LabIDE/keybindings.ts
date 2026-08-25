export interface IdeKeybinding {
  id: string
  labelKey: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  key: string
}

// Single source of truth for every keybinding the /lab editor shell reserves for
// itself, per explicit user request: a new shortcut only needs to be added here once,
// instead of in both a display list and a separate "block the browser's default"
// list that can drift out of sync. Drives IdeEditorWatermark's own display
// (getKeybindingChips below) and useDisableBrowserKeybindings's real preventDefault().
// None of these are wired to a real command yet (this round is visual-design-only, see
// features/f05_ide_viewer_page); adding a real command handler later still starts
// here.
export const IDE_KEYBINDINGS: IdeKeybinding[] = [
  { id: 'newFile', labelKey: 'ideWatermarkNewFile', ctrlKey: true, altKey: true, key: 'n' },
  { id: 'showAllCommands', labelKey: 'ideWatermarkShowCommands', ctrlKey: true, shiftKey: true, key: 'p' },
  { id: 'openCommitModal', labelKey: 'ideWatermarkOpenCommit', ctrlKey: true, altKey: true, key: 'i' },
]

// Human-readable key-cap chips for display, derived from the same definition
// matchesKeybinding below uses for the real behavior, so display and behavior can
// never disagree with each other.
export function getKeybindingChips(binding: IdeKeybinding): string[] {
  const chips: string[] = []
  if (binding.ctrlKey) chips.push('Ctrl')
  if (binding.metaKey) chips.push('Cmd')
  if (binding.altKey) chips.push('Alt')
  if (binding.shiftKey) chips.push('Shift')
  chips.push(binding.key.length === 1 ? binding.key.toUpperCase() : binding.key)
  return chips
}

// Modifier flags compared exactly (not just "is this one held"), so e.g. Ctrl+Alt+N
// does not also match a plain Ctrl+N binding by accident.
export function matchesKeybinding(event: KeyboardEvent, binding: IdeKeybinding): boolean {
  return (
    event.ctrlKey === Boolean(binding.ctrlKey) &&
    event.altKey === Boolean(binding.altKey) &&
    event.shiftKey === Boolean(binding.shiftKey) &&
    event.metaKey === Boolean(binding.metaKey) &&
    event.key.toLowerCase() === binding.key.toLowerCase()
  )
}
