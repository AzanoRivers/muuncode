import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyDevCors } from './lib/devCors'
import { exchangeCodeForTokens } from './lib/githubOAuth'

interface AuthExchangeBody {
  code?: string
}

// POST /api/auth-exchange: trades the GitHub App OAuth `code` (appended to the callback
// URL) for an access token + refresh token. Needs the App's Client Secret, so it must
// run here, never in the browser. See CLAUDE.md -> Authentication and Account Creation.
//
// Lives at the repo-root api/: Vercel only auto-discovers Serverless Functions under a
// top-level api/ directory, it does not follow an arbitrary path from a `functions`
// glob in vercel.json. Shared lib code lives in ./lib, next to the functions.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyDevCors(req, res)) return

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { code } = (req.body ?? {}) as AuthExchangeBody
  if (!code) {
    res.status(400).json({ error: 'Missing code' })
    return
  }

  const result = await exchangeCodeForTokens(code)
  if (!result.ok) {
    res.status(502).json({ error: result.error })
    return
  }

  res.status(200).json(result.tokens)
}
