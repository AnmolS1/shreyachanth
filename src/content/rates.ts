import { z } from 'zod'

export const RateLineSchema = z.object({
	name: z.string(),
	/** e.g. "Monthly retainer", "Per session" */
	unit: z.string(),
	/** e.g. "$0,000" or "–" */
	price: z.string(),
	/** Optional per-frequency suffix e.g. "/mo" */
	priceSuffix: z.string().optional(),
	description: z.string(),
})

export const RateCardSchema = z.object({
	pillar: z.enum(['fitness', 'diet', 'storytelling']),
	title: z.string(),
	lines: z.array(RateLineSchema).min(1),
	footNote: z.string(),
})

export const RatesSchema = z.object({
	cards: z.array(RateCardSchema).length(3),
})

export type RateLine = z.infer<typeof RateLineSchema>
export type RateCard = z.infer<typeof RateCardSchema>
export type Rates = z.infer<typeof RatesSchema>

export const rates: Rates = RatesSchema.parse({
	cards: [
		{
			pillar: 'fitness',
			title: 'Rate sheet — Fitness',
			lines: [
				{
					name: '1:1 coaching',
					unit: 'Monthly retainer',
					price: '–',
					priceSuffix: '/mo',
					description:
						'Custom programming, weekly check-ins, form review.',
				},
				{
					name: '12-week build',
					unit: 'One-off program',
					price: '–',
					description:
						'A full periodised block, delivered and tracked.',
				},
				{
					name: 'Single session',
					unit: 'Per session',
					price: '–',
					description:
						'One focused 60-minute working session.',
				},
			],
			footNote: 'Custom scopes –',
		},
		{
			pillar: 'diet',
			title: 'Rate sheet — Diet',
			lines: [
				{
					name: 'Nutrition system',
					unit: 'One-off build',
					price: '–',
					description:
						'Intake plan, targets, and a habit framework.',
				},
				{
					name: 'Monthly guidance',
					unit: 'Ongoing',
					price: '–',
					priceSuffix: '/mo',
					description:
						'Adjustments, accountability, and check-ins.',
				},
				{
					name: 'Consult',
					unit: '60 minutes',
					price: '–',
					description:
						'A single strategy call to map the approach.',
				},
			],
			footNote: 'Bundled with coaching –',
		},
		{
			pillar: 'storytelling',
			title: 'Rate sheet — Storytelling',
			lines: [
				{
					name: 'Single reel',
					unit: 'Per piece',
					price: '–',
					description:
						'Concept, shoot direction, edit.',
				},
				{
					name: 'Content pack',
					unit: '×6 reels',
					price: '–',
					description:
						'A batched set with a consistent through-line.',
				},
				{
					name: 'Brand partnership',
					unit: 'Scoped',
					price: '–',
					description:
						'Integrated campaigns and ongoing collaborations.',
				},
			],
			footNote: 'Media kit available –',
		},
	],
})
