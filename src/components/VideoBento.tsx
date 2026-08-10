/**
 * VideoBento — section 02/04 on Home route.
 * 15 mixed-ratio tiles; each is a <button aria-haspopup="dialog"> that opens
 * the <dialog>-based lightbox.
 *
 * Tile video playback:
 * - Poster frame is shown immediately (static img)
 * - <video muted playsinline loop> is lazy-loaded via IntersectionObserver
 * - Video plays on hover/focus; paused when off-route or out of viewport
 *
 * HTML structure mirrors prototype/index.html lines ~160–308 exactly.
 */
import {
	useRef,
	useState,
	useCallback,
	useEffect,
} from 'react'
import { useLocation } from 'react-router-dom'
import type { VideoItem } from '../content/video'
import { videos } from '../content/video'
import { useReveal } from '../hooks/useReveal'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useAllowsAutoplay } from '../hooks/useAllowsAutoplay'
import VideoLightbox from './VideoLightbox'

// ── Lazy video tile ────────────────────────────────────────────────────────────
function BentoTile({
	video,
	onOpen,
	isRouteActive,
	carouselMode,
	isActive,
	autoplayAllowed,
}: {
	video: VideoItem
	onOpen: (video: VideoItem, triggerEl: HTMLButtonElement) => void
	isRouteActive: boolean
	/** true below the carousel breakpoint — playback is driven by position, not hover */
	carouselMode: boolean
	/** true when this tile is the current carousel slide (always false on desktop) */
	isActive: boolean
	/** false under reduced-motion / data-saver / slow connection */
	autoplayAllowed: boolean
}) {
	const triggerRef = useRef<HTMLButtonElement>(null!)
	const videoRef = useRef<HTMLVideoElement | null>(null)
	const [loaded, setLoaded] = useState(false)
	const [playing, setPlaying] = useState(false)

	// Lazy-load via IntersectionObserver — load src once tile enters viewport
	useEffect(() => {
		const el = triggerRef.current
		if (!el) return
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !loaded) {
					setLoaded(true)
					io.disconnect()
				}
			},
			{ rootMargin: '200px' }
		)
		io.observe(el)
		return () => io.disconnect()
	}, [loaded])

	// Pause video when route is not Home
	useEffect(() => {
		const vid = videoRef.current
		if (!vid) return
		if (!isRouteActive) {
			vid.pause()
			setPlaying(false)
		}
	}, [isRouteActive])

	/**
	 * Carousel playback — driven by which slide is current, not by hover
	 * (neither mouseenter nor focus fires meaningfully on touch).
	 *
	 * Position comes from the parent's scroll-derived index rather than a second
	 * IntersectionObserver: a 9:16 slide can be taller than the viewport, so no
	 * single threshold reliably means "this is the one you're looking at".
	 *
	 * `loaded` is a dependency because the <video> element does not exist on the
	 * first pass — the effect has to re-run once the lazy src is attached.
	 */
	useEffect(() => {
		if (!carouselMode) return // desktop: hover/focus own playback
		const vid = videoRef.current
		if (!vid) return

		if (isActive && isRouteActive && autoplayAllowed) {
			vid.play().catch(() => { /* autoplay blocked — poster stays */ })
			setPlaying(true)
		} else {
			vid.pause()
			vid.currentTime = 0
			setPlaying(false)
		}
	}, [carouselMode, isActive, isRouteActive, autoplayAllowed, loaded])

	const handleMouseEnter = useCallback(() => {
		const vid = videoRef.current
		if (vid && isRouteActive) {
			vid.play().catch(() => { /* autoplay blocked — ignore */ })
			setPlaying(true)
		}
	}, [isRouteActive])

	const handleMouseLeave = useCallback(() => {
		const vid = videoRef.current
		if (vid) {
			vid.pause()
			vid.currentTime = 0
			setPlaying(false)
		}
	}, [])

	const handleFocus = useCallback(() => {
		const vid = videoRef.current
		if (vid && isRouteActive) {
			vid.play().catch(() => { /* ignore */ })
			setPlaying(true)
		}
	}, [isRouteActive])

	const handleBlur = useCallback(() => {
		const vid = videoRef.current
		if (vid) {
			vid.pause()
			vid.currentTime = 0
			setPlaying(false)
		}
	}, [])

	const handleClick = useCallback(() => {
		// Pause the tile's looping preview before opening lightbox
		const vid = videoRef.current
		if (vid) { vid.pause(); setPlaying(false) }
		onOpen(video, triggerRef.current)
	}, [video, onOpen])

	return (
		<button
			ref={triggerRef}
			className={`tile ${video.variant}${playing ? ' is-playing' : ''}`}
			aria-label={`Play: ${video.title}`}
			aria-haspopup="dialog"
			onClick={handleClick}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onFocus={handleFocus}
			onBlur={handleBlur}
		>
			{/* Poster + looping muted preview video (tile hover) */}
			<div className="poster">
				{loaded && (video.previewMp4 || video.previewWebm) ? (
					<video
						ref={videoRef}
						muted
						playsInline
						loop
						preload="none"
						poster={video.poster}
						aria-hidden="true"
						tabIndex={-1}
						style={{ width: '100%', height: '100%', objectFit: 'cover' }}
					>
						{video.previewWebm && <source src={video.previewWebm} type="video/webm" />}
						{video.previewMp4 && <source src={video.previewMp4} type="video/mp4" />}
					</video>
				) : (
					<img
						src={video.poster}
						alt=""
						loading="lazy"
						decoding="async"
						style={{ width: '100%', height: '100%', objectFit: 'cover' }}
					/>
				)}
			</div>

			{/* <span className="mono mono--sm tlabel">{video.title}</span> */}
			{video.duration && <span className="dur">{video.duration}</span>}
			<span className="play" aria-hidden="true">
				<span className="tri" />
				preview
			</span>
			<span className="scrub" aria-hidden="true" />
		</button>
	)
}

// ── Main component ────────────────────────────────────────────────────────────
/**
 * Must match the `.bento` carousel media query in globals.css. CSS owns the
 * layout switch; this only gates behaviour (which controls mount, what plays).
 */
const CAROUSEL_QUERY = '(max-width: 760px)'

/**
 * Index of the slide nearest the track's left edge.
 *
 * Compares each child's offsetLeft rather than dividing scrollLeft by
 * clientWidth: the track has a `gap`, so the per-slide step is width + gap
 * (360px, not 350px at 390vw) and the division would desync within a few slides.
 */
function nearestIndex(track: HTMLElement): number {
	let nearest = 0
	let nearestDist = Infinity
	for (let i = 0; i < track.children.length; i++) {
		const dist = Math.abs((track.children[i] as HTMLElement).offsetLeft - track.scrollLeft)
		if (dist < nearestDist) {
			nearestDist = dist
			nearest = i
		}
	}
	return nearest
}

export default function VideoBento() {
	const sectionRef = useRef<HTMLElement>(null)
	useReveal(sectionRef)

	const location = useLocation()
	const isHomeRoute = location.pathname === '/'

	const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null)
	const activeTriggerRef = useRef<HTMLButtonElement | null>(null)

	// ── Carousel (≤760px) ──────────────────────────────────────────────────────
	const isCarousel = useMediaQuery(CAROUSEL_QUERY)
	const autoplayAllowed = useAllowsAutoplay()
	const trackRef = useRef<HTMLDivElement>(null)
	const [index, setIndex] = useState(0)
	/**
	 * Slide the last button press aimed at, or null when no press is in flight.
	 *
	 * scrollTo({ behavior: 'smooth' }) returns immediately and animates, so
	 * scrollLeft reports the animation rather than the intent. Two clicks inside
	 * one frame would both read the pre-scroll position and advance a single slide.
	 * Cleared once scrolling settles, at which point the DOM is authoritative
	 * again — that also keeps a manual swipe from being overridden by stale intent.
	 */
	const pendingRef = useRef<number | null>(null)

	/**
	 * Derive the current slide from scroll position rather than tracking it only
	 * on button clicks — otherwise a swipe would desync the index and the next
	 * button press would jump from a stale position.
	 *
	 * Nearest-child-by-offsetLeft instead of `round(scrollLeft / clientWidth)` so
	 * the maths survives the track's `gap` and any future padding.
	 */
	useEffect(() => {
		const track = trackRef.current
		if (!track || !isCarousel) return

		let raf = 0
		let settleTimer: number | undefined
		const measure = () => setIndex(nearestIndex(track))
		const onScroll = () => {
			cancelAnimationFrame(raf)
			raf = requestAnimationFrame(measure)
			// once motion stops, position is settled and intent is no longer needed
			window.clearTimeout(settleTimer)
			settleTimer = window.setTimeout(() => {
				pendingRef.current = null
			}, 140)
		}

		measure()
		track.addEventListener('scroll', onScroll, { passive: true })
		return () => {
			track.removeEventListener('scroll', onScroll)
			cancelAnimationFrame(raf)
			window.clearTimeout(settleTimer)
		}
	}, [isCarousel])

	/**
	 * Step one slide, wrapping at both ends.
	 *
	 * Takes a delta and reads the current position from the DOM instead of
	 * closing over `index`: a second click landing before the smooth scroll
	 * finishes would otherwise compute from a stale index and skip a slide.
	 */
	const step = useCallback((delta: number) => {
		const track = trackRef.current
		if (!track) return

		// Bound by the DOM, not videos.length: if anything non-tile is ever added
		// to the track the two would diverge and children[target] would resolve to
		// the wrong node.
		const count = track.children.length
		if (count === 0) return
		// intent wins while a smooth scroll is mid-flight; the DOM wins once settled
		const current = pendingRef.current ?? nearestIndex(track)
		const target = (((current + delta) % count) + count) % count
		const slide = track.children[target] as HTMLElement | undefined
		if (!slide) return

		pendingRef.current = target

		// A wrap crosses the whole track (~5000px); animating through all 15
		// slides is slow and disorienting, so jump instead.
		const isWrap = Math.abs(target - current) > 1
		// CSS scroll-behavior does not govern programmatic scrollTo, so the
		// reduced-motion preference has to be applied by hand here.
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

		track.scrollTo({
			left: slide.offsetLeft,
			behavior: prefersReduced || isWrap ? 'auto' : 'smooth',
		})
		setIndex(target)
	}, [])

	const handleOpen = useCallback((video: VideoItem, trigger: HTMLButtonElement) => {
		activeTriggerRef.current = trigger
		setActiveVideo(video)
	}, [])

	const handleClose = useCallback(() => {
		setActiveVideo(null)
	}, [])

	return (
		<section
			ref={sectionRef}
			className="section section--tight"
			id="reel-index"
			aria-labelledby="reel-title"
		>
			<div className="container">
				<div className="sec-head">
					<div>
						<div className="section-index reveal">
							<span className="dot" aria-hidden="true" />
							<span className="mono mono--sm">02 — Reel index</span>
						</div>
						<h2 className="sec-title reveal" id="reel-title">
							Selected work, by the clip.
						</h2>
					</div>
					<p className="sec-note reveal">
						{isCarousel
							? 'Fifteen samples. Swipe or tap through; tap to expand.'
							: 'Fifteen samples. Hover to preview; click to expand.'}
					</p>
				</div>

				{/*
				 * One DOM structure for both layouts — globals.css turns this grid
				 * into a scroll-snap track at ≤760px. Rendering two variants would
				 * double the tiles and put 30 <video> elements on the page.
				 */}
				<div
					className="bento reveal"
					ref={trackRef}
					id="bento-track"
					{...(isCarousel
						? { role: 'group', 'aria-roledescription': 'carousel', 'aria-label': 'Reel index' }
						: {})}
				>
					{videos.map((video, i) => (
						<BentoTile
							key={video.id}
							video={video}
							onOpen={handleOpen}
							isRouteActive={isHomeRoute}
							carouselMode={isCarousel}
							isActive={isCarousel && i === index}
							autoplayAllowed={autoplayAllowed}
						/>
					))}
				</div>

				{/*
				 * Mounted rather than display:none'd, so assistive tech below the
				 * breakpoint gets real controls and desktop users get none at all.
				 */}
				{isCarousel && (
					<div className="bento-nav">
						<button
							type="button"
							className="bnav"
							onClick={() => step(-1)}
							aria-label="Previous reel"
							aria-controls="bento-track"
						>
							<span aria-hidden="true">←</span>
						</button>
						<button
							type="button"
							className="bnav"
							onClick={() => step(1)}
							aria-label="Next reel"
							aria-controls="bento-track"
						>
							<span aria-hidden="true">→</span>
						</button>
					</div>
				)}
			</div>

			{activeVideo && (
				<VideoLightbox
					video={activeVideo}
					onClose={handleClose}
					returnFocusRef={activeTriggerRef}
				/>
			)}
		</section>
	)
}
