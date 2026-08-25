import { apiUrl } from './apiUrl'

interface CheckInstallationResponse {
  hasInstallation?: boolean
}

// Asks GitHub directly (via api/check-installation.ts) whether this GitHub account has
// installed the MuunCode App. Returns null if the check itself could not be completed
// (network error, GitHub unreachable), true/false is the actual answer. Never inferred
// from anything stored locally: see api/check-installation.ts for why.
export async function checkHasInstallation(accessToken: string): Promise<boolean | null> {
  const response = await fetch(apiUrl('/api/check-installation'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken }),
  }).catch(() => null)

  if (!response || !response.ok) return null

  const data = (await response.json().catch(() => null)) as CheckInstallationResponse | null
  if (!data || typeof data.hasInstallation !== 'boolean') return null

  return data.hasInstallation
}
