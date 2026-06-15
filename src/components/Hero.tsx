/**
 * Hero — section 01 of Home route.
 *
 * Wraps HeroField in ErrorBoundary + Suspense; falls back to HeroStaticFallback
 * on WebGL failure or under prefers-reduced-motion.
 *
 * HTML structure mirrors prototype/index.html lines 59–99 exactly:
 *   .hero
 *     .hero-canvas-wrap (absolutely filled background)
 *     .container
 *       .hero-eyebrow > span.tick + span.mono.mono--sm
 *       h1.hero-title > em (gilded gradient)
 *       p.hero-sub
 *       .hero-actions > btn--gold + btn--ghost
 *       .stat-line > .stat × 3
 *     .scroll-cue > span.bar + span.mono.mono--sm
 */
import { forwardRef, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
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
				{/* aria-hidden on inner = visual count-up animation only */}
				<span aria-hidden="true">
					{displayValue}
					{unit && <span className="suffix">{unit}</span>}
				</span>
			</span>
			<span className="lbl">{label}</span>
		</div>
	)
}

const Hero = forwardRef<HTMLElement>(function Hero(_, ref) {
	return (
		<section ref={ref} className="hero" aria-labelledby="hero-heading">
			{/* ── Canvas / particle field ──────────────────────────────────────── */}
			<div className="hero-canvas-wrap" aria-hidden="true">
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

			{/* ── Hero content ─────────────────────────────────────────────────── */}
			<div className="container">
				{/* Eyebrow: gold tick + mono label */}
				<div className="hero-eyebrow">
					<span className="tick" aria-hidden="true" />
					<span className="mono mono--sm">{about.eyebrow}</span>
				</div>

				{/* Display headline — second line gilded */}
				<h1 className="hero-title" id="hero-heading" data-view-heading tabIndex={-1}>
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

				{/* Subtitle */}
				<p className="hero-sub">{about.heroSub}</p>

				{/* CTA buttons */}
				<div className="hero-actions">
					<Link to="/work" className="btn btn--gold" data-cursor>
						{about.heroCta1} <span className="arr">→</span>
					</Link>
					<Link to="/contact" className="btn btn--ghost" data-cursor>
						{about.heroCta2}
					</Link>
				</div>

				{/* Mono stat line */}
				<div className="stat-line">
					{about.stats.map((s, i) => (
						<div
							key={s.label}
							className="reveal"
							style={{ '--i': i } as React.CSSProperties}
						>
							<StatItem label={s.label} value={s.value} unit={s.unit ?? ''} />
						</div>
					))}
				</div>
			</div>

			{/* ── Animated scroll cue (bottom-left) ───────────────────────────── */}
			<div className="scroll-cue" aria-hidden="true">
				<span className="bar" />
				<span className="mono mono--sm">Scroll</span>
			</div>
		</section>
	)
})

export default Hero
