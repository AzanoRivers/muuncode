interface CloseIconProps {
  size?: number
}

// A simple X glyph (two crossed lines), the same generic construction most icon sets
// use for "close" (not traced from any specific one), matching this project's other
// line-icon atoms (ChevronIcon/BranchIcon: viewBox 24, currentColor stroke).
export function CloseIcon({ size = 14 }: CloseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      role="img"
      aria-hidden="true"
    >
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  )
}
