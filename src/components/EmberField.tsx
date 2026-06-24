import { useEffect, useRef } from 'react'

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
  hue: number
}

const COUNT = 52

export default function EmberField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

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
      hue: 32 + Math.random() * 22, // amber → orange
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

        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4)
        g.addColorStop(0, `oklch(0.8 0.2 ${s.hue} / ${alpha})`)
        g.addColorStop(1, `oklch(0.6 0.2 ${s.hue} / 0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2)
        ctx.fill()

        if (s.life >= s.max || s.y < -20) Object.assign(s, spawn())
      }

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
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 opacity-0 transition-opacity duration-300"
    />
  )
}
