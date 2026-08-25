import { useLayoutEffect, useRef, useState, type UIEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, RocketIcon, WarningIcon } from '@/components/atoms'
import { AccordionPanel, CreateRepoForm, RepoListItem } from '@/components/molecules'
import type { CreateRepoFormHandle, CreateRepoFormValues } from '@/components/molecules'
import type { Repo } from '@/lib/githubRepos'
import styles from './RepoSelector.module.css'

interface RepoSelectorProps {
  repos: Repo[]
  selectedRepoId: string | null
  onSelectRepo: (repoId: string) => void
  onConfirmExisting: (repo: Repo) => void
  onConfirmCreate: (values: CreateRepoFormValues) => void
  hasMoreRepos: boolean
  isLoadingMoreRepos: boolean
  onLoadMoreRepos: () => void
}

// How close to the bottom of the list (in pixels) triggers loading the next page.
// Small enough that it only fires once the user has genuinely scrolled near the end,
// not on every scroll frame near the middle of a long list.
const LOAD_MORE_THRESHOLD_PX = 48

type ExpandedPanel = 'create' | 'existing' | null

// First organism in the project: composes the RepoListItem/AccordionPanel/
// CreateRepoForm molecules and Card/Button atoms into the repository picker rendered
// under Station's success message. Controlled component: selection state lives in
// Station.tsx (see Round 5), since the persistent "Siguiente" button below
// RepoSelector also needs to react to it. Repository data is real (see
// real-github-repo-data.md) and fully controlled too. Repo creation/scaffolding itself
// no longer happens inside this component (see repo-creation-confirmation-flow.md):
// confirming either path is handed up to Station.tsx via onConfirmExisting/
// onConfirmCreate, which drives the real full-screen loader and navigation.
export function RepoSelector({
  repos,
  selectedRepoId,
  onSelectRepo,
  onConfirmExisting,
  onConfirmCreate,
  hasMoreRepos,
  isLoadingMoreRepos,
  onLoadMoreRepos,
}: RepoSelectorProps) {
  const { t } = useTranslation()
  const [isScrolledFromTop, setIsScrolledFromTop] = useState(false)
  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>('existing')
  const [createFormIsValid, setCreateFormIsValid] = useState(false)
  const [contentHeight, setContentHeight] = useState(0)
  const [showCreateConfirmation, setShowCreateConfirmation] = useState(false)
  const [pendingCreateValues, setPendingCreateValues] = useState<CreateRepoFormValues | null>(null)
  const [isConfirmingExisting, setIsConfirmingExisting] = useState(false)

  const selectorRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const createHeaderRef = useRef<HTMLButtonElement>(null)
  const existingHeaderRef = useRef<HTMLButtonElement>(null)
  const nextActionRef = useRef<HTMLDivElement>(null)
  const createFormRef = useRef<CreateRepoFormHandle>(null)

  // Computes how much vertical space is genuinely available for whichever accordion
  // section is expanded, by subtracting every fixed-size sibling (the heading/hint
  // block, both panel headers, the Siguiente action, and the gaps .selector's own
  // flex column puts between them) from .selector's own real, definite height. This
  // replaces an earlier CSS-only approach (a grid-template-rows 0fr/1fr trick paired
  // with toggling flex:1/auto on the outer panel) that repeatedly proved unreliable:
  // a flex item with flex-basis:auto can still report its full, real content size to
  // an ancestor's own auto-height calculation even while "collapsed", which starves
  // a sibling relying on flex-grow for space, a genuine CSS Grid/Flexbox intrinsic-
  // sizing edge case rather than an animation-timing glitch. Measuring once per
  // toggle (via this effect, not per animation frame) and animating a plain
  // max-height between two explicit pixel values sidesteps that ambiguity entirely.
  // Also recomputes when showCreateConfirmation toggles: the accordion group (and its
  // fixed-size siblings this effect measures) is hidden while the confirmation summary
  // is shown, so returning from it needs a fresh measurement.
  useLayoutEffect(() => {
    const selectorEl = selectorRef.current
    if (!selectorEl) return

    function recomputeContentHeight() {
      const headingHintHeight = headerRef.current?.getBoundingClientRect().height ?? 0
      const createHeaderHeight = createHeaderRef.current?.getBoundingClientRect().height ?? 0
      const existingHeaderHeight = existingHeaderRef.current?.getBoundingClientRect().height ?? 0
      const nextActionHeight = nextActionRef.current?.getBoundingClientRect().height ?? 0
      const selectorStyle = getComputedStyle(selectorEl!)
      const gap = Number.parseFloat(selectorStyle.rowGap) || 0
      const paddingTop = Number.parseFloat(selectorStyle.paddingTop) || 0
      const paddingBottom = Number.parseFloat(selectorStyle.paddingBottom) || 0

      const fixedTotal = headingHintHeight + createHeaderHeight + existingHeaderHeight + nextActionHeight + gap * 3
      const available = selectorEl!.clientHeight - paddingTop - paddingBottom - fixedTotal
      setContentHeight(Math.max(0, available))
    }

    recomputeContentHeight()

    const resizeObserver = new ResizeObserver(recomputeContentHeight)
    resizeObserver.observe(selectorEl)
    return () => resizeObserver.disconnect()
  }, [showCreateConfirmation])

  // Reads scrollTop/scrollHeight/clientHeight off the event target (no separate
  // getBoundingClientRect call). setIsScrolledFromTop only fires when the boolean
  // actually flips, avoiding a re-render on every scroll frame; onLoadMoreRepos is
  // guarded by Station.tsx's own hasMoreRepos/isLoadingMoreRepos check too, so a
  // redundant call here while a page is already loading is harmless.
  const handleListScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget

    const scrolledFromTop = scrollTop > 0
    if (isScrolledFromTop !== scrolledFromTop) {
      setIsScrolledFromTop(scrolledFromTop)
    }

    if (hasMoreRepos && !isLoadingMoreRepos && scrollHeight - scrollTop - clientHeight < LOAD_MORE_THRESHOLD_PX) {
      onLoadMoreRepos()
    }
  }

  const handleNext = () => {
    if (expandedPanel === 'create') {
      const values = createFormRef.current?.getValues()
      if (!values) return

      setPendingCreateValues(values)
      setShowCreateConfirmation(true)
      return
    }

    const selectedRepo = repos.find((repo) => repo.id === selectedRepoId)
    if (!selectedRepo) return

    // Guards against a double click: onConfirmExisting leads straight to a real
    // page navigation (see Station.tsx), never reset back to false, this component
    // is about to be torn down anyway.
    setIsConfirmingExisting(true)
    onConfirmExisting(selectedRepo)
  }

  const handleConfirmCreate = () => {
    if (!pendingCreateValues) return
    onConfirmCreate(pendingCreateValues)
  }

  const handleCancelCreate = () => {
    setShowCreateConfirmation(false)
  }

  function computeIsNextDisabled() {
    if (expandedPanel === null) return true
    return expandedPanel === 'existing' ? !selectedRepoId : !createFormIsValid
  }

  const isNextDisabled = computeIsNextDisabled()

  return (
    <div className={styles.wrapper}>
      <Card variant="blue">
        <div className={styles.selector} ref={selectorRef}>
          {!showCreateConfirmation && (
            <div className={styles.header} ref={headerRef}>
              <h2 className={styles.heading}>{t('repoSelectorHeading')}</h2>
              <p className={styles.hint}>{t('repoSelectorHint')}</p>
            </div>
          )}
          {showCreateConfirmation && (
            <div className={styles.confirmation}>
              <div className={styles.confirmationHeading}>
                <span className={styles.confirmationIcon}>
                  <span className={styles.confirmationRocket}>
                    <RocketIcon size={48} />
                  </span>
                  <span className={styles.confirmationParticle} aria-hidden="true" />
                  <span className={styles.confirmationParticle} aria-hidden="true" />
                  <span className={styles.confirmationParticle} aria-hidden="true" />
                </span>
                <h2 className={styles.confirmationTagline}>{t('confirmCreateTagline')}</h2>
              </div>
              <div className={styles.confirmationMessageBox}>
                <p className={styles.confirmationMessage}>
                  {t('confirmCreateMessagePrefix')}
                  <span className={styles.confirmationHighlight}>{pendingCreateValues?.name ?? ''}</span>
                  {t('confirmCreateMessageMiddle')}
                  <span className={styles.confirmationHighlight}>MuunCode</span>
                  {t('confirmCreateMessageSuffix')}
                </p>
              </div>
              <div className={styles.confirmationWarning}>
                <span className={styles.confirmationWarningIcon}>
                  <WarningIcon />
                </span>
                <p className={styles.confirmationWarningText}>{t('confirmCreateWarning')}</p>
              </div>
              <div className={styles.confirmationActions}>
                <div className={styles.confirmationSecondaryAction}>
                  <Button onClick={handleCancelCreate}>{t('cancelButton')}</Button>
                </div>
                <div className={styles.confirmationPrimaryAction}>
                  <Button onClick={handleConfirmCreate}>{t('confirmCreateButton')}</Button>
                </div>
              </div>
            </div>
          )}
          {/* Kept mounted even while the confirmation summary above is shown (only
              visually hidden), so CreateRepoForm never unmounts and its already-typed
              values survive a Cancelar back to this view. */}
          <div className={showCreateConfirmation ? styles.hiddenAccordionGroup : styles.accordionGroup}>
            <AccordionPanel
              label={t('createRepoTabLabel')}
              isExpanded={expandedPanel === 'create'}
              onToggle={() => setExpandedPanel((current) => (current === 'create' ? null : 'create'))}
              headerRef={createHeaderRef}
              contentHeight={contentHeight}
            >
              <CreateRepoForm ref={createFormRef} onValidityChange={setCreateFormIsValid} />
            </AccordionPanel>
            <AccordionPanel
              label={
                <>
                  {t('existingRepoTabLabel')}{' '}
                  <span className={styles.brandQualifier}>{t('muunCodeQualifier')}</span>
                </>
              }
              isExpanded={expandedPanel === 'existing'}
              onToggle={() => setExpandedPanel((current) => (current === 'existing' ? null : 'existing'))}
              headerRef={existingHeaderRef}
              contentHeight={contentHeight}
            >
              <p className={styles.activityNotice}>{t('repoListActivityNotice')}</p>
              {repos.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyStateIcon}>
                    <WarningIcon />
                  </span>
                  <p className={styles.emptyStateTagline}>{t('repoListEmptyTagline')}</p>
                  <p className={styles.emptyStateMessage}>{t('repoListEmptyMessage')}</p>
                  <div className={styles.emptyStateAction}>
                    <Button onClick={() => setExpandedPanel('create')}>{t('startNewRepoButton')}</Button>
                  </div>
                </div>
              ) : (
                <div className={styles.listWrapper}>
                  <div
                    className={`${styles.scrollIndicatorTop} ${
                      isScrolledFromTop ? styles.scrollIndicatorTopVisible : ''
                    }`}
                  />
                  <div className={styles.list} onScroll={handleListScroll}>
                    {repos.map((repo) => (
                      <RepoListItem
                        key={repo.id}
                        name={repo.name}
                        isPrivate={repo.isPrivate}
                        isSelected={selectedRepoId === repo.id}
                        updatedAt={repo.updatedAt}
                        onSelect={() => onSelectRepo(repo.id)}
                      />
                    ))}
                    {isLoadingMoreRepos && <p className={styles.loadingMore}>{t('repoListLoadingMore')}</p>}
                  </div>
                  <div className={styles.scrollIndicatorBottom} />
                </div>
              )}
            </AccordionPanel>
            {/* Lives inside the same card as the two accordion sections, disabled state
                depends on whichever one is expanded: Station.tsx still owns
                selectedRepoId (see Round 5) and passes it down, but this button's click
                handling stays local, it does not depend on anything Station owns
                beyond that selection. */}
            <div className={styles.nextAction} ref={nextActionRef}>
              <Button onClick={handleNext} disabled={isNextDisabled || isConfirmingExisting}>
                {t('nextButton')}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
