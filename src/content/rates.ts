import { z } from 'zod'

export const RateLineSchema = z.object({
  name: z.string(),
  /** e.g. "Monthly retainer", "Per session" */
  unit: z.string(),
  /** e.g. "$0,000" or "On request" */
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
          price: '$0,000',
          priceSuffix: '/mo',
          description:
            'Custom programming, weekly check-ins, form review. [PLACEHOLDER: line item]',
        },
        {
          name: '12-week build',
          unit: 'One-off program',
          price: '$0,000',
          description:
            'A full periodised block, delivered and tracked. [PLACEHOLDER: line item]',
        },
        {
          name: 'Single session',
          unit: 'Per session',
          price: '$000',
          description:
            'One focused 60-minute working session. [PLACEHOLDER: line item]',
        },
      ],
      footNote: 'Custom scopes on request',
    },
    {
      pillar: 'diet',
      title: 'Rate sheet — Diet',
      lines: [
        {
          name: 'Nutrition system',
          unit: 'One-off build',
          price: '$0,000',
          description:
            'Intake plan, targets, and a habit framework. [PLACEHOLDER: line item]',
        },
        {
          name: 'Monthly guidance',
          unit: 'Ongoing',
          price: '$000',
          priceSuffix: '/mo',
          description:
            'Adjustments, accountability, and check-ins. [PLACEHOLDER: line item]',
        },
        {
          name: 'Consult',
          unit: '60 minutes',
          price: '$000',
          description:
            'A single strategy call to map the approach. [PLACEHOLDER: line item]',
        },
      ],
      footNote: 'Bundled with coaching on request',
    },
    {
      pillar: 'storytelling',
      title: 'Rate sheet — Storytelling',
      lines: [
        {
          name: 'Single reel',
          unit: 'Per piece',
          price: '$000',
          description:
            'Concept, shoot direction, edit. [PLACEHOLDER: line item]',
        },
        {
          name: 'Content pack',
          unit: '×6 reels',
          price: '$0,000',
          description:
            'A batched set with a consistent through-line. [PLACEHOLDER: line item]',
        },
        {
          name: 'Brand partnership',
          unit: 'Scoped',
          price: 'On request',
          description:
            'Integrated campaigns and ongoing collaborations. [PLACEHOLDER: line item]',
        },
      ],
      footNote: 'Media kit available on request',
    },
  ],
})
