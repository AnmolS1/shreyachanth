/**
 * ContactForm — terminal console form for the Contact route.
 * Uses prototype CSS classes: .terminal, .terminal-bar, .terminal-body, .tfield, .tinput
 *
 * Security checklist (per CLAUDE.md):
 * - Off-screen honeypot: tabIndex={-1}, aria-hidden, NOT display:none
 * - Turnstile: @marsidev/react-turnstile with ref for .reset() after failed submit
 * - role="alert" status div always in DOM; content changes trigger announcement
 * - aria-describedby on each field for inline error messages
 * - Submit button disabled while pending
 * - Token reset after any failed submit (tokens are single-use)
 * - mailto: fallback when VITE_TURNSTILE_SITE_KEY is not configured
 *
 * POSTs to /contact (functions/contact.ts) — wired fully in T15.
 */
import { useState, useRef, useId } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

type Status = 'idle' | 'pending' | 'success' | 'error'

interface FormState {
  name: string
  email: string
  message: string
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

export default function ContactForm() {
  const uid = useId()
  const nameId = `${uid}-name`
  const emailId = `${uid}-email`
  const msgId = `${uid}-message`
  const nameErrId = `${uid}-name-err`
  const emailErrId = `${uid}-email-err`
  const msgErrId = `${uid}-msg-err`

  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [token, setToken] = useState<string | null>(null)

  const turnstileRef = useRef<TurnstileInstance>(null!)

  // ── Client-side validation ─────────────────────────────────────────────────
  function validate(): boolean {
    const e: Partial<FormState> = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'A valid email address is required.'
    if (!form.message.trim()) e.message = 'Message is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return

    // If no site key, fall back to mailto:
    if (!SITE_KEY) {
      const subject = encodeURIComponent(`Portfolio inquiry from ${form.name}`)
      const body = encodeURIComponent(`From: ${form.name} <${form.email}>\n\n${form.message}`)
      window.location.href = `mailto:contact@shreyachanth.com?subject=${subject}&body=${body}`
      return
    }

    if (!token) {
      setErrors((prev) => ({ ...prev, message: 'Please complete the CAPTCHA.' }))
      return
    }

    setStatus('pending')

    try {
      const honeypot =
        (e.currentTarget.elements.namedItem('company') as HTMLInputElement | null)?.value ?? ''

      const res = await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          turnstileToken: token,
          honeypot,
        }),
      })

      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', message: '' })
        setToken(null)
      } else {
        setStatus('error')
        // Reset Turnstile — tokens are single-use
        turnstileRef.current?.reset()
        setToken(null)
      }
    } catch {
      setStatus('error')
      turnstileRef.current?.reset()
      setToken(null)
    }
  }

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const isPending = status === 'pending'

  return (
    <div className="terminal reveal" role="group" aria-label="Contact form">
      {/* Terminal header bar — macOS-style traffic lights */}
      <div className="terminal-bar">
        <span className="dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="ttitle">secure channel // session 0x1A</span>
      </div>

      <form className="terminal-body" onSubmit={handleSubmit} noValidate>
        {/* Decorative connection line — hidden from AT */}
        <p className="terminal-line" aria-hidden="true">
          <span className="gold">›</span> establishing connection…{' '}
          <span className="gold">ok</span>
        </p>

        {/* ── Honeypot — off-screen, not display:none, aria-hidden ── */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-9999px',
            height: 0,
            width: 0,
            overflow: 'hidden',
          }}
        />

        {/* ── Name ────────────────────────────────────────────────── */}
        <div className="tfield">
          <label className="key" htmlFor={nameId}>
            Identify
          </label>
          <div className="inwrap">
            <span className="pr" aria-hidden="true">
              ›
            </span>
            <input
              id={nameId}
              className="tinput"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange('name')}
              autoComplete="name"
              required
              maxLength={100}
              placeholder="your name"
              aria-describedby={errors.name ? nameErrId : undefined}
              aria-invalid={!!errors.name || undefined}
            />
          </div>
          {errors.name && (
            <span id={nameErrId} className="field-error" role="alert">
              {errors.name}
            </span>
          )}
        </div>

        {/* ── Email ───────────────────────────────────────────────── */}
        <div className="tfield">
          <label className="key" htmlFor={emailId}>
            Return address
          </label>
          <div className="inwrap">
            <span className="pr" aria-hidden="true">
              ›
            </span>
            <input
              id={emailId}
              className="tinput"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange('email')}
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@domain.com"
              aria-describedby={errors.email ? emailErrId : undefined}
              aria-invalid={!!errors.email || undefined}
            />
          </div>
          {errors.email && (
            <span id={emailErrId} className="field-error" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        {/* ── Message ─────────────────────────────────────────────── */}
        <div className="tfield">
          <label className="key" htmlFor={msgId}>
            Payload
          </label>
          <div className="inwrap">
            <span className="pr" aria-hidden="true">
              ›
            </span>
            <textarea
              id={msgId}
              className="tinput"
              name="message"
              value={form.message}
              onChange={handleChange('message')}
              required
              maxLength={5000}
              rows={3}
              placeholder="what are we building?"
              aria-describedby={errors.message ? msgErrId : undefined}
              aria-invalid={!!errors.message || undefined}
            />
          </div>
          {errors.message && (
            <span id={msgErrId} className="field-error" role="alert">
              {errors.message}
            </span>
          )}
        </div>

        {/* ── Turnstile ───────────────────────────────────────────── */}
        {SITE_KEY && (
          <div className="turnstile-wrap">
            <Turnstile
              ref={turnstileRef}
              siteKey={SITE_KEY}
              onSuccess={setToken}
              onExpire={() => setToken(null)}
              options={{ theme: 'dark' }}
            />
          </div>
        )}

        {/* ── Submit footer ───────────────────────────────────────── */}
        <div className="terminal-foot">
          <span className="mono mono--sm" style={{ color: 'var(--faint)' }}>
            {SITE_KEY ? 'Complete CAPTCHA then transmit' : 'Enter to send · fallback opens mail'}
          </span>
          <button
            type="submit"
            className="btn btn--gold"
            disabled={isPending}
            aria-disabled={isPending}
          >
            {isPending ? (
              <span>Transmitting…</span>
            ) : (
              <>
                Transmit <span className="arr">→</span>
              </>
            )}
          </button>
        </div>

        {/* ── Status (always in DOM, assertive) ───────────────────── */}
        <div role="alert" aria-live="assertive" aria-atomic="true">
          {status === 'success' && (
            <div className="terminal-log">
              <div>
                <span className="muted">›</span> payload queued…{' '}
                <span style={{ color: 'var(--gold)' }}>ok</span>
              </div>
              <div>
                <span className="muted">›</span> transmission received — I&apos;ll be in touch
                soon. <span style={{ color: 'var(--gold)' }}>end ▮</span>
              </div>
            </div>
          )}
          {status === 'error' && (
            <div
              className="terminal-log"
              style={{ color: '#e07070', borderTopColor: 'rgba(224,112,112,0.3)' }}
            >
              <div>
                <span style={{ color: 'var(--muted)' }}>›</span> transmission failed.{' '}
                <span style={{ color: '#e07070' }}>err</span>
              </div>
              <div>
                <span style={{ color: 'var(--muted)' }}>›</span> please try again or email
                directly. <span style={{ color: '#e07070' }}>end ▮</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Privacy notice ──────────────────────────────────────── */}
        <p
          className="mono mono--sm"
          style={{ color: 'var(--faint)', marginTop: '8px', lineHeight: 1.6 }}
        >
          Your details are used only to respond to your inquiry and are not shared with third
          parties.
        </p>
      </form>
    </div>
  )
}
