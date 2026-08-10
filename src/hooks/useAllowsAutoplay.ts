/**
 * useAllowsAutoplay — should we autoplay a muted looping preview right now?
 *
 * Returns false when ANY of these hold:
 *  - prefers-reduced-data: reduce     — explicit "don't spend my bandwidth"
 *  - navigator.connection.saveData    — OS/browser data-saver toggle
 *  - navigator.connection.effectiveType is 'slow-2g' or '2g'
 *
 * Deliberately NOT gated on prefers-reduced-motion. Autoplay is the only
 * playback path in the ≤760px carousel, so gating it there would leave that
 * section as 15 frozen posters while desktop hover-play (which has never
 * consulted the preference) kept working — the same feature behaving differently
 * per breakpoint. Reduced-motion instead governs the slide-change animation,
 * handled in VideoBento's step(). Revisit only alongside the hover path, so the
 * two stay consistent.
 *
 * Callers fall back to the static poster frame, which is local and already
 * loaded. Only the visible carousel slide ever asks, so at most one preview is
 * in flight at a time.
 *
 * NB: NetworkInformation is not in TypeScript's DOM lib — the `connection`
 * property is declared in src/vite-env.d.ts.
 */
import { useEffect, useState } from 'react'

/**
 * Deliberately excludes '3g'. effectiveType is derived from measured RTT and
 * downlink, and its '3g' band (~700kbps–2Mbps) covers plenty of connections that
 * stream a ≤8s 640px preview fine — headless Chromium reports '3g' on a wired
 * link, which is how conservative the estimate can be. Blocking it would
 * suppress autoplay for a large slice of ordinary mobile users. Widen to
 * ['slow-2g', '2g', '3g'] if previews turn out to feel heavy in the field.
 */
const SLOW_TYPES = ['slow-2g', '2g']

function evaluate(): boolean {
	if (typeof window === 'undefined') return false

	// prefers-reduced-data has limited support; an unsupported query never
	// matches, so this is a no-op rather than a false negative.
	const reducedData = window.matchMedia?.('(prefers-reduced-data: reduce)').matches
	if (reducedData) return false

	const conn = navigator.connection
	if (conn) {
		if (conn.saveData) return false
		if (conn.effectiveType && SLOW_TYPES.includes(conn.effectiveType)) return false
	}

	return true
}

export function useAllowsAutoplay(): boolean {
	const [allowed, setAllowed] = useState(evaluate)

	useEffect(() => {
		const resync = () => setAllowed(evaluate())
		resync()

		const queries = [window.matchMedia?.('(prefers-reduced-data: reduce)')].filter(
			Boolean
		) as MediaQueryList[]

		queries.forEach((q) => q.addEventListener('change', resync))

		// effectiveType/saveData can change mid-session (wifi -> cellular)
		const conn = navigator.connection
		conn?.addEventListener?.('change', resync)

		return () => {
			queries.forEach((q) => q.removeEventListener('change', resync))
			conn?.removeEventListener?.('change', resync)
		}
	}, [])

	return allowed
}
