// Deletes a repository outright, using the user's own OAuth access token. Called from
// two places: api/scaffold-repo.ts's own rollback path, when the scaffold commit itself
// failed (at that point the repo exists on GitHub with no MuunCode structure at all, so
// leaving it behind would just be orphaned clutter with no path back into the app,
// list-repos.ts only surfaces repos that already have `.MuunCode/workspace.json`), and
// api/delete-repo.ts, the real user-facing "Delete Repository" action (see
// IdeDeleteRepoModal). Returns false (never throws) both on a network failure and when
// the App's own token lacks the "Administration: write" permission repo deletion
// requires, since that permission is independent from the "Contents" one the scaffold
// commit itself needs.
export async function deleteRepo(accessToken: string, owner: string, repo: string): Promise<boolean> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  }).catch(() => null)

  return Boolean(response && response.ok)
}
