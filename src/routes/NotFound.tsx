import { useLocation, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'

/**
 * T06 — NotFound (404)
 * Faithful port of prototype/404.html: "coordinate not found" instrument theme.
 * The reticle replaces the middle "0" in "404".
 * The scan sweep is a horizontal hairline that translates X from -60vw to 160vw.
 */
export default function NotFound() {
  const { pathname } = useLocation()
  const requested = pathname.length > 64 ? pathname.slice(0, 61) + '…' : pathname

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
    >
      <Helmet>
        <title>Page not found — Shreya Chanth</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <style>{`
        /* =======================================================================
           404 — "coordinate not found"
           An instrument that can't lock a location. The 0 of 404 becomes a
           crosshair reticle (hairlines + a circle), with a mono diagnostic
           readout and a quiet scanning sweep. Reuses every :root token.
           transform/opacity motion only.
           ======================================================================= */
        .nf {
          min-height: calc(100vh - var(--nav-h));
          min-height: calc(100svh - var(--nav-h));
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        /* slow scanning hairline that sweeps the field — the instrument "searching" */
        .nf-scan {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .nf-scan::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 40vw;
          background: linear-gradient(90deg, transparent 0, rgba(201, 162, 75, 0.05) 50%, transparent 100%);
          transform: translateX(-60vw);
          animation: nfSweep 7s var(--ease) infinite;
        }

        @keyframes nfSweep {
          0%   { transform: translateX(-60vw); }
          100% { transform: translateX(160vw); }
        }

        .nf .container {
          position: relative;
          z-index: 2;
          width: 100%;
        }

        /* eyebrow: tick line + mono label */
        .nf-eyebrow {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 34px;
        }

        .nf-eyebrow .tick {
          width: 26px;
          height: var(--hairline-w);
          background: var(--gold);
          flex-shrink: 0;
        }

        /* the big code: 4 · reticle · 4 — mono, tabular, gilded glyphs */
        .nf-code {
          display: flex;
          align-items: center;
          gap: clamp(6px, 1.4vw, 20px);
          font-family: var(--font-mono);
          font-weight: 500;
          line-height: 0.8;
          font-size: clamp(6rem, 22vw, 17rem);
          letter-spacing: -0.04em;
          font-variant-numeric: tabular-nums;
        }

        .nf-code .d {
          color: transparent;
          background: var(--gold-sheen);
          -webkit-background-clip: text;
          background-clip: text;
        }

        /* the reticle that stands in for the middle 0 */
        .nf-ret {
          position: relative;
          width: clamp(5rem, 18vw, 13.5rem);
          aspect-ratio: 1;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
        }

        .nf-ret .ring {
          position: absolute;
          inset: 12%;
          border: var(--hairline-w) solid var(--gold-line);
          border-radius: 50%;
        }

        .nf-ret .ring.r2 {
          inset: 30%;
          border-color: var(--hairline);
        }

        .nf-ret .ring.spin {
          inset: 2%;
          border-color: transparent;
          border-top-color: var(--gold);
          animation: nfSpin 5.5s linear infinite;
        }

        @keyframes nfSpin {
          to { transform: rotate(360deg); }
        }

        /* cross hairs */
        .nf-ret .cross-h,
        .nf-ret .cross-v {
          position: absolute;
          background: var(--hairline);
        }

        .nf-ret .cross-h {
          left: 0;
          right: 0;
          height: var(--hairline-w);
          top: 50%;
        }

        .nf-ret .cross-v {
          top: 0;
          bottom: 0;
          width: var(--hairline-w);
          left: 50%;
        }

        .nf-ret .pip {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 0 0 var(--gold-line);
          animation: nfPulse 2.6s var(--ease) infinite;
        }

        @keyframes nfPulse {
          0%        { box-shadow: 0 0 0 0 rgba(201, 162, 75, 0.4); }
          70%, 100% { box-shadow: 0 0 0 10px rgba(201, 162, 75, 0); }
        }

        /* corner ticks */
        .nf-ret .tk {
          position: absolute;
          width: 12px;
          height: 12px;
          border: var(--hairline-w) solid var(--gold-line);
        }

        .nf-ret .tk.tl { top: 6%;    left: 6%;   border-right: 0; border-bottom: 0; }
        .nf-ret .tk.tr { top: 6%;    right: 6%;  border-left: 0;  border-bottom: 0; }
        .nf-ret .tk.bl { bottom: 6%; left: 6%;   border-right: 0; border-top: 0;    }
        .nf-ret .tk.br { bottom: 6%; right: 6%;  border-left: 0;  border-top: 0;    }

        .nf-lead {
          margin-top: 40px;
          font-size: var(--fs-h2);
          font-weight: 600;
          letter-spacing: -0.03em;
          max-width: 18ch;
        }

        .nf-lead em {
          font-style: normal;
          color: var(--gold);
          -webkit-text-fill-color: transparent;
          background: var(--gold-sheen);
          -webkit-background-clip: text;
          background-clip: text;
        }

        .nf-sub {
          margin-top: 18px;
          color: var(--muted);
          max-width: 46ch;
          font-size: var(--fs-body);
        }

        /* diagnostic readout — same spec-row language as the rest of the site */
        .nf-readout {
          margin-top: 40px;
          max-width: 560px;
          border-top: var(--hairline-w) solid var(--hairline);
        }

        .nf-readout .ro {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 18px;
          align-items: baseline;
          padding: 14px 0;
          border-bottom: var(--hairline-w) solid var(--hairline);
        }

        .nf-readout .ro .k {
          font-family: var(--font-mono);
          font-size: var(--fs-mono-sm);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--faint);
        }

        .nf-readout .ro .v {
          font-family: var(--font-mono);
          font-size: var(--fs-mono);
          color: var(--text);
          word-break: break-all;
        }

        .nf-readout .ro .v.bad {
          color: var(--gold);
        }

        .nf-actions {
          margin-top: 44px;
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        @media (prefers-reduced-motion: reduce) {
          .nf-scan::after,
          .nf-ret .ring.spin,
          .nf-ret .pip {
            animation: none !important;
          }

          .nf-ret .ring.spin {
            border-top-color: transparent;
          }
        }

        @media (max-width: 560px) {
          .nf-readout .ro {
            grid-template-columns: 1fr;
            gap: 4px;
          }
        }
      `}</style>

      <section className="nf" aria-labelledby="nf-title">
        <div className="nf-scan" aria-hidden="true" />

        <div className="container">
          {/* eyebrow: tick + mono label */}
          <div className="nf-eyebrow">
            <span className="tick" aria-hidden="true" />
            <span className="mono mono--sm">Error 404 · signal lost</span>
          </div>

          {/* 4 · reticle · 4 */}
          <div className="nf-code" role="img" aria-label="404">
            <span className="d" aria-hidden="true">4</span>
            <span className="nf-ret" aria-hidden="true">
              <span className="ring" />
              <span className="ring r2" />
              <span className="ring spin" />
              <span className="cross-h" />
              <span className="cross-v" />
              <span className="tk tl" /><span className="tk tr" />
              <span className="tk bl" /><span className="tk br" />
              <span className="pip" />
            </span>
            <span className="d" aria-hidden="true">4</span>
          </div>

          <h1
            className="nf-lead"
            id="nf-title"
            data-view-heading
            tabIndex={-1}
          >
            This coordinate isn&apos;t <em>on the grid.</em>
          </h1>

          <p className="nf-sub">
            The page you&apos;re after has moved, retired, or never existed. The instrument keeps
            scanning — but you&apos;ll get there faster from a known route below.
          </p>

          {/* diagnostic readout */}
          <div className="nf-readout">
            <div className="ro">
              <span className="k">Requested</span>
              <span className="v bad">{requested}</span>
            </div>
            <div className="ro">
              <span className="k">Status</span>
              <span className="v">404 · not found</span>
            </div>
            <div className="ro">
              <span className="k">Nearest route</span>
              <span className="v">/ · home</span>
            </div>
          </div>

          <div className="nf-actions">
            <Link to="/" className="btn btn--gold">
              Return home <span className="arr">→</span>
            </Link>
            <Link to="/work" className="btn btn--ghost">
              Work with me
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
