// Resolves the numeric installation id for the MuunCode App on the signed-in GitHub
// account, using the user's own access token (never the App's private key). Used by
// list-repos.ts and scaffold-repo.ts.

interface GitHubInstallation {
  id: number
}

interface GitHubInstallationsResponse {
  total_count?: number
  installations?: GitHubInstallation[]
}

export interface InstallationInfo {
  installationId: number
}

export async function getInstallationInfo(accessToken: string): Promise<InstallationInfo | null> {
  const response = await fetch('https://api.github.com/user/installations', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  }).catch(() => null)

  if (!response || !response.ok) return null

  const data = (await response.json().catch(() => null)) as GitHubInstallationsResponse | null
  if (!data || !(data.total_count ?? 0)) return null

  const firstInstallation = data.installations?.[0]
  if (!firstInstallation) return null

  return { installationId: firstInstallation.id }
}
