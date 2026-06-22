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

// Touch-primary device with no mouse/trackpad — i.e. a real phone/tablet whose
// video decoder seeks slowly. Drives the coarse-grained, seek-gated scrub path.
const isCoarsePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: coarse)').matches &&
  !window.matchMedia('(any-pointer: fine)').matches

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

    const coarse = isCoarsePointer()
    let raf = 0
    // Force the first frame to paint as soon as data is ready so the poster
    // gives way to actual footage — otherwise, while progress sits at ~0 the
    // seek threshold below is never crossed, no frame decodes, and the poster
    // lingers until the visitor has scrolled well into the section.
    let primed = false
    // Mobile decoders can only service one seek at a time; firing a fresh
    // currentTime every frame queues seeks faster than they complete and the
    // section stutters. Gate on the decoder: only issue the next seek once the
    // previous one has reported `seeked`. Cleared by the listener below.
    let seeking = false
    const onSeeked = () => { seeking = false; }
    if (coarse) video.addEventListener('seeked', onSeeked)

    // Skip negligible seeks. Coarse devices use a far larger deadband (~1/24s,
    // roughly a frame) so a steady scroll produces a handful of seeks per second
    // instead of 60 — smooth on the decoder, still tracks the scroll.
    const deadband = coarse ? 0.04 : 0.004

    const tick = () => {
      const duration = video.duration
      if (duration && Number.isFinite(duration) && video.readyState >= 2) {
        const rect = track.getBoundingClientRect()
        const total = rect.height - window.innerHeight
        const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1))
        const progress = total > 0 ? scrolled / total : 0
        const target = progress * (duration - 0.05)
        const cur = video.currentTime

        if (!primed) {
          // Nudge currentTime so the decoder paints a frame over the poster.
          video.currentTime = Math.max(target, 0.001)
          primed = true
        } else if (coarse) {
          // Snap straight to target (no easing — easing would mean a stream of
          // micro-seeks the decoder can't keep up with) and only when idle.
          if (!seeking && Math.abs(target - cur) > deadband) {
            seeking = true
            video.currentTime = target
          }
        } else if (Math.abs(target - cur) > deadband) {
          // Desktop seeks fast enough to ease for buttery-smooth scrubbing.
          video.currentTime = cur + (target - cur) * 0.15
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      if (coarse) video.removeEventListener('seeked', onSeeked)
    }
  }, [active])

  return (
    <section
      ref={trackRef}
      aria-label="Cinematic orbit — fly around the Ember"
      className="relative h-[200vh] border-y border-hairline bg-bg md:h-[300vh]"
    >
      {/* Sticky stage holds the viewport-filling clip while the tall track scrolls. */}
      <div className="ember-stage sticky top-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          // Mobile: the clip is landscape and the stage is a tall portrait
          // viewport — object-cover would scale up and slice the car's sides
          // off, which is exactly the silhouette this section sells. Letterbox
          // it instead (object-contain, vertically centered) so every angle
          // stays in frame; the dark stage + vignette read as an intentional
          // cinematic frame. Desktop aspect ratios are close enough to fill.
          className="absolute inset-0 h-full w-full object-contain md:object-cover"
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
