/**
 * useReveal — adds/removes the `.is-visible` class on elements that have
 * `.reveal` using IntersectionObserver. Stagger via `--i` CSS custom property.
 *
 * Under prefers-reduced-motion: immediately marks all observed elements as visible
 * with no transition delay (the CSS reduces/removes transitions for them already).
 *
 * Pass a `ref` to the container you want observed, or leave empty to observe
 * the entire document (useful at route level).
 *
 * T09 stub — signatures match final Wave 2 implementation.
 */
import { useEffect, RefObject } from 'react'

export function useReveal(containerRef?: RefObject<Element | null>) {
	useEffect(() => {
		const root = containerRef?.current ?? document
		const elements = Array.from(root.querySelectorAll<HTMLElement>('.reveal'))

		if (!elements.length) return

		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

		if (prefersReduced) {
			elements.forEach((el) => el.classList.add('is-visible'))
			return
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible')
						observer.unobserve(entry.target)
					}
				})
			},
			{ threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
		)

		elements.forEach((el) => observer.observe(el))

		return () => observer.disconnect()
	}, [containerRef])
}
