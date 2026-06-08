/**
 * Hero — section 01 of Home route.
 *
 * Wraps HeroField in ErrorBoundary + Suspense; falls back to HeroStaticFallback
 * on WebGL failure or under prefers-reduced-motion.
 *
 * The HeroField canvas is absolutely positioned behind the hero text layer.
 * T07 stub — particle field logic lives in src/three/HeroField.tsx.
 */
import { forwardRef, lazy, Suspense } from 'react'
import ErrorBoundary from './ErrorBoundary'
import HeroStaticFallback from './HeroStaticFallback'
import { about } from '../content/about'
import { useCountUp } from '../hooks/useCountUp'

const HeroField = lazy(() => import('../three/HeroField'))

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ── Stat count-up display ─────────────────────────────────────────────────────
function StatItem({
  label,
  value,
  unit = '',
}: {
  label: string
  value: number
  unit?: string
}) {
  const { displayValue } = useCountUp({ target: value })
  const finalStr = `${value}${unit}`
  return (
    <div className="stat">
      {/* aria-label on outer span = final value for screen readers */}
      <span className="num" aria-label={finalStr}>
        {/* aria-hidden on inner = visual count-up animation */}
        <span aria-hidden="true">
          {displayValue}
          {unit}
        </span>
      </span>
      <span className="lbl">{label}</span>
    </div>
  )
}

const Hero = forwardRef<HTMLElement>(function Hero(_, ref) {
  return (
    <section ref={ref} className="hero" aria-labelledby="hero-heading">
      {/* ── Canvas layer ─────────────────────────────────────────────────── */}
      <div className="hero-canvas" aria-hidden="true">
        {prefersReduced ? (
          <HeroStaticFallback />
        ) : (
          <ErrorBoundary fallback={<HeroStaticFallback />}>
            <Suspense fallback={<HeroStaticFallback />}>
              <HeroField />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>

      {/* ── Hero text layer ──────────────────────────────────────────────── */}
      <div className="hero-inner container">
        <div className="hero-content">
          <div className="eyebrow mono mono--sm">
            <span className="dot" />
            {about.eyebrow}
          </div>

          <h1 id="hero-heading" data-view-heading tabIndex={-1}>
            {about.heroLine1}
            <br />
            <em
              style={{
                fontStyle: 'normal',
                color: 'var(--gold)',
                WebkitTextFillColor: 'transparent',
                background: 'var(--gold-sheen)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
              }}
            >
              {about.heroLine2}
            </em>
          </h1>

          <p className="sub">{about.heroSub}</p>

          <div className="hero-cta">
            <a href="/work" className="btn btn--gold">
              {about.heroCta1} <span className="arr">→</span>
            </a>
            <a href="/contact" className="btn btn--ghost">
              {about.heroCta2}
            </a>
          </div>

          {/* ── Stats row ─────────────────────────────────────────────── */}
          <div className="stats" role="list">
            {about.stats.map((s) => (
              <div key={s.label} role="listitem">
                <StatItem
                  label={s.label}
                  value={s.value}
                  unit={s.unit ?? ''}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ────────────────────────────────────────────── */}
      <div className="hero-scroll" aria-hidden="true">
        <span className="mono mono--sm">Scroll</span>
        <span className="line" />
      </div>
    </section>
  )
})

export default Hero
