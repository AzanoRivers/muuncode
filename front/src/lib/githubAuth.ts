// Every future GitHub-API-calling feature imports getAccessToken() from here instead of
// reading localStorage directly. See CLAUDE.md -> Authentication and Account Creation.
// Never throws: every failure path returns null/false instead.

import { apiUrl } from './apiUrl'

const STORAGE_KEY = 'muuncode.githubAuth'
const REFRESH_SAFETY_MARGIN_MS = 5 * 60 * 1000

export interface GitHubOAuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  refreshTokenExpiresIn: number
}

interface StoredGitHubAuth {
  accessToken: string
  refreshToken: string
  expiresAt: number
  refreshTokenExpiresAt: number
}

function toStoredAuth(tokens: GitHubOAuthTokens): StoredGitHubAuth {
  const now = Date.now()
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: now + tokens.expiresIn * 1000,
    refreshTokenExpiresAt: now + tokens.refreshTokenExpiresIn * 1000,
  }
}

function readStoredAuth(): StoredGitHubAuth | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as StoredGitHubAuth
  } catch {
    return null
  }
}

function writeStoredAuth(auth: StoredGitHubAuth): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

// Called once by Station right after a successful token exchange.
export function storeGitHubTokens(tokens: GitHubOAuthTokens): void {
  writeStoredAuth(toStoredAuth(tokens))
}

export function clearGitHubTokens(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// Cheap, local-only check (no network): is there a stored session whose refresh token
// has not passed its own expiry (GitHub App refresh tokens last up to 6 months of
// regular use, access tokens only 8 hours, so this alone does NOT prove the session
// still works, GitHub may have revoked it server-side, e.g. the user uninstalled the
// App). Good enough for deciding what a button should say; not a substitute for
// actually calling getAccessToken() before relying on the session for real.
export function isSignedIn(): boolean {
  const stored = readStoredAuth()
  if (!stored) return false

  if (Date.now() >= stored.refreshTokenExpiresAt) {
    clearGitHubTokens()
    return false
  }

  return true
}

async function requestRefresh(refreshToken: string): Promise<StoredGitHubAuth | null> {
  const response = await fetch(apiUrl('/api/auth-refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => null)

  if (!response || !response.ok) return null

  const tokens = (await response.json().catch(() => null)) as GitHubOAuthTokens | null
  if (!tokens) return null

  const refreshed = toStoredAuth(tokens)
  writeStoredAuth(refreshed)
  return refreshed
}

// Returns a usable access token, transparently refreshing it first if it is expired or
// close to expiring. Returns null if the user never signed in, or if the refresh fails
// for any reason (network error, revoked session, etc.).
export async function getAccessToken(): Promise<string | null> {
  const stored = readStoredAuth()
  if (!stored) return null

  const isNearExpiry = Date.now() >= stored.expiresAt - REFRESH_SAFETY_MARGIN_MS
  if (!isNearExpiry) {
    return stored.accessToken
  }

  const refreshed = await requestRefresh(stored.refreshToken)
  return refreshed ? refreshed.accessToken : null
}
