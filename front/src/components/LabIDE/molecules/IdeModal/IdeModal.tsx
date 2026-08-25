import { useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './IdeModal.module.css'

export type IdeModalSize = 'palette' | 'small' | 'medium' | 'large'

interface IdeModalProps {
  isOpen: boolean
  onClose: () => void
  size: IdeModalSize
  children: ReactNode
}

// Matches .modal's own closing animation duration below (IdeModal.module.css): kept
// mounted this long after isOpen flips false, so the close animation actually gets to
// play instead of the modal just vanishing.
const CLOSE_ANIMATION_MS = 150

const SIZE_CLASS: Record<IdeModalSize, string> = {
  palette: styles.sizePalette,
  small: styles.sizeSmall,
  medium: styles.sizeMedium,
  large: styles.sizeLarge,
}

// 'medium'/'large'/'small' still need something to center them on screen, but unlike
// an actual dimming backdrop (explicitly rejected, see below) this is invisible and
// pointer-events: none, so it never intercepts clicks itself: outside-click detection
// for every size instead relies on the same document-level containment check
// (handleMouseDown below), never a backdrop click handler.
const SIZES_NEEDING_CENTERING_LAYER: IdeModalSize[] = ['small', 'medium', 'large']

// Generic modal shell reused for every overlay in /lab (the command palette, the
// commit modal, and anything bigger later). Modeled on VS Code's real Quick Input /
// Command Palette (src/vs/platform/quickinput/browser/, media/quickInput.css) for
// every size, per CLAUDE.md's UI Reference Methodology and explicit user request: no
// dimmed backdrop for ANY size (VS Code's own separate Dialog widget does have one,
// but the user explicitly rejected it here), closes on Escape or an outside click for
// every size, and reuses Quick Input's real open/close animation (250ms open / 150ms
// close, cubic-bezier(0.22, 1, 0.36, 1), opacity + scale 0.97/0.99, transform-origin
// top center) across all four sizes, not only the one it is drawn from.
export function IdeModal({ isOpen, onClose, size, children }: IdeModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setIsClosing(false)
      return
    }

    if (!shouldRender) return

    setIsClosing(true)
    const timeout = window.setTimeout(() => setShouldRender(false), CLOSE_ANIMATION_MS)
    return () => window.clearTimeout(timeout)
  }, [isOpen, shouldRender])

  useEffect(() => {
    if (!shouldRender) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    function handleMouseDown(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [shouldRender, onClose])

  if (!shouldRender) return null

  const modal = (
    <div ref={modalRef} className={`${styles.modal} ${SIZE_CLASS[size]} ${isClosing ? styles.closing : ''}`}>
      {children}
    </div>
  )

  if (!SIZES_NEEDING_CENTERING_LAYER.includes(size)) return modal

  return <div className={styles.centeringLayer}>{modal}</div>
}
