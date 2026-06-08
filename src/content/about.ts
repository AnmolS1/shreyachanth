import { z } from 'zod'

export const StatSchema = z.object({
  /** Target count-up value */
  value: z.number().int().positive(),
  /** Visual unit suffix rendered right after the number e.g. "+" or "k" */
  unit: z.string().optional(),
  /** Mono label below the number */
  label: z.string(),
})

export const SpecRowSchema = z.object({
  /** Left-column mono key */
  label: z.string(),
  /** Right-column value */
  value: z.string(),
  /** Optional right-aligned mono note/number */
  note: z.string().optional(),
})

export const AboutSchema = z.object({
  // ── Identity ──────────────────────────────────────────────────────────────
  name: z.string(),
  portraitAlt: z.string(),

  // ── Hero section ──────────────────────────────────────────────────────────
  eyebrow: z.string(),      // mono label above h1
  heroLine1: z.string(),    // first line of hero h1
  heroLine2: z.string(),    // second line (rendered gold gradient)
  heroSub: z.string(),      // subtitle paragraph below h1
  heroCta1: z.string(),     // primary gold button text
  heroCta2: z.string(),     // ghost button text

  // ── About dossier ─────────────────────────────────────────────────────────
  tagline: z.string(),       // h2 in About section
  bio: z.string(),           // lead paragraph
  specs: z.array(SpecRowSchema).min(1),
  stats: z.array(StatSchema).min(1),
})

export type Stat = z.infer<typeof StatSchema>
export type SpecRow = z.infer<typeof SpecRowSchema>
export type About = z.infer<typeof AboutSchema>

export const about: About = AboutSchema.parse({
  name: 'Shreya Chanth',
  portraitAlt: 'Portrait of Shreya Chanth',

  // ── Hero ──────────────────────────────────────────────────────────────────
  eyebrow: 'Fitness coach · Content creator · [PLACEHOLDER: Location]',
  heroLine1: 'A systems mind,',
  heroLine2: 'applied to the body.',
  heroSub:
    'Strength coaching, nutrition systems, and narrative-led content — three disciplines, one framework. [PLACEHOLDER: positioning copy]',
  heroCta1: 'Work with me',
  heroCta2: 'Get in touch',

  // ── Dossier ───────────────────────────────────────────────────────────────
  tagline: 'A systems mind, applied to the body.',
  bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. [PLACEHOLDER: bio paragraph — replace with real text. Keep the tone disciplined and quiet.]',
  specs: [
    { label: 'Based in',        value: '[PLACEHOLDER: City · Country]' },
    { label: 'Focus',           value: 'Strength · Conditioning · Story', note: '03' },
    { label: 'Coaching since',  value: 'Building, one rep at a time', note: '2025' },
    { label: 'Athletes coached',value: '[PLACEHOLDER: figure]', note: '80+' },
  ],
  stats: [
    { value: 1200, unit: '+', label: 'Sessions logged' },
    { value: 16,              label: 'Programs built'  },
    { value: 400,             label: 'Days in motion'  },
  ],
})
