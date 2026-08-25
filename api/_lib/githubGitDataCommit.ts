// Commits multiple files as ONE single real git commit via GitHub's Git Data API, using
// the user's own OAuth access token (no installation token needed, same as the bare
// repo-creation call itself). Superseded githubContentCommit.ts's one-PUT-per-file
// Contents API approach (see repo-creation-confirmation-flow.md): that approach produced
// three separate commits for what is conceptually a single "scaffold this project" action.
//
// GitHub's Git Data API (blobs/trees/commits) rejects every call with "Git Repository is
// empty." on a repository that has zero refs at all, even though blobs/trees are
// conceptually ref-independent content-addressed objects: this repo has zero commits at
// the point this runs (api/create-repo.ts uses auto_init: false), so
// api/lib/githubBootstrapBranch.ts must create one throwaway commit on `defaultBranch`
// first. This function's own final commit has no parents (a fresh root commit, unrelated
// to that bootstrap commit) and force-updates the existing branch ref to point at it, so
// the bootstrap commit becomes unreachable and never shows up in the repo's visible
// history.
import { githubRequest } from './githubApiRequest'

export interface CommitFileInput {
  path: string
  content: string
}

function createBlob(accessToken: string, owner: string, repo: string, content: string) {
  return githubRequest<{ sha: string }>(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, accessToken, 'POST', {
    content: Buffer.from(content, 'utf-8').toString('base64'),
    encoding: 'base64',
  })
}

function createTree(accessToken: string, owner: string, repo: string, entries: { path: string; sha: string }[]) {
  return githubRequest<{ sha: string }>(`https://api.github.com/repos/${owner}/${repo}/git/trees`, accessToken, 'POST', {
    tree: entries.map((entry) => ({ path: entry.path, mode: '100644', type: 'blob', sha: entry.sha })),
  })
}

function createCommit(accessToken: string, owner: string, repo: string, message: string, treeSha: string) {
  return githubRequest<{ sha: string }>(`https://api.github.com/repos/${owner}/${repo}/git/commits`, accessToken, 'POST', {
    // No `parents`: conceptually the repository's very first commit (the bootstrap
    // commit this force-replaces is never meant to be part of the real history).
    message,
    tree: treeSha,
  })
}

function updateRef(accessToken: string, owner: string, repo: string, branch: string, commitSha: string) {
  return githubRequest<{ ref: string }>(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    accessToken,
    'PATCH',
    // force: true since commitSha has no parents and so is never a fast-forward of the
    // bootstrap commit currently on this branch.
    { sha: commitSha, force: true },
  )
}

export type CommitFilesResult = { ok: true } | { ok: false; step: string; detail: string }

// Commits every file in `files` as one single git commit, then force-updates the
// `defaultBranch` ref (already created by githubBootstrapBranch.ts) to point at it.
// Returns which step failed and GitHub's own detail on failure, instead of a bare
// boolean, so a real failure can actually be diagnosed (network tab / server logs)
// rather than collapsing into one opaque message; never throws.
export async function commitFiles(
  accessToken: string,
  owner: string,
  repo: string,
  defaultBranch: string,
  message: string,
  files: CommitFileInput[],
): Promise<CommitFilesResult> {
  try {
    const blobEntries: { path: string; sha: string }[] = []

    for (const file of files) {
      const blob = await createBlob(accessToken, owner, repo, file.content)
      if (!blob.ok) return { ok: false, step: `blob:${file.path}`, detail: blob.detail }
      blobEntries.push({ path: file.path, sha: blob.value.sha })
    }

    const tree = await createTree(accessToken, owner, repo, blobEntries)
    if (!tree.ok) return { ok: false, step: 'tree', detail: tree.detail }

    const commit = await createCommit(accessToken, owner, repo, message, tree.value.sha)
    if (!commit.ok) return { ok: false, step: 'commit', detail: commit.detail }

    const ref = await updateRef(accessToken, owner, repo, defaultBranch, commit.value.sha)
    if (!ref.ok) return { ok: false, step: 'ref', detail: ref.detail }

    return { ok: true }
  } catch (error) {
    return { ok: false, step: 'unexpected', detail: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Re-asserts `branch` as the repo's actual default branch setting. Belt-and-suspenders:
// api/create-repo.ts's repo response already claims `defaultBranch` is `master`, and
// githubBootstrapBranch.ts's bootstrap commit already targets that exact branch name, so
// this should already be a no-op in practice; kept as a safety net in case GitHub's
// account-level default-branch-name setting ever disagrees. Best-effort.
export async function setDefaultBranch(accessToken: string, owner: string, repo: string, branch: string): Promise<boolean> {
  const result = await githubRequest(`https://api.github.com/repos/${owner}/${repo}`, accessToken, 'PATCH', {
    default_branch: branch,
  })
  return result.ok
}
