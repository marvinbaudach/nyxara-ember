import { useEffect, useRef, useState } from 'react'

// Scroll-scrubbed cinematic orbit. Instead of a live WebGL turntable we play a
// pre-rendered fly-around video, with the scroll position driving the video's
// currentTime — so the camera circles the car as the visitor scrolls. This is
// far lighter than a WebGL canvas (no GPU scene, no per-frame raytracing) and
// stays smooth as long as the clip is encoded with dense keyframes for seeking.
const SRC = 'assets/orbit.mp4'
const POSTER = 'assets/g3.jpg'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const CinematicOrbit = () => {
  const trackRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState(false)

  // Pause the scrub loop unless the section is on (or near) screen.
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => { for (const e of entries) setActive(e.isIntersecting); },
      { rootMargin: '200px 0px' },
    )
    io.observe(el)
    return () => { io.disconnect(); }
  }, [])

  // Reduced-motion: don't hijack scroll — just loop the clip gently.
  useEffect(() => {
    const video = videoRef.current
    if (!video || !prefersReducedMotion()) return
    video.loop = true
    video.play().catch(() => { /* autoplay may be blocked; poster stays */ })
  }, [])

  // The scrub loop: map how far the tall track has scrolled through the
  // viewport onto the video timeline, easing currentTime toward the target so
  // fast flicks don't make the seek stutter.
  useEffect(() => {
    if (!active || prefersReducedMotion()) return
    const video = videoRef.current
    const track = trackRef.current
    if (!video || !track) return

    let raf = 0
    const tick = () => {
      const duration = video.duration
      if (duration && Number.isFinite(duration)) {
        const rect = track.getBoundingClientRect()
        const total = rect.height - window.innerHeight
        const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1))
        const progress = total > 0 ? scrolled / total : 0
        const target = progress * (duration - 0.05)
        const cur = video.currentTime
        const next = cur + (target - cur) * 0.15
        if (Math.abs(target - cur) > 0.004 && video.readyState >= 2) {
          video.currentTime = next
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); }
  }, [active])

  return (
    <section
      ref={trackRef}
      aria-label="Cinematic orbit — fly around the Ember"
      className="relative h-[300vh] border-y border-hairline bg-bg"
    >
      {/* Sticky stage holds the viewport-filling clip while the tall track scrolls. */}
      <div className="ember-stage sticky top-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={SRC}
          poster={POSTER}
          muted
          playsInline
          preload="auto"
          // No controls / no autoplay: scroll drives the frame.
        />

        {/* Vignette + heading overlaid on the footage. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_45%,oklch(0.12_0.012_50/0.85)_100%)]" />

        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-[1400px] px-6 pt-16 md:pt-24">
          <p className="font-sans text-[0.7rem] uppercase tracking-[0.4em] text-muted">Turntable</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.05] text-ink">
            Every angle, <span className="text-accent">in your hands</span>
          </h2>
          <p className="mt-4 max-w-xl font-sans text-[clamp(0.95rem,1.4vw,1.1rem)] text-muted">
            Scroll to fly around the Ember — the camera circles under a field of
            light, reflections pooling on the wet floor.
          </p>
        </div>

        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-hairline bg-[oklch(0.205_0.014_50/0.7)] px-4 py-1.5 font-sans text-[0.7rem] uppercase tracking-[0.25em] text-muted backdrop-blur">
          Scroll to orbit
        </div>
      </div>
    </section>
  )
}

export default CinematicOrbit
