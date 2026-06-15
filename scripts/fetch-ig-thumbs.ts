/**
 * scripts/fetch-ig-thumbs.ts
 *
 * Downloads a self-hosted thumbnail for each curated Instagram post.
 * Source of truth: src/content/instagram.ts → curatedPosts[].permalink + id
 *
 * Algorithm per post:
 *   1. Fetch the permalink page with the facebookexternalhit User-Agent
 *      (Instagram serves OG tags to this UA without a login wall).
 *   2. Extract og:image from the HTML.
 *   3. Fetch that image and write public/instagram/<id>.jpg.
 *   4. Optionally resize to ≤ 400px wide via ffmpeg (already installed) to
 *      keep file sizes lean — same approach as the transcode.sh poster pipeline.
 *
 * Usage:  npm run fetch:ig
 *         npx tsx scripts/fetch-ig-thumbs.ts
 *
 * Re-running is safe: existing files are overwritten.
 * If a post's OG image can't be fetched, the post is skipped (still falls
 * back to the .ph placeholder in the rail — no crash).
 */
import { mkdirSync, writeFileSync, statSync } from 'fs'
import { execSync } from 'child_process'
import { resolve } from 'path'

// ── Import the curated list (source of truth) ─────────────────────────────────
import { instagram } from '../src/content/instagram.js'

const OUT_DIR = resolve(process.cwd(), 'public/instagram')
mkdirSync(OUT_DIR, { recursive: true })

// ── Helpers ───────────────────────────────────────────────────────────────────

function decodeHtmlEntities(s: string): string {
	return s
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
}

async function fetchOgImage(permalink: string): Promise<string | null> {
	const res = await fetch(permalink, {
		headers: {
			'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
			Accept: 'text/html,application/xhtml+xml',
		},
		signal: AbortSignal.timeout(15_000),
	})
	if (!res.ok) {
		console.warn(`  ✗ HTTP ${res.status} fetching page: ${permalink}`)
		return null
	}
	const html = await res.text()
	// Match <meta property="og:image" content="..." /> — attribute order may vary
	const m =
		html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ??
		html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
	if (!m) {
		console.warn(`  ✗ og:image not found in page HTML`)
		return null
	}
	return decodeHtmlEntities(m[1])
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
	const res = await fetch(url, {
		headers: { 'User-Agent': 'facebookexternalhit/1.1' },
		signal: AbortSignal.timeout(30_000),
	})
	if (!res.ok) {
		console.warn(`  ✗ HTTP ${res.status} fetching image: ${url}`)
		return false
	}
	const buf = Buffer.from(await res.arrayBuffer())
	writeFileSync(destPath, buf)
	return true
}

function resizeIfPossible(destPath: string): void {
	// Resize to max 400px wide, keep aspect ratio, overwrite in-place.
	// ffmpeg is expected at /opt/homebrew/bin/ffmpeg (same as transcode.sh).
	try {
		execSync(
			`ffmpeg -y -i "${destPath}" -vf "scale='min(400,iw)':-2" "${destPath}.resized.jpg" 2>/dev/null`,
			{ stdio: 'pipe' }
		)
		execSync(`mv "${destPath}.resized.jpg" "${destPath}"`, { stdio: 'pipe' })
	} catch {
		// ffmpeg unavailable or failed — keep the original download, it's fine
	}
}

// ── Main ──────────────────────────────────────────────────────────────────────

let ok = 0
let fail = 0

for (const post of instagram.curatedPosts) {
	const dest = resolve(OUT_DIR, `${post.id}.jpg`)
	console.log(`\n▸ ${post.id}  (${post.permalink})`)

	const ogUrl = await fetchOgImage(post.permalink)
	if (!ogUrl) {
		console.warn(`  ✗ Skipped — could not get og:image`)
		fail++
		continue
	}
	console.log(`  og:image → ${ogUrl.slice(0, 80)}…`)

	const downloaded = await downloadImage(ogUrl, dest)
	if (!downloaded) {
		fail++
		continue
	}

	resizeIfPossible(dest)

	const { size } = statSync(dest)
	console.log(`  ✓ ${dest.replace(process.cwd() + '/', '')}  (${(size / 1024).toFixed(0)} kB)`)
	ok++
}

console.log(`\n=== Done: ${ok} fetched, ${fail} failed ===`)
if (fail > 0) {
	console.log('  Failed posts can be added manually: public/instagram/<id>.jpg')
}
process.exit(fail > 0 ? 1 : 0)
