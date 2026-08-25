import { githubRequest } from './githubApiRequest'

export type BootstrapResult = { ok: true } | { ok: false; detail: string }

// Creates the repository's very first commit via GitHub's Contents API, the only GitHub
// REST surface that can write to a repository with zero refs at all (unlike the Git Data
// API's blob/tree/commit endpoints, which all reject with "Git Repository is empty."
// until at least one ref exists, see githubGitDataCommit.ts). Explicitly targets
// `branch` via the Contents API's own `branch` field, so the very first ref this
// repository ever gets is already the one MuunCode wants (`master`), not whichever name
// the signed-in account's own default-branch-name setting would otherwise pick. The
// placeholder file/commit this creates is immediately orphaned once
// githubGitDataCommit.ts's commitFiles force-updates this same branch ref to point at its
// own, real, parent-less commit instead, so it never actually appears in the
// repository's visible history.
export async function bootstrapEmptyRepoBranch(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string,
): Promise<BootstrapResult> {
  const result = await githubRequest(
    `https://api.github.com/repos/${owner}/${repo}/contents/.muuncode-bootstrap`,
    accessToken,
    'PUT',
    {
      message: 'bootstrap',
      content: Buffer.from('').toString('base64'),
      branch,
    },
  )

  return result.ok ? { ok: true } : { ok: false, detail: result.detail }
}
