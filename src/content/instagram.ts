import { z } from 'zod'

export const IgPostSchema = z.object({
	id: z.string(),
	/** Used as alt text and fallback label */
	caption: z.string(),
	/** URL to the post */
	permalink: z.string().url(),
	/** Thumbnail URL (from Behold or curated) */
	mediaUrl: z.string().optional(),
	/** Focal-point for the placeholder gradient when mediaUrl is absent */
	px: z.number().min(0).max(100).default(30),
	py: z.number().min(0).max(100).default(30),
})

export const InstagramConfigSchema = z.object({
	/**
	 * 'behold': fetch live from /feed (Pages Function).
	 * 'curated': always render the curated array below.
	 */
	mode: z.enum(['behold', 'curated']),
	instagramHandle: z.string(),
	curatedPosts: z.array(IgPostSchema).min(1),
})

export type IgPost = z.infer<typeof IgPostSchema>
export type InstagramConfig = z.infer<typeof InstagramConfigSchema>

export const instagram: InstagramConfig = InstagramConfigSchema.parse({
	mode: 'behold', // falls back to curatedPosts below if /feed is unavailable
	instagramHandle: '@shrookya',
	curatedPosts: [
		{ id: 'post-01', caption: 'post 01', permalink: 'https://www.instagram.com/p/DTWRfhUEbqY/', mediaUrl: '/instagram/post-01.jpg', px: 30, py: 30 },
		{ id: 'post-02', caption: 'post 02', permalink: 'https://www.instagram.com/p/DVrvnuKkbzG/', mediaUrl: '/instagram/post-02.jpg', px: 58, py: 40 },
		{ id: 'post-03', caption: 'post 03', permalink: 'https://www.instagram.com/p/DYtp22Lo9ua/', mediaUrl: '/instagram/post-03.jpg', px: 44, py: 62 },
		{ id: 'post-04', caption: 'post 04', permalink: 'https://www.instagram.com/p/DYzxqo8RDtb/', mediaUrl: '/instagram/post-04.jpg', px: 66, py: 28 },
		{ id: 'post-05', caption: 'post 05', permalink: 'https://www.instagram.com/p/DXw2j-cI9-z/', mediaUrl: '/instagram/post-05.jpg', px: 36, py: 48 },
		{ id: 'post-06', caption: 'post 06', permalink: 'https://www.instagram.com/p/DYGEIkrR_V4/', mediaUrl: '/instagram/post-06.jpg', px: 52, py: 36 },
		{ id: 'post-07', caption: 'post 07', permalink: 'https://www.instagram.com/p/DX-YlbKRxUq/', mediaUrl: '/instagram/post-07.jpg', px: 48, py: 58 },
	],
})
