import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyDevCors } from './_lib/devCors'
import { refreshGitHubTokens } from './_lib/githubOAuth'

interface AuthRefreshBody {
  refreshToken?: string
}

// POST /api/auth-refresh: exchanges a still-valid refresh token for a new access token
// (GitHub App user tokens expire after 8 hours). Needs the Client Secret, so it runs
// here, never in the browser. See CLAUDE.md -> Authentication and Account Creation.
//
// Lives at the repo-root api/: see auth-exchange.ts for why.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyDevCors(req, res)) return

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { refreshToken } = (req.body ?? {}) as AuthRefreshBody
  if (!refreshToken) {
    res.status(400).json({ error: 'Missing refreshToken' })
    return
  }

  const result = await refreshGitHubTokens(refreshToken)
  if (!result.ok) {
    res.status(502).json({ error: result.error })
    return
  }

  res.status(200).json(result.tokens)
}
