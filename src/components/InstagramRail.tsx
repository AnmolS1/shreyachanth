/**
 * InstagramRail — section 03/04 on Home route.
 * Fetches /feed (Behold proxy), falls back to curatedPosts on any error or empty response.
 *
 * HTML structure mirrors prototype/index.html lines ~310–373 exactly.
 */
import { useEffect, useRef, useState } from 'react'
import { instagram } from '../content/instagram'
import type { IgPost } from '../content/instagram'
import { useReveal } from '../hooks/useReveal'

/**
 * Behold post shape — the /feed function normalises the response to a posts
 * array before returning it, so this interface matches each element.
 * Behold v2 docs: https://behold.so/docs/json-feeds/
 */
interface BeholdPost {
	id: string
	mediaUrl: string
	caption?: string
	/** Behold's own alt text (preferred over caption for img alt) */
	altText?: string
	permalink: string
	mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
	/** Thumbnail for VIDEO posts */
	thumbnailUrl?: string
	/**
	 * Behold's resized/optimised WebP variants.
	 * Keys: small, medium, large, full — each { mediaUrl: string }.
	 * Prefer sizes.medium for cards (~300px wide).
	 */
	sizes?: {
		small?: { mediaUrl: string }
		medium?: { mediaUrl: string }
		large?: { mediaUrl: string }
		full?: { mediaUrl: string }
	}
}

function mapBeholdPost(post: BeholdPost): IgPost {
	// For images: prefer Behold's optimised medium WebP over the raw Instagram CDN URL
	// For videos: prefer the thumbnail (static frame) over the raw video mediaUrl
	let mediaUrl: string | undefined
	if (post.mediaType === 'VIDEO') {
		mediaUrl =
			post.thumbnailUrl ??
			post.sizes?.medium?.mediaUrl ??
			post.sizes?.large?.mediaUrl ??
			post.mediaUrl
	} else {
		mediaUrl =
			post.sizes?.medium?.mediaUrl ??
			post.sizes?.large?.mediaUrl ??
			post.mediaUrl
	}

	return {
		id: post.id,
		caption: post.altText ?? post.caption ?? '',
		permalink: post.permalink,
		mediaUrl,
		px: 30,
		py: 30,
	}
}

export default function InstagramRail() {
	const sectionRef = useRef<HTMLElement>(null)
	useReveal(sectionRef)

	const [posts, setPosts] = useState<IgPost[]>(
		instagram.mode === 'curated' ? instagram.curatedPosts : []
	)
	const [loading, setLoading] = useState(instagram.mode === 'behold')

	useEffect(() => {
		if (instagram.mode !== 'behold') return

		let cancelled = false
		fetch('/feed')
			.then((res) => {
				if (!res.ok) throw new Error(`/feed returned ${res.status}`)
				return res.json() as Promise<BeholdPost[]>
			})
			.then((data) => {
				if (cancelled) return
				// /feed already normalises to a posts array; guard defensively
				if (!Array.isArray(data) || data.length === 0) {
					setPosts(instagram.curatedPosts) // curated fallback
				} else {
					setPosts(data.slice(0, 7).map(mapBeholdPost))
				}
			})
			.catch(() => {
				if (!cancelled) setPosts(instagram.curatedPosts) // graceful fallback
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [])

	return (
		<section
			ref={sectionRef}
			className="section section--tight"
			aria-labelledby="ig-title"
		>
			<div className="container">
				{/* ig-head: section-index + heading on left, IG handle link on right */}
				<div className="ig-head">
					<div>
						<div className="section-index reveal">
							<span className="dot" aria-hidden="true" />
							<span className="mono mono--sm">03 — Instagram</span>
						</div>
						<h2 className="sec-title reveal" id="ig-title">
							From the feed.
						</h2>
					</div>
					<a
						className="btn btn--ghost reveal"
						href={`https://instagram.com/${instagram.instagramHandle.replace('@', '')}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						{instagram.instagramHandle} <span className="arr">↗</span>
					</a>
				</div>
			</div>

			{/* Horizontally scrolling rail — outside container to allow edge-to-edge scroll */}
			<div className="container">
				{loading ? (
					<p className="mono mono--sm" style={{ color: 'var(--faint)', marginTop: 24 }}>
						Loading…
					</p>
				) : (
					<div
						className="ig-rail"
						role="list"
						aria-label="Recent posts from Instagram"
					>
						{posts.map((post, i) => (
							<a
								key={post.id}
								className="ig-card"
								role="listitem"
								href={post.permalink}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={
									post.caption
										? `Instagram post: ${post.caption.slice(0, 80)}`
										: 'Instagram post'
								}
							>
								{post.mediaUrl ? (
									<img
										src={post.mediaUrl}
										alt={post.caption ? post.caption.slice(0, 120) : ''}
										loading="lazy"
										decoding="async"
										style={{ width: '100%', height: '100%', objectFit: 'cover' }}
									/>
								) : (
									<div
										className="ph"
										style={
											{
												'--px': `${post.px}%`,
												'--py': `${post.py}%`,
											} as React.CSSProperties
										}
									/>
								)}
								{/* Hover overlay — View on IG */}
								<div className="ig-hover" aria-hidden="true">
									<span className="glyph">View on IG ↗</span>
								</div>
								{/* Meta tag */}
								<div className="ig-meta">
									<span className="ig-tag">post {String(i + 1).padStart(2, '0')}</span>
								</div>
							</a>
						))}
					</div>
				)}
			</div>
		</section>
	)
}
