import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyDevCors } from './lib/devCors'

interface CheckInstallationBody {
  accessToken?: string
}

interface GitHubInstallationsResponse {
  total_count?: number
}

// POST /api/check-installation: asks GitHub directly whether the signed-in user has
// installed the MuunCode App on any account, using the user's own access token (no
// Client Secret needed here). This is the only reliable source of truth: it must never
// be inferred from anything stored in the browser (localStorage is per browser/device,
// a different browser or a cleared localStorage would otherwise look like "never
// installed" even when the GitHub account already has it installed).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyDevCors(req, res)) return

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { accessToken } = (req.body ?? {}) as CheckInstallationBody
  if (!accessToken) {
    res.status(400).json({ error: 'Missing accessToken' })
    return
  }

  const response = await fetch('https://api.github.com/user/installations', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  }).catch(() => null)

  if (!response || !response.ok) {
    res.status(502).json({ error: 'Failed to check GitHub App installations' })
    return
  }

  const data = (await response.json().catch(() => null)) as GitHubInstallationsResponse | null
  if (!data) {
    res.status(502).json({ error: 'Invalid response from GitHub' })
    return
  }

  res.status(200).json({ hasInstallation: (data.total_count ?? 0) > 0 })
}
