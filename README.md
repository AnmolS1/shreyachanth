# Shreya Chanth — Portfolio Site

Personal portfolio site for Shreya Chanth, fitness coach and content creator. Built with Vite + React + TypeScript, styled with Tailwind CSS, and deployed to Cloudflare Pages. The approved design in `prototype/index.html` is the canonical source of truth for all visual decisions. The site uses Cloudflare Pages Functions for the contact form and Instagram feed proxy, R2 for self-hosted media, and Resend for email delivery.

---

## Local development

**Requirements:** Node 20+, npm

```bash
npm install
npm run dev        # starts at http://localhost:5173
```

Copy `.env.example` to `.env` and fill in your keys before running locally:

```bash
cp .env.example .env
# edit .env with your Turnstile site key and any other keys you want active locally
```

For local testing of Pages Functions (contact form, Instagram feed proxy):

```bash
# 1. Create .dev.vars from the example (wrangler reads this file for local env vars)
cp .env.example .dev.vars
# Edit .dev.vars — fill in RESEND_API_KEY, TURNSTILE_SECRET_KEY, BEHOLD_FEED_ID, etc.

# 2. Run wrangler in proxy mode (it serves the Pages Functions and forwards
#    everything else to the Vite dev server). KV namespaces run in-memory locally.
npx wrangler pages dev --proxy 5173 -- npm run dev
```

> **Without wrangler** (`npm run dev` only): the `/feed` endpoint returns the Vite
> dev server's fallback HTML, which triggers the `InstagramRail` error handler and
> gracefully renders the curated placeholder posts. This is expected — not a bug.
> The real Behold data only appears when running via wrangler as above.

---

## Safe content editing

> This section is for the site owner. You do not need to understand any code to make these edits safely.

**The golden rule: never commit directly to `main` (or `prod`). Always use a branch.**

Every time you push a branch and open a Pull Request, Cloudflare automatically builds a private preview URL so you can review the change before it goes live. A typo or formatting mistake will fail the preview build — not production — so it is completely safe to experiment.

### Step-by-step content edit workflow

```
1.  git checkout -b content/what-you-are-changing
    # example: git checkout -b content/update-bio

2.  Edit the relevant file in src/content/  (see table below)

3.  git add src/content/
    git commit -m "describe what you changed"
    git push origin content/what-you-are-changing

4.  Open a Pull Request on GitHub
    → Cloudflare automatically posts a preview URL in the PR

5.  Click the preview URL and review the change

6.  Merge the PR → Cloudflare deploys to production automatically
```

### What is safe to edit

| File | What it controls |
|---|---|
| `src/content/about.ts` | Hero heading and subtitle, bio paragraph, spec sheet rows, stat count-up numbers |
| `src/content/instagram.ts` | Curated Instagram posts (captions, links), mode switch between live Behold feed and curated |
| `src/content/logos.ts` | Brand deal / "Trusted by" logos — names, URLs, logo file paths |
| `src/content/rates.ts` | Rate cards — service names, pricing, descriptions, footnotes |
| `src/content/seo.ts` | Page titles, meta descriptions, Open Graph copy, footer tagline |
| `src/content/video.ts` | Video file URLs, titles, durations, aspect ratio variants |

If a content file has a formatting error (for example, a missing comma or a field left blank that is required), the Cloudflare preview build will fail with a clear error message pointing at exactly which field caused the problem. Fix the issue in a new commit on the same branch and push again.

### What NOT to edit without a developer

Any file outside `src/content/` — including `src/components/`, `src/routes/`, `src/three/`, `src/hooks/`, `src/styles/`, and any config file at the repo root — controls the code and design of the site. Edits there require developer review.

---

## Environment variables

See `.env.example` for the full list with descriptions.

**Summary:**

| Variable | Where to set it | Why |
|---|---|---|
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Pages env vars (plain, not encrypted) | Goes into the client bundle — designed to be public |
| `RESEND_API_KEY` | Cloudflare Pages env vars (Encrypted) | Gives send access to the email domain — must stay secret |
| `TURNSTILE_SECRET_KEY` | Cloudflare Pages env vars (Encrypted) | Used server-side to verify Turnstile challenges |
| `BEHOLD_FEED_ID` | Cloudflare Pages env vars (Encrypted) | Handled by the server-side feed proxy — never exposed to visitors |
| `SENTRY_DSN` | Cloudflare Pages env vars (Encrypted) | Optional JS error monitoring |

Never put `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, or `BEHOLD_FEED_ID` in a file that starts with `VITE_` — doing so would expose them in the public JavaScript bundle.

---

## Adding videos

1. Place your source `.MOV` or `.MP4` files in the `videos/` directory at the repo root (this directory is gitignored)
2. Run the transcode script (requires ffmpeg):
   ```bash
   bash scripts/transcode.sh
   ```
   This outputs compressed `.mp4`, `.webm`, and poster `.webp` files into `public/videos/` and `public/posters/`
3. Add an entry for each new video in `src/content/video.ts`, following the existing pattern:
   ```ts
   {
     id: 'reel-17',
     title: 'Your descriptive title here',
     duration: '0:12',
     variant: 'v',               // tile shape: v, v-tall, sq, wide, big
     mp4:    `${MEDIA_BASE}/videos/reel-17.mp4`,
     webm:   `${MEDIA_BASE}/videos/reel-17.webm`,
     poster: `${MEDIA_BASE}/posters/reel-17.webp`,
     pillar: 'fitness',           // fitness | diet | storytelling | bento
   },
   ```
4. Upload the new files to R2 (see `DEPLOY-RUNBOOK.md` Step 4 for upload instructions)
5. Commit `src/content/video.ts` and open a PR as normal

---

## Setting up the live Instagram feed (Behold)

The Instagram rail is already in `'behold'` mode and will show live posts once `BEHOLD_FEED_ID`
is configured. Until then it gracefully falls back to the curated placeholder posts.

### One-time Behold setup

1. Go to [behold.so](https://behold.so) and create a free account.
2. Create a new **feed** and connect it to Shreya's Instagram account.
3. Copy the **Feed ID** from the Behold dashboard (a short alphanumeric string).
4. In Cloudflare Pages → your project → **Settings → Environment Variables**, add:
   - Variable name: `BEHOLD_FEED_ID`
   - Value: the Feed ID from step 3
   - Mark it **Encrypted** (it is server-side only — never put it in `.env` with `VITE_` prefix)
5. Trigger a new Cloudflare deployment (push any commit, or click **Retry deployment**).

The `/feed` Pages Function caches the Behold response for 6 hours in KV, so the quota of
1,200 views/month is not exhausted on every page load.

### Switching back to curated mode

If Behold is unavailable or you want to show hand-picked posts, edit `mode` in
`src/content/instagram.ts`:

```ts
export const instagram: InstagramConfig = InstagramConfigSchema.parse({
  mode: 'curated',   // change back to 'behold' to re-enable the live feed
  ...
})
```

Commit on a branch and open a PR.

### Testing the feed locally

```bash
# Add BEHOLD_FEED_ID to .dev.vars, then run via wrangler:
npx wrangler pages dev --proxy 5173 -- npm run dev
```

See the **Local development** section above for details.

---

## Deploy (first time)

See `DEPLOY-RUNBOOK.md` for the complete step-by-step provisioning guide covering:

- Cloudflare Pages setup
- Environment variables and KV namespace bindings
- R2 bucket creation and custom domain (`media.shreyachanth.com`)
- Resend domain verification and DNS records
- Behold integration
- Post-deploy verification checklist

---

## Tech stack

| Layer | Technology |
|---|---|
| Bundler | Vite 6 |
| UI | React 18, TypeScript |
| Styling | Tailwind CSS |
| Routing | React Router (BrowserRouter) |
| Transitions | framer-motion |
| 3D / particles | three.js via React Three Fiber + Drei |
| Scroll | GSAP + ScrollTrigger, Lenis |
| Metadata | react-helmet-async |
| Schema validation | Zod |
| Captcha | Cloudflare Turnstile |
| Hosting | Cloudflare Pages |
| Serverless functions | Cloudflare Pages Functions |
| Media storage | Cloudflare R2 |
| Edge KV | Cloudflare KV |
| Email | Resend |
| Instagram feed | Behold |
| Error monitoring | Sentry (optional) |

---

## Running tests

```bash
# Validate all content schemas (runs automatically before every build)
npm run validate

# Full production build
npm run build

# Playwright end-to-end smoke suite
# First time only — install the browser:
npx playwright install chromium

npm run test:e2e

# Dependency security audit
npx audit-ci --moderate
```

The CI pipeline (`.github/workflows/ci.yml`) runs all four of these automatically on every Pull Request targeting `main` or `prod`. A PR cannot be merged if any of them fails.

---

## Project structure

```
src/
  routes/        Home.tsx  Work.tsx  Contact.tsx  NotFound.tsx
  components/    Nav  Footer  Hero  HeroStaticFallback  About  VideoBento
                 InstagramRail  TrustedBy  RateCard  ContactForm  ErrorBoundary
  three/         HeroField.tsx
  hooks/         useReveal.ts  useCountUp.ts  useLenis.ts
  content/       about.ts  instagram.ts  logos.ts  rates.ts  seo.ts  video.ts
  styles/        tokens.css
functions/
  contact.ts     Pages Function — form validation, Turnstile, rate limit, Resend
  feed.ts        Pages Function — Behold proxy with KV caching
e2e/             Playwright smoke suite
public/
  _headers       HTTP security headers (CSP, HSTS, etc.)
  _redirects     SPA fallback: /* /index.html 200
  404.html       Pre-hydration static 404 fallback
  fonts/         Self-hosted Inter + IBM Plex Mono woff2
  icons/         Favicon set, PWA icons, og-image.jpg
  images/        Hero fallback image
  videos/        Transcoded MP4/WebM bento loop previews
  posters/       Poster frames for video tiles
scripts/
  transcode.sh   ffmpeg script — source MOV → MP4 + WebM + poster webp
```

---

## Accessibility

The site targets WCAG 2.1 AA. Key implementations:

- Skip-navigation link as the first focusable element on every page
- All video bento tiles are `<button>` elements with descriptive `aria-label`
- Video lightbox uses the native `<dialog>` element with `showModal()` focus management
- Contact form errors are announced via `role="alert" aria-live="assertive"`
- All animations respect `prefers-reduced-motion: reduce` — Lenis, GSAP, three.js, and count-ups are all disabled or instant under reduced motion
- Three.js canvas is `aria-hidden="true"` with a static image fallback

To run an accessibility check locally, install the axe DevTools extension for Firefox and run "Analyze" on each route.
