import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
	children: ReactNode
	fallback: ReactNode
}

interface State {
	hasError: boolean
}

/**
 * Class-based error boundary — function components can't catch render errors.
 * Wrap each route tree and the three.js canvas separately.
 *
 * Usage:
 *   <ErrorBoundary fallback={<HeroStaticFallback />}>
 *     <Suspense fallback={null}><HeroField /></Suspense>
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false }

	static getDerivedStateFromError(): State {
		return { hasError: true }
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		// Log to Sentry in production (initialized in main.tsx if enabled)
		console.error('[ErrorBoundary]', error, info.componentStack)
	}

	render() {
		if (this.state.hasError) return this.props.fallback
		return this.props.children
	}
}
