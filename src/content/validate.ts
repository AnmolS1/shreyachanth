/**
 * Content validation script — run via `npm run validate` (uses tsx).
 * All content files call Zod .parse() at module evaluation time, so importing
 * them is sufficient to validate. Any schema violation throws and exits non-zero.
 *
 * Wire into build: package.json "build": "npm run validate && vite build"
 * This causes the Cloudflare Pages preview build to fail on malformed edits,
 * not production.
 */

// Importing each module triggers Zod .parse() — throws on invalid data.
import { about } from './about.ts'
import { videos, workSamples } from './video.ts'
import { instagram } from './instagram.ts'
import { logos } from './logos.ts'
import { rates } from './rates.ts'
import { seo } from './seo.ts'

// Reference exports to silence "unused variable" linters
void about
void videos
void workSamples
void instagram
void logos
void rates
void seo

console.log('✓ Content validation passed — all schemas valid')
