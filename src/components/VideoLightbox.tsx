/**
 * VideoLightbox — shared lightbox <dialog> for video playback.
 *
 * Used by both VideoBento (Home bento grid) and Work page sample reels.
 * Native <dialog> + showModal() gives us the browser's own focus trap,
 * aria-modal, and Escape-to-close for free.
 *
 * Props:
 *   video          — the VideoItem to show
 *   onClose        — called when the lightbox closes (clear activeVideo state)
 *   returnFocusRef — ref to the tile <button> that opened the lightbox;
 *                    focus returns there on close
 */
import { useRef, useCallback, useId } from 'react'
import type { VideoItem } from '../content/video'

export default function VideoLightbox({
	video,
	onClose,
	returnFocusRef,
}: {
	video: VideoItem
	onClose: () => void
	returnFocusRef: React.RefObject<HTMLButtonElement | null>
}) {
	const dialogRef = useRef<HTMLDialogElement | null>(null)
	const videoRef = useRef<HTMLVideoElement | null>(null)
	const titleId = useId()

	// Open on mount — showModal() for native focus trap + aria-modal
	const attachDialog = useCallback((el: HTMLDialogElement | null) => {
		dialogRef.current = el
		if (el && !el.open) el.showModal()
	}, [])

	const close = useCallback(() => {
		// Pause embedded video before closing
		const vid = videoRef.current
		if (vid) { vid.pause(); vid.currentTime = 0 }
		const iframe = dialogRef.current?.querySelector('iframe')
		if (iframe) { iframe.src = iframe.src } // reset Stream iframe (stop playback)
		dialogRef.current?.close()
		onClose()
		// Return focus to the tile button that triggered this
		returnFocusRef.current?.focus()
	}, [onClose, returnFocusRef])

	// Sync close state when user presses Escape (native dialog behavior)
	const handleNativeClose = useCallback(() => {
		const vid = videoRef.current
		if (vid) { vid.pause(); vid.currentTime = 0 }
		onClose()
		returnFocusRef.current?.focus()
	}, [onClose, returnFocusRef])

	// Portrait: 9:16 (vertical clips); landscape/square: 16:9
	const isPortrait = video.variant === 'v' || video.variant === 'v-tall'
	const aspectRatio = isPortrait ? '9 / 16' : '16 / 9'

	return (
		<dialog
			ref={attachDialog}
			className="lightbox"
			aria-labelledby={titleId}
			onClose={handleNativeClose}
		>
			<div className={`lightbox-inner${isPortrait ? '' : ' lightbox-wide'}`}>
				{/* Close button — above the media area, matches prototype .lightbox-close */}
				<button
					onClick={close}
					aria-label="Close video"
					className="lightbox-close"
				>
					Close ✕
				</button>

				{/* Media area — gold-line border, 4px radius */}
				<div className="lightbox-media" style={{ aspectRatio }}>
					{video.mp4 || video.webm ? (
						// Short-form: R2 / local video
						<video
							ref={videoRef}
							autoPlay
							controls
							playsInline
							loop={false}
							poster={video.poster}
							style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
						>
							{video.webm && <source src={video.webm} type="video/webm" />}
							{video.mp4 && <source src={video.mp4} type="video/mp4" />}
						</video>
					) : (
						// Poster-only fallback
						<img
							src={video.poster}
							alt={video.title}
							style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
						/>
					)}
				</div>

				{/* Caption bar below */}
				<div className="lightbox-bar">
					<span id={titleId} className="mono mono--sm" style={{ color: 'var(--muted)' }}>
						{video.title}
					</span>
					{video.duration && (
						<span className="mono mono--sm mono--gold">{video.duration}</span>
					)}
				</div>
			</div>
		</dialog>
	)
}
