interface GearIconProps {
  size?: number
}

// A settings/gear glyph: a solid 6-tooth cog silhouette with a circular hole punched
// through its hub (evenodd fill-rule, both subpaths in one path). Replaces an earlier
// version built from a center circle plus 8 thin radiating spokes, which is the exact
// construction most icon sets use for a "sun" (light/dark theme toggle) glyph, not a
// gear, per explicit user feedback. Filled/solid, not stroked, matching how real
// settings-gear icons (e.g. VS Code's codicon `gear`) actually render.
export function GearIcon({ size = 20 }: GearIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      role="img"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22,12 L18.5,8.25 L17,3.34 L12,4.5 L7,3.34 L5.5,8.25 L2,12 L5.5,15.75 L7,20.66 L12,19.5 L17,20.66 L18.5,15.75 Z M15.5,12 A3.5,3.5 0 1,0 8.5,12 A3.5,3.5 0 1,0 15.5,12 Z"
      />
    </svg>
  )
}
