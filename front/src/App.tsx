import { Component } from 'react'
import type { ReactNode } from 'react'
import { Home, LabViewer, NotFound, ServerError, Station } from '@/components/pages'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

// Catches unexpected render errors anywhere below it and shows ServerError instead of
// a blank crashed page. Must be a class component: React only supports error
// boundaries via getDerivedStateFromError/componentDidCatch, hooks cannot do this.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <ServerError />
    }

    return this.props.children
  }
}

// No routing library: only 3 states to distinguish (home, /station, everything else),
// decided by reading window.location.pathname directly, per CLAUDE.md's "no
// URL-based locale routing" precedent and the Simplicity principle.
function CurrentView() {
  const path = window.location.pathname

  if (path === '/station') return <Station />
  if (path === '/lab') return <LabViewer />
  if (path === '/') return <Home />
  return <NotFound />
}

function App() {
  return (
    <ErrorBoundary>
      <CurrentView />
    </ErrorBoundary>
  )
}

export default App
