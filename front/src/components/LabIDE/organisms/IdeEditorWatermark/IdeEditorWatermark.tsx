import { useTranslation } from 'react-i18next'
import { MoonOrbitLogo } from '@/components/atoms'
import { getKeybindingChips, IDE_KEYBINDINGS } from '@/components/LabIDE/keybindings'
import styles from './IdeEditorWatermark.module.css'

// Fills the editor area while no file is open, the same role VS Code's own real
// empty-editor-group watermark plays: a big, muted wordmark plus a short list of
// keybinding hints, centered in the otherwise blank pane. MuunCode's own wordmark
// (the "o" replaced by MoonOrbitLogo, same composition as BrandTitle) stands in for
// VS Code's own logo there, desaturated and darkened via .logo's own filter into a
// shadowy, low-contrast mark instead of its usual neon gradient, per explicit request.
// The keybinding list itself reads from keybindings.ts's IDE_KEYBINDINGS (the same
// definition useDisableBrowserKeybindings uses to actually reserve these
// combinations), rendered as separate key-cap chips per key rather than one long
// string, matching how VS Code's own watermark (and most editors/OS shortcut hints)
// present a keybinding.
export function IdeEditorWatermark() {
  const { t } = useTranslation()
  const title = t('title')
  const brandPrefix = title.slice(0, 5)
  const brandSuffix = title.slice(6)

  return (
    <div className={styles.watermark}>
      <div className={styles.logo}>
        <span>{brandPrefix}</span>
        <MoonOrbitLogo size={72} />
        <span>{brandSuffix}</span>
      </div>
      <ul className={styles.shortcuts}>
        {IDE_KEYBINDINGS.map((binding) => (
          <li key={binding.id} className={styles.shortcutRow}>
            <span className={styles.shortcutLabel}>{t(binding.labelKey)}</span>
            <span className={styles.keys}>
              {getKeybindingChips(binding).map((chip, index) => (
                <span key={chip}>
                  {index > 0 && <span className={styles.keySeparator}>+</span>}
                  <span className={styles.key}>{chip}</span>
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
