import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'
import Preloader from './components/Preloader'
import Hero from './components/Hero'
import ThesisCallout from './components/ThesisCallout'
import FeaturePairs from './components/FeaturePairs'
import GalleryBand from './components/GalleryBand'
import DetailRows from './components/DetailRows'
import CTA from './components/CTA'
import Footer from './components/Footer'

export default function App() {
  const [ready, setReady] = useState(false)

  // Lock scrolling while the loading veil is up.
  useEffect(() => {
    document.body.style.overflow = ready ? '' : 'hidden'
  }, [ready])

  // Safety net: never trap the visitor behind the loader.
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 6000)
    return () => window.clearTimeout(t)
  }, [])

  // Smooth inertia scroll, started once the experience is revealed.
  useEffect(() => {
    if (!ready) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    let raf = 0
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop) }
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
