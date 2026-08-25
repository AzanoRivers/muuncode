import { useId, type CSSProperties, type ReactNode, type Ref } from 'react'
import { ChevronIcon } from '@/components/atoms'
import styles from './AccordionPanel.module.css'

interface AccordionPanelProps {
  label: ReactNode
  isExpanded: boolean
  onToggle: () => void
  children: ReactNode
  headerRef?: Ref<HTMLButtonElement>
  contentHeight: number
}

// Generic, reusable single accordion section: a full-width header button toggling a
// content region. The expanded content area's target height is computed by the
// parent (see RepoSelector) from the actual available space in its own flex column,
// not derived here via a CSS-only intrinsic-sizing trick: an earlier grid-template-
// rows (0fr/1fr) + flex:1 approach repeatedly proved unreliable across collapse/
// expand directions (a collapsed flex item with flex-basis:auto can still report its
// full, real content size to an ancestor's own auto-height calculation, starving a
// sibling relying on flex-grow for space, a genuine CSS Grid/Flexbox intrinsic-sizing
// edge case, not just an animation-timing glitch). A single JS measurement per toggle
// (not per animation frame) drives a `--accordion-content-height` CSS custom property
// (the one documented exception to this project's no-inline-style rule), read by a
// single, never-class-swapped max-height rule: confirmed in isolation that swapping
// WHICH RULE applies max-height via a class change does not reliably retrigger this
// browser's transition when the target value comes through `var()`, while changing
// only the custom property's own value, with the same rule active throughout, does.
// Not hardcoded to any domain, so RepoSelector composes it twice (create/existing)
// and both inherit the exact same behavior. Inspired by VS Code's explorer tree
// "twisty" header (src/vs/workbench/browser/parts/views), reimplemented from scratch
// with our own React + CSS Modules stack, never ported from that source.
export function AccordionPanel({ label, isExpanded, onToggle, children, headerRef, contentHeight }: AccordionPanelProps) {
  const contentId = useId()

  return (
    <div className={styles.panel}>
      <button
        ref={headerRef}
        type="button"
        className={`${styles.header} ${isExpanded ? styles.headerActive : ''}`}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={onToggle}
      >
        <span className={styles.labelGroup}>
          <span className={styles.bullet} aria-hidden="true" />
          <span>{label}</span>
        </span>
        <span className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}>
          <ChevronIcon size={16} />
        </span>
      </button>
      <div
        className={styles.contentWrapper}
        style={{ '--accordion-content-height': isExpanded ? `${contentHeight}px` : '0px' } as CSSProperties}
      >
        {/* inert while collapsed: keeps this section's interactive children (inputs,
            the mock repo list buttons) out of tab order while visually hidden, without
            resorting to JS-measured visibility toggling. */}
        <div className={styles.contentInner} id={contentId} inert={!isExpanded}>
          <div className={styles.contentPadding}>{children}</div>
        </div>
      </div>
    </div>
  )
}
