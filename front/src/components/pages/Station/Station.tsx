import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BackIcon, BrandTitle, Button, GitHubIcon, GridBackground, WarningIcon } from '@/components/atoms'
import { apiUrl } from '@/lib/apiUrl'
import { storeActiveProject } from '@/lib/activeProject'
import { clearGitHubTokens, storeGitHubTokens } from '@/lib/githubAuth'
import type { GitHubOAuthTokens } from '@/lib/githubAuth'
import { createBareRepo, listRepos, scaffoldRepo, type Repo } from '@/lib/githubRepos'
import { GITHUB_INSTALL_URL, githubSignInUrl } from '@/lib/githubSignInUrl'
import { resolveSession, resolveSessionFromToken } from '@/lib/sessionResolution'
import type { SessionResolution } from '@/lib/sessionResolution'
import { LaunchLoader, StatusScreen, StatusScreenAction } from '@/components/molecules'
import type { CreateRepoFormValues } from '@/components/molecules'
import { RepoSelector } from '@/components/organisms'
import styles from './Station.module.css'

type StationStatus =
  | 'exchanging'
  | 'success'
  | 'error'
  | 'unauthenticated'
  | 'needsInstall'
  | 'createRepoError'
  | 'scaffoldError'

// Matches LaunchLoader.module.css's exit animation duration: the rocket flying up out
// of frame and the whole box fading out. Station keeps rendering LaunchLoader in its
// "exiting" visual state for this long before actually switching away from it, so the
// transition plays instead of the loader just vanishing.
const EXIT_ANIMATION_MS = 700

// Renders at /station: this is MuunCode's IDE entry point, not a throwaway auth
// callback screen (it used to be named AuthCallback for that reason, renamed once its
// real identity became clear). It is both the GitHub App's OAuth redirect target (see
// CLAUDE.md -> Authentication and Account Creation) and where an already-signed-in
// user lands when entering MuunCode from the home screen. The actual IDE UI does not
// exist yet, so this stays a status message for now; once it does, its organisms and
// molecules render inside this same template, in the 'success' branch below.
// App.tsx picks this template by reading window.location.pathname directly: no
// routing library for this one route.
export function Station() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<StationStatus>('exchanging')
  const [isLoaderExiting, setIsLoaderExiting] = useState(false)
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [repos, setRepos] = useState<Repo[]>([])
  const [hasMoreRepos, setHasMoreRepos] = useState(false)
  const [isLoadingMoreRepos, setIsLoadingMoreRepos] = useState(false)
  const nextRepoPageRef = useRef(1)
  const [loadingMessageKey, setLoadingMessageKey] = useState('stationSigningIn')
  const [createRepoErrorReason, setCreateRepoErrorReason] = useState('')
  const [scaffoldErrorReason, setScaffoldErrorReason] = useState('')
  const [scaffoldRepoDeleted, setScaffoldRepoDeleted] = useState(false)
  const hasExchangedRef = useRef(false)

  // Every real transition away from 'exchanging' goes through here instead of a direct
  // setStatus, so LaunchLoader gets to play its exit animation (rocket flies up out of
  // frame, box fades out) before the next screen actually replaces it. Hoisted out of
  // the mount-effect below (which still drives the sign-in/install-check chain with it)
  // so handleConfirmCreate can reuse it too, once a repo creation attempt fails.
  const transitionTo = useCallback((nextStatus: StationStatus) => {
    setIsLoaderExiting(true)
    window.setTimeout(() => {
      setIsLoaderExiting(false)
      setStatus(nextStatus)
    }, EXIT_ANIMATION_MS)
  }, [])

  // Same idea as transitionTo, but for a real page navigation (leaving Station/the SPA
  // entirely) rather than an internal status change, so /lab's own LaunchLoader always
  // gets to play its below-frame entrance right after this one finishes its exit,
  // instead of the browser cutting away mid-animation or mid-RepoSelector. Also covers
  // the case where the loader is not showing yet (status !== 'exchanging', e.g.
  // RepoSelector still visible when an existing repo is confirmed): mounts it first and
  // waits a frame so it actually renders its normal entering/idle state at least once
  // before flying away, rather than mounting already mid-exit with nothing to visually
  // transition from.
  const navigateToLab = useCallback(() => {
    setStatus('exchanging')
    requestAnimationFrame(() => {
      setIsLoaderExiting(true)
      window.setTimeout(() => {
        window.location.href = '/lab'
      }, EXIT_ANIMATION_MS)
    })
  }, [])

  useEffect(() => {
    // GitHub's OAuth `code` is single-use: guard against StrictMode's dev-only
    // double effect invocation, which would otherwise send it twice.
    if (hasExchangedRef.current) return
    hasExchangedRef.current = true

    const code = new URLSearchParams(window.location.search).get('code')

    if (!code) {
      // No `code` means this wasn't reached via GitHub's redirect: either an
      // already-signed-in user came straight here from the home screen, or someone
      // typed /station directly with no session at all. resolveSession() runs the
      // exact same session/token/installation/project check every other entry point
      // (Home, LabViewer) uses, so this branch stays in sync with them by
      // construction instead of keeping its own parallel copy.
      void resolveSession().then(handleResolution)
      return
    }

    void exchangeCode(code)

    async function exchangeCode(codeToExchange: string) {
      const response = await fetch(apiUrl('/api/auth-exchange'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToExchange }),
      }).catch(() => null)

      if (!response || !response.ok) {
        transitionTo('error')
        return
      }

      const tokens = (await response.json().catch(() => null)) as GitHubOAuthTokens | null
      if (!tokens) {
        transitionTo('error')
        return
      }

      storeGitHubTokens(tokens)
      // Already holds a just-minted token: resolveSessionFromToken skips
      // resolveSession()'s own isSignedIn/getAccessToken steps, which would otherwise
      // redundantly re-derive what this call already has.
      const resolution = await resolveSessionFromToken(tokens.accessToken)
      await handleResolution(resolution)
    }

    // The one place that decides what Station itself does with any resolveSession()
    // (or resolveSessionFromToken()) outcome: everything short of 'noProject' maps
    // directly onto an existing Station status or a navigation; 'noProject' is the
    // only case Station itself still needs to do real extra work for (loading the
    // repo list to show RepoSelector), which is exactly why the shared state machine
    // does not try to own that step itself.
    async function handleResolution(resolution: SessionResolution) {
      if (resolution.status === 'unauthenticated') {
        clearGitHubTokens()
        transitionTo('unauthenticated')
        return
      }

      if (resolution.status === 'error') {
        transitionTo('error')
        return
      }

      if (resolution.status === 'needsInstall') {
        transitionTo('needsInstall')
        return
      }

      if (resolution.status === 'ready') {
        setLoadingMessageKey('requestingRepoDataLoading')
        navigateToLab()
        return
      }

      // 'noProject': the repo list load also happens under the same full-screen
      // LaunchLoader (still status === 'exchanging'), only switching to 'success'
      // once real data is ready, so RepoSelector never mounts without something to
      // show.
      setLoadingMessageKey('repoListLoading')
      const result = await listRepos(resolution.accessToken)
      if (result === null) {
        transitionTo('error')
        return
      }

      setAccessToken(resolution.accessToken)
      setRepos(result.repos)
      setHasMoreRepos(result.hasMore)
      nextRepoPageRef.current = 2
      transitionTo('success')
    }
  }, [transitionTo, navigateToLab])

  // Infinite scroll: RepoSelector calls this once the existing-repo list is scrolled
  // near its bottom and hasMoreRepos is still true. Best-effort: a failed "load more"
  // just stops further loading (hasMoreRepos -> false) rather than erroring the whole
  // already-successfully-loaded screen over a pagination follow-up request.
  const handleLoadMoreRepos = async () => {
    if (!accessToken || isLoadingMoreRepos || !hasMoreRepos) return

    setIsLoadingMoreRepos(true)
    const result = await listRepos(accessToken, nextRepoPageRef.current)
    setIsLoadingMoreRepos(false)

    if (result === null) {
      setHasMoreRepos(false)
      return
    }

    setRepos((current) => [...current, ...result.repos])
    setHasMoreRepos(result.hasMore)
    nextRepoPageRef.current += 1
  }

  const handleSignIn = () => {
    window.location.href = githubSignInUrl()
  }

  const handleInstall = () => {
    window.location.href = GITHUB_INSTALL_URL
  }

  // Just a local UI toggle (which repo is highlighted before confirming): the real
  // persist-and-navigate step only happens once "Siguiente" is actually clicked, see
  // handleConfirmExisting below.
  const handleSelectRepo = (repoId: string) => {
    setSelectedRepoId((current) => (current === repoId ? null : repoId))
  }

  const handleBack = () => {
    window.location.href = '/'
  }

  // Repo creation failures happen while already signed in with a valid session and a
  // loaded repo list: unlike handleBack (full navigation home), this just returns to
  // the already-mounted RepoSelector so the user can retry without losing that state.
  const handleBackToSelector = () => {
    setStatus('success')
  }

  // Both the select-existing and create-new paths end at the same real destination
  // once confirmed (see f05's LabViewer): the active project is persisted locally
  // first (lib/activeProject.ts), since /lab now reads it from there instead of a
  // query string, then a full-page navigation since there is no client-side router.
  const handleConfirmExisting = (repo: Repo) => {
    storeActiveProject({ owner: repo.owner, name: repo.name })
    setLoadingMessageKey('requestingRepoDataLoading')
    navigateToLab()
  }

  // Two real network boundaries, two distinct loader messages: setStatus goes straight
  // to 'exchanging' here (no exit animation needed going into the loader, only
  // transitionTo when leaving it, see repo-creation-confirmation-flow.md).
  const handleConfirmCreate = async (values: CreateRepoFormValues) => {
    setLoadingMessageKey('creatingRepoLoading')
    setStatus('exchanging')

    const created = await createBareRepo(accessToken ?? '', values)
    if (!created.ok) {
      setCreateRepoErrorReason(created.error)
      transitionTo('createRepoError')
      return
    }

    setLoadingMessageKey('scaffoldingRepoLoading')
    const scaffolded = await scaffoldRepo(accessToken ?? '', {
      owner: created.repo.owner,
      name: created.repo.name,
      description: values.description,
      defaultBranch: created.repo.defaultBranch,
    })

    if (!scaffolded.ok) {
      setScaffoldErrorReason(scaffolded.error)
      setScaffoldRepoDeleted(scaffolded.repoDeleted)
      transitionTo('scaffoldError')
      return
    }

    storeActiveProject({ owner: created.repo.owner, name: created.repo.name })
    navigateToLab()
  }

  if (status === 'unauthenticated') {
    return (
      <StatusScreen tagline={t('stationUnauthenticatedTagline')} message={t('stationUnauthenticatedMessage')}>
        <StatusScreenAction>
          <Button onClick={handleSignIn}>
            <GitHubIcon size={20} />
            {t('signInButton')}
          </Button>
        </StatusScreenAction>
        <StatusScreenAction>
          <Button onClick={handleBack}>
            <BackIcon size={20} />
            {t('backButton')}
          </Button>
        </StatusScreenAction>
      </StatusScreen>
    )
  }

  if (status === 'error') {
    return (
      <StatusScreen
        tagline={t('stationErrorTagline')}
        message={t('stationError')}
        variant="red"
        icon={<WarningIcon size={20} />}
      >
        <StatusScreenAction>
          <Button onClick={handleSignIn}>
            <GitHubIcon size={20} />
            {t('signInButton')}
          </Button>
        </StatusScreenAction>
        <StatusScreenAction>
          <Button onClick={handleBack}>
            <BackIcon size={20} />
            {t('backButton')}
          </Button>
        </StatusScreenAction>
      </StatusScreen>
    )
  }

  if (status === 'createRepoError' || status === 'scaffoldError') {
    const isScaffoldError = status === 'scaffoldError'
    return (
      <StatusScreen
        tagline={t('stationErrorTagline')}
        message={
          isScaffoldError
            ? t(scaffoldRepoDeleted ? 'scaffoldErrorMessageDeleted' : 'scaffoldErrorMessage')
            : t('createRepoErrorMessage')
        }
        detail={isScaffoldError ? scaffoldErrorReason : createRepoErrorReason}
        variant="red"
        icon={<WarningIcon size={20} />}
      >
        <StatusScreenAction>
          <Button onClick={handleBackToSelector}>
            <BackIcon size={20} />
            {t('backButton')}
          </Button>
        </StatusScreenAction>
      </StatusScreen>
    )
  }

  if (status === 'needsInstall') {
    return (
      <StatusScreen tagline={t('stationNeedsInstallTagline')} message={t('stationNeedsInstallMessage')}>
        <StatusScreenAction>
          <Button onClick={handleInstall}>
            <GitHubIcon size={20} />
            {t('installButton')}
          </Button>
        </StatusScreenAction>
        <StatusScreenAction>
          <Button onClick={handleBack}>
            <BackIcon size={20} />
            {t('backButton')}
          </Button>
        </StatusScreenAction>
      </StatusScreen>
    )
  }

  if (status === 'exchanging') {
    return (
      <GridBackground>
        <main className={styles.content}>
          <LaunchLoader exiting={isLoaderExiting} />
          <p className={styles.message}>{t(loadingMessageKey)}</p>
        </main>
      </GridBackground>
    )
  }

  // Only 'success' can reach here: every other status returns above. This branch
  // fills exactly one viewport height (successContent) so the page itself never
  // scrolls; RepoSelector's own internal list is the only thing that scrolls. The
  // former tagline Badge and sign-out button that used to sit above/below RepoSelector
  // here moved to f05's LabViewer stub instead, the real destination both confirm paths
  // now navigate to (see repo-creation-confirmation-flow.md).
  return (
    <GridBackground>
      <main className={styles.successContent}>
        <BrandTitle />
        <RepoSelector
          repos={repos}
          selectedRepoId={selectedRepoId}
          onSelectRepo={handleSelectRepo}
          onConfirmExisting={handleConfirmExisting}
          onConfirmCreate={handleConfirmCreate}
          hasMoreRepos={hasMoreRepos}
          isLoadingMoreRepos={isLoadingMoreRepos}
          onLoadMoreRepos={handleLoadMoreRepos}
        />
      </main>
    </GridBackground>
  )
}
