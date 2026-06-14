/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** Cloudflare Turnstile site key — public, designed to be in the bundle */
	readonly VITE_TURNSTILE_SITE_KEY: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
