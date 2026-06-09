import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'

import Nav from './components/Nav'
import Footer from './components/Footer'
import Cursor from './components/Cursor'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './routes/Home'
import Work from './routes/Work'
import Contact from './routes/Contact'
import NotFound from './routes/NotFound'

/** Scroll to top + move focus to the route's <h1> on every navigation. */
function RouteChangeEffect() {
  const { pathname } = useLocation()
  const firstRender = useRef(true)

  useEffect(() => {
    // Skip focus scroll on initial load
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    if (firstRender.current) {
      firstRender.current = false
      return
    }

    // Programmatically focus the route heading so screen readers announce it.
    // tabIndex={-1} must be on the h1 in each route; outline suppressed via CSS
    // [data-view-heading]:focus { outline: none }
    const heading = document.querySelector<HTMLElement>('[data-view-heading]')
    if (heading) {
      heading.focus({ preventScroll: true })
    }
  }, [pathname])

  return null
}

function AppShell() {
  const location = useLocation()

  return (
    <>
      {/* Custom gold cursor — disabled on touch / reduced-motion */}
      <Cursor />

      {/* Skip navigation — WCAG 2.4.1 Level A, must be first DOM element */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:ring-2"
        style={{
          // Inline fallback for ring-champagne since Tailwind ring color utilities
          // need a CSS variable that may not resolve correctly in all contexts
          outline: '2px solid var(--gold)',
          outlineOffset: '3px',
          background: 'var(--surface)',
          color: 'var(--text)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-mono)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          borderRadius: '2px',
        }}
      >
        Skip to main content
      </a>

      <RouteChangeEffect />
      <Nav />

      <main id="main-content" tabIndex={-1}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <ErrorBoundary fallback={<div className="container section"><p>Something went wrong.</p></div>}>
                  <Home />
                </ErrorBoundary>
              }
            />
            <Route
              path="/work"
              element={
                <ErrorBoundary fallback={<div className="container section"><p>Something went wrong.</p></div>}>
                  <Work />
                </ErrorBoundary>
              }
            />
            <Route
              path="/contact"
              element={
                <ErrorBoundary fallback={<div className="container section"><p>Something went wrong.</p></div>}>
                  <Contact />
                </ErrorBoundary>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </HelmetProvider>
  )
}
