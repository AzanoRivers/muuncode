// Shared GitHub OAuth token exchange logic, used by both auth-exchange.ts and
// auth-refresh.ts (same GitHub endpoint, different grant type). Never throws: every
// failure path returns an explicit `{ ok: false, error }` result instead.

export interface GitHubOAuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  refreshTokenExpiresIn: number
}

export type GitHubOAuthResult =
  | { ok: true; tokens: GitHubOAuthTokens }
  | { ok: false; error: string }

interface GitHubTokenResponse {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  refresh_token_expires_in?: number
  error?: string
  error_description?: string
}

const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'

async function requestGitHubToken(params: Record<string, string>): Promise<GitHubOAuthResult> {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      ...params,
    }),
  }).catch(() => null)

  if (!response) {
    return { ok: false, error: 'Network error reaching GitHub' }
  }

  const data = (await response.json().catch(() => null)) as GitHubTokenResponse | null

  if (!data || !response.ok || data.error || !data.access_token || !data.refresh_token) {
    // Never include `data` here: GitHub error payloads can echo back request params.
    return { ok: false, error: 'GitHub OAuth token request failed' }
  }

  return {
    ok: true,
    tokens: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in ?? 0,
      refreshTokenExpiresIn: data.refresh_token_expires_in ?? 0,
    },
  }
}

export function exchangeCodeForTokens(code: string): Promise<GitHubOAuthResult> {
  return requestGitHubToken({ code })
}

export function refreshGitHubTokens(refreshToken: string): Promise<GitHubOAuthResult> {
  return requestGitHubToken({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })
}
