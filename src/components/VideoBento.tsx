/**
 * VideoBento — section 02/04 on Home route.
 * 16 mixed-ratio tiles; each is a <button aria-haspopup="dialog"> that opens
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
  useId,
} from 'react'
import { useLocation } from 'react-router-dom'
import type { VideoItem } from '../content/video'
import { videos } from '../content/video'
import { useReveal } from '../hooks/useReveal'

// ── Lazy video tile ────────────────────────────────────────────────────────────
function BentoTile({
  video,
  onOpen,
  isRouteActive,
}: {
  video: VideoItem
  onOpen: (video: VideoItem, triggerEl: HTMLButtonElement) => void
  isRouteActive: boolean
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
      {/* Poster + looping video preview */}
      <div className="poster">
        {loaded && (video.mp4 || video.webm) ? (
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
            {video.webm && <source src={video.webm} type="video/webm" />}
            {video.mp4 && <source src={video.mp4} type="video/mp4" />}
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

      <span className="mono mono--sm tlabel">{video.title}</span>
      {video.duration && <span className="dur">{video.duration}</span>}
      <span className="play" aria-hidden="true">
        <span className="tri" />
        preview
      </span>
      <span className="scrub" aria-hidden="true" />
    </button>
  )
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function VideoLightbox({
  video,
  onClose,
  returnFocusRef,
}: {
  video: VideoItem
  onClose: () => void
  returnFocusRef: React.RefObject<HTMLButtonElement | null>
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const titleId = useId()

  // Open on mount — showModal() for native focus trap + aria-modal
  const attachDialog = useCallback((el: HTMLDialogElement | null) => {
    dialogRef.current = el
    if (el && !el.open) el.showModal()
  }, [])

  const close = useCallback(() => {
    // Pause embedded video before closing
    const vid = videoRef.current
    if (vid) { vid.pause(); vid.currentTime = 0 }
    const iframe = dialogRef.current?.querySelector('iframe')
    if (iframe) { iframe.src = iframe.src } // reset Stream iframe (stop playback)
    dialogRef.current?.close()
    onClose()
    // Return focus to the tile button that triggered this
    returnFocusRef.current?.focus()
  }, [onClose, returnFocusRef])

  // Sync close state when user presses Escape (native dialog behavior)
  const handleNativeClose = useCallback(() => {
    const vid = videoRef.current
    if (vid) { vid.pause(); vid.currentTime = 0 }
    onClose()
    returnFocusRef.current?.focus()
  }, [onClose, returnFocusRef])

  // Aspect ratio — use video's native dimensions if known, else 16:9 default
  const isPortrait =
    video.variant === 'v' || video.variant === 'v-tall'
  const aspectRatio = isPortrait ? '9 / 16' : '16 / 9'

  return (
    <dialog
      ref={attachDialog}
      aria-labelledby={titleId}
      onClose={handleNativeClose}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: '12px',
        padding: 0,
        maxWidth: isPortrait
          ? 'min(480px, 90vw)'
          : 'min(90vw, 1200px)',
        width: '100%',
        color: 'var(--text)',
        overflow: 'hidden',
      }}
    >
      {/* Close button — 44×44 touch target */}
      <button
        onClick={close}
        aria-label="Close video"
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'rgba(11,11,13,0.72)',
          border: '1px solid var(--hairline)',
          borderRadius: 8,
          color: 'var(--muted)',
          fontSize: '1.25rem',
          cursor: 'pointer',
          zIndex: 10,
          lineHeight: 1,
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ×
      </button>

      {/* Video area */}
      <div style={{ aspectRatio, background: 'var(--ink)' }}>
        {video.streamId ? (
          // Long-form: Cloudflare Stream sandboxed iframe
          <iframe
            src={`https://customer-placeholder.cloudflarestream.com/${video.streamId}/iframe`}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
            title={video.title}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        ) : video.mp4 || video.webm ? (
          // Short-form: R2 / local video
          <video
            ref={videoRef}
            autoPlay
            controls
            playsInline
            loop={false}
            poster={video.poster}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          >
            {video.webm && <source src={video.webm} type="video/webm" />}
            {video.mp4 && <source src={video.mp4} type="video/mp4" />}
          </video>
        ) : (
          // Poster-only fallback
          <img
            src={video.poster}
            alt={video.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
      </div>

      {/* Title bar */}
      <div
        style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--hairline)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <span id={titleId} className="mono mono--sm" style={{ color: 'var(--muted)' }}>
          {video.title}
        </span>
        {video.duration && (
          <span className="mono mono--sm" style={{ color: 'var(--faint)' }}>
            {video.duration}
          </span>
        )}
      </div>
    </dialog>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function VideoBento() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef)

  const location = useLocation()
  const isHomeRoute = location.pathname === '/'

  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null)
  const activeTriggerRef = useRef<HTMLButtonElement | null>(null)

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
              <span className="mono mono--sm">02 / 04 — Reel index</span>
            </div>
            <h2 className="sec-title reveal" id="reel-title">
              Selected work, by the clip.
            </h2>
          </div>
          <p className="sec-note reveal">
            Sixteen pieces, native ratios preserved. Hover to preview; click to expand.
          </p>
        </div>

        {/* Bento grid */}
        <div className="bento reveal">
          {videos.map((video) => (
            <BentoTile
              key={video.id}
              video={video}
              onOpen={handleOpen}
              isRouteActive={isHomeRoute}
            />
          ))}
        </div>
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
