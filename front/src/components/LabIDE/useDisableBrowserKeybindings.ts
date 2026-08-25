import { useEffect } from 'react'
import { IDE_KEYBINDINGS, matchesKeybinding } from './keybindings'

// Prevents the browser's own default behavior for every key combination the /lab
// editor shell reserves for itself (keybindings.ts's IDE_KEYBINDINGS): some browsers
// treat combinations like Ctrl+Shift+P as their own action (e.g. opening a private
// window), which would fire instead of (or alongside) a future MuunCode command using
// the same shortcut. None of these run a real command yet (this round is
// visual-design-only, see features/f05_ide_viewer_page); this only reserves the
// combination.
export function useDisableBrowserKeybindings(): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (IDE_KEYBINDINGS.some((binding) => matchesKeybinding(event, binding))) {
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
