import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

// Sitemap generation plugin — runs at build end
function sitemapPlugin() {
	return {
		name: 'sitemap',
		closeBundle() {
			const baseUrl = 'https://shreyachanth.com'
			const routes = ['/', '/work', '/contact']
			const today = new Date().toISOString().split('T')[0]
			const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
					.map(
						(route) => `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`
					)
					.join('\n')}
</urlset>`
			writeFileSync(resolve(process.cwd(), 'dist/sitemap.xml'), sitemap)
		},
	}
}

export default defineConfig({
	plugins: [react(), sitemapPlugin()],
	build: {
		// Disable modulepreload polyfill — the inline <script> it injects would be
		// blocked by our strict script-src 'self' CSP. Modern browsers don't need it.
		modulePreload: { polyfill: false },
		rollupOptions: {
			output: {
				manualChunks: {
					'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
					'gsap-vendor': ['gsap', '@gsap/react'],
					'motion-vendor': ['framer-motion'],
				},
			},
		},
	},
})
