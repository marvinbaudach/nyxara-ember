import { useEffect, useRef, useState } from 'react'
import { useCoarsePointer, usePrefersReducedMotion } from '../hooks'
import VideoSources from './VideoSources'

// Scroll-scrubbed cinematic orbit. Instead of a live WebGL turntable we play a
// pre-rendered fly-around video, with the scroll position driving the video's
// currentTime — so the camera circles the car as the visitor scrolls. This is
// far lighter than a WebGL canvas (no GPU scene, no per-frame raytracing) and
// stays smooth as long as the clip is encoded with dense keyframes for seeking.
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

  // Touch devices don't scrub: scroll-driven video seeking
  // is too jittery on mobile decoders, and pinning the car through a tall track
  // forces a long, awkward scroll. Instead just loop the orbit clip gently —
  // play while the section is on screen, pause otherwise to save battery.
  // Reduced motion: neither loop nor scrub; the stage rests on the opening frame.
  const autoplay = coarse && !reducedMotion
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // Reduced motion switched on mid-session: stop a clip that is already looping.
    if (reducedMotion) video.pause()
    if (!autoplay) return
    video.loop = true
    if (active) video.play().catch(() => { /* autoplay may be blocked; poster stays */ })
    else video.pause()
  }, [autoplay, active, reducedMotion])

  // Desktop scrub loop: map how far the tall track has scrolled through the
  // viewport onto the video timeline. Seeking is expensive, so we never fire a
  // fresh seek every frame — we gate on the decoder, issuing the next seek only
  // once the previous one has reported `seeked`. That caps seeks at decoder
  // throughput (instead of 60/s) while still easing toward the scroll target.
  useEffect(() => {
    if (!active || autoplay || reducedMotion) return
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
  }, [active, autoplay, reducedMotion])

  return (
    <section
      ref={trackRef}
      aria-labelledby="orbit-heading"
      className={`relative z-50 h-dvh border-y border-hairline bg-bg ${reducedMotion ? '' : 'md:h-[300vh]'}`}
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
          <VideoSources mp4={SRC_MP4} />
        </video>

        {/* Edge vignette and a top scrim that keeps the heading legible on the
            brightest frames of the clip. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_45%,oklch(0.12_0.012_50/0.85)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-[oklch(0.12_0.012_50/0.85)] via-[oklch(0.12_0.012_50/0.5)] to-transparent" />

        <div className="wrap pointer-events-none absolute inset-x-0 top-0 pt-16 md:pt-24">
          <h2 id="orbit-heading" className="font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] text-ink">
            Every angle, <span className="text-accent">in your hands</span>
          </h2>
          <p className="mt-4 max-w-xl font-sans text-[clamp(1rem,1.4vw,1.1rem)] text-ink/85">
            {reducedMotion
              ? 'The Ember under a field of light.'
              : autoplay
                ? 'The camera circles the Ember under a field of light.'
                : 'Scroll and the camera circles the Ember under a field of light.'}
          </p>
        </div>
      </div>
    </section>
  )
}

export default CinematicOrbit
