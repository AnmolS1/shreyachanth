/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** Cloudflare Turnstile site key — public, designed to be in the bundle */
	readonly VITE_TURNSTILE_SITE_KEY: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

/**
 * Network Information API — not in TypeScript's DOM lib because the spec is
 * still unofficial and Safari/Firefox don't implement it. Consumed by
 * src/hooks/useAllowsAutoplay.ts, which treats an absent `connection` as
 * "no signal, allow autoplay".
 * https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation
 */
interface NetworkInformation extends EventTarget {
	readonly saveData?: boolean
	readonly effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
}

interface Navigator {
	readonly connection?: NetworkInformation
}
