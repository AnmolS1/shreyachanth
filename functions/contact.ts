/**
 * functions/contact.ts — Cloudflare Pages Function
 * POST /contact — validates, rate-limits, verifies Turnstile, sends via Resend.
 *
 * Security checklist:
 * ✓ Rejects non-JSON content-type before parsing
 * ✓ Zod validation with length caps on every field
 * ✓ CR/LF stripping on header-bound fields (name, email → subject/reply-to)
 * ✓ Silent honeypot discard (looks like success to bots)
 * ✓ Per-IP KV rate limit: 5 submissions / hour (bind KV namespace `RL`)
 * ✓ Turnstile server-side verification with remoteip
 * ✓ Resend res.ok check — never reports success on a failed send
 * ✓ Email sent as plain text only (never html)
 *
 * Env bindings (set in Cloudflare Pages → Settings → Env Vars, encrypted):
 *   RESEND_API_KEY       — Resend API key
 *   TURNSTILE_SECRET_KEY — Cloudflare Turnstile secret key
 * KV binding:
 *   RL                   — rate-limit namespace
 */
import { z } from 'zod'

interface Env {
  RESEND_API_KEY: string
  TURNSTILE_SECRET_KEY: string
  RL: KVNamespace
  CONTACT_DRY_RUN?: string   // set in .dev.vars to skip Resend during local dev
}

const Schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(1).max(5000),
  turnstileToken: z.string().min(1),
  honeypot: z.string().optional(),
})

/** Strip CR/LF from fields that flow into email headers (subject, reply-to) */
const stripCRLF = (s: string) => s.replace(/[\r\n]+/g, ' ').trim()

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // 1. Reject non-JSON before parsing
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return new Response('Unsupported Media Type', { status: 415 })
  }

  // 2. Parse + validate
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return new Response('Bad Request', { status: 400 })
  }
  const parsed = Schema.safeParse(raw)
  if (!parsed.success) {
    return new Response('Bad Request', { status: 400 })
  }
  const { name, email, message, turnstileToken, honeypot } = parsed.data

  // 3. Honeypot — silent discard (looks like success to the bot)
  if (honeypot) {
    return Response.json({ ok: true })
  }

  // 4. Per-IP rate limit (5 per hour)
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  const hits = Number((await env.RL.get(`rl:${ip}`)) ?? 0)
  if (hits >= 5) {
    return new Response('Too Many Requests', { status: 429 })
  }
  await env.RL.put(`rl:${ip}`, String(hits + 1), { expirationTtl: 3600 })

  // 5. Turnstile server-side verification
  try {
    const ver = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
        remoteip: ip,
      }),
    })
    const result = await ver.json<{ success: boolean }>()
    if (!result.success) {
      return new Response('Forbidden', { status: 403 })
    }
  } catch {
    return new Response('Verification failed', { status: 502 })
  }

  // 6. Dev dry-run: skip Resend entirely (set CONTACT_DRY_RUN in .dev.vars for local testing)
  if (env.CONTACT_DRY_RUN) {
    return Response.json({ ok: true })
  }

  // 7. Send via Resend — plain text only; strip CR/LF from header fields
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'contact@shreyachanth.com',
        to: 'contact@shreyachanth.com',
        reply_to: stripCRLF(email),
        subject: `Portfolio inquiry from ${stripCRLF(name)}`,
        text: `From: ${stripCRLF(name)} <${stripCRLF(email)}>\n\n${message}`,
      }),
    })
    if (!res.ok) {
      // Never report success on a failed send — client's role="alert" error path fires
      return new Response('Email failed', { status: 502 })
    }
  } catch {
    return new Response('Email failed', { status: 502 })
  }

  return Response.json({ ok: true })
}
