/**
 * HeroField — R3F port of prototype/assets/hero.js
 *
 * 520 champagne gold points drifting toward a loose 3D lattice with sin/cos shimmer,
 * pointer parallax tilt on the group, and slow autorotation. Additive blending, soft
 * sprite generated at runtime (no asset required), DPR cap 1.5.
 *
 * Faithful to prototype/assets/hero.js — same constants, same math, same feel.
 */
import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useLocation } from 'react-router-dom'
import * as THREE from 'three'

// ── Particle constants (verbatim from hero.js) ────────────────────────────────
const COUNT = 520
const SPREAD = 60       // world-space slab size
const GRID_PULL = 0.012 // how strongly points drift toward the lattice
const FOV = 54
const CAMERA_Z = 78
const CHAMPAGNE = new THREE.Color(0xc9a24b)

// ── Soft sprite texture — champagne radial gradient (matches hero.js exactly) ─
function makeSprite(): THREE.CanvasTexture {
	const c = document.createElement('canvas')
	c.width = c.height = 64
	const g = c.getContext('2d')!
	const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
	grd.addColorStop(0, 'rgba(234,209,138,1)')
	grd.addColorStop(0.35, 'rgba(201,162,75,0.65)')
	grd.addColorStop(1, 'rgba(201,162,75,0)')
	g.fillStyle = grd
	g.beginPath()
	g.arc(32, 32, 32, 0, Math.PI * 2)
	g.fill()
	const tex = new THREE.CanvasTexture(c)
	tex.needsUpdate = true
	return tex
}

// ── Grid lattice target positions (verbatim from hero.js buildLattice) ────────
function buildLattice(): Float32Array {
	const grid = new Float32Array(COUNT * 3)
	const perAxis = Math.round(Math.cbrt(COUNT)) // ≈ 8
	let i = 0
	for (let x = 0; x < perAxis && i < COUNT; x++) {
		for (let y = 0; y < perAxis && i < COUNT; y++) {
			for (let z = 0; z < perAxis && i < COUNT; z++) {
				grid[i * 3 + 0] = (x / (perAxis - 1) - 0.5) * SPREAD
				grid[i * 3 + 1] = (y / (perAxis - 1) - 0.5) * SPREAD * 0.62
				grid[i * 3 + 2] = (z / (perAxis - 1) - 0.5) * SPREAD * 0.5
				i++
			}
		}
	}
	// leftover points scatter randomly so the grid stays "loose", not rigid
	for (; i < COUNT; i++) {
		grid[i * 3 + 0] = (Math.random() - 0.5) * SPREAD
		grid[i * 3 + 1] = (Math.random() - 0.5) * SPREAD * 0.62
		grid[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 0.5
	}
	return grid
}

// ── FrameloopController — sets frameloop to "never" when canvas is offscreen ──
// Reads the canvas DOM node from R3F context and wires an IntersectionObserver.
function FrameloopController() {
	const { set, gl } = useThree()

	useEffect(() => {
		const canvas = gl.domElement
		if (!canvas) return

		const observer = new IntersectionObserver(
			([entry]) => {
				set({ frameloop: entry.isIntersecting ? 'always' : 'never' })
			},
			{ threshold: 0 },
		)
		observer.observe(canvas)

		return () => observer.disconnect()
	}, [gl.domElement, set])

	return null
}

// ── Inner scene component (rendered inside <Canvas>) ─────────────────────────
function ParticleScene() {
	const groupRef = useRef<THREE.Group>(null!)
	const pointsRef = useRef<THREE.Points>(null!)
	const sprite = useMemo(() => makeSprite(), [])

	// mutable refs for pointer lerp state — avoid React re-renders on every move
	const pointerRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
	const timeRef = useRef(0)

	// base positions and grid targets — allocated once, mutated every frame
	const { basePositions, gridPositions, initialPositions } = useMemo(() => {
		const gridPositions = buildLattice()
		const basePositions = new Float32Array(COUNT * 3)
		const initialPositions = new Float32Array(COUNT * 3)

		// start scattered, drift toward the lattice (verbatim from hero.js init)
		for (let i = 0; i < COUNT; i++) {
			initialPositions[i * 3 + 0] = (Math.random() - 0.5) * SPREAD * 1.6
			initialPositions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD * 1.1
			initialPositions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 1.0
		}
		basePositions.set(initialPositions)

		return { basePositions, gridPositions, initialPositions }
	}, [])

	// pointermove handler — normalized -0.5..0.5 (matches hero.js onPointer)
	useEffect(() => {
		const onPointer = (e: PointerEvent) => {
			pointerRef.current.tx = e.clientX / window.innerWidth - 0.5
			pointerRef.current.ty = e.clientY / window.innerHeight - 0.5
		}
		window.addEventListener('pointermove', onPointer)
		return () => window.removeEventListener('pointermove', onPointer)
	}, [])

	useFrame(() => {
		if (!pointsRef.current || !groupRef.current) return

		// increment time (matches hero.js: time += 0.0042 per frame at ~60fps)
		timeRef.current += 0.0042
		const t = timeRef.current

		const pts = pointsRef.current
		const pos = (pts.geometry.attributes.position as THREE.BufferAttribute)
			.array as Float32Array

		// per-particle drift + shimmer (verbatim from hero.js loop)
		for (let i = 0; i < COUNT; i++) {
			const ix = i * 3
			const iy = ix + 1
			const iz = ix + 2

			// drift toward lattice
			basePositions[ix] += (gridPositions[ix] - basePositions[ix]) * GRID_PULL
			basePositions[iy] += (gridPositions[iy] - basePositions[iy]) * GRID_PULL
			basePositions[iz] += (gridPositions[iz] - basePositions[iz]) * GRID_PULL

			// gentle organic shimmer so it never locks rigid (verbatim: amplitude 1.1 / 0.8)
			const ph = i * 0.35
			pos[ix] = basePositions[ix] + Math.sin(t + ph) * 1.1
			pos[iy] = basePositions[iy] + Math.cos(t * 0.9 + ph) * 1.1
			pos[iz] = basePositions[iz] + Math.sin(t * 0.7 + ph) * 0.8
		}
		; (pts.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true

		// ease parallax pointer (verbatim: lerp factor 0.04)
		const p = pointerRef.current
		p.x += (p.tx - p.x) * 0.04
		p.y += (p.ty - p.y) * 0.04

		// autorotate + parallax on GROUP (verbatim from hero.js loop)
		groupRef.current.rotation.y = t * 0.12 + p.x * 0.5
		groupRef.current.rotation.x = p.y * 0.3
	})

	return (
		<group ref={groupRef}>
			<points ref={pointsRef}>
				<bufferGeometry>
					<bufferAttribute
						attach="attributes-position"
						count={COUNT}
						array={initialPositions}
						itemSize={3}
					/>
				</bufferGeometry>
				<pointsMaterial
					map={sprite}
					color={CHAMPAGNE}
					size={1.5}
					sizeAttenuation
					blending={THREE.AdditiveBlending}
					depthWrite={false}
					transparent
					opacity={0.9}
				/>
			</points>
		</group>
	)
}

// ── Public component (lazy-loaded by Hero.tsx via React.lazy) ─────────────────
// Route-aware: returns null when not on Home so the GPU goes idle on other routes.
export default function HeroField() {
	const { pathname } = useLocation()
	const isHome = pathname === '/'

	// Track whether we're on Home to avoid Canvas mount/unmount flash on first load
	const [everMounted, setEverMounted] = useState(isHome)
	const setMounted = useCallback(() => setEverMounted(true), [])

	useEffect(() => {
		if (isHome) setMounted()
	}, [isHome, setMounted])

	if (!everMounted) return null

	return (
		<Canvas
			// pause rendering when off-route: frameloop initial state; IntersectionObserver
			// will override to 'never' when scrolled out of view
			frameloop={isHome ? 'always' : 'never'}
			dpr={[1, 1.5]}
			camera={{ fov: FOV, near: 0.1, far: 400, position: [0, 0, CAMERA_Z] }}
			aria-hidden="true"
			role="presentation"
			tabIndex={-1}
			style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
		>
			{/* wires IntersectionObserver → frameloop inside R3F context */}
			<FrameloopController />
			<ParticleScene />
		</Canvas>
	)
}
