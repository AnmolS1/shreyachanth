import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { seo } from '../content/seo'
import { useLenis } from '../hooks/useLenis'
import { useHeroPin } from '../hooks/useHeroPin'

// Wave 2 components — filled in by T07, T08, T10 subagents
import Hero from '../components/Hero'
import About from '../components/About'
import VideoBento from '../components/VideoBento'
import InstagramRail from '../components/InstagramRail'
import TrustedBy from '../components/TrustedBy'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
}

export default function Home() {
  const heroRef = useRef<HTMLElement>(null!)
  const lenisRef = useLenis()
  useHeroPin(heroRef, lenisRef)

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
    >
      <Helmet>
        <title>{seo.defaultTitle}</title>
        <meta name="description" content={seo.defaultDescription} />
        <link rel="canonical" href={seo.siteUrl} />
        <meta property="og:title" content={seo.siteName} />
        <meta property="og:description" content={seo.defaultDescription} />
        <meta property="og:image" content={seo.ogImage} />
        <meta property="og:url" content={seo.siteUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* 01 – Hero (three.js particle field + headline + stats) */}
      <Hero ref={heroRef} />

      {/* 02 – About dossier */}
      <About />

      {/* 03 – Video bento grid */}
      <VideoBento />

      {/* 04 – Instagram rail */}
      <InstagramRail />

      {/* 05 – Trusted by */}
      <TrustedBy variant="home" />
    </motion.div>
  )
}
