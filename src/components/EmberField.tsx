import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks'

// Live ember field. A fixed full-viewport canvas of drifting sparks rising like
// heat off the page — the one thing that makes a site named "Ember" feel alive.
// Sparks waft upward with a little turbulence, flare and fade, and lean away
// from the cursor as if pushed by the air it moves. Kept cheap: a capped count,
// DPR clamped to 2, paused when the tab is hidden, and skipped entirely under
// reduced-motion.
interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  life: number
  max: number
  sprite: number // index into the pre-baked glow sprites, by hue bucket
}

const COUNT = 52
const HUE_MIN = 32 // amber
const HUE_MAX = 54 // orange
const SPRITES = 8 // pre-baked glow textures across the hue range
const SPRITE_R = 32 // radius each sprite is baked at; scaled down per draw

// Bake the radial-gradient glow once per hue bucket into offscreen canvases.
// Drawing these with `drawImage` + globalAlpha replaces a `createRadialGradient`
// allocation for every spark every frame (~3000/s) — the dominant cost in the
// loop — with a cheap, GC-free blit.
const bakeSprites = () =>
  Array.from({ length: SPRITES }, (_, i) => {
    const hue = HUE_MIN + (HUE_MAX - HUE_MIN) * (i / (SPRITES - 1))
    const c = document.createElement('canvas')
    c.width = c.height = SPRITE_R * 2
    const g = c.getContext('2d')
    if (!g) return c
    const grad = g.createRadialGradient(SPRITE_R, SPRITE_R, 0, SPRITE_R, SPRITE_R, SPRITE_R)
    grad.addColorStop(0, `oklch(0.8 0.2 ${hue} / 1)`)
    grad.addColorStop(1, `oklch(0.6 0.2 ${hue} / 0)`)
    g.fillStyle = grad
    g.fillRect(0, 0, SPRITE_R * 2, SPRITE_R * 2)
    return c
  })

export default function EmberField() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || reducedMotion) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const sprites = bakeSprites()

    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const pointer = { x: -9999, y: -9999 }

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const spawn = (seed = false): Spark => ({
      x: Math.random() * w,
      y: seed ? Math.random() * h : h + 12,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(0.25 + Math.random() * 0.7),
      r: 0.6 + Math.random() * 1.9,
      life: 0,
      max: 240 + Math.random() * 360,
      sprite: Math.floor(Math.random() * SPRITES), // amber → orange bucket
    })

    const sparks: Spark[] = Array.from({ length: COUNT }, () => spawn(true))

    let raf = 0
    let running = true

    const step = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'

      for (const s of sparks) {
        // Gentle turbulence + buoyancy.
        s.vx += (Math.random() - 0.5) * 0.02
        s.vy -= 0.0015

        // Cursor pushes nearby sparks aside, like displaced hot air.
        const dx = s.x - pointer.x
        const dy = s.y - pointer.y
        const d2 = dx * dx + dy * dy
        if (d2 < 18000) {
          const f = (18000 - d2) / 18000
          const d = Math.sqrt(d2) || 1
          s.vx += (dx / d) * f * 0.5
          s.vy += (dy / d) * f * 0.5
        }

        s.x += s.vx
        s.y += s.vy
        s.life++

        const t = s.life / s.max
        const fade = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85
        const alpha = Math.max(0, fade) * 0.9

        // Blit the pre-baked glow, scaled to this spark's size and faded via
        // globalAlpha — no per-frame gradient allocation.
        const d = s.r * 8 // sprite drawn at diameter r*8 (radius r*4)
        ctx.globalAlpha = alpha
        ctx.drawImage(sprites[s.sprite], s.x - s.r * 4, s.y - s.r * 4, d, d)

        if (s.life >= s.max || s.y < -20) Object.assign(s, spawn())
      }

      ctx.globalAlpha = 1

      if (running) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)

    const onMove = (e: PointerEvent) => { pointer.x = e.clientX; pointer.y = e.clientY }
    const onLeave = () => { pointer.x = -9999; pointer.y = -9999 }
    const onVis = () => {
      running = !document.hidden
      if (running) raf = requestAnimationFrame(step)
      else cancelAnimationFrame(raf)
    }

    // The cinematic hero should stay clean — only let the embers show once the
    // visitor has scrolled past it. Fade the canvas in across the back half of
    // the first viewport so there's no hard pop at the seam.
    const onScroll = () => {
      const start = h * 0.5
      const o = Math.min(1, Math.max(0, (window.scrollY - start) / (h * 0.5)))
      canvas.style.opacity = String(o)
    }
    onScroll()

    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [reducedMotion])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 opacity-0 transition-opacity duration-300"
    />
  )
}
