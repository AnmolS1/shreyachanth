import { z } from 'zod'

// Base URL for self-hosted video/poster assets.
// Switch to 'https://media.shreyachanth.com' once R2 is provisioned.
const MEDIA_BASE = ''  // empty = relative /public/ path in dev

/** Bento tile size variant — mirrors prototype CSS span helpers */
export const TileVariant = z.enum(['v', 'v-tall', 'sq', 'wide', 'big'])
export type TileVariant = z.infer<typeof TileVariant>

export const VideoItemSchema = z.object({
	id: z.string(),
	/** Human-readable label shown in the tile aria-label and lightbox */
	title: z.string(),
	/** Duration string e.g. "0:38" — shown on the tile */
	duration: z.string(),
	/** CSS grid span variant */
	variant: TileVariant,
	/** R2 / local path for the looping MP4 bento preview */
	mp4: z.string(),
	/** R2 / local path for the WebM variant (served first to modern browsers) */
	webm: z.string().optional(),
	/** Poster image for the tile (webp preferred) */
	poster: z.string(),
	/** Focal point for the placeholder gradient (0–100%) */
	px: z.number().min(0).max(100).default(30),
	py: z.number().min(0).max(100).default(25),
	/**
	 * Cloudflare Stream video ID for long-form story version.
	 * When set, the lightbox shows a Stream iframe instead of the R2 video.
	 */
	streamId: z.string().optional(),
	/** Pillar this clip belongs to (for Work page sample tiles) */
	pillar: z.enum(['fitness', 'diet', 'storytelling', 'bento']).default('bento'),
})

export type VideoItem = z.infer<typeof VideoItemSchema>

/**
 * Ordered bento tile layout — 15 items matching the prototype grid.
 * Source files: videos/*.MOV → transcoded to public/videos/*.mp4 + .webm
 * Poster frames: public/posters/*.jpg
 *
 * Variant layout (15 tiles):
 * big  v    v    sq   wide  v    v-tall  sq
 * v    wide v    sq   v-tall v   wide    v
 */
export const videos: VideoItem[] = VideoItemSchema.array().parse([
	// Row 1
	{
		id: 'reel-01',
		title: 'Reel 01',
		duration: '0:07',
		variant: 'big',
		mp4: `${MEDIA_BASE}/videos/reel-01.mp4`,
		webm: `${MEDIA_BASE}/videos/reel-01.webm`,
		poster: `${MEDIA_BASE}/posters/reel-01.jpg`,
		px: 50, py: 50,
		pillar: 'bento',
	},
	{
		id: 'reel-02',
		title: 'Reel 02',
		duration: '0:05',
		variant: 'v',
		mp4: `${MEDIA_BASE}/videos/reel-02.mp4`,
		webm: `${MEDIA_BASE}/videos/reel-02.webm`,
		poster: `${MEDIA_BASE}/posters/reel-02.jpg`,
		px: 50, py: 30,
		pillar: 'bento',
	},
	{
		id: 'reel-03',
		title: 'Reel 03',
		duration: '0:08',
		variant: 'v',
		mp4: `${MEDIA_BASE}/videos/reel-03.mp4`,
		webm: `${MEDIA_BASE}/videos/reel-03.webm`,
		poster: `${MEDIA_BASE}/posters/reel-03.jpg`,
		px: 50, py: 40,
		pillar: 'fitness',
	},
	{
		id: 'reel-04',
		title: 'Reel 04',
		duration: '0:08',
		variant: 'sq',
		mp4: `${MEDIA_BASE}/videos/reel-04.mp4`,
		webm: `${MEDIA_BASE}/videos/reel-04.webm`,
		poster: `${MEDIA_BASE}/posters/reel-04.jpg`,
		px: 50, py: 30,
		pillar: 'diet',
	},
	{
		id: 'reel-05',
		title: 'Reel 05',
		duration: '0:04',
		variant: 'wide',
		mp4: `${MEDIA_BASE}/videos/reel-05.mp4`,
		webm: `${MEDIA_BASE}/videos/reel-05.webm`,
		poster: `${MEDIA_BASE}/posters/reel-05.jpg`,
		px: 50, py: 50,
		pillar: 'storytelling',
	},
	{
		id: 'reel-06',
		title: 'Reel 06',
		duration: '0:08',
		variant: 'v',
		mp4: `${MEDIA_BASE}/videos/reel-06.mp4`,
		webm: `${MEDIA_BASE}/videos/reel-06.webm`,
		poster: `${MEDIA_BASE}/posters/reel-06.jpg`,
		px: 50, py: 40,
		pillar: 'fitness',
	},
	{
		id: 'reel-07',
		title: 'Reel 07',
		duration: '0:08',
		variant: 'v-tall',
		mp4: `${MEDIA_BASE}/videos/reel-07.mp4`,
		webm: `${MEDIA_BASE}/videos/reel-07.webm`,
		poster: `${MEDIA_BASE}/posters/reel-07.jpg`,
		px: 50, py: 30,
		pillar: 'bento',
	},
	{
		id: 'reel-08',
		title: 'Reel 08',
		duration: '0:08',
		variant: 'sq',
		mp4: `${MEDIA_BASE}/videos/reel-08.mp4`,
		webm: `${MEDIA_BASE}/videos/reel-08.webm`,
		poster: `${MEDIA_BASE}/posters/reel-08.jpg`,
		px: 50, py: 40,
		pillar: 'diet',
	},
	// Row 2
	{
		id: 'reel-09',
		title: 'Reel 09',
		duration: '0:08',
		variant: 'v',
		mp4: `${MEDIA_BASE}/videos/reel-09.mp4`,
		webm: `${MEDIA_BASE}/videos/reel-09.webm`,
		poster: `${MEDIA_BASE}/posters/reel-09.jpg`,
		px: 50, py: 35,
		pillar: 'fitness',
	},
	{
		id: 'reel-10',
		title: 'Reel 10',
		duration: '0:08',
		variant: 'wide',
		mp4: `${MEDIA_BASE}/videos/reel-10.mp4`,
		webm: `${MEDIA_BASE}/videos/reel-10.webm`,
		poster: `${MEDIA_BASE}/posters/reel-10.jpg`,
		px: 50, py: 40,
		pillar: 'storytelling',
	},
	{
		id: 'reel-11',
		title: 'Reel 11',
		duration: '0:08',
		variant: 'v',
		mp4: `${MEDIA_BASE}/videos/reel-11.mp4`,
		webm: `${MEDIA_BASE}/videos/reel-11.webm`,
		poster: `${MEDIA_BASE}/posters/reel-11.jpg`,
		px: 50, py: 40,
		pillar: 'diet',
	},
	{
		id: 'reel-12',
		title: 'Reel 12',
		duration: '0:08',
		variant: 'sq',
		mp4: `${MEDIA_BASE}/videos/reel-12.mp4`,
		webm: `${MEDIA_BASE}/videos/reel-12.webm`,
		poster: `${MEDIA_BASE}/posters/reel-12.jpg`,
		px: 50, py: 40,
		pillar: 'bento',
	},
	{
		id: 'reel-13',
		title: 'Reel 13',
		duration: '0:08',
		variant: 'v-tall',
		mp4: `${MEDIA_BASE}/videos/reel-13.mp4`,
		webm: `${MEDIA_BASE}/videos/reel-13.webm`,
		poster: `${MEDIA_BASE}/posters/reel-13.jpg`,
		px: 50, py: 30,
		pillar: 'storytelling',
	},
	{
		id: 'reel-14',
		title: 'Reel 14',
		duration: '0:08',
		variant: 'v',
		mp4: `${MEDIA_BASE}/videos/reel-14.mp4`,
		webm: `${MEDIA_BASE}/videos/reel-14.webm`,
		poster: `${MEDIA_BASE}/posters/reel-14.jpg`,
		px: 50, py: 35,
		pillar: 'fitness',
	},
	{
		id: 'reel-15',
		title: 'Reel 15',
		duration: '0:08',
		variant: 'wide',
		mp4: `${MEDIA_BASE}/videos/reel-15.mp4`,
		webm: `${MEDIA_BASE}/videos/reel-15.webm`,
		poster: `${MEDIA_BASE}/posters/reel-15.jpg`,
		px: 50, py: 40,
		pillar: 'bento',
	},
])

/** Work page sample tiles — 3 per pillar, drawn from the bento videos */
export const workSamples: Record<'fitness' | 'diet' | 'storytelling', VideoItem[]> = {
	fitness: [
		videos.find((v) => v.id === 'reel-03')!,
		videos.find((v) => v.id === 'reel-06')!,
		videos.find((v) => v.id === 'reel-09')!,
	],
	diet: [
		videos.find((v) => v.id === 'reel-04')!,
		videos.find((v) => v.id === 'reel-08')!,
		videos.find((v) => v.id === 'reel-11')!,
	],
	storytelling: [
		videos.find((v) => v.id === 'reel-05')!,
		videos.find((v) => v.id === 'reel-10')!,
		videos.find((v) => v.id === 'reel-13')!,
	],
}
