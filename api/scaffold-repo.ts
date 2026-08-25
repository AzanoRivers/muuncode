import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyDevCors } from './_lib/devCors'
import { bootstrapEmptyRepoBranch } from './_lib/githubBootstrapBranch'
import { deleteRepo } from './_lib/githubDeleteRepo'
import { commitFiles, setDefaultBranch } from './_lib/githubGitDataCommit'
import { getInstallationInfo } from './_lib/githubInstallationId'
import { buildReadme, buildWorkspaceConfig, GREETINGS_MD } from './_lib/repoScaffoldTemplates'

interface ScaffoldRepoBody {
  accessToken?: string
  owner?: string
  name?: string
  description?: string
  defaultBranch?: string
}

interface GitHubRepo {
  id: number
}

// POST /api/scaffold-repo: runs everything api/create-repo.ts used to do right after
// creating the bare repository. The repository itself was already created and
// confirmed by the user (see repo-creation-confirmation-flow.md); if the scaffold commit
// itself fails, the repo exists on GitHub with no MuunCode structure at all and no way
// back into the app's own repo list (list-repos.ts only surfaces repos that already have
// `.MuunCode/workspace.json`), so it is deleted automatically rather than left behind as
// orphaned clutter (explicit user decision, overriding this file's own earlier choice not
// to, see repo-creation-confirmation-flow.md's history).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyDevCors(req, res)) return

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { accessToken, owner, name, description, defaultBranch } = (req.body ?? {}) as ScaffoldRepoBody
  if (!accessToken || !owner || !name || !defaultBranch) {
    res.status(400).json({ error: 'Missing accessToken, owner, name or defaultBranch' })
    return
  }

  // Must run before commitFiles below: the repo was just created via /user/repos,
  // which is a plain user-level action that never required the MuunCode App's
  // installation to cover it. If that installation is scoped to "selected
  // repositories" (the common case), the App's own repo permissions (needed to write
  // git blobs/trees/commits) simply do not apply to this repo yet, so commitFiles
  // would fail every time until this repo is actually added to the installation.
  // Best-effort on purpose: if the installation already covers all repositories, this
  // PUT is a no-op/harmless failure, and commitFiles below still succeeds regardless.
  await addRepoToInstallation(accessToken, owner, name)

  // GitHub's Git Data API (used by commitFiles below) rejects every call with "Git
  // Repository is empty." until the repo has at least one ref: this repo has zero
  // commits at this point (api/create-repo.ts uses auto_init: false), so this creates
  // one throwaway commit directly on `defaultBranch` first. commitFiles force-updates
  // that same ref with its own, real, parent-less commit right after, so this bootstrap
  // commit is immediately orphaned and never appears in the repo's visible history.
  const bootstrapped = await bootstrapEmptyRepoBranch(accessToken, owner, name, defaultBranch)
  if (!bootstrapped.ok) {
    const repoDeleted = await deleteRepo(accessToken, owner, name)
    res.status(502).json({
      error: `Failed to bootstrap the repository before scaffolding: ${bootstrapped.detail}`,
      repoDeleted,
    })
    return
  }

  const commitMessage = `MuunCode: Foundation - Houston, repo ${name} successfully created`

  const scaffolded = await commitFiles(accessToken, owner, name, defaultBranch, commitMessage, [
    {
      path: '.MuunCode/workspace.json',
      content: buildWorkspaceConfig({ name, createdAt: new Date().toISOString() }),
    },
    { path: 'README.md', content: buildReadme({ name, description: description ?? '' }) },
    { path: 'GREETINGS.md', content: GREETINGS_MD },
  ])

  if (!scaffolded.ok) {
    const repoDeleted = await deleteRepo(accessToken, owner, name)
    res.status(502).json({
      error: `Failed to commit the initial project scaffold (${scaffolded.step}): ${scaffolded.detail}`,
      repoDeleted,
    })
    return
  }

  // The repo had zero commits (and so no real branch) when created, so GitHub's own
  // default_branch setting on it so far only reflects the account's naming preference,
  // not `defaultBranch` (always `master`, see api/create-repo.ts), which only started
  // existing as a real ref via commitFiles above. Re-asserting it now makes GitHub's
  // own UI/API agree that `master` is the repo's actual default branch.
  await setDefaultBranch(accessToken, owner, name, defaultBranch)

  res.status(200).json({ ok: true })
}

// Best-effort: never fails the outer request by itself, since a no-op/harmless failure
// here (e.g. the installation already covers all repositories) is not a real problem,
// commitFiles right after this call will still succeed regardless. Resolves the repo's
// own numeric id first (not passed in the request body), since the installation-add
// endpoint needs it, then attempts to add it to the installation.
async function addRepoToInstallation(accessToken: string, owner: string, repo: string): Promise<void> {
  const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  }).catch(() => null)

  if (!repoResponse || !repoResponse.ok) return

  const repoData = (await repoResponse.json().catch(() => null)) as GitHubRepo | null
  if (!repoData) return

  const installationInfo = await getInstallationInfo(accessToken)
  if (!installationInfo) return
  const { installationId } = installationInfo

  await fetch(
    `https://api.github.com/user/installations/${installationId}/repositories/${repoData.id}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    },
  ).catch(() => null)
}
