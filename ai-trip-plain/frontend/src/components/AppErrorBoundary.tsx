import React from 'react'
import ErrorState from './ErrorState'

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
}

export default class AppErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    // Log detailed errors internally only
    // eslint-disable-next-line no-console
    console.error('Render error caught by boundary', error)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorState message="Something went wrong. Please try again." />
    }

    return this.props.children
  }
}

