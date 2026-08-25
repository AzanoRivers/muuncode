interface ChevronIconProps {
  size?: number
}

// Downward chevron, matching BackIcon/PlusIcon's line-icon style. Used as an
// accordion header's expand/collapse indicator, rotated via CSS by the caller.
export function ChevronIcon({ size = 20 }: ChevronIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
