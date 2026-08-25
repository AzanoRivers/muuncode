interface BranchIconProps {
  size?: number
}

// A generic git-branch glyph: a trunk line with two commit nodes plus a curved
// offshoot to a third node, the same widely-used mathematical construction most icon
// sets use for "branch" (not traced from any specific one), matching this project's
// other line-icon atoms (ChevronIcon/RepoIcon/BackIcon: viewBox 24, currentColor
// stroke).
export function BranchIcon({ size = 14 }: BranchIconProps) {
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
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  )
}
