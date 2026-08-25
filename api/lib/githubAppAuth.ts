import { createAppAuth } from '@octokit/auth-app'

// Mints a short-lived installation access token for the MuunCode GitHub App, using the
// App's own credentials (GITHUB_APP_ID/GITHUB_APP_PRIVATE_KEY, server-only, never sent to
// the browser). @octokit/auth-app is the official GitHub App auth strategy: it handles
// JWT signing (including the clock-skew margin GitHub expects) and the installation-token
// exchange in one call, so this project does not hand-roll either.
//
// createAppAuth() can throw on a malformed private key or a failed exchange with GitHub;
// this is the one documented, unavoidable exception to this project's global no-throw
// rule (a third-party library that can only fail by throwing). Wrapped in try/catch
// immediately, converted to a controlled `null` return, never rethrown.
export async function getInstallationAccessToken(installationId: number): Promise<string | null> {
  const appId = process.env.GITHUB_APP_ID
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY

  if (!appId || !privateKey) return null

  try {
    const auth = createAppAuth({ appId, privateKey })
    const installationAuth = await auth({ type: 'installation', installationId })
    return installationAuth.token
  } catch {
    return null
  }
}
