import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyDevCors } from './lib/devCors'
import { getInstallationAccessToken } from './lib/githubAppAuth'
import { getInstallationInfo } from './lib/githubInstallationId'

interface ListReposBody {
  accessToken?: string
  page?: number
}

interface GitHubRepoOwner {
  login: string
}

interface GitHubRepo {
  id: number
  name: string
  private: boolean
  pushed_at: string
  owner: GitHubRepoOwner
}

interface GitHubListReposResponse {
  total_count?: number
  repositories?: GitHubRepo[]
}

export interface RepoSummary {
  id: number
  name: string
  owner: string
  private: boolean
  pushed_at: string
}

export interface ListReposResult {
  repos: RepoSummary[]
  hasMore: boolean
}

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000
const PER_PAGE = 100
// Caps how many "does .MuunCode/workspace.json exist" checks run at once per page:
// PER_PAGE (100) simultaneous requests risk tripping GitHub's abuse/secondary rate
// limiting even though the installation token's hourly quota (5000) has plenty of
// room left. Processed in sequential batches of this size instead.
const MEMBERSHIP_CHECK_BATCH_SIZE = 10

function isActiveWithinOneYear(pushedAt: string): boolean {
  return Date.now() - new Date(pushedAt).getTime() <= ONE_YEAR_MS
}

async function mapWithConcurrencyLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = []
  for (let start = 0; start < items.length; start += limit) {
    const batch = items.slice(start, start + limit)
    results.push(...(await Promise.all(batch.map(fn))))
  }
  return results
}

// POST /api/list-repos: lists the repositories the MuunCode App installation can
// access on the signed-in account, one page at a time (`page`, 1-based, defaults to 1;
// see front/src/lib/githubRepos.ts's listRepos for the infinite-scroll caller). Needs an
// installation access token (not the user's own OAuth token) since
// `/installation/repositories` is an installation-scoped endpoint; that token is minted
// server-side from the App's private key, never sent to the browser (see
// api/lib/githubAppAuth.ts).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyDevCors(req, res)) return

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { accessToken, page } = (req.body ?? {}) as ListReposBody
  if (!accessToken) {
    res.status(400).json({ error: 'Missing accessToken' })
    return
  }
  const currentPage = page && page > 0 ? page : 1

  const installationInfo = await getInstallationInfo(accessToken)
  if (!installationInfo) {
    res.status(502).json({ error: 'Failed to resolve GitHub App installation' })
    return
  }
  const { installationId } = installationInfo

  const installationToken = await getInstallationAccessToken(installationId)
  if (!installationToken) {
    res.status(502).json({ error: 'Failed to authenticate as the GitHub App installation' })
    return
  }

  const response = await fetch(
    `https://api.github.com/installation/repositories?per_page=${PER_PAGE}&page=${currentPage}`,
    {
      headers: {
        Authorization: `Bearer ${installationToken}`,
        Accept: 'application/vnd.github+json',
      },
    },
  ).catch(() => null)

  if (!response || !response.ok) {
    res.status(502).json({ error: 'Failed to list repositories' })
    return
  }

  const data = (await response.json().catch(() => null)) as GitHubListReposResponse | null
  if (!data) {
    res.status(502).json({ error: 'Invalid response from GitHub' })
    return
  }

  const repos: RepoSummary[] = (data.repositories ?? [])
    .map((repo) => ({
      id: repo.id,
      name: repo.name,
      owner: repo.owner.login,
      private: repo.private,
      pushed_at: repo.pushed_at,
    }))
    // Excludes repos with over a year of inactivity before even checking whether they
    // are a MuunCode project: keeps ancient, presumably abandoned repos out of the
    // picker, and saves a Contents API call per repo that would fail this cutoff anyway.
    .filter((repo) => isActiveWithinOneYear(repo.pushed_at))
    .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())

  const membership = await mapWithConcurrencyLimit(repos, MEMBERSHIP_CHECK_BATCH_SIZE, async (repo) => ({
    id: repo.id,
    isMuunCodeProject: await hasWorkspaceConfig(installationToken, repo.owner, repo.name),
  }))
  const muunCodeRepoIds = new Set(membership.filter((entry) => entry.isMuunCodeProject).map((entry) => entry.id))

  const muunCodeRepos = repos.filter((repo) => muunCodeRepoIds.has(repo.id))
  const hasMore = currentPage * PER_PAGE < (data.total_count ?? 0)

  const result: ListReposResult = { repos: muunCodeRepos, hasMore }
  res.status(200).json(result)
}

// Checks whether this repository already qualifies as a MuunCode project (a committed
// `.MuunCode/workspace.json` file, per CLAUDE.md's "Configuration and Preferences"), via
// a direct Contents API existence check, one per repo. Superseded an earlier single
// Code Search API call for the whole account at once: GitHub's code search index has a
// real, unbounded lag for newly pushed content (a repo whose scaffold commit had
// genuinely already landed still would not show up here for a while), which this
// project's own "Predictability" principle ranks above the extra requests this costs.
// Returns false both when the file genuinely does not exist (a normal 404, not a
// failure) and on any network error; never throws.
async function hasWorkspaceConfig(installationToken: string, owner: string, repo: string): Promise<boolean> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/.MuunCode/workspace.json`, {
    headers: {
      Authorization: `Bearer ${installationToken}`,
      Accept: 'application/vnd.github+json',
    },
  }).catch(() => null)

  return Boolean(response && response.ok)
}
