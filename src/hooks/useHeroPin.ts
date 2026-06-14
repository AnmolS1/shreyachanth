/**
 * useHeroPin — wires GSAP ScrollTrigger to the hero section for a pinned,
 * scrubbed entrance moment.
 *
 * Single rAF contract: useLenis drives Lenis via gsap.ticker. This hook only
 * adds lenis.on('scroll', ScrollTrigger.update) so ScrollTrigger receives
 * smooth-scroll positions. It does NOT start any new RAF loop.
 *
 * Under prefers-reduced-motion this hook is a no-op.
 *
 * T10 implementation.
 */
import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export function useHeroPin(
	heroRef: RefObject<HTMLElement | null>,
	lenisRef: RefObject<Lenis | null>,
) {
	useEffect(() => {
		// Respect prefers-reduced-motion: skip all GSAP/ScrollTrigger work entirely
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

		const heroEl = heroRef.current
		if (!heroEl) return

		// Bind Lenis → ScrollTrigger so smooth-scroll positions feed the trigger.
		// Guard: lenisRef.current is null under reduced-motion (handled above) or
		// before Lenis finishes initialising.
		const lenis = lenisRef.current
		const scrollHandler = () => ScrollTrigger.update()
		if (lenis) {
			lenis.on('scroll', scrollHandler)
		}

		// Targets inside the hero section
		const heading = heroEl.querySelector<HTMLElement>('h1')
		const sub = heroEl.querySelector<HTMLElement>('p.sub')
		const stats = heroEl.querySelector<HTMLElement>('.stats')

		// Create a shared timeline scrubbed by the ScrollTrigger
		const tl = gsap.timeline({ paused: true })

		if (heading) {
			tl.fromTo(
				heading,
				{ opacity: 1, y: 0 },
				{ opacity: 0, y: -40, ease: 'none' },
				0,
			)
		}
		if (sub) {
			tl.fromTo(
				sub,
				{ opacity: 1, y: 0 },
				{ opacity: 0, y: -24, ease: 'none' },
				0.15, // starts slightly later than heading
			)
		}
		if (stats) {
			tl.fromTo(
				stats,
				{ opacity: 1, y: 0 },
				{ opacity: 0, y: -16, ease: 'none' },
				0.3, // fades last
			)
		}

		// Pin the hero section and scrub the timeline as the user scrolls
		const st = ScrollTrigger.create({
			trigger: heroEl,
			pin: true,
			start: 'top top',
			end: '+=60%',
			scrub: 1,
			animation: tl,
		})

		return () => {
			// Remove Lenis scroll binding
			if (lenis) {
				lenis.off('scroll', scrollHandler)
			}
			// Kill only the ScrollTrigger created by this hook
			st.kill()
			// Reset any inline styles GSAP may have left on the animated elements
			if (heading) gsap.set(heading, { clearProps: 'opacity,y' })
			if (sub) gsap.set(sub, { clearProps: 'opacity,y' })
			if (stats) gsap.set(stats, { clearProps: 'opacity,y' })
		}
	}, [heroRef, lenisRef])
}
