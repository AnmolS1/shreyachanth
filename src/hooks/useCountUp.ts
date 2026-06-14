/**
 * useCountUp — increments from 0 to `target` using easeOutExpo over `duration` ms.
 * Returns `{ displayValue, isComplete }`.
 *
 * Announces only the FINAL value to screen readers via the aria-label pattern
 * (caller renders `<span aria-label={final+unit}><span aria-hidden>{displayValue}</span></span>`).
 *
 * Under prefers-reduced-motion: sets final value immediately on mount, no animation.
 *
 * T09 stub — full easing implementation in Wave 2 / T09 subagent.
 */
import { useState, useEffect, useRef } from 'react'

interface UseCountUpOptions {
	target: number
	duration?: number
	startOnMount?: boolean
}

export function useCountUp({
	target,
	duration = 1800,
	startOnMount = true,
}: UseCountUpOptions) {
	const prefersReduced =
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches

	const [displayValue, setDisplayValue] = useState(prefersReduced ? target : 0)
	const [isComplete, setIsComplete] = useState(prefersReduced)
	const frameRef = useRef<number | null>(null)
	const startTimeRef = useRef<number | null>(null)

	useEffect(() => {
		if (!startOnMount || prefersReduced) return

		const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

		const animate = (timestamp: number) => {
			if (!startTimeRef.current) startTimeRef.current = timestamp
			const elapsed = timestamp - startTimeRef.current
			const progress = Math.min(elapsed / duration, 1)
			const eased = easeOutExpo(progress)
			setDisplayValue(Math.round(eased * target))

			if (progress < 1) {
				frameRef.current = requestAnimationFrame(animate)
			} else {
				setDisplayValue(target)
				setIsComplete(true)
			}
		}

		frameRef.current = requestAnimationFrame(animate)

		return () => {
			if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
		}
	}, [target, duration, startOnMount, prefersReduced])

	return { displayValue, isComplete }
}
