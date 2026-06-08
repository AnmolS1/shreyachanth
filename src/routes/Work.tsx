import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { seo } from '../content/seo'

// Wave 2 components — filled in by T11 subagent
import RateCard from '../components/RateCard'
import TrustedBy from '../components/TrustedBy'
import { rates } from '../content/rates'
import { workSamples } from '../content/video'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
}

/** Sample tile — semantic button matching bento tile structure */
function SampleTile({
  label,
  px,
  py,
}: {
  label: string
  px: number
  py: number
}) {
  return (
    <button
      className="tile v"
      aria-label={`Play: ${label}`}
      aria-haspopup="dialog"
      type="button"
    >
      <div className="poster">
        <div
          className="ph"
          style={{ '--px': `${px}%`, '--py': `${py}%` } as React.CSSProperties}
        />
      </div>
      <span className="mono mono--sm tlabel">{label}</span>
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

  return (
    <motion.div
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
                  <SampleTile key={v.id} label={v.title} px={v.px} py={v.py} />
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
                  <SampleTile key={v.id} label={v.title} px={v.px} py={v.py} />
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
                  <SampleTile key={v.id} label={v.title} px={v.px} py={v.py} />
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
    </motion.div>
  )
}
