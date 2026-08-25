# MuunCode: Claude Harness Map

*A short guide to every file and folder that makes up this repository's Claude Code
harness, for any developer (human or agent) joining the project later.*

**Selecciona idioma / Select language:** [🇪🇸 Español](#español) | [🇬🇧 English](#english)

---

## Español

Este documento explica, carpeta por carpeta y archivo por archivo, para qué existe cada
pieza del harness de Claude Code en este repositorio. No sustituye a `CLAUDE.md`: es un
mapa de orientación rápida, no la fuente de verdad del producto.

### Árbol de directorios

```
MuunCode/
├── CLAUDE.md                      Fuente de verdad del proyecto: visión, misión,
│                                   principios, non-goals, stack, workflow y reglas
│                                   para cualquier agente que trabaje en este repo.
├── claude-map.md                  Este documento: mapa del harness para
│                                   programadores humanos y agentes.
├── .gitignore                     Reglas de ignorado genéricas, reutilizadas en
│                                   todos los proyectos del autor. No se edita aquí.
├── front/                         La app real de MuunCode (Vite + React + TS).
│                                   Atomic Design en front/src/components/, un solo
│                                   CSS global en front/src/styles/tokens.css.
├── api/                           Funciones serverless livianas (intercambio/refresh
│                                   de token de GitHub), por convención de Vercel.
├── features/                      Solo specs (.md), nunca código de aplicación.
│   │                               Una carpeta por feature, nombrada igual que su
│   │                               id en feature_list.json: f0N_nombre/, sin
│   │                               numeración interna aparte.
│   └── f01_environment_setup/      Spec de la primera feature real (scaffold de
│                                    front/, ya ejecutada y aprobada).
└── .claude/                       Todo lo relacionado al harness de Claude Code.
    │                               Nunca contiene código de producto de MuunCode.
    ├── init.ps1                     Script de verificación del harness (PowerShell).
    │                                 Revisa el feature_list.json y la carpeta
    │                                 progress/ antes de empezar a trabajar.
    ├── AGENTS.md                    Mapa de navegación: primera lectura obligatoria
    │                                 de cualquier agente al iniciar una sesión.
    ├── CHECKPOINTS.md                Criterios verificables de "hecho" por feature.
    │                                 El Implementer los usa para saber cuándo
    │                                 terminó; el Reviewer, para validar el trabajo.
    ├── feature_list.json             Estado machine-readable de todas las features
    │                                 (pending / in_progress / done).
    ├── context/                      Material de contexto de producto extendido.
    │   ├── MuunCode-Context.md       Narrativa completa: visión, misión,
    │   │                                filosofía, principios, non-goals.
    │   └── context-iphone-bugs.md      Guía de bugs comunes de compatibilidad
    │                                    iOS Safari, para cuando exista un frontend.
    ├── agents/                       Sub-agentes de Claude Code invocados por el
    │   │                              lead (el modelo principal de la sesión).
    │   ├── implementer.md              Implementa una feature siguiendo su spec
    │   │                                 y los checkpoints correspondientes.
    │   └── reviewer.md                  Valida el trabajo del Implementer contra
    │                                     los checkpoints. Solo lectura, nunca edita
    │                                     código.
    └── progress/                     Estado de sesión persistido en disco.
        ├── current.md                  Plan de la sesión activa. Sobrescribible.
        └── history.md                  Log histórico de decisiones. Solo se le
                                          agregan entradas, nunca se borra nada.
```

### Notas rápidas

- El *lead* (el modelo principal) nunca implementa código de producto directamente:
  siempre delega en el sub-agente `implementer`, y nunca marca una feature como
  terminada sin un `APPROVED` del sub-agente `reviewer`.
- Todo el código, nombres de archivo, identificadores y comentarios generados para
  MuunCode se escriben en inglés (ver `CLAUDE.md` → "Code & Naming Standards"),
  aunque la comunicación con el usuario sea en español.
- Nada fuera de `.claude/` y de los archivos raíz (`CLAUDE.md`, `.gitignore`, `front/`,
  `api/`, y `features/` para las specs) pertenece al harness.
- `CLAUDE.md` también define, entre otras cosas: gestión de paquetes (solo pnpm, nunca
  versiones escritas a mano), arquitectura Atomic Design + CSS puro, y la metodología
  de referenciar el código fuente real de VS Code antes de construir cualquier
  elemento de UI del shell del IDE.

---

## English

This document explains, folder by folder and file by file, what each piece of this
repository's Claude Code harness is for. It does not replace `CLAUDE.md`: it is a quick
orientation map, not the product's source of truth.

### Directory tree

```
MuunCode/
├── CLAUDE.md                      Project source of truth: vision, mission,
│                                   principles, non-goals, stack status, workflow,
│                                   and rules for any agent working in this repo.
├── claude-map.md                  This document: harness map for human
│                                   developers and agents.
├── .gitignore                     Generic ignore rules, reused across the
│                                   author's projects. Not edited here.
├── front/                         MuunCode's actual app (Vite + React + TS).
│                                   Atomic Design under front/src/components/, one
│                                   global CSS file at front/src/styles/tokens.css.
├── api/                           Small serverless functions (GitHub OAuth token
│                                   exchange/refresh), per Vercel's own convention.
├── features/                      Specs only (.md), never application code. One
│   │                               folder per feature, named to match its id in
│   │                               feature_list.json exactly: f0N_name/, no
│   │                               separate internal numbering.
│   └── f01_environment_setup/      Spec for the first real feature (scaffolding
│                                    `front/`, already executed and approved).
└── .claude/                       Everything related to the Claude Code harness.
    │                               Never contains MuunCode product code.
    ├── init.ps1                     Harness verification script (PowerShell).
    │                                 Checks feature_list.json and the progress/
    │                                 folder before work starts.
    ├── AGENTS.md                    Navigation map: mandatory first read for any
    │                                 agent starting a session.
    ├── CHECKPOINTS.md                Verifiable done-criteria per feature. The
    │                                 Implementer uses it to know when it's done;
    │                                 the Reviewer, to validate the work.
    ├── feature_list.json             Machine-readable status of all features
    │                                 (pending / in_progress / done).
    ├── context/                      Extended product context material.
    │   ├── MuunCode-Context.md       Full narrative: vision, mission,
    │   │                                philosophy, principles, non-goals.
    │   └── context-iphone-bugs.md      iOS Safari compatibility bug guide, for
    │                                    when a frontend eventually exists.
    ├── agents/                       Claude Code subagents invoked by the lead
    │   │                              (the session's main model).
    │   ├── implementer.md              Implements a feature per its spec and the
    │   │                                 relevant checkpoints.
    │   └── reviewer.md                  Validates the Implementer's work against
    │                                     the checkpoints. Read-only, never edits
    │                                     code.
    └── progress/                     On-disk session state.
        ├── current.md                  Active session plan. Overwritable.
        └── history.md                  Append-only decision history log. Never
                                          delete previous entries.
```

### Quick notes

- The *lead* (the main model) never implements product code directly: it always
  delegates to the `implementer` subagent, and never marks a feature done without an
  `APPROVED` verdict from the `reviewer` subagent.
- All code, file names, identifiers, and comments generated for MuunCode are written
  in English (see `CLAUDE.md` → "Code & Naming Standards"), even though communication
  with the user happens in Spanish.
- Nothing outside `.claude/` and the root files (`CLAUDE.md`, `.gitignore`, `front/`,
  `api/`, and `features/` for specs) belongs to the harness.
- `CLAUDE.md` also defines, among other things: package management (pnpm only, never
  hand-typed versions), Atomic Design + pure CSS architecture, and the methodology of
  referencing VS Code's actual source before building any IDE-shell UI element.
