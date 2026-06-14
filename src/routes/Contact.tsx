import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { seo } from '../content/seo'
import ContactForm from '../components/ContactForm'
import { useReveal } from '../hooks/useReveal'

const pageVariants = {
	initial: { opacity: 0, y: 8 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0 },
}

export default function Contact() {
	const title = `Contact — ${seo.siteName}`
	const sectionRef = useRef<HTMLElement>(null)
	useReveal(sectionRef)

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
				<meta name="description" content="[PLACEHOLDER: Contact page description]" />
				<link rel="canonical" href={`${seo.siteUrl}/contact`} />
				<meta property="og:title" content={title} />
				<meta property="og:description" content="[PLACEHOLDER: Contact description]" />
				<meta property="og:image" content={seo.ogImage} />
				<meta property="og:url" content={`${seo.siteUrl}/contact`} />
				<meta property="og:type" content="website" />
				<meta name="twitter:card" content="summary_large_image" />
			</Helmet>

			<section ref={sectionRef} className="container contact-wrap">
				<div className="contact-grid">
					{/* ── Left: intro + readout ──────────────────────────────────── */}
					<div className="contact-intro">
						<div className="section-index reveal">
							<span className="dot" />
							<span className="mono mono--sm">Contact — open a channel</span>
						</div>
						<h1
							data-view-heading
							tabIndex={-1}
						>
							Start a{' '}
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
								new journey.
							</em>
						</h1>
						<p className="lead reveal">
							Tell me what you&apos;re building and where you want it to go.{' '}
							<span style={{ color: 'var(--faint)' }}>[Placeholder copy.]</span>
						</p>

						<div className="contact-readout reveal">
							<div className="ro">
								<span className="k">Channel</span>
								<span className="v online">Open</span>
							</div>
							<div className="ro">
								<span className="k">Response</span>
								<span className="v">~ 24–48 hrs</span>
							</div>
							<div className="ro">
								<span className="k">Based in</span>
								<span className="v">Toronta · Canada</span>
							</div>
							<div className="ro">
								<span className="k">Direct</span>
								<span className="v">{seo.contactEmail ?? 'contact@shreyachanth.com'}</span>
							</div>
						</div>
					</div>

					{/* ── Right: terminal console form ───────────────────────────── */}
					<ContactForm />
				</div>
			</section>
		</motion.div>
	)
}
