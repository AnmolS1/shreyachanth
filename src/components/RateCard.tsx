/**
 * RateCard — spec-sheet style pricing card for each pillar on the Work route.
 * Uses prototype CSS classes: .ratecard, .ratecard-head, .rate-row, .ratecard-foot
 * Content type: RateCard from src/content/rates.ts
 */
import { Link } from 'react-router-dom'
import type { RateCard } from '../content/rates'

export default function RateCard({ card }: { card: RateCard }) {
	return (
		<article className="ratecard" aria-labelledby={`rc-heading-${card.pillar}`}>
			{/* Header */}
			<div className="ratecard-head">
				<span className="rc-title">{card.title}</span>
				<span className="rc-tag">[ placeholder pricing ]</span>
			</div>

			{/* Line items */}
			{card.lines.map((line) => (
				<div key={line.name} className="rate-row">
					<span className="rate-name">
						{line.name}
						<span className="unit">{line.unit}</span>
					</span>
					<span className="rate-price">
						{line.price.startsWith('$') ? (
							<>
								<span className="cur">$</span>
								{line.price.slice(1)}
								{line.priceSuffix && <i>{line.priceSuffix}</i>}
							</>
						) : (
							line.price
						)}
					</span>
					<p className="rate-desc">{line.description}</p>
				</div>
			))}

			{/* Footnote + CTA */}
			<div className="ratecard-foot">
				<span className="rc-note">{card.footNote}</span>
				<Link to="/contact" className="btn btn--gold">
					Start a project <span className="arr">→</span>
				</Link>
			</div>
		</article>
	)
}
