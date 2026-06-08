/* =============================================================================
   SHREYA CHANTH — app shell
   Vanilla JS. Every concern is an isolated, named init function so it ports to a
   React effect 1:1. No globals beyond the IIFE and window.HeroAccent.
   ============================================================================= */
(function () {
	"use strict";

	/* ---- shared helpers ---------------------------------------------------- */
	const $ = (s, r = document) => r.querySelector(s);
	const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
	const prefersReducedMotion = () =>
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const isTouch = () =>
		window.matchMedia("(hover: none), (pointer: coarse)").matches;

	/* =========================================================================
	   ROUTER — hash routes (#/ , #/work , #/contact)
	   Crossfade between views, reset scroll, move focus to the view heading,
	   update document.title. One shared header/footer stays outside .view.
	   ========================================================================= */
	const ROUTES = {
		"/": { view: "view-home", title: "Shreya Chanth — Coach & creator", nav: "home" },
		"/work": { view: "view-work", title: "Work with me — Shreya Chanth", nav: "work" },
		"/contact": { view: "view-contact", title: "Contact — Shreya Chanth", nav: "contact" },
	};

	let currentRoute = null;

	function parseHash() {
		const raw = (location.hash || "#/").replace(/^#/, "");
		return ROUTES[raw] ? raw : "/";
	}

	function initRouter() {
		window.addEventListener("hashchange", () => navigateTo(parseHash()));
		navigateTo(parseHash(), true);
	}

	function navigateTo(route, isInitial = false) {
		if (route === currentRoute) return;
		const conf = ROUTES[route];
		const incoming = document.getElementById(conf.view);
		if (!incoming) return;

		// outgoing
		$$(".view.is-current").forEach((v) => {
			v.classList.remove("is-current", "is-entering");
		});

		// Home owns the three.js + autoplay previews; tear them down on leave.
		if (route !== "/") onLeaveHome();

		incoming.classList.add("is-current");
		if (!isInitial && !prefersReducedMotion()) {
			incoming.classList.add("is-entering");
		}

		// reset scroll + active nav + title + focus
		window.scrollTo({ top: 0, behavior: "auto" });
		setActiveNav(conf.nav);
		document.title = conf.title;

		const heading = incoming.querySelector("[data-view-heading]");
		if (heading) {
			heading.setAttribute("tabindex", "-1");
			// focus without yanking scroll
			heading.focus({ preventScroll: true });
		}

		// re-arm reveals inside the freshly shown view
		armReveals(incoming);

		if (route === "/") onEnterHome();
		currentRoute = route;
	}

	function setActiveNav(nav) {
		$$(".nav-link").forEach((a) => {
			a.classList.toggle("is-active", a.dataset.nav === nav);
		});
	}

	/* =========================================================================
	   HOME lifecycle — three.js + bento previews live ONLY while Home is shown
	   ========================================================================= */
	let heroObserver = null;

	function onEnterHome() {
		if (prefersReducedMotion()) return;       // skip three.js entirely
		if (!window.HeroAccent) return;
		if (!window.HeroAccent.running && !heroInitialised) {
			window.HeroAccent.init();
			heroInitialised = true;
		} else {
			window.HeroAccent.resume();
		}
		observeHeroVisibility();
		resumeBentoPreviews();
	}
	let heroInitialised = false;

	function onLeaveHome() {
		if (window.HeroAccent) window.HeroAccent.pause();
		if (heroObserver) { heroObserver.disconnect(); heroObserver = null; }
		pauseBentoPreviews();
	}

	// pause the canvas RAF whenever the hero scrolls out of view
	function observeHeroVisibility() {
		const hero = document.getElementById("hero-canvas");
		if (!hero || heroObserver) return;
		heroObserver = new IntersectionObserver((entries) => {
			entries.forEach((e) => {
				if (!window.HeroAccent) return;
				if (e.isIntersecting) window.HeroAccent.resume();
				else window.HeroAccent.pause();
			});
		}, { threshold: 0.05 });
		heroObserver.observe(hero);
	}

	/* =========================================================================
	   SCROLL REVEALS — IntersectionObserver (NOT animation-timeline; iOS-safe)
	   transform/opacity only; ports straight to a React effect.
	   ========================================================================= */
	let revealObserver = null;

	function initReveals() {
		if (prefersReducedMotion()) {
			$$(".reveal").forEach((el) => el.classList.add("is-visible"));
			return;
		}
		revealObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					if (entry.target.hasAttribute("data-count")) runCountUp(entry.target);
					revealObserver.unobserve(entry.target);
				}
			});
		}, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
		armReveals(document);
	}

	// (re)observe reveal/count nodes inside a scope — called on each view switch
	function armReveals(scope) {
		if (prefersReducedMotion()) {
			$$(".reveal", scope).forEach((el) => el.classList.add("is-visible"));
			$$("[data-count]", scope).forEach((el) => setCountFinal(el));
			return;
		}
		if (!revealObserver) return;
		$$(".reveal:not(.is-visible)", scope).forEach((el) => revealObserver.observe(el));
		$$("[data-count]", scope).forEach((el) => {
			if (!el.classList.contains("counted")) revealObserver.observe(el);
		});
	}

	/* =========================================================================
	   COUNT-UPS — ease toward target with the signature curve
	   ========================================================================= */
	function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

	function setCountFinal(el) {
		el.classList.add("counted");
		const target = parseFloat(el.dataset.count);
		el.querySelector("[data-count-val]").textContent = formatNum(target, el.dataset.decimals);
	}

	function runCountUp(el) {
		if (el.classList.contains("counted")) return;
		el.classList.add("counted");
		const target = parseFloat(el.dataset.count);
		const dur = 1400;
		const valEl = el.querySelector("[data-count-val]");
		const decimals = el.dataset.decimals;
		const start = performance.now();
		function tick(now) {
			const t = Math.min((now - start) / dur, 1);
			const v = target * easeOutExpo(t);
			valEl.textContent = formatNum(v, decimals);
			if (t < 1) requestAnimationFrame(tick);
			else valEl.textContent = formatNum(target, decimals);
		}
		requestAnimationFrame(tick);
	}

	function formatNum(v, decimals) {
		if (decimals) return v.toFixed(parseInt(decimals, 10));
		return Math.round(v).toLocaleString("en-US");
	}

	/* =========================================================================
	   NAV condense on scroll
	   ========================================================================= */
	function initNavCondense() {
		const header = $(".site-header");
		if (!header) return;
		const onScroll = () => header.classList.toggle("is-condensed", window.scrollY > 24);
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
	}

	/* =========================================================================
	   CUSTOM CURSOR — lerped ring + dot, gilds over interactive targets
	   Disabled on touch + under reduced motion.
	   ========================================================================= */
	function initCustomCursor() {
		if (isTouch() || prefersReducedMotion()) return;
		const ring = $(".cursor-ring");
		const dot = $(".cursor-dot");
		if (!ring || !dot) return;
		document.documentElement.classList.add("has-custom-cursor");

		let mx = window.innerWidth / 2, my = window.innerHeight / 2;
		let rx = mx, ry = my;

		window.addEventListener("pointermove", (e) => {
			mx = e.clientX; my = e.clientY;
			dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
		});

		// ring trails with a little lag for a machined feel
		(function ringLoop() {
			rx += (mx - rx) * 0.18;
			ry += (my - ry) * 0.18;
			ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
			requestAnimationFrame(ringLoop);
		})();

		const INTERACTIVE = "a, button, [data-cursor], .tile, .ig-card, .logo-cell, input, textarea";
		document.addEventListener("pointerover", (e) => {
			if (e.target.closest(INTERACTIVE)) {
				ring.classList.add("is-active");
				dot.classList.add("is-active");
			}
		});
		document.addEventListener("pointerout", (e) => {
			if (e.target.closest(INTERACTIVE)) {
				ring.classList.remove("is-active");
				dot.classList.remove("is-active");
			}
		});
	}

	/* =========================================================================
	   BENTO video previews
	   Prototype: posters + CSS sheen stand in for muted/looped/playsinline clips.
	   The lifecycle below is the real seam — in the React build, swap the poster
	   for a <video> and call .play()/.pause() in these two functions.
	   ========================================================================= */
	let bentoObserver = null;

	function initBentoPreviews() {
		// In production: observe tiles, .play() the muted loop in view, .pause() out.
		// Here we toggle a class that drives the CSS preview so behaviour is testable.
		bentoObserver = new IntersectionObserver((entries) => {
			entries.forEach((e) => {
				e.target.classList.toggle("in-view", e.isIntersecting);
			});
		}, { threshold: 0.5 });
		$$(".tile").forEach((t) => bentoObserver.observe(t));
	}

	function pauseBentoPreviews() {
		// React port: querySelectorAll('.tile video').forEach(v => v.pause())
		$$(".tile.in-view").forEach((t) => t.classList.remove("in-view"));
	}
	function resumeBentoPreviews() {
		// React port: replay in-view clips
	}

	/* =========================================================================
	   LIGHTBOX
	   ========================================================================= */
	function initLightbox() {
		const box = $(".lightbox");
		if (!box) return;
		const media = $(".lightbox-media .ph", box) || $(".lightbox-media", box);
		const idxEl = $("[data-lb-idx]", box);
		const lblEl = $("[data-lb-label]", box);
		let lastFocus = null;

		function open(tile) {
			lastFocus = document.activeElement;
			const ph = tile.querySelector(".ph");
			if (ph && media) media.style.setProperty("--px", ph.style.getPropertyValue("--px") || "40%");
			idxEl.textContent = tile.dataset.idx || "—";
			lblEl.textContent = tile.dataset.label || "Reel";
			box.classList.add("is-open");
			box.setAttribute("aria-hidden", "false");
			$(".lightbox-close", box).focus();
			document.addEventListener("keydown", onKey);
		}
		function close() {
			box.classList.remove("is-open");
			box.setAttribute("aria-hidden", "true");
			document.removeEventListener("keydown", onKey);
			if (lastFocus) lastFocus.focus();
		}
		function onKey(e) { if (e.key === "Escape") close(); }

		$$(".tile").forEach((tile) => {
			tile.addEventListener("click", () => open(tile));
			tile.addEventListener("keydown", (e) => {
				if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(tile); }
			});
		});
		$(".lightbox-close", box).addEventListener("click", close);
		box.addEventListener("click", (e) => { if (e.target === box) close(); });
	}

	/* =========================================================================
	   INSTAGRAM rail — subtle cursor-reactive parallax on the cards
	   Integration seam: see IG_CONFIG below.
	   ========================================================================= */
	// -- Instagram integration config (stubbed; real wiring in the React build) --
	//    mode "behold"  -> fetch from Behold (free tier ~1,200 views/mo), cache a
	//                      few hours to protect quota, revalidate on a timer.
	//    mode "curated" -> render IG_CONFIG.curated[] (PR-reviewed, schema-checked).
	//    A malformed curated edit should fail the Cloudflare Pages PREVIEW build,
	//    never the live site.
	const IG_CONFIG = {
		mode: "curated",            // "behold" | "curated"
		beholdId: "REPLACE_WITH_BEHOLD_FEED_ID",
		cacheHours: 4,
		curated: [
			// { id, permalink, mediaType, thumbnail, caption }  <- placeholders rendered in markup
		],
	};

	function initInstagramRail() {
		if (prefersReducedMotion()) return;
		const rail = $(".ig-rail");
		if (!rail) return;
		const cards = $$(".ig-card", rail);
		rail.addEventListener("pointermove", (e) => {
			const r = rail.getBoundingClientRect();
			const rel = (e.clientX - r.left) / r.width - 0.5;
			cards.forEach((c, i) => {
				const depth = (i % 3 + 1) * 2.2;
				c.style.transform = `translateY(${rel * depth}px)`;
			});
		});
		rail.addEventListener("pointerleave", () => {
			cards.forEach((c) => (c.style.transform = ""));
		});
	}

	/* =========================================================================
	   CONTACT form (stub) — usable mailto fallback + confirmation state
	   React build posts to Formspree/Resend instead.
	   ========================================================================= */
	function initContactForm() {
		const form = $("#contact-form");
		if (!form) return;
		form.addEventListener("submit", (e) => {
			e.preventDefault();
			const data = new FormData(form);
			const subject = encodeURIComponent("New enquiry via shreyachanth.com");
			const body = encodeURIComponent(
				`From: ${data.get("name") || ""} <${data.get("email") || ""}>\n\n${data.get("message") || ""}`
			);
			// mailto: fallback — replace with Formspree/Resend POST in production
			window.location.href = `mailto:hello@placeholder.com?subject=${subject}&body=${body}`;
			const ok = $("#contact-ok");
			if (ok) ok.hidden = false;
		});
	}

	/* =========================================================================
	   GSAP PINNED MOMENT — intentionally NOT built in this prototype.
	   React build: register ScrollTrigger and pin/scrub ONE hero moment here
	   (e.g. the stat line counting as the hero text parallaxes up). Keep it to a
	   single scrubbed beat — restraint is the brand.
	   ------------------------------------------------------------------------
	   // gsap.registerPlugin(ScrollTrigger);
	   // ScrollTrigger.create({ trigger: ".hero", pin: ".hero .container",
	   //   start: "top top", end: "+=60%", scrub: true, ... });
	   ========================================================================= */

	/* =========================================================================
	   IN-PAGE SCROLL LINKS — [data-scroll-to] scrolls without touching the route
	   hash (a bare #id would be parsed by the router and bounce us to Home).
	   ========================================================================= */
	function initScrollLinks() {
		document.addEventListener("click", (e) => {
			const link = e.target.closest("[data-scroll-to]");
			if (!link) return;
			const target = document.getElementById(link.dataset.scrollTo);
			if (!target) return;
			e.preventDefault();
			const clearance = 112; // sticky header + pillar sub-nav
			const y = target.getBoundingClientRect().top + window.scrollY - clearance;
			window.scrollTo({ top: y, behavior: prefersReducedMotion() ? "auto" : "smooth" });
		});
	}

	/* =========================================================================
	   PILLAR SCROLLSPY — highlight the active sub-nav link on Work view
	   ========================================================================= */
	function initPillarNav() {
		const links = $$(".pillar-nav a");
		if (!links.length) return;
		const obs = new IntersectionObserver((entries) => {
			entries.forEach((e) => {
				if (!e.isIntersecting) return;
				links.forEach((a) => a.classList.toggle("is-active", a.dataset.scrollTo === e.target.id));
			});
		}, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
		$$("[data-pillar]").forEach((s) => obs.observe(s));
	}

	/* ---- boot -------------------------------------------------------------- */
	function boot() {
		initCustomCursor();
		initNavCondense();
		initReveals();
		initBentoPreviews();
		initLightbox();
		initInstagramRail();
		initContactForm();
		initScrollLinks();
		initPillarNav();
		initRouter();   // last — paints the initial view + fires Home lifecycle
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}
})();
