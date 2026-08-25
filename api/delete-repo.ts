import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyDevCors } from './_lib/devCors'
import { deleteRepo } from './_lib/githubDeleteRepo'

interface DeleteRepoBody {
  accessToken?: string
  owner?: string
  name?: string
}

// POST /api/delete-repo: permanently deletes a repository on the signed-in account, via
// the user's own OAuth access token. Thin wrapper around lib/githubDeleteRepo.ts's own
// deleteRepo, which until now was only ever called internally by scaffold-repo.ts's
// rollback path; this is its first real, user-facing entry point, wired to /lab's File
// menu "Delete Repository" action (see IdeDeleteRepoModal).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyDevCors(req, res)) return

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { accessToken, owner, name } = (req.body ?? {}) as DeleteRepoBody
  if (!accessToken || !owner || !name) {
    res.status(400).json({ error: 'Missing accessToken, owner or name' })
    return
  }

  const deleted = await deleteRepo(accessToken, owner, name)
  if (!deleted) {
    res.status(502).json({ error: 'Failed to delete the repository' })
    return
  }

  res.status(200).json({ ok: true })
}
