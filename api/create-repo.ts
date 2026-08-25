import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyDevCors } from './_lib/devCors'

interface CreateRepoBody {
  accessToken?: string
  name?: string
  description?: string
  isPrivate?: boolean
}

interface GitHubRepoOwner {
  login: string
}

interface GitHubErrorBody {
  message?: string
  errors?: { message?: string }[]
}

interface GitHubRepo {
  id: number
  name: string
  private: boolean
  pushed_at: string
  default_branch: string
  owner: GitHubRepoOwner
}

// The bare-creation response shape: distinct from list-repos.ts's RepoSummary (which
// mirrors GitHub's own snake_case field names for the repo list) since this is a fresh
// creation result consumed by exactly one caller, front/src/lib/githubRepos.ts's
// createBareRepo, which also needs defaultBranch to hand off to api/scaffold-repo.ts.
export interface CreateRepoResult {
  id: number
  name: string
  owner: string
  private: boolean
  pushedAt: string
  defaultBranch: string
}

// POST /api/create-repo: creates a new bare repository on the signed-in account (using
// the user's own access token, no installation token needed for /user/repos). Committing
// the MuunCode scaffold and adding the repo to the App installation now happen in a
// separate, later call (see api/scaffold-repo.ts): this split lets the frontend show two
// real, distinct loading phases instead of one long opaque request.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyDevCors(req, res)) return

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { accessToken, name, description, isPrivate } = (req.body ?? {}) as CreateRepoBody
  if (!accessToken || !name) {
    res.status(400).json({ error: 'Missing accessToken or name' })
    return
  }

  const createResponse = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description: description || undefined,
      private: Boolean(isPrivate),
      // The MuunCode scaffold (workspace config, README, greetings) is committed by
      // api/scaffold-repo.ts right after this call succeeds, so an empty auto_init
      // README is not needed here: this repo's first real commit is its own scaffold.
      auto_init: false,
    }),
  }).catch(() => null)

  if (!createResponse || !createResponse.ok) {
    const errorBody = createResponse
      ? ((await createResponse.json().catch(() => null)) as GitHubErrorBody | null)
      : null
    const detail = errorBody?.errors?.[0]?.message ?? errorBody?.message ?? 'Failed to create repository'
    res.status(502).json({ error: detail })
    return
  }

  const repo = (await createResponse.json().catch(() => null)) as GitHubRepo | null
  if (!repo) {
    res.status(502).json({ error: 'Invalid response from GitHub' })
    return
  }

  const result: CreateRepoResult = {
    id: repo.id,
    name: repo.name,
    owner: repo.owner.login,
    private: repo.private,
    pushedAt: repo.pushed_at,
    // MuunCode always uses `master` as the default branch, regardless of the signed-in
    // account's own GitHub default-branch-name setting: the repo has zero commits at
    // this point (auto_init: false), so GitHub's own `default_branch` field here is
    // just that account setting, not an actual existing branch yet. api/scaffold-repo.ts
    // creates the real `master` ref for the first commit and then re-asserts it as the
    // repo's default branch, so this value must match that, not GitHub's.
    defaultBranch: 'master',
  }
  res.status(200).json(result)
}
