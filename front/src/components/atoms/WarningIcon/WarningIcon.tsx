interface WarningIconProps {
  size?: number
}

// Warning triangle with an exclamation mark. Colored via `currentColor`: set `color`
// on a wrapping element. Used by BrowserSupportNotice and error status screens.
export function WarningIcon({ size = 20 }: WarningIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-hidden="true">
      <path d="M12 3 L22 20 H2 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="17.2" r="0.9" fill="currentColor" />
    </svg>
  )
}
