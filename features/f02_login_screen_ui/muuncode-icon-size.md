# Additional scope: Larger MuunCode Icon

Round 14 of adjustments to `f02_login_screen_ui`. Per the standing rule, this stays
inside the existing `f02` feature folder, no new feature id.

## Context

The user found the inline moon icon (the "o" in "Code" from the MuunCode rebrand round)
too small. Tested live in a real browser at both the base and `768px+` font sizes:
`3.4rem`/`4rem` started clipping into the neighboring "C"/"d" letters, `3.2rem` reads
clearly larger while staying legible next to the adjacent letters at both sizes.

## Change

In `LoginScreen.module.css`, `.title svg`'s `width`/`height` change from `2.8rem` to
`3.2rem`. `MoonOrbitLogo`'s `size={28}` prop in `LoginScreen.tsx` stays as-is (the CSS
`width`/`height` already overrides the SVG's own `width`/`height` attributes, this is
how the icon is actually sized on screen; verified live before writing this spec, do
not also change the `size` prop). No other property on `.title svg` (`display`,
`vertical-align`, `transform: translateY(-0.1em)`) changes.

## Checkpoints

See `.claude/CHECKPOINTS.md` -> "F02: Login Screen UI" -> "Additional scope: Larger
MuunCode Icon".
