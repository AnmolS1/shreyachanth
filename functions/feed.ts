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
 */

interface Env {
  FEED_CACHE: KVNamespace
  BEHOLD_FEED_ID: string
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  // 1. Cache hit — serve from KV
  const cached = await env.FEED_CACHE.get('behold', 'json')
  if (cached) {
    return Response.json(cached, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    })
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

  const data = await r.json()

  // 4. Cache for 6 hours
  await env.FEED_CACHE.put('behold', JSON.stringify(data), { expirationTtl: 21600 })

  return Response.json(data, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  })
}
