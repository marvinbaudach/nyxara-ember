import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'
import Preloader from './components/Preloader.jsx'
import Hero from './components/Hero.jsx'
import ThesisCallout from './components/ThesisCallout.jsx'
import FeaturePairs from './components/FeaturePairs.jsx'
import GalleryBand from './components/GalleryBand.jsx'
import DetailRows from './components/DetailRows.jsx'
import CTA from './components/CTA.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const [ready, setReady] = useState(false)

  // Lock scrolling while the loading veil is up.
  useEffect(() => {
    document.body.style.overflow = ready ? '' : 'hidden'
  }, [ready])

  // Safety net: never trap the visitor behind the loader.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 6000)
    return () => clearTimeout(t)
  }, [])

  // Smooth inertia scroll, started once the experience is revealed.
  useEffect(() => {
    if (!ready) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    let raf = 0
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); lenis.destroy() }
  }, [ready])

  return (
    <>
      <AnimatePresence>{!ready && <Preloader key="preloader" />}</AnimatePresence>
      <main className="bg-bg text-ink">
        <Hero onReady={() => setReady(true)} />
        <ThesisCallout />
        <FeaturePairs />
        <GalleryBand />
        <DetailRows />
        <CTA />
        <Footer />
      </main>
    </>
  )
}
