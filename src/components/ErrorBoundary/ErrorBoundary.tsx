import { Component, type ReactNode } from "react"

class ErrorBoundary extends Component<{ children: ReactNode }, { error: unknown }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = {
      error: null
    }
  }

  static getDerivedStateFromError(error: unknown) {
    return { error }
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error(error, info)
  }

  render() {
    if (this.state.error) {
      return 'error!'
    }

    return this.props.children
  }
}

export {ErrorBoundary}
