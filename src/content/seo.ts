import { z } from 'zod'

export const SeoSchema = z.object({
	siteName: z.string(),
	siteUrl: z.string().url(),
	defaultTitle: z.string(),
	defaultDescription: z.string(),
	ogImage: z.string(),
	instagramUrl: z.string().url().optional(),
	contactEmail: z.string().email().optional(),
	footerTagline: z.string(),
})

export type Seo = z.infer<typeof SeoSchema>

export const seo: Seo = SeoSchema.parse({
	siteName: 'Shreya Chanth',
	siteUrl: 'https://shreyachanth.com',
	defaultTitle: 'Shreya Chanth — Fitness Coach & Content Creator',
	defaultDescription:
		'Toronto-based fitness and nutrition coach. I work with people who want to change how they move and eat, and with brands who want that change on camera.',
	ogImage: 'https://shreyachanth.com/icons/og-image.jpg',
	instagramUrl: 'https://instagram.com/shrookya',
	contactEmail: 'contact@shreyachanth.com',
	footerTagline: '[ Built to spec · shreyachanth.com ]',
})
