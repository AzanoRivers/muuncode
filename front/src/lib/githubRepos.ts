import { apiUrl } from './apiUrl'

export interface Repo {
  id: string
  name: string
  owner: string
  isPrivate: boolean
  updatedAt: string
}

interface GitHubRepoResponse {
  id: number
  name: string
  owner: string
  private: boolean
  pushed_at: string
}

function toRepo(data: GitHubRepoResponse): Repo {
  return { id: String(data.id), name: data.name, owner: data.owner, isPrivate: data.private, updatedAt: data.pushed_at }
}

export interface ListReposResult {
  repos: Repo[]
  hasMore: boolean
}

interface ListReposResponse {
  repos: GitHubRepoResponse[]
  hasMore: boolean
}

// Lists one page of the repositories the MuunCode App installation can access on the
// signed-in account (via api/list-repos.ts), `page` 1-based (defaults to 1). `hasMore`
// tells the caller (RepoSelector's infinite scroll) whether a further page is worth
// requesting. Returns null if the call could not be completed, never throws.
export async function listRepos(accessToken: string, page = 1): Promise<ListReposResult | null> {
  const response = await fetch(apiUrl('/api/list-repos'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, page }),
  }).catch(() => null)

  if (!response || !response.ok) return null

  const data = (await response.json().catch(() => null)) as ListReposResponse | null
  if (!data) return null

  return { repos: data.repos.map(toRepo), hasMore: data.hasMore }
}

interface CreateBareRepoData {
  name: string
  description: string
  isPrivate: boolean
}

interface BareRepo {
  id: string
  name: string
  owner: string
  defaultBranch: string
  isPrivate: boolean
}

interface CreateRepoResponse {
  id: number
  name: string
  owner: string
  private: boolean
  pushedAt: string
  defaultBranch: string
}

interface CreateRepoErrorResponse {
  error?: string
}

export type CreateBareRepoResult = { ok: true; repo: BareRepo } | { ok: false; error: string }

// Creates a new, bare repository on the signed-in account (via api/create-repo.ts): no
// scaffold commit yet, that is a separate, later call (see scaffoldRepo below), so the
// two real network phases can be shown as two distinct loading messages. Returns a
// controlled { ok, error } result instead of null so the caller can surface GitHub's
// actual failure reason (e.g. a repository name already taken on this account), never
// throws.
export async function createBareRepo(accessToken: string, data: CreateBareRepoData): Promise<CreateBareRepoResult> {
  const response = await fetch(apiUrl('/api/create-repo'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accessToken,
      name: data.name,
      description: data.description,
      isPrivate: data.isPrivate,
    }),
  }).catch(() => null)

  if (!response || !response.ok) {
    const errorBody = response ? ((await response.json().catch(() => null)) as CreateRepoErrorResponse | null) : null
    return { ok: false, error: errorBody?.error ?? 'Unknown error' }
  }

  const repo = (await response.json().catch(() => null)) as CreateRepoResponse | null
  if (!repo) return { ok: false, error: 'Invalid response from server' }

  return {
    ok: true,
    repo: {
      id: String(repo.id),
      name: repo.name,
      owner: repo.owner,
      defaultBranch: repo.defaultBranch,
      isPrivate: repo.private,
    },
  }
}

interface ScaffoldRepoData {
  owner: string
  name: string
  description: string
  defaultBranch: string
}

interface ScaffoldRepoErrorResponse {
  error?: string
  repoDeleted?: boolean
}

export type ScaffoldRepoResult = { ok: true } | { ok: false; error: string; repoDeleted: boolean }

// Commits the MuunCode scaffold (workspace config, README, greetings) as one real git
// commit, then attempts to add the repo to the App installation (via
// api/scaffold-repo.ts). Only reports success/failure: there is no repo data left to
// return, createBareRepo above already returned everything the caller needs. Returns a
// controlled { ok, error, repoDeleted } result instead of a bare boolean so the caller
// can surface GitHub's actual failure reason and whether the incomplete repository was
// cleaned up automatically, never throws.
export async function scaffoldRepo(accessToken: string, data: ScaffoldRepoData): Promise<ScaffoldRepoResult> {
  const response = await fetch(apiUrl('/api/scaffold-repo'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accessToken,
      owner: data.owner,
      name: data.name,
      description: data.description,
      defaultBranch: data.defaultBranch,
    }),
  }).catch(() => null)

  if (response && response.ok) return { ok: true }

  const errorBody = response ? ((await response.json().catch(() => null)) as ScaffoldRepoErrorResponse | null) : null
  return { ok: false, error: errorBody?.error ?? 'Unknown error', repoDeleted: errorBody?.repoDeleted ?? false }
}

interface DeleteRepoData {
  owner: string
  name: string
}

interface DeleteRepoErrorResponse {
  error?: string
}

export type DeleteRepoResult = { ok: true } | { ok: false; error: string }

// Permanently deletes a repository on the signed-in account (via api/delete-repo.ts).
// Used by IdeDeleteRepoModal, the only place in the app that calls this: everywhere
// else a "deleted" repo is just orphaned cleanup after a failed scaffold (see
// scaffoldRepo above), never a direct user action. Returns a controlled
// { ok, error } result instead of a bare boolean so the caller can surface GitHub's
// actual failure reason, never throws.
export async function deleteRepo(accessToken: string, data: DeleteRepoData): Promise<DeleteRepoResult> {
  const response = await fetch(apiUrl('/api/delete-repo'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, owner: data.owner, name: data.name }),
  }).catch(() => null)

  if (response && response.ok) return { ok: true }

  const errorBody = response ? ((await response.json().catch(() => null)) as DeleteRepoErrorResponse | null) : null
  return { ok: false, error: errorBody?.error ?? 'Unknown error' }
}
