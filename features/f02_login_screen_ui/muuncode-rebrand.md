# Additional scope: MuunCode Rebrand (Icon as the "O" in "Code")

Round 13 of adjustments to `f02_login_screen_ui`. Per the standing rule, this stays
inside the existing `f02` feature folder, no new feature id.

## Context

The user asked for an experiment: rename the brand from "HyperMuun" to "MuunCode",
with the `MoonOrbitLogo` icon replacing the letter "o" in "Code", inline within the
wordmark (not stacked above the text as before). The lead prototyped this live in a
browser via DOM manipulation (never persisted to code) and the user confirmed they
like the visual result and want it made real.

## 1. Locale copy

In `front/src/locales/en.json` and `front/src/locales/es.json`, change the `title` key
from `"MuunCode"` to `"MuunCode"` in both files (the brand name itself does not
translate). Do not change any other key in either file.

## 2. `LoginScreen.tsx`: restructure the title markup

Current structure splits `title` into a "Hyper" prefix and a "Muun" suffix stacked in
a column with the icon above it (`.brandMuunColumn`). Replace this with an inline
wordmark: "Muun" + "C" + [icon, replacing "o"] + "de", all on one line, no column
stacking.

Replace:
```tsx
const title = t('title')
const brandPrefix = title.slice(0, 5)
const brandSuffix = title.slice(5)
```
with:
```tsx
const title = t('title')
const brandPrefix = title.slice(0, 5) // "MuunC"
const brandSuffix = title.slice(6) // "de" (skips the "o" the icon replaces)
```

Replace the `<h1>` block:
```tsx
<h1 className={styles.title}>
  <span>{brandPrefix}</span>
  <span className={styles.brandMuunColumn}>
    <MoonOrbitLogo size={48} />
    <span>{brandSuffix}</span>
  </span>
</h1>
```
with:
```tsx
<h1 className={styles.title}>
  <span>{brandPrefix}</span>
  <MoonOrbitLogo size={28} />
  <span>{brandSuffix}</span>
</h1>
```

## 3. `LoginScreen.module.css`: inline icon sizing, remove the column layout

`.brandMuunColumn` and `.brandMuunColumn svg` are no longer used anywhere (the column
stacking is gone); remove both rules.

`.title` currently uses `display: flex; align-items: flex-end; justify-content:
flex-end; gap: var(--spacing-xs);`. With only inline children now (two spans and one
icon on a single line, no stacked column), change to a plain inline flow so the icon
sits like a glyph inside the word, vertically centered with the surrounding text
baseline, no visible extra gap between it and the adjacent letters:

```css
.title {
  display: block;
  text-align: right;
  width: 100%;
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--font-size-title);
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--color-text);
  text-shadow:
    0 0 4px var(--glow-blue),
    0 0 12px var(--glow-purple),
    0 0 24px var(--glow-pink);
}

.title svg {
  display: inline-block;
  width: 2.8rem;
  height: 2.8rem;
  vertical-align: middle;
  transform: translateY(-0.1em);
}
```

Keep every other property already on `.title` unchanged (font/color/shadow tokens).
`.title` switches from flex to plain block flow with `text-align: right` because its
children are now inline text and a single inline icon, not a stacked column: this is
exactly the layout the lead verified live in the browser (both at `font-size-title-lg`
and at `font-size-title`, the mobile size), not a flex alternative. The icon's fixed
`2.8rem` size and the `translateY(-0.1em)` nudge are the exact values confirmed to look
proportionate and vertically centered at both font sizes; do not substitute a
`font-size`-relative (`em`) icon size or a different offset without re-verifying live,
since this exact combination was already checked at both breakpoints.

## Checkpoints

See `.claude/CHECKPOINTS.md` -> "F02: Login Screen UI" -> "Additional scope: MuunCode
Rebrand".
