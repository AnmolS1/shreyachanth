/**
 * functions/feed.ts — Cloudflare Pages Function
 * GET /feed — proxies Behold Instagram feed with 6-hour KV cache.
 *
 * Why: keeps BEHOLD_FEED_ID server-side (never in client bundle),
 * protects the 1,200 views/month quota from page-load thrashing,
 * and enables graceful degradation to curated fallback on any failure.
 *
 * Client behavior on error:
 *   - Non-200 response → InstagramRail falls back to curated posts
 *   - Empty array → InstagramRail falls back to curated posts
 *   (failures are never cached — a 502 won't poison the cache for 6 hours)
 *
 * Env bindings:
 *   FEED_CACHE — KV namespace for cached Behold response
 *   BEHOLD_FEED_ID — Behold widget ID (server-side only, never VITE_-prefixed)
 *
 * NOTE: Behold's /feeds.behold.so/{id} endpoint returns a JSON OBJECT of the
 * form { username, biography, posts: [...], … } — NOT a bare array.
 * We normalize to the posts array before caching so the client always receives
 * BeholdPost[] and the Array.isArray guard in InstagramRail works correctly.
 */

interface Env {
  FEED_CACHE: KVNamespace
  BEHOLD_FEED_ID: string
}

/**
 * Normalise whatever Behold returns into a plain posts array.
 * Handles three observed shapes:
 *   - { posts: [...], … }   ← current Behold v2 API (object with posts key)
 *   - [...]                  ← possible future bare-array shape / cached legacy
 *   - anything else          ← return null → caller returns 502
 */
function extractPosts(data: unknown): unknown[] | null {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'posts' in data) {
    const posts = (data as Record<string, unknown>).posts
    if (Array.isArray(posts)) return posts
  }
  return null
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  // 1. Cache hit — serve from KV.
  //    The cached value is already a normalised posts array (see step 4 below).
  //    Apply extractPosts defensively in case an old object-shaped value was
  //    cached before this fix was deployed — self-heals on next miss.
  const cached = await env.FEED_CACHE.get('behold', 'json')
  if (cached) {
    const posts = extractPosts(cached)
    if (posts) {
      return Response.json(posts, {
        headers: { 'Cache-Control': 'public, max-age=3600' },
      })
    }
    // Stale/unexpected shape in KV — fall through to a fresh fetch and re-cache
  }

  // 2. Feed ID must be configured
  if (!env.BEHOLD_FEED_ID) {
    return new Response('Not configured', { status: 503 })
  }

  // 3. Fetch from Behold
  let r: Response
  try {
    r = await fetch(`https://feeds.behold.so/${env.BEHOLD_FEED_ID}`)
  } catch {
    return new Response('Upstream error', { status: 502 })
  }

  if (!r.ok) {
    // Do NOT cache a failure — next request will try Behold again
    return new Response('Upstream error', { status: 502 })
  }

  const raw = await r.json()
  const posts = extractPosts(raw)

  if (!posts || posts.length === 0) {
    // Unexpected payload shape or empty feed — do not cache
    return new Response('Upstream returned unexpected data', { status: 502 })
  }

  // 4. Cache the normalised posts ARRAY for 6 hours
  await env.FEED_CACHE.put('behold', JSON.stringify(posts), { expirationTtl: 21600 })

  return Response.json(posts, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  })
}
