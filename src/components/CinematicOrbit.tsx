import { useEffect, useRef, useState } from 'react'
import { useCoarsePointer, usePrefersReducedMotion } from '../hooks'

// Scroll-scrubbed cinematic orbit. Instead of a live WebGL turntable we play a
// pre-rendered fly-around video, with the scroll position driving the video's
// currentTime — so the camera circles the car as the visitor scrolls. This is
// far lighter than a WebGL canvas (no GPU scene, no per-frame raytracing) and
// stays smooth as long as the clip is encoded with dense keyframes for seeking.
const SRC_WEBM = 'assets/orbit.webm'
const SRC_MP4 = 'assets/orbit.mp4'
const POSTER = 'assets/g3.jpg'

const CinematicOrbit = () => {
  const trackRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const coarse = useCoarsePointer()

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

  // Touch devices (and reduced-motion) don't scrub: scroll-driven video seeking
  // is too jittery on mobile decoders, and pinning the car through a tall track
  // forces a long, awkward scroll. Instead just loop the orbit clip gently —
  // play while the section is on screen, pause otherwise to save battery.
  const autoplay = reducedMotion || coarse
  useEffect(() => {
    const video = videoRef.current
    if (!video || !autoplay) return
    video.loop = true
    if (active) video.play().catch(() => { /* autoplay may be blocked; poster stays */ })
    else video.pause()
  }, [autoplay, active])

  // Desktop scrub loop: map how far the tall track has scrolled through the
  // viewport onto the video timeline. Seeking is expensive, so we never fire a
  // fresh seek every frame — we gate on the decoder, issuing the next seek only
  // once the previous one has reported `seeked`. That caps seeks at decoder
  // throughput (instead of 60/s) while still easing toward the scroll target.
  useEffect(() => {
    if (!active || autoplay) return
    const video = videoRef.current
    const track = trackRef.current
    if (!video || !track) return

    let raf = 0
    // Force the first frame to paint as soon as data is ready so the poster
    // gives way to actual footage — otherwise, while progress sits at ~0 the
    // seek threshold below is never crossed, no frame decodes, and the poster
    // lingers until the visitor has scrolled well into the section.
    let primed = false
    // True between issuing a seek and its `seeked` event — the decoder is busy.
    let seeking = false
    const onSeeked = () => { seeking = false; }
    video.addEventListener('seeked', onSeeked)

    const deadband = 0.004

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
          seeking = true
        } else if (!seeking && Math.abs(target - cur) > deadband) {
          // Ease toward target, but only once the decoder is idle. A larger
          // step (0.5) converges in a few decoder-paced seeks rather than a
          // stream of micro-seeks that stutter.
          seeking = true
          video.currentTime = cur + (target - cur) * 0.5
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      video.removeEventListener('seeked', onSeeked)
    }
  }, [active, autoplay])

  return (
    <section
      ref={trackRef}
      aria-label="Cinematic orbit — fly around the Ember"
      className="relative z-50 h-dvh border-y border-hairline bg-bg md:h-[300vh]"
    >
      {/* Sticky stage holds the viewport-filling clip while the tall track
          scrolls. dvh (not vh) so the mobile URL bar collapsing/expanding
          doesn't reflow the stage and jitter the frame up and down. */}
      <div className="ember-stage sticky top-0 h-dvh w-full overflow-hidden">
        <video
          ref={videoRef}
          // Mobile: the clip is landscape and the stage is a tall portrait
          // viewport — object-cover would scale up and slice the car's sides
          // off, which is exactly the silhouette this section sells. Letterbox
          // it instead (object-contain, vertically centered) so every angle
          // stays in frame; the dark stage + vignette read as an intentional
          // cinematic frame. Desktop aspect ratios are close enough to fill.
          className="absolute inset-0 h-full w-full object-contain md:object-cover"
          poster={POSTER}
          muted
          playsInline
          preload="auto"
          aria-hidden
          // No controls / no autoplay: scroll drives the frame.
        >
          <source src={SRC_WEBM} type="video/webm" />
          <source src={SRC_MP4} type="video/mp4" />
        </video>

        {/* Vignette + heading overlaid on the footage. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_45%,oklch(0.12_0.012_50/0.85)_100%)]" />

        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-[1400px] px-6 pt-16 md:pt-24">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.4em] text-accent">Turntable</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.05] text-ink">
            Every angle, <span className="text-accent">in your hands</span>
          </h2>
          <p className="mt-4 max-w-xl font-sans text-[clamp(0.95rem,1.4vw,1.1rem)] text-muted">
            Scroll to fly around the Ember — the camera circles under a field of
            light, reflections pooling on the wet floor.
          </p>
        </div>

        {!autoplay && (
          <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-hairline bg-[oklch(0.205_0.014_50/0.7)] px-4 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-muted backdrop-blur">
            Scroll to orbit
          </div>
        )}
      </div>
    </section>
  )
}

export default CinematicOrbit
