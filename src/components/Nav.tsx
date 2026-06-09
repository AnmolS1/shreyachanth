/**
 * Nav — persistent site header.
 *
 * Desktop (>640px): single-row wordmark + nav links, matching the prototype.
 * Mobile (≤640px): wordmark + hamburger button; nav links appear as a full-width
 * dropdown panel when opened. Closes on: link click (route change), Escape, route change.
 *
 * The `.is-condensed` class condenses the header height and increases backdrop opacity
 * after 24px of scroll — matches prototype's `.is-condensed` behaviour.
 */
import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

function NavItem({
  to,
  end,
  children,
}: {
  to: string
  end?: boolean
  children: React.ReactNode
}) {
  const { pathname } = useLocation()
  const isActive = end ? pathname === to : pathname.startsWith(to)

  return (
    <Link
      to={to}
      className={`nav-link${isActive ? ' is-active' : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  )
}

export default function Nav() {
  const [condensed, setCondensed] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // Condense header after 24px scroll
  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change (covers clicking nav links)
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Close mobile menu on Escape
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header className={`site-header${condensed ? ' is-condensed' : ''}`}>
      <nav className="nav" aria-label="Main">
        <Link
          to="/"
          className="wordmark"
          aria-label="Shreya Chanth — home"
        >
          Shreya<span className="sep">·</span>Chanth
        </Link>

        {/* Hamburger — visible only at ≤640px (CSS hides it above) */}
        <button
          className="nav-hamburger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <span className="nav-hamburger-bar" aria-hidden="true" />
          <span className="nav-hamburger-bar" aria-hidden="true" />
          <span className="nav-hamburger-bar" aria-hidden="true" />
        </button>

        {/* Nav links — desktop: flex row; mobile: absolute dropdown panel */}
        <div
          id="nav-links"
          className={`nav-links${open ? ' is-open' : ''}`}
        >
          <NavItem to="/" end>Home</NavItem>
          <NavItem to="/work">Work with me</NavItem>
          <NavItem to="/contact">Contact</NavItem>
        </div>
      </nav>
    </header>
  )
}
