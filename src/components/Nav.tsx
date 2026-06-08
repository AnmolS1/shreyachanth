import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

/** NavItem — uses useLocation to derive active state (avoids NavLink aria-current gotcha). */
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

/**
 * Persistent site header. Condenses (reduces height + increases backdrop opacity)
 * after 24px of scroll, matching the prototype's `.is-condensed` behaviour.
 */
export default function Nav() {
  const [condensed, setCondensed] = useState(false)

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24)
    // Set initial state in case page loads scrolled
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

        <div className="nav-links">
          <NavItem to="/" end>
            Home
          </NavItem>
          <NavItem to="/work">Work with me</NavItem>
          <NavItem to="/contact">Contact</NavItem>
        </div>
      </nav>
    </header>
  )
}
