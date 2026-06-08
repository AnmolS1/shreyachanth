/**
 * HeroStaticFallback — renders the brand hero image in place of the three.js canvas.
 * Used when:
 *   1. prefers-reduced-motion is set (no WebGL at all)
 *   2. ErrorBoundary catches a WebGL failure
 *   3. <Suspense> is still resolving
 *
 * aria-hidden="true" + role="presentation" so it stays decorative, consistent
 * with the Canvas it replaces.
 */
export default function HeroStaticFallback() {
  return (
    <div
      className="hero-canvas-fallback"
      aria-hidden="true"
      role="presentation"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: 'var(--ink)',
      }}
    >
      <picture>
        <source srcSet="/images/hero-fallback.webp" type="image/webp" />
        <img
          src="/images/hero-fallback.jpg"
          alt=""
          decoding="async"
          loading="eager"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: 0.6,
          }}
        />
      </picture>
      {/* Subtle ink vignette to match the prototype's dark feel */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, var(--ink) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
