// Shared low-level GitHub REST call used by both api/lib/githubGitDataCommit.ts and
// api/lib/githubBootstrapBranch.ts: every one of their steps fails the same way (network
// error, non-2xx, or an unparsable body), so this captures GitHub's own error detail once
// instead of repeating that parsing per step, which is exactly what made this scaffold
// flow's real failures impossible to diagnose before this existed.

interface GitHubErrorBody {
  message?: string
  errors?: { message?: string }[]
}

export type StepResult<T> = { ok: true; value: T } | { ok: false; status: number; detail: string }

export async function githubRequest<T>(
  url: string,
  accessToken: string,
  method: string,
  body?: object,
): Promise<StepResult<T>> {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => null)

  if (!response) return { ok: false, status: 0, detail: 'Network request failed' }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as GitHubErrorBody | null
    const detail = errorBody?.errors?.[0]?.message ?? errorBody?.message ?? response.statusText
    return { ok: false, status: response.status, detail }
  }

  const data = (await response.json().catch(() => null)) as T | null
  if (!data) return { ok: false, status: response.status, detail: 'Invalid response body' }

  return { ok: true, value: data }
}
