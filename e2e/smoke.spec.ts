/**
 * Playwright smoke suite — shreyachanth.com
 *
 * Covers (per CLAUDE.md Testing section):
 * 1. Route h1 text — each route renders the expected heading
 * 2. Nav aria-current — active link has aria-current="page" after route change (no full reload)
 * 3. Contact form — mocked /contact endpoint (success + 5xx error paths)
 * 4. 404 page — /bogus-path renders the branded NotFound view
 *
 * Turnstile note: playwright.config.ts builds with Cloudflare's always-pass test key
 * (1x00000000000000000000AA) so the widget auto-completes in headless Chromium.
 * We wait for the hidden cf-turnstile-response input to be populated before submitting.
 */
import { test, expect, Route, type Page } from '@playwright/test'

// ── Route heading assertions ──────────────────────────────────────────────────

test('Home route renders h1', async ({ page }) => {
	await page.goto('/')
	// The hero h1 has data-view-heading; text comes from about.heroLine1 + heroLine2
	const h1 = page.locator('h1[data-view-heading]')
	await expect(h1).toBeVisible({ timeout: 8000 })
})

test('Work route renders h1', async ({ page }) => {
	await page.goto('/work')
	const h1 = page.locator('h1[data-view-heading]')
	await expect(h1).toBeVisible({ timeout: 8000 })
	await expect(h1).toContainText(/work with me/i)
})

test('Contact route renders h1', async ({ page }) => {
	await page.goto('/contact')
	const h1 = page.locator('h1[data-view-heading]')
	await expect(h1).toBeVisible({ timeout: 8000 })
})

// ── Nav aria-current and SPA navigation ──────────────────────────────────────

test('Nav sets aria-current="page" on active link and routes without reload', async ({ page }) => {
	await page.goto('/')

	// Narrow selector to .nav-link to exclude the wordmark (also an <a href="/">) from the match
	const homeLink = page.locator('nav[aria-label="Main"] a.nav-link[href="/"]')
	await expect(homeLink).toHaveAttribute('aria-current', 'page')

	// Click Work link — no full page reload (SPA routing)
	const workLink = page.locator('nav[aria-label="Main"] a.nav-link[href="/work"]')
	await workLink.click()
	await expect(page).toHaveURL('/work')

	// Work link is now active; Home link is not
	await expect(workLink).toHaveAttribute('aria-current', 'page')
	await expect(homeLink).not.toHaveAttribute('aria-current', 'page')
})

// ── Contact form — mocked /contact endpoint ───────────────────────────────────

/**
 * Wait for the Turnstile hidden response input to be populated.
 * The always-pass test key (1x00000000000000000000AA) resolves automatically;
 * this wait ensures the React `onSuccess` state update has propagated before submit.
 */
async function waitForTurnstile(page: Page) {
	await page.waitForFunction(
		() => {
			const input = document.querySelector<HTMLInputElement>(
				'[name="cf-turnstile-response"]'
			)
			return input && input.value.length > 0
		},
		{ timeout: 15000 }
	)
}

test('Contact form shows success message on 200 response', async ({ page }) => {
	// Intercept only POST /contact — GET navigation to /contact must pass through
	await page.route('**/contact', (route: Route) => {
		if (route.request().method() === 'POST') {
			route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ ok: true }),
			})
		} else {
			route.continue()
		}
	})

	await page.goto('/contact')

	// Fill visible form fields (useReveal adds is-visible once in viewport)
	const nameInput = page.locator('input[name="name"]')
	await expect(nameInput).toBeVisible({ timeout: 10000 })
	await nameInput.fill('Test User')
	await page.locator('input[name="email"]').fill('test@example.com')
	await page.locator('textarea[name="message"]').fill('This is a test message from the smoke suite.')

	// Wait for the Turnstile always-pass widget to auto-complete
	await waitForTurnstile(page)

	await page.locator('button[type="submit"]').click()

	// Success message must appear in the role="alert" region
	const alert = page.locator('[role="alert"]')
	await expect(alert).toContainText(/received|sent/i, { timeout: 8000 })
})

test('Contact form shows error message on 5xx response', async ({ page }) => {
	// Intercept only POST /contact — GET navigation to /contact must pass through
	await page.route('**/contact', (route: Route) => {
		if (route.request().method() === 'POST') {
			route.fulfill({
				status: 502,
				contentType: 'text/plain',
				body: 'Email failed',
			})
		} else {
			route.continue()
		}
	})

	await page.goto('/contact')

	const nameInput = page.locator('input[name="name"]')
	await expect(nameInput).toBeVisible({ timeout: 10000 })
	await nameInput.fill('Test User')
	await page.locator('input[name="email"]').fill('test@example.com')
	await page.locator('textarea[name="message"]').fill('This is a test message from the smoke suite.')

	// Wait for the Turnstile always-pass widget to auto-complete
	await waitForTurnstile(page)

	await page.locator('button[type="submit"]').click()

	// Error message must appear — never "success" on a 5xx
	const alert = page.locator('[role="alert"]')
	await expect(alert).toContainText(/failed|error|wrong/i, { timeout: 8000 })
	await expect(alert).not.toContainText(/received|sent/i)
})

// ── 404 / NotFound ────────────────────────────────────────────────────────────

test('Unknown path renders branded 404 page', async ({ page }) => {
	await page.goto('/bogus-path-does-not-exist')

	// The NotFound h1 has data-view-heading
	const h1 = page.locator('h1[data-view-heading]')
	await expect(h1).toBeVisible({ timeout: 8000 })
	await expect(h1).toContainText(/coordinate|grid|found/i)

	// "Return home" CTA button — use .btn class to avoid matching the nav "Home" link
	const homeBtn = page.locator('a.btn[href="/"]').first()
	await expect(homeBtn).toBeVisible()
	await homeBtn.click()
	await expect(page).toHaveURL('/')
})

// ── Skip navigation ───────────────────────────────────────────────────────────

test('Skip-nav link is present and focusable', async ({ page }) => {
	await page.goto('/')

	// Tab to first focusable element — should be the skip-nav link
	await page.keyboard.press('Tab')
	const focused = page.locator(':focus')
	await expect(focused).toHaveText(/skip to main/i)
})
