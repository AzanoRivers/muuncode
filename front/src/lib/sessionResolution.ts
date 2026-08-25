// Shared "given whatever is already stored locally, what screen does this land on"
// state machine: the same session/token/installation/project checks every entry point
// needs, in exactly one place, so Home's "Entrar a MuunCode" button, LabViewer's
// direct-entry check, and Station.tsx's own returning-visitor flow all run the exact
// same sequence instead of each keeping its own copy. Does NOT handle the GitHub OAuth
// `code` exchange itself (a fresh redirect from GitHub, only Station.tsx's mount effect
// ever sees that): `resolveSessionFromToken` is what a caller that already has a
// just-minted token (Station's own code-exchange path) uses instead of re-deriving it
// via `resolveSession`.
import { getAccessToken, isSignedIn } from './githubAuth'
import { checkHasInstallation } from './githubInstallation'
import { readActiveProject } from './activeProject'
import type { ActiveProject } from './activeProject'

export type SessionResolution =
  | { status: 'unauthenticated' }
  | { status: 'needsInstall' }
  | { status: 'error' }
  | { status: 'noProject'; accessToken: string }
  | { status: 'ready'; accessToken: string; project: ActiveProject }

// Never throws: every failure path resolves to a status instead, same convention as
// githubAuth.ts/githubInstallation.ts, which this composes. Shared by resolveSession
// below and by any caller that already holds a verified, current access token.
export async function resolveSessionFromToken(accessToken: string): Promise<SessionResolution> {
  const hasInstallation = await checkHasInstallation(accessToken)
  if (hasInstallation === null) return { status: 'error' }
  if (!hasInstallation) return { status: 'needsInstall' }

  const project = readActiveProject()
  if (!project) return { status: 'noProject', accessToken }

  return { status: 'ready', accessToken, project }
}

export async function resolveSession(): Promise<SessionResolution> {
  if (!isSignedIn()) return { status: 'unauthenticated' }

  const accessToken = await getAccessToken()
  if (!accessToken) return { status: 'unauthenticated' }

  return resolveSessionFromToken(accessToken)
}
