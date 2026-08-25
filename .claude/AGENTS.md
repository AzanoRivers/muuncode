# AGENTS.md: MuunCode Navigation Map

This file is the mandatory first read for any agent starting a session on this
repository. It tells you what exists, where it lives, and when to read it. It does not
duplicate content: everything below is a pointer, not a manual.

---

## Key Files

| File | Purpose | When to read it |
|---|---|---|
| `CLAUDE.md` (root) | Product vision, principles, stack status, workflow, rules for agents | Always, at session start |
| `claude-map.md` (root) | Bilingual (ES/EN) map of every harness file, for humans and agents | When onboarding, or to locate a specific harness file |
| `.claude/AGENTS.md` | This file: navigation map | Always, at session start (first) |
| `.claude/CHECKPOINTS.md` | Verifiable done-criteria per feature | Before implementing or reviewing any feature |
| `.claude/feature_list.json` | Machine-readable status of all features | Before deciding what to work on next |
| `.claude/context/MuunCode-Context.md` | Extended product narrative: vision, mission, philosophy, non-goals | When a design decision needs deeper product grounding |
| `.claude/context/context-iphone-bugs.md` | iOS Safari compatibility reference (Astro/Next.js/React/Tailwind) | Once any frontend/dashboard work begins |
| `.claude/progress/current.md` | Active session plan, overwritable | At the start of every session, to resume state |
| `.claude/progress/history.md` | Permanent append-only log of past sessions | When you need history of a past decision |
| `.claude/init.ps1` | Harness verification script | Run before starting work in any session |
| `features/f0N_name/` | One folder per feature, named to match its exact id in `feature_list.json` (e.g. `f01_environment_setup/`), no separate internal numbering. Holds that feature's `.md` specs only, never application code | Before implementing or reviewing that feature: read the specs first |
| `front/` (root) | The actual MuunCode frontend project (Vite + React + TS), shared across every feature: Atomic Design components under `front/src/components/` plus `front/src/styles/tokens.css` | Whenever implementing or reviewing frontend code |

---

## Agent Roles

| Agent | File | When to invoke |
|---|---|---|
| Lead (you, the main model) | `CLAUDE.md` | Always active; plans, coordinates, never implements |
| Implementer | `.claude/agents/implementer.md` | After the lead has written a plan in `.claude/progress/current.md` for a specific feature |
| Light Reviewer | `.claude/agents/reviewer-light.md` | After the Implementer reports `DONE` on an adjustment/tweak round for a feature already in progress. Fast pass, the default choice |
| Full Reviewer | `.claude/agents/reviewer.md` | Only as the final gate, once, right before a feature is marked `done` for good and the lead advances to a new feature/phase |

---

## Development Flow

1. Read `.claude/AGENTS.md` (this file).
2. Run `.\.claude\init.ps1` from the project root.
3. Check `.claude/feature_list.json` for the next `pending` feature.
4. Write or update the feature spec(s) inside `features/<NN>_name/`.
5. Write the plan in `.claude/progress/current.md` before launching any subagent.
6. Launch the Implementer (`.claude/agents/implementer.md`).
7. Launch the Reviewer (`.claude/agents/reviewer.md`) once the Implementer reports `DONE`.
8. On `APPROVED`, update `.claude/feature_list.json` and append to
   `.claude/progress/history.md`. On `REJECTED`, repeat from step 6 with a new
   Implementer pass.

---

## Harness Rules (invariant)

- Never use the em dash (`—`) anywhere in this repository, in English or Spanish, under
  any circumstance: it is a serious writing mistake in both languages. Use `:` for an
  explanation, `,` for a parallel construction, or `.` to split into separate sentences.
- Only one feature may be `in_progress` at a time in `.claude/feature_list.json`.
  `.claude/init.ps1` enforces this.
- State lives on disk, never only in chat. `.claude/progress/current.md` must reflect
  the real active plan at all times.
- The lead never implements application code directly. Implementation is always
  delegated to the Implementer subagent.
- The Reviewer never edits code. It only reports `APPROVED` or `REJECTED` with issues.
- No feature is marked `done` without an `APPROVED` verdict from the Reviewer.
- Nothing outside `.claude/` and the three root files (`CLAUDE.md`, `.gitignore`, plus
  the `features/` folder for application-level feature work) belongs to the harness.
- Before building any IDE-shell UI element with a direct VS Code equivalent (toasts,
  command palette, status bar, tabs, etc.), consult `microsoft/vscode`'s actual
  implementation for behavior/structure first. See `CLAUDE.md` → "UI Reference
  Methodology". This is a priority, not optional polish.

---

## Claude Code Agents vs. Application Modules

- Files under `.claude/agents/` (`implementer.md`, `reviewer.md`) are **Claude Code
  subagents**: instructions for AI roles, not application code. They are invoked by the
  lead during development, never shipped as part of MuunCode itself.
- Files under `features/` are **specs only**: `.md` documents describing what a feature
  is and how to verify it, never the application code itself. The actual MuunCode
  source code (for the web IDE: editor, file handling, device flashing) lives under
  `front/` at the repository root, shared across every feature. A root-level `api/`
  folder holds the small serverless functions (OAuth exchange, refresh), per Vercel's
  own convention of auto-discovering functions only under a top-level `api/`
  directory. This repository's scope is the IDE only; firmware compilation/build
  orchestration is a separate project. See `CLAUDE.md` → "Repository Scope" and
  "Technical Stack".
- Do not confuse the two: a change to `.claude/agents/implementer.md` changes how an AI
  agent behaves, it does not change MuunCode's product behavior. A change under
  `front/` changes the actual product.
