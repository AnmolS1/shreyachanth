/**
 * useMediaQuery — subscribes to a media query and returns whether it matches.
 *
 * Used to gate BEHAVIOUR only, never layout. Layout switches belong in
 * globals.css so the browser handles them without a React render — see the
 * ≤760px `.bento` carousel rules. This hook exists for the things CSS cannot
 * express: which controls to mount, and whether a tile should autoplay.
 *
 * Initialises from matchMedia during the first render (not in an effect) so the
 * first paint is already correct and controls don't flash in and out.
 */
import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(() =>
		typeof window !== 'undefined' && typeof window.matchMedia === 'function'
			? window.matchMedia(query).matches
			: false
	)

	useEffect(() => {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

		const mql = window.matchMedia(query)
		// Re-sync in case the query changed between render and effect
		setMatches(mql.matches)

		const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
		mql.addEventListener('change', onChange)
		return () => mql.removeEventListener('change', onChange)
	}, [query])

	return matches
}
