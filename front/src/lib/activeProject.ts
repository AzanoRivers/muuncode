// Persists which repository the signed-in user is currently working on, the same way
// githubAuth.ts persists the GitHub session itself: client-side only, no database (see
// CLAUDE.md -> "Configuration and Preferences"). Station.tsx writes this once a
// repository is confirmed (selected or freshly created); LabViewer reads it back on a
// direct visit, with no query string involved, per lib/sessionResolution.ts.

const STORAGE_KEY = 'muuncode.activeProject'

export interface ActiveProject {
  owner: string
  name: string
}

export function storeActiveProject(project: ActiveProject): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
}

export function readActiveProject(): ActiveProject | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<ActiveProject>
    if (!parsed.owner || !parsed.name) return null
    return { owner: parsed.owner, name: parsed.name }
  } catch {
    return null
  }
}

export function clearActiveProject(): void {
  localStorage.removeItem(STORAGE_KEY)
}
