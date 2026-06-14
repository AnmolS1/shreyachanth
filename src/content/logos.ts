import { z } from 'zod'

export const LogoSchema = z.object({
	id: z.string(),
	name: z.string(),
	url: z.string().url().optional(),
	/** Path to SVG logo file in public/images/logos/ — omit until real assets are added */
	svg: z.string().optional(),
	/** Displayed as the "↗ 01" index tag */
	index: z.number().int().positive(),
})

export const LogosSchema = z.object({
	/** 6 logos shown on the Home "Trusted by" teaser strip */
	home: z.array(LogoSchema).length(6),
	/** 12 logos shown on the Work page "Brand deals" section */
	work: z.array(LogoSchema).length(12),
})

export type Logo = z.infer<typeof LogoSchema>
export type Logos = z.infer<typeof LogosSchema>

export const logos: Logos = LogosSchema.parse({
	home: [
		{ id: 'luma', name: 'LUMA', index: 1 },
		{ id: 'forge', name: 'FORGE', index: 2 },
		{ id: 'meridian', name: 'MERIDIAN', index: 3 },
		{ id: 'atlas', name: 'ATLAS', index: 4 },
		{ id: 'norda', name: 'NORDA', index: 5 },
		{ id: 'kiln', name: 'KILN', index: 6 },
	],
	work: [
		{ id: 'luma', name: 'LUMA', index: 1 },
		{ id: 'forge', name: 'FORGE', index: 2 },
		{ id: 'meridian', name: 'MERIDIAN', index: 3 },
		{ id: 'atlas', name: 'ATLAS', index: 4 },
		{ id: 'norda', name: 'NORDA', index: 5 },
		{ id: 'kiln', name: 'KILN', index: 6 },
		{ id: 'vanta', name: 'VANTA', index: 7 },
		{ id: 'halcyon', name: 'HALCYON', index: 8 },
		{ id: 'obelisk', name: 'OBELISK', index: 9 },
		{ id: 'cinder', name: 'CINDER', index: 10 },
		{ id: 'praxis', name: 'PRAXIS', index: 11 },
		{ id: 'solace', name: 'SOLACE', index: 12 },
	],
})
