import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { useLenis } from './hooks'
import Preloader from './components/Preloader'
import Hero from './components/Hero'
import ThesisCallout from './components/ThesisCallout'
import SpecsCounter from './components/SpecsCounter'
import Marquee from './components/Marquee'
import FeaturePairs from './components/FeaturePairs'
import GalleryBand from './components/GalleryBand'
import CinematicOrbit from './components/CinematicOrbit'
import DetailRows from './components/DetailRows'
import CTA from './components/CTA'
import Footer from './components/Footer'
import EmberField from './components/EmberField'
import FilmOverlay from './components/FilmOverlay'
import Cursor from './components/Cursor'
import ScrollProgress from './components/ScrollProgress'

export default function App() {
  const [ready, setReady] = useState(false)

  // Smooth inertia scroll, started once the experience is revealed.
  useLenis(ready)

  // Lock scrolling while the loading veil is up.
  useEffect(() => {
    document.body.style.overflow = ready ? '' : 'hidden'
  }, [ready])

  // Safety net: never trap the visitor behind the loader.
  useEffect(() => {
    const t = window.setTimeout(() => { setReady(true); }, 6000)
    return () => { window.clearTimeout(t); }
  }, [])

  // Once the hero is up, warm the cache for the below-the-fold gallery AVIFs
  // at low priority. Otherwise they only start downloading on near-approach
  // (loading="lazy") and pop in mid-reveal. fetchpriority=low keeps them from
  // competing with the hero clip; type=image/avif means non-AVIF browsers skip
  // and keep their lazy JPG fallback.
  useEffect(() => {
    if (!ready) return
    const links = ['assets/g1.avif', 'assets/g2.avif'].map((href) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.type = 'image/avif'
      link.href = href
      link.setAttribute('fetchpriority', 'low')
      document.head.appendChild(link)
      return link
    })
    return () => { links.forEach((l) => { l.remove(); }); }
  }, [ready])

  return (
    // reducedMotion="user" makes every Framer animation honour the OS
    // "reduce motion" setting — transform/layout tweens resolve instantly while
    // essential opacity fades stay, so the page never moves for visitors who
    // asked it not to.
    <MotionConfig reducedMotion="user">
      {/* First tab stop: jump straight past the decorative chrome to content. */}
      <a
        href="#main"
        className="sr-only z-[80] rounded-full bg-bg-lift px-5 py-3 font-mono text-sm text-ink outline outline-2 outline-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <AnimatePresence>{!ready && <Preloader key="preloader" />}</AnimatePresence>

      {/* Atmosphere + chrome that live above the page, below the loader. */}
      <Cursor />
      <ScrollProgress />
      <EmberField />
      <FilmOverlay />

      <main id="main" tabIndex={-1} className="relative bg-bg text-ink outline-none">
        <Hero onReady={() => { setReady(true); }} />
        <ThesisCallout />
        <SpecsCounter />
        <Marquee />
        <FeaturePairs />
        <GalleryBand />
        <CinematicOrbit />
        <DetailRows />
        <CTA />
        <Footer />
      </main>
    </MotionConfig>
  )
}
