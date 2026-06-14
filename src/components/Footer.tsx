import { seo } from '../content/seo'

/**
 * Persistent site footer.
 * Social / contact links come from src/content/seo.ts (single source of truth).
 */
export default function Footer() {
	return (
		<footer className="site-footer">
			<div className="container footer-grid">
				<span className="wordmark" style={{ fontSize: '0.82rem' }}>
					Shreya<span className="sep">·</span>Chanth
				</span>

				<div className="footer-links">
					{seo.instagramUrl && (
						<a
							className="footer-link"
							href={seo.instagramUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							Instagram ↗
						</a>
					)}
					{seo.contactEmail && (
						<a className="footer-link" href={`mailto:${seo.contactEmail}`}>
							{seo.contactEmail}
						</a>
					)}
				</div>

				<span className="footer-tag">{seo.footerTagline}</span>
			</div>
		</footer>
	)
}
