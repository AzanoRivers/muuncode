// GitHub App Client ID: not secret, safe in the browser bundle (unlike the Client
// Secret, which only ever lives server-side in api/, see CLAUDE.md -> Authentication
// and Account Creation).
const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID ?? ''

// The plain OAuth authorize endpoint: always re-issues a fresh `code`, regardless of
// whether the App is already installed, and never shows GitHub's own
// installation-management page the way /apps/muuncode/installations/new does once an
// installation already exists. Whether the user still needs to install the App is
// checked separately and correctly, server-side, via api/check-installation.ts (see
// githubInstallation.ts), never guessed from anything stored in the browser.
export function githubSignInUrl(): string {
  const redirectUri = `${window.location.origin}/station`
  return `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}`
}

export const GITHUB_INSTALL_URL = 'https://github.com/apps/muuncode/installations/new'
