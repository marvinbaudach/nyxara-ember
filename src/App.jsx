import { useEffect } from 'react'
import Lenis from 'lenis'
import Hero from './components/Hero.jsx'
import ThesisCallout from './components/ThesisCallout.jsx'
import FeaturePairs from './components/FeaturePairs.jsx'
import GalleryBand from './components/GalleryBand.jsx'
import DetailRows from './components/DetailRows.jsx'
import CTA from './components/CTA.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    let raf = 0
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); lenis.destroy() }
  }, [])

  return (
    <main className="bg-bg text-ink">
      <Hero />
      <ThesisCallout />
      <FeaturePairs />
      <GalleryBand />
      <DetailRows />
      <CTA />
      <Footer />
    </main>
  )
}
