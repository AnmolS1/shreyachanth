/* =============================================================================
   HERO ACCENT — drifting champagne point field that loosely resolves into a grid
   three.js r128 (loaded from cdnjs).

   Lifecycle contract (so it ports cleanly to a React effect):
	 HeroAccent.init()    -> build scene, start RAF
	 HeroAccent.pause()   -> stop RAF (offscreen / leaving Home), keeps GPU buffers
	 HeroAccent.resume()  -> restart RAF if it was running before
	 HeroAccent.destroy() -> full teardown, dispose geometry/material/renderer

   Hard rules from the brief:
	 - cap devicePixelRatio at 1.5
	 - pause rendering when offscreen (caller wires an IntersectionObserver)
	 - skip entirely under reduced motion (caller checks before init)
	 - never feel heavy / gamer-y: ~520 fine points, additive glint, slow drift
   ============================================================================= */
(function () {
	"use strict";

	const DPR_CAP = 1.5;
	const COUNT = 520;            // fine points — keep light
	const SPREAD = 60;            // world-space slab size
	const GRID_PULL = 0.012;      // how strongly points drift toward the lattice

	let renderer, scene, camera, points, group;
	let raf = null;
	let running = false;
	let canvas = null;
	let basePositions, gridPositions, velocities;
	let pointer = { x: 0, y: 0, tx: 0, ty: 0 };
	let time = 0;

	/* round soft sprite, generated on a canvas so we ship no external asset */
	function makeSprite() {
		const c = document.createElement("canvas");
		c.width = c.height = 64;
		const g = c.getContext("2d");
		const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
		grd.addColorStop(0, "rgba(234,209,138,1)");
		grd.addColorStop(0.35, "rgba(201,162,75,0.65)");
		grd.addColorStop(1, "rgba(201,162,75,0)");
		g.fillStyle = grd;
		g.beginPath();
		g.arc(32, 32, 32, 0, Math.PI * 2);
		g.fill();
		const tex = new THREE.CanvasTexture(c);
		tex.needsUpdate = true;
		return tex;
	}

	/* build the target lattice: a loose 3D grid the cloud resolves toward */
	function buildLattice() {
		const grid = new Float32Array(COUNT * 3);
		const perAxis = Math.round(Math.cbrt(COUNT));
		let i = 0;
		for (let x = 0; x < perAxis && i < COUNT; x++) {
			for (let y = 0; y < perAxis && i < COUNT; y++) {
				for (let z = 0; z < perAxis && i < COUNT; z++) {
					grid[i * 3 + 0] = (x / (perAxis - 1) - 0.5) * SPREAD;
					grid[i * 3 + 1] = (y / (perAxis - 1) - 0.5) * SPREAD * 0.62;
					grid[i * 3 + 2] = (z / (perAxis - 1) - 0.5) * SPREAD * 0.5;
					i++;
				}
			}
		}
		// any leftover points scatter randomly so the grid stays "loose", not rigid
		for (; i < COUNT; i++) {
			grid[i * 3 + 0] = (Math.random() - 0.5) * SPREAD;
			grid[i * 3 + 1] = (Math.random() - 0.5) * SPREAD * 0.62;
			grid[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 0.5;
		}
		return grid;
	}

	function init() {
		canvas = document.getElementById("hero-canvas");
		if (!canvas || typeof THREE === "undefined") return;

		const w = canvas.clientWidth || window.innerWidth;
		const h = canvas.clientHeight || window.innerHeight;

		renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
		renderer.setSize(w, h, false);

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(54, w / h, 0.1, 400);
		camera.position.set(0, 0, 78);

		group = new THREE.Group();
		scene.add(group);

		gridPositions = buildLattice();
		basePositions = new Float32Array(COUNT * 3);
		velocities = new Float32Array(COUNT * 3);

		// start scattered, drift toward the lattice
		for (let i = 0; i < COUNT; i++) {
			basePositions[i * 3 + 0] = (Math.random() - 0.5) * SPREAD * 1.6;
			basePositions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD * 1.1;
			basePositions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 1.0;
		}

		const geo = new THREE.BufferGeometry();
		geo.setAttribute("position", new THREE.BufferAttribute(basePositions, 3));

		const mat = new THREE.PointsMaterial({
			size: 1.5,
			map: makeSprite(),
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			sizeAttenuation: true,
			opacity: 0.9,
			color: new THREE.Color(0xc9a24b),
		});

		points = new THREE.Points(geo, mat);
		group.add(points);

		window.addEventListener("resize", onResize);
		window.addEventListener("pointermove", onPointer);

		running = true;
		loop();
	}

	function onResize() {
		if (!renderer || !canvas) return;
		const w = canvas.clientWidth || window.innerWidth;
		const h = canvas.clientHeight || window.innerHeight;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	}

	function onPointer(e) {
		// normalized -0.5..0.5 for a subtle parallax tilt — never gamer-y
		pointer.tx = (e.clientX / window.innerWidth - 0.5);
		pointer.ty = (e.clientY / window.innerHeight - 0.5);
	}

	function loop() {
		if (!running) return;
		raf = requestAnimationFrame(loop);
		time += 0.0042;

		const pos = points.geometry.attributes.position.array;
		for (let i = 0; i < COUNT; i++) {
			const ix = i * 3, iy = ix + 1, iz = ix + 2;
			// drift toward lattice
			basePositions[ix] += (gridPositions[ix] - basePositions[ix]) * GRID_PULL;
			basePositions[iy] += (gridPositions[iy] - basePositions[iy]) * GRID_PULL;
			basePositions[iz] += (gridPositions[iz] - basePositions[iz]) * GRID_PULL;
			// gentle organic shimmer on top so it never locks rigid
			const ph = i * 0.35;
			pos[ix] = basePositions[ix] + Math.sin(time + ph) * 1.1;
			pos[iy] = basePositions[iy] + Math.cos(time * 0.9 + ph) * 1.1;
			pos[iz] = basePositions[iz] + Math.sin(time * 0.7 + ph) * 0.8;
		}
		points.geometry.attributes.position.needsUpdate = true;

		// ease parallax + slow autorotate
		pointer.x += (pointer.tx - pointer.x) * 0.04;
		pointer.y += (pointer.ty - pointer.y) * 0.04;
		group.rotation.y = time * 0.12 + pointer.x * 0.5;
		group.rotation.x = pointer.y * 0.3;

		renderer.render(scene, camera);
	}

	function pause() {
		running = false;
		if (raf) cancelAnimationFrame(raf);
		raf = null;
	}

	function resume() {
		if (running || !renderer) return;
		running = true;
		loop();
	}

	function destroy() {
		pause();
		window.removeEventListener("resize", onResize);
		window.removeEventListener("pointermove", onPointer);
		if (points) {
			points.geometry.dispose();
			if (points.material.map) points.material.map.dispose();
			points.material.dispose();
		}
		if (renderer) {
			renderer.dispose();
			renderer.forceContextLoss && renderer.forceContextLoss();
		}
		renderer = scene = camera = points = group = null;
	}

	window.HeroAccent = { init, pause, resume, destroy, get running() { return running; } };
})();
