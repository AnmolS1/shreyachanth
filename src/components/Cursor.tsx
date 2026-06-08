/**
 * Custom gold cursor — ring + dot that follow the pointer.
 *
 * CSS lives in globals.css (.cursor-ring / .cursor-dot, lines 282-324).
 *   .cursor-layer   — the popover wrapper that hoists the cursor into the
 *                     browser top layer so it paints above native <dialog>
 *                     modals (showModal() promotes them to the top layer too).
 *
 * JS:
 *   - Adds `has-custom-cursor` to <html> on first mouse move (which removes the
 *     native cursor and shows the ring/dot).
 *   - Toggles `.is-active` over interactive targets (a, button, [data-cursor]).
 *   - Uses Popover API (popover="manual") to keep cursor in the top layer.
 *     When a <dialog open> is detected via MutationObserver, the layer is
 *     re-promoted (hidePopover + showPopover) so it stacks above the new dialog.
 *   - Feature-detected: if Popover API is absent, skips the showPopover call
 *     and falls back to z-index:9999 (same as before).
 *
 * Disabled entirely on:
 * - touch devices  (pointer: coarse)
 * - prefers-reduced-motion: reduce
 */
import { useEffect, useRef } from 'react'

const isDisabled =
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches)

const supportsPopover =
  typeof window !== 'undefined' &&
  typeof (HTMLElement.prototype as unknown as { showPopover?: () => void }).showPopover === 'function'

export default function Cursor() {
  // On touch or reduced-motion, render nothing and never touch the html class
  if (isDisabled) return null
  return <CursorInner />
}

function CursorInner() {
  const layerRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    const ring = ringRef.current
    const dot = dotRef.current
    if (!layer || !ring || !dot) return

    // ── Promote cursor into the top layer ─────────────────────────────────────
    // The Popover API top layer is shared with <dialog> (showModal). Elements
    // promoted later in a single animation frame stack above earlier ones.
    // We call showPopover once on mount, then re-call it whenever a new modal
    // dialog appears (MutationObserver), so the cursor is always topmost.
    const showLayer = () => {
      if (!supportsPopover) return
      try {
        if ((layer as unknown as { popover: string }).popover !== undefined) {
          const l = layer as unknown as { showPopover: () => void; hidePopover: () => void }
          // Hide first (no-op if already hidden) to allow re-show
          try { l.hidePopover() } catch { /* not shown yet, fine */ }
          l.showPopover()
        }
      } catch {
        // Popover unavailable in this env — falls back to z-index stacking
      }
    }

    showLayer()

    // Re-promote whenever a modal <dialog> is added/opened
    let dialogOpen = !!document.querySelector('dialog[open]')
    const mo = new MutationObserver(() => {
      const nowOpen = !!document.querySelector('dialog[open]')
      if (nowOpen && !dialogOpen) {
        // A modal just opened — move cursor above it
        showLayer()
      }
      dialogOpen = nowOpen
    })
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['open'],
    })

    // ── Pointer tracking ──────────────────────────────────────────────────────
    let rafId = 0
    // Start off-screen so they don't flash at (0,0) before first move
    let mx = -300
    let my = -300
    let rx = -300
    let ry = -300
    let active = false

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY

      // Reveal on first pointer move
      const html = document.documentElement
      if (!html.classList.contains('has-custom-cursor')) {
        html.classList.add('has-custom-cursor')
      }
    }

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null
      const isInteractive = !!target?.closest('a, button, [data-cursor]')
      if (isInteractive !== active) {
        ring.classList.toggle('is-active', isInteractive)
        dot.classList.toggle('is-active', isInteractive)
        active = isInteractive
      }
    }

    // Smooth-lerp the ring; dot follows instantly (matches prototype feel)
    const loop = () => {
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      ring.style.left = `${rx}px`
      ring.style.top = `${ry}px`
      dot.style.left = `${mx}px`
      dot.style.top = `${my}px`
      rafId = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver, { passive: true })
    rafId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(rafId)
      mo.disconnect()
      document.documentElement.classList.remove('has-custom-cursor')
      // Close the popover layer on unmount
      try {
        const l = layer as unknown as { hidePopover: () => void }
        l.hidePopover()
      } catch { /* already hidden or not supported */ }
    }
  }, [])

  return (
    // popover="manual" — browser renders this element in the top layer (above
    // all z-index stacking, including modal dialogs). pointer-events:none keeps
    // it from intercepting clicks. CSS in globals.css .cursor-layer.
    <div
      ref={layerRef}
      // @ts-expect-error — popover is a valid HTML attribute but TypeScript's
      // bundled lib.dom.d.ts may not yet include it in all versions
      popover="manual"
      className="cursor-layer"
      aria-hidden="true"
    >
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </div>
  )
}
