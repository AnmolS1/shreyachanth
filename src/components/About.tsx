/**
 * About — section 01/04 dossier on Home route.
 * Dossier grid: portrait left, spec sheet right.
 * All copy from src/content/about.ts.
 *
 * HTML structure mirrors prototype/index.html lines ~101–158 exactly.
 */
import { useRef } from 'react'
import { about } from '../content/about'
import { useReveal } from '../hooks/useReveal'

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef)

  return (
    <section ref={sectionRef} className="section" aria-labelledby="about-title">
      <div className="container">
        <div className="section-index reveal">
          <span className="dot" aria-hidden="true" />
          <span className="mono mono--sm">01 — About</span>
        </div>

        <div className="about-grid">
          {/* ── Portrait column ─────────────────────────────────────────── */}
          <div className="portrait-frame reveal">
            {/* Corner brackets — decorative hairline measurement ticks */}
            <span className="bracket tl" aria-hidden="true" />
            <span className="bracket tr" aria-hidden="true" />
            <span className="bracket bl" aria-hidden="true" />
            <span className="bracket br" aria-hidden="true" />
            {/* Ruler ticks down the left edge */}
            <span className="ruler" aria-hidden="true" />

            <div
              className="portrait ph-static"
              {...(!about.portrait && { role: 'img', 'aria-label': about.portraitAlt })}
            >
              {about.portrait ? (
                <img
                  className="portrait-img"
                  src={about.portrait}
                  alt={about.portraitAlt}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div
                  className="ph"
                  style={
                    { '--px': '38%', '--py': '30%' } as React.CSSProperties
                  }
                />
              )}
              <span className="mono mono--sm meta">fig.01 — portrait</span>
            </div>
          </div>

          {/* ── Spec sheet column ────────────────────────────────────────── */}
          <div className="about-body">
            <h2
              className="sec-title about-lead reveal"
              id="about-title"
              style={{ '--i': 0 } as React.CSSProperties}
            >
              {about.tagline}
            </h2>

            <p
              className="about-copy reveal"
              style={{ '--i': 1 } as React.CSSProperties}
            >
              {about.bio}
            </p>

            {/* Spec readout */}
            <div
              className="spec-list reveal"
              style={{ '--i': 3 } as React.CSSProperties}
            >
              {about.specs.map((row) => (
                <div key={row.label} className="spec-row">
                  <span className="k">{row.label}</span>
                  <span className="v">{row.value}</span>
                  <span className="n">{row.note ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
