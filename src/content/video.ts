import { z } from 'zod'

/** Base URL for R2-hosted video assets. */
const MEDIA_BASE = 'https://media.shreyachanth.com'

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
	/**
	 * Full-quality R2 MP4 URL (full length, with audio).
	 * Played in the lightbox.
	 */
	mp4: z.string(),
	/**
	 * Full-quality R2 WebM URL (full length, with audio).
	 * Served first to modern browsers in the lightbox.
	 */
	webm: z.string().optional(),
	/**
	 * Muted preview MP4 (≤8s, 640px wide, no audio).
	 * Used for the bento tile + Work page sample hover animation.
	 */
	previewMp4: z.string().optional(),
	/**
	 * Muted preview WebM (≤8s, 640px wide, no audio).
	 * Served first to modern browsers on tile hover.
	 */
	previewWebm: z.string().optional(),
	/** Poster image for the tile — served from public/posters/, always local */
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
 *
 * NB: `variant` is desktop grid geometry, NOT the media's shape. Measured from
 * public/posters/: 13 of 15 are 360x640 (9:16) and only reel-01 and reel-05 are
 * 640x360 (16:9) — so sq/wide/big tiles are vertical footage cropped by
 * object-fit to tessellate the grid. The <=760px carousel frames every slide at
 * a uniform 9:16 for the same reason, which crops those two wide clips.
 * (reel-12's poster is 360x644, 0.6% off 9:16 — a sub-pixel sliver.)
 */
export const videos: VideoItem[] = VideoItemSchema.array().parse([
	// Row 1
	{
		id: 'reel-01',
		title: 'Reel 01',
		duration: '0:07',
		variant: 'big',
		mp4: `${MEDIA_BASE}/videos/full/reel-01.mp4`,
		webm: `${MEDIA_BASE}/videos/full/reel-01.webm`,
		previewMp4: `${MEDIA_BASE}/videos/preview/reel-01.mp4`,
		previewWebm: `${MEDIA_BASE}/videos/preview/reel-01.webm`,
		poster: '/posters/reel-01.jpg',
		px: 50, py: 50,
		pillar: 'bento',
	},
	{
		id: 'reel-02',
		title: 'Reel 02',
		duration: '0:05',
		variant: 'v',
		mp4: `${MEDIA_BASE}/videos/full/reel-02.mp4`,
		webm: `${MEDIA_BASE}/videos/full/reel-02.webm`,
		previewMp4: `${MEDIA_BASE}/videos/preview/reel-02.mp4`,
		previewWebm: `${MEDIA_BASE}/videos/preview/reel-02.webm`,
		poster: '/posters/reel-02.jpg',
		px: 50, py: 30,
		pillar: 'bento',
	},
	{
		id: 'reel-03',
		title: 'Reel 03',
		duration: '0:08',
		variant: 'v',
		mp4: `${MEDIA_BASE}/videos/full/reel-03.mp4`,
		webm: `${MEDIA_BASE}/videos/full/reel-03.webm`,
		previewMp4: `${MEDIA_BASE}/videos/preview/reel-03.mp4`,
		previewWebm: `${MEDIA_BASE}/videos/preview/reel-03.webm`,
		poster: '/posters/reel-03.jpg',
		px: 50, py: 40,
		pillar: 'fitness',
	},
	{
		id: 'reel-04',
		title: 'Reel 04',
		duration: '0:08',
		variant: 'sq',
		mp4: `${MEDIA_BASE}/videos/full/reel-04.mp4`,
		webm: `${MEDIA_BASE}/videos/full/reel-04.webm`,
		previewMp4: `${MEDIA_BASE}/videos/preview/reel-04.mp4`,
		previewWebm: `${MEDIA_BASE}/videos/preview/reel-04.webm`,
		poster: '/posters/reel-04.jpg',
		px: 50, py: 30,
		pillar: 'diet',
	},
	{
		id: 'reel-05',
		title: 'Reel 05',
		duration: '0:04',
		variant: 'wide',
		mp4: `${MEDIA_BASE}/videos/full/reel-05.mp4`,
		webm: `${MEDIA_BASE}/videos/full/reel-05.webm`,
		previewMp4: `${MEDIA_BASE}/videos/preview/reel-05.mp4`,
		previewWebm: `${MEDIA_BASE}/videos/preview/reel-05.webm`,
		poster: '/posters/reel-05.jpg',
		px: 50, py: 50,
		pillar: 'storytelling',
	},
	{
		id: 'reel-06',
		title: 'Reel 06',
		duration: '0:08',
		variant: 'v',
		mp4: `${MEDIA_BASE}/videos/full/reel-06.mp4`,
		webm: `${MEDIA_BASE}/videos/full/reel-06.webm`,
		previewMp4: `${MEDIA_BASE}/videos/preview/reel-06.mp4`,
		previewWebm: `${MEDIA_BASE}/videos/preview/reel-06.webm`,
		poster: '/posters/reel-06.jpg',
		px: 50, py: 40,
		pillar: 'fitness',
	},
	{
		id: 'reel-07',
		title: 'Reel 07',
		duration: '0:08',
		variant: 'v-tall',
		mp4: `${MEDIA_BASE}/videos/full/reel-07.mp4`,
		webm: `${MEDIA_BASE}/videos/full/reel-07.webm`,
		previewMp4: `${MEDIA_BASE}/videos/preview/reel-07.mp4`,
		previewWebm: `${MEDIA_BASE}/videos/preview/reel-07.webm`,
		poster: '/posters/reel-07.jpg',
		px: 50, py: 30,
		pillar: 'bento',
	},
	{
		id: 'reel-08',
		title: 'Reel 08',
		duration: '0:08',
		variant: 'sq',
		mp4: `${MEDIA_BASE}/videos/full/reel-08.mp4`,
		webm: `${MEDIA_BASE}/videos/full/reel-08.webm`,
		previewMp4: `${MEDIA_BASE}/videos/preview/reel-08.mp4`,
		previewWebm: `${MEDIA_BASE}/videos/preview/reel-08.webm`,
		poster: '/posters/reel-08.jpg',
		px: 50, py: 40,
		pillar: 'diet',
	},
	// Row 2
	{
		id: 'reel-09',
		title: 'Reel 09',
		duration: '0:08',
		variant: 'v',
		mp4: `${MEDIA_BASE}/videos/full/reel-09.mp4`,
		webm: `${MEDIA_BASE}/videos/full/reel-09.webm`,
		previewMp4: `${MEDIA_BASE}/videos/preview/reel-09.mp4`,
		previewWebm: `${MEDIA_BASE}/videos/preview/reel-09.webm`,
		poster: '/posters/reel-09.jpg',
		px: 50, py: 35,
		pillar: 'fitness',
	},
	{
		id: 'reel-10',
		title: 'Reel 10',
		duration: '0:08',
		variant: 'wide',
		mp4: `${MEDIA_BASE}/videos/full/reel-10.mp4`,
		webm: `${MEDIA_BASE}/videos/full/reel-10.webm`,
		previewMp4: `${MEDIA_BASE}/videos/preview/reel-10.mp4`,
		previewWebm: `${MEDIA_BASE}/videos/preview/reel-10.webm`,
		poster: '/posters/reel-10.jpg',
		px: 50, py: 40,
		pillar: 'storytelling',
	},
	{
		id: 'reel-11',
		title: 'Reel 11',
		duration: '0:08',
		variant: 'v',
		mp4: `${MEDIA_BASE}/videos/full/reel-11.mp4`,
		webm: `${MEDIA_BASE}/videos/full/reel-11.webm`,
		previewMp4: `${MEDIA_BASE}/videos/preview/reel-11.mp4`,
		previewWebm: `${MEDIA_BASE}/videos/preview/reel-11.webm`,
		poster: '/posters/reel-11.jpg',
		px: 50, py: 40,
		pillar: 'diet',
	},
	{
		id: 'reel-12',
		title: 'Reel 12',
		duration: '0:08',
		variant: 'sq',
		mp4: `${MEDIA_BASE}/videos/full/reel-12.mp4`,
		webm: `${MEDIA_BASE}/videos/full/reel-12.webm`,
		previewMp4: `${MEDIA_BASE}/videos/preview/reel-12.mp4`,
		previewWebm: `${MEDIA_BASE}/videos/preview/reel-12.webm`,
		poster: '/posters/reel-12.jpg',
		px: 50, py: 40,
		pillar: 'bento',
	},
	{
		id: 'reel-13',
		title: 'Reel 13',
		duration: '0:08',
		variant: 'v-tall',
		mp4: `${MEDIA_BASE}/videos/full/reel-13.mp4`,
		webm: `${MEDIA_BASE}/videos/full/reel-13.webm`,
		previewMp4: `${MEDIA_BASE}/videos/preview/reel-13.mp4`,
		previewWebm: `${MEDIA_BASE}/videos/preview/reel-13.webm`,
		poster: '/posters/reel-13.jpg',
		px: 50, py: 30,
		pillar: 'storytelling',
	},
	{
		id: 'reel-14',
		title: 'Reel 14',
		duration: '0:08',
		variant: 'v',
		mp4: `${MEDIA_BASE}/videos/full/reel-14.mp4`,
		webm: `${MEDIA_BASE}/videos/full/reel-14.webm`,
		previewMp4: `${MEDIA_BASE}/videos/preview/reel-14.mp4`,
		previewWebm: `${MEDIA_BASE}/videos/preview/reel-14.webm`,
		poster: '/posters/reel-14.jpg',
		px: 50, py: 35,
		pillar: 'fitness',
	},
	{
		id: 'reel-15',
		title: 'Reel 15',
		duration: '0:08',
		variant: 'wide',
		mp4: `${MEDIA_BASE}/videos/full/reel-15.mp4`,
		webm: `${MEDIA_BASE}/videos/full/reel-15.webm`,
		previewMp4: `${MEDIA_BASE}/videos/preview/reel-15.mp4`,
		previewWebm: `${MEDIA_BASE}/videos/preview/reel-15.webm`,
		poster: '/posters/reel-15.jpg',
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
