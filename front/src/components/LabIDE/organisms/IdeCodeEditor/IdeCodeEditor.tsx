import { useEffect, useRef } from 'react'
import { monaco } from '@/components/LabIDE/monacoSetup'
// Type-only: `monaco` (the runtime value above) is typed via a cast, not a real
// namespace the checker can use in type positions (`monaco.editor.IStandaloneCodeEditor`
// below), so type annotations borrow directly from monaco-editor's own root types
// instead, same real types, erased entirely at build time.
import type * as Monaco from 'monaco-editor'
import type { OpenTab } from '@/components/LabIDE/editorTabs'
import styles from './IdeCodeEditor.module.css'

interface IdeCodeEditorProps {
  codeTabs: OpenTab[]
  activePath: string | null
  // Whether the active tab (which may be an image, see IdeFileExplorer's kind
  // classification) is actually a code tab: this component stays mounted even while
  // an image tab is active (see this file's own comment below on why), so it needs
  // its own visibility flag instead of just being conditionally rendered.
  isVisible: boolean
  contents: Record<string, string>
}

const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  html: 'html',
  css: 'css',
  js: 'javascript',
  json: 'json',
  md: 'markdown',
}

function languageFor(path: string): string {
  const dotIndex = path.lastIndexOf('.')
  const extension = dotIndex === -1 ? '' : path.slice(dotIndex + 1).toLowerCase()
  return LANGUAGE_BY_EXTENSION[extension] ?? 'plaintext'
}

// One real Monaco instance for the whole /lab editor area, mounted once and kept alive
// for as long as any code tab exists (including while an image tab is the active one,
// see IdeCodeEditor.module.css's own `.hidden`): switching tabs swaps which
// `editor.ITextModel` the single editor displays via `setModel`, rather than tearing
// down and recreating Monaco on every tab switch, so each open file keeps its own
// undo/redo stack and cursor position while it stays open. Toggling away and back with
// CSS (not unmount) is also what keeps that model state alive across a code<->image
// tab switch within the same session; per this round's own explicit scope (see
// features/f05_ide_viewer_page/file-opening-and-editor-tabs.md), nothing is persisted
// across a real page reload yet, that is the next, already-planned round.
export function IdeCodeEditor({ codeTabs, activePath, isVisible, contents }: IdeCodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const modelsRef = useRef<Map<string, Monaco.editor.ITextModel>>(new Map())

  useEffect(() => {
    if (!containerRef.current) return

    const editor = monaco.editor.create(containerRef.current, {
      automaticLayout: true,
      theme: 'vs-dark',
      // Was unset, so Monaco fell back to its own built-in default instead of this
      // project's real --ide-font-mono token (Consolas on Windows, matching VS
      // Code's own actual default editor.fontFamily there): a CSS custom property
      // reference works fine here since Monaco just applies this string as a literal
      // font-family value, resolved against .labIdeRoot's own inherited token.
      fontFamily: 'var(--ide-font-mono)',
      fontSize: 13,
      minimap: { enabled: false },
    })
    editorRef.current = editor
    const models = modelsRef.current

    return () => {
      editor.dispose()
      editorRef.current = null
      for (const model of models.values()) model.dispose()
      models.clear()
    }
  }, [])

  useEffect(() => {
    const openPaths = new Set(codeTabs.map((tab) => tab.path))

    for (const [path, model] of modelsRef.current) {
      if (!openPaths.has(path)) {
        model.dispose()
        modelsRef.current.delete(path)
      }
    }

    for (const tab of codeTabs) {
      if (modelsRef.current.has(tab.path)) continue
      const model = monaco.editor.createModel(contents[tab.path] ?? '', languageFor(tab.path), monaco.Uri.parse(`file://${tab.path}`))
      modelsRef.current.set(tab.path, model)
    }

    const activeModel = activePath ? (modelsRef.current.get(activePath) ?? null) : null
    editorRef.current?.setModel(activeModel)
  }, [codeTabs, activePath, contents])

  useEffect(() => {
    if (isVisible) editorRef.current?.layout()
  }, [isVisible])

  return <div ref={containerRef} className={isVisible ? styles.editor : `${styles.editor} ${styles.hidden}`} />
}
