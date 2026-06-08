import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { seo } from '../content/seo'
import { useReveal } from '../hooks/useReveal'
import type { VideoItem } from '../content/video'

// Wave 2 components
import RateCard from '../components/RateCard'
import TrustedBy from '../components/TrustedBy'
import VideoLightbox from '../components/VideoLightbox'
import { rates } from '../content/rates'
import { workSamples } from '../content/video'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
}

/**
 * SampleTile — shows a real poster image + hover-preview video (matching
 * BentoTile on Home). Clicking opens the shared VideoLightbox.
 */
function SampleTile({
  video,
  onOpen,
}: {
  video: VideoItem
  onOpen: (video: VideoItem, trigger: HTMLButtonElement) => void
}) {
  const triggerRef = useRef<HTMLButtonElement>(null!)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [playing, setPlaying] = useState(false)

  // Lazy-load the video src once the tile enters the viewport
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

  const play = useCallback(() => {
    const vid = videoRef.current
    if (vid) {
      vid.play().catch(() => { /* autoplay blocked — ignore */ })
      setPlaying(true)
    }
  }, [])

  const pause = useCallback(() => {
    const vid = videoRef.current
    if (vid) {
      vid.pause()
      vid.currentTime = 0
      setPlaying(false)
    }
  }, [])

  const handleClick = useCallback(() => {
    pause()
    onOpen(video, triggerRef.current)
  }, [video, onOpen, pause])

  return (
    <button
      ref={triggerRef}
      className={`tile tile--sample${playing ? ' is-playing' : ''}`}
      aria-label={`Play: ${video.title}`}
      aria-haspopup="dialog"
      type="button"
      onClick={handleClick}
      onMouseEnter={play}
      onMouseLeave={pause}
      onFocus={play}
      onBlur={pause}
    >
      <div className="poster">
        {/* Always render the poster img; swap to looping video preview once loaded */}
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
      <span className="play" aria-hidden="true">
        <span className="tri" />
        preview
      </span>
      <span className="scrub" aria-hidden="true" />
    </button>
  )
}

export default function Work() {
  const title = `Work with me — ${seo.siteName}`
  const rootRef = useRef<HTMLDivElement>(null)
  useReveal(rootRef)

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
    <motion.div
      ref={rootRef}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
    >
      <Helmet>
        <title>{title}</title>
        <meta name="description" content="[PLACEHOLDER: Work with me description]" />
        <link rel="canonical" href={`${seo.siteUrl}/work`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content="[PLACEHOLDER: Work page description]" />
        <meta property="og:image" content={seo.ogImage} />
        <meta property="og:url" content={`${seo.siteUrl}/work`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* ── Page intro ───────────────────────────────────────────────────── */}
      <section className="container work-intro">
        <div className="section-index reveal">
          <span className="dot" />
          <span className="mono mono--sm">Services — three pillars, one system</span>
        </div>
        <h1 data-view-heading tabIndex={-1}>
          Work with <em>me.</em>
        </h1>
        <p className="lead reveal">
          Coaching, nutrition, and content — each a discipline of its own, each with sample work
          and a spec-sheet rate card.{' '}
          <span style={{ color: 'var(--faint)' }}>[Placeholder positioning copy.]</span>
        </p>
      </section>

      {/* ── Sticky pillar sub-nav ────────────────────────────────────────── */}
      <div className="container">
        <nav className="pillar-nav" aria-label="Service pillars">
          <span className="pn-label">Pillars</span>
          <a href="#fitness">
            <span className="n">01</span> Fitness
          </a>
          <a href="#diet">
            <span className="n">02</span> Diet
          </a>
          <a href="#storytelling">
            <span className="n">03</span> Storytelling
          </a>
        </nav>
      </div>

      <div className="container">
        {/* ── Pillar 01 · Fitness ────────────────────────────────────────── */}
        <section className="pillar" id="fitness" data-pillar>
          <div className="pillar-head reveal">
            <div className="p-index">
              <span className="num">01 / Fitness</span>
              <span className="ln" />
            </div>
            <h2>Strength, programmed.</h2>
            <p className="p-desc">
              [PLACEHOLDER: Fitness pillar description — strength &amp; conditioning, periodised
              and tracked.]
            </p>
          </div>
          <div className="pillar-body">
            <div className="reveal">
              <div className="samples-head">
                <span className="mono mono--sm">Sample work</span>
                <span className="mono mono--sm" style={{ color: 'var(--faint)' }}>
                  03 clips
                </span>
              </div>
              <div className="samples">
                {workSamples.fitness.map((v) => (
                  <SampleTile key={v.id} video={v} onOpen={handleOpen} />
                ))}
              </div>
            </div>
            <div className="reveal">
              <RateCard card={rates.cards[0]} />
            </div>
          </div>
        </section>

        {/* ── Pillar 02 · Diet ──────────────────────────────────────────── */}
        <section className="pillar" id="diet" data-pillar>
          <div className="pillar-head reveal">
            <div className="p-index">
              <span className="num">02 / Diet</span>
              <span className="ln" />
            </div>
            <h2>Nutrition, as a system.</h2>
            <p className="p-desc">
              [PLACEHOLDER: Diet pillar description — habits and intake, engineered to be
              repeatable.]
            </p>
          </div>
          <div className="pillar-body">
            <div className="reveal">
              <div className="samples-head">
                <span className="mono mono--sm">Sample work</span>
                <span className="mono mono--sm" style={{ color: 'var(--faint)' }}>
                  03 clips
                </span>
              </div>
              <div className="samples">
                {workSamples.diet.map((v) => (
                  <SampleTile key={v.id} video={v} onOpen={handleOpen} />
                ))}
              </div>
            </div>
            <div className="reveal">
              <RateCard card={rates.cards[1]} />
            </div>
          </div>
        </section>

        {/* ── Pillar 03 · Storytelling ───────────────────────────────────── */}
        <section className="pillar" id="storytelling" data-pillar style={{ borderBottom: 0 }}>
          <div className="pillar-head reveal">
            <div className="p-index">
              <span className="num">03 / Storytelling</span>
              <span className="ln" />
            </div>
            <h2>Content &amp; brand work.</h2>
            <p className="p-desc">
              [PLACEHOLDER: Storytelling pillar description — narrative-led content and brand
              partnerships.]
            </p>
          </div>
          <div className="pillar-body">
            <div className="reveal">
              <div className="samples-head">
                <span className="mono mono--sm">Sample work</span>
                <span className="mono mono--sm" style={{ color: 'var(--faint)' }}>
                  03 clips
                </span>
              </div>
              <div className="samples">
                {workSamples.storytelling.map((v) => (
                  <SampleTile key={v.id} video={v} onOpen={handleOpen} />
                ))}
              </div>
            </div>
            <div className="reveal">
              <RateCard card={rates.cards[2]} />
            </div>
          </div>

          {/* ── Brand deals ─────────────────────────────────────────────── */}
          <TrustedBy variant="work" />
        </section>
      </div>

      {/* Shared lightbox — renders above all content when a sample is clicked */}
      {activeVideo && (
        <VideoLightbox
          video={activeVideo}
          onClose={handleClose}
          returnFocusRef={activeTriggerRef}
        />
      )}
    </motion.div>
  )
}
