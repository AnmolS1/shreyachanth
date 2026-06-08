/**
 * TrustedBy — logo grid.
 * variant="home" → 6 logos (end of Home route)
 * variant="work" → 12 logos (end of Work route, after all pillars)
 *
 * HTML structure mirrors prototype/index.html lines ~375–404 exactly.
 * Uses .logos / .logo-cell / .logo-mark / .logo-idx classes as in the prototype.
 * T08 stub — renders placeholder name badges until real logo SVGs are available.
 */
import { useRef } from 'react'
import { logos } from '../content/logos'
import type { Logo } from '../content/logos'
import { useReveal } from '../hooks/useReveal'

interface TrustedByProps {
  variant: 'home' | 'work'
}

function LogoCell({ logo }: { logo: Logo }) {
  return (
    <div className="logo-cell" aria-label={logo.name}>
      {logo.svg ? (
        <img
          src={logo.svg}
          alt={logo.name}
          loading="lazy"
          decoding="async"
          style={{ maxWidth: 120, maxHeight: 40, objectFit: 'contain' }}
          className="logo-mark"
        />
      ) : (
        /* Placeholder until brand supplies real SVGs */
        <span className="logo-mark">{logo.name}</span>
      )}
      <span className="logo-idx">↗ {String(logo.index).padStart(2, '0')}</span>
    </div>
  )
}

export default function TrustedBy({ variant }: TrustedByProps) {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef)

  const list = variant === 'work' ? logos.work : logos.home

  return (
    <section
      ref={sectionRef}
      className="section section--tight"
      aria-labelledby={`trust-title-${variant}`}
    >
      <div className="container">
        <div className="sec-head">
          <div>
            <div className="section-index reveal">
              <span className="dot" aria-hidden="true" />
              <span className="mono mono--sm">
                {variant === 'home' ? '04 / 04 — Trusted by' : 'Trusted by'}
              </span>
            </div>
            <h2 className="sec-title reveal" id={`trust-title-${variant}`}>
              Logos, as data points.
            </h2>
          </div>
          <p className="sec-note reveal">
            {variant === 'home'
              ? 'A teaser strip — the full roster lives under Work with me.'
              : 'The full brand partner roster.'}
          </p>
        </div>

        <div className="logos reveal">
          {list.map((logo) => (
            <LogoCell key={logo.id} logo={logo} />
          ))}
        </div>
      </div>
    </section>
  )
}
