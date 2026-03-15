'use client'

import { Component, ReactNode } from 'react'

interface Props  { children: ReactNode }
interface State  { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center px-6"
              style={{ backgroundColor: '#E8FDF7' }}>
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                 style={{ backgroundColor: '#0A2E2A' }}>
              <span className="font-black text-lg" style={{ color: '#0AF3CD' }}>MQ</span>
            </div>
            <h1 className="text-lg font-bold mb-2" style={{ color: '#0A2E2A' }}>
              Something went wrong
            </h1>
            <p className="text-sm mb-6" style={{ color: '#05A88E' }}>
              We hit an unexpected error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl text-sm font-bold"
              style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
            >
              Refresh page
            </button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
