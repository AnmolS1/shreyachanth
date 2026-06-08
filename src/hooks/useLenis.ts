/**
 * useLenis — initialise Lenis smooth scroll, driven via gsap.ticker as the
 * single rAF source (prevents double-rAF jank once ScrollTrigger is wired).
 *
 * Returns the Lenis instance (or null under prefers-reduced-motion).
 * Cleanup happens automatically on unmount.
 *
 * T09 stub — full implementation in Wave 2 / T09 subagent.
 */
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Respect prefers-reduced-motion: never initialise Lenis, let native scroll handle it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    })
    lenisRef.current = lenis

    // Drive Lenis via gsap.ticker (single rAF source, required for ScrollTrigger sync in T10)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000))
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return lenisRef
}
