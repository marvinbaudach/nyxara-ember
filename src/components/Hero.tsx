import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ease } from '../anim'
import VideoSources from './VideoSources'

const SRC_MP4 = 'assets/hero.mp4'
const POSTER = 'assets/hero_poster.jpg' // first frame — shown until decode catches up
const FADE = 0.8 // seconds of crossfade at the loop boundary

interface HeroProps { onReady?: () => void }

// Ambient cinematic hero. The driving take is a single continuous shot, so its
// first and last frames differ; a hard loop would visibly jump. Two stacked
// video layers crossfade into each other at the boundary to hide the restart.
export default function Hero({ onReady }: HeroProps) {
  const aRef = useRef<HTMLVideoElement>(null)
  const bRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const a = aRef.current
    const b = bRef.current
    if (!a || !b) return

    let active: HTMLVideoElement = a
    let idle: HTMLVideoElement = b
    let swapping = false
    let raf = 0

    const kick = (v: HTMLVideoElement) => v.play().catch(() => {})
    void kick(a)

    // Tell the app the hero is showing real frames so the loader can lift.
    const signalReady = () => onReady?.()
    a.addEventListener('playing', signalReady, { once: true })
    a.addEventListener('canplaythrough', signalReady, { once: true })

    const tick = () => {
      const v = active
      if (v.duration && !swapping && v.duration - v.currentTime <= FADE) {
        swapping = true
        idle.currentTime = 0
        void kick(idle)
        idle.style.opacity = '1'
        v.style.opacity = '0'
        const tmp = active
        active = idle
        idle = tmp
        window.setTimeout(() => { swapping = false }, FADE * 1000)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onTouch = () => { void kick(active); window.removeEventListener('pointerdown', onTouch) }
    window.addEventListener('pointerdown', onTouch)

    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointerdown', onTouch) }
  }, [onReady])

  // Landscape footage in a portrait phone viewport: object-cover would zoom to
  // fill height and crop the car's length away. On portrait we switch the sharp
  // layers to object-contain (whole car visible) and fill the would-be empty
  // bars with a blurred, scaled copy of the same clip — cinematic, no dead space.
  const layer = 'absolute inset-0 z-0 h-full w-full object-cover portrait:object-contain transition-opacity duration-[800ms] ease-linear'

  return (
    <section className="relative h-screen w-full overflow-hidden bg-bg">
      {/* Blurred fill behind the contained video — portrait only. Decorative, so
          it loads at metadata priority (it is display:none on landscape) and
          never competes with layer A for the first playable frame. */}
      <video
        className="absolute inset-0 z-0 hidden h-full w-full scale-110 object-cover brightness-[0.55] blur-2xl portrait:block"
        poster={POSTER}
        muted
        loop
        autoPlay
        playsInline
        preload="metadata"
        aria-hidden
      >
        <VideoSources mp4={SRC_MP4} />
      </video>
      {/* Layer A reveals first — gets full preload priority and a poster so the
          frame is visible the instant the loader lifts, before decode catches up. */}
      <video ref={aRef} className={layer} style={{ opacity: 1 }} poster={POSTER} muted playsInline preload="auto" aria-hidden>
        <VideoSources mp4={SRC_MP4} />
      </video>
      {/* Layer B only matters near the first loop boundary (~7s in), by which time
          A has buffered the same file. preload="none" keeps it off the critical path. */}
      <video ref={bRef} className={layer} style={{ opacity: 0 }} muted playsInline preload="none" aria-hidden>
        <VideoSources mp4={SRC_MP4} />
      </video>

      {/* soft dark contrast halo so the wordmark never washes out */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(58% 68% at 50% 56%, oklch(0.11 0.01 50 / 0.74) 0%, oklch(0.11 0.01 50 / 0.32) 45%, oklch(0.11 0.01 50 / 0) 74%), linear-gradient(to bottom, oklch(0.13 0.01 50 / 0.5), oklch(0.13 0.01 50 / 0.08) 28%, oklch(0.13 0.01 50 / 0.1) 70%, oklch(0.13 0.01 50 / 0.75))',
        }}
      />

      <div className="absolute inset-0 z-20 grid place-items-center px-[6vw] text-center">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="mb-6 pl-[0.5em] font-mono text-[clamp(0.7rem,1.2vw,0.95rem)] font-medium tracking-[0.62em] text-ink"
          >
            NYXARA
          </motion.p>

          {/* The wordmark resolves glyph by glyph from a soft clipped rise — the
              kind of theatrical entrance award launches use for the model name. */}
          <h1
            aria-label="Ember"
            className="flex justify-center font-display text-[clamp(4rem,21vw,17rem)] font-medium leading-[0.82] tracking-[-0.02em]"
          >
            {'EMBER'.split('').map((ch, i) => (
              <span key={i} aria-hidden className="overflow-hidden">
                <motion.span
                  className="inline-block"
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 1, delay: 0.15 + i * 0.09, ease }}
                >
                  {ch}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="mt-7 font-mono text-[0.72rem] uppercase tracking-[0.42em] text-muted"
          >
            Ninety nine will <span className="text-accent ember-glow">burn</span>. No more.
          </motion.p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-[4vh] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.36em] text-muted">Scroll</span>
        <motion.span
          aria-hidden
          className="block h-8 w-px bg-gradient-to-b from-accent to-transparent"
          animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: 'top' }}
        />
      </motion.div>
    </section>
  )
}
