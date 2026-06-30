import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks'

// Live ember field. A fixed full-viewport canvas of drifting sparks rising like
// heat off the page — the one thing that makes a site named "Ember" feel alive.
// Sparks waft upward with a little turbulence, flare and fade, and lean away
// from the cursor as if pushed by the air it moves.
//
// Rendering is GPU-first: a WebGL2 pass draws each spark as an additively
// blended point sprite, so the glows pile into real bloom and we can afford far
// more particles. Browsers without WebGL2 fall back to the cheaper 2D-canvas
// blit. Either way it's paused when the tab is hidden and skipped entirely under
// reduced-motion.
interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  life: number
  max: number
  hue: number // amber → orange
}

const HUE_MIN = 32
const HUE_MAX = 54
const GL_COUNT = 150 // GPU can carry many more than the 2D fallback
const FALLBACK_COUNT = 52
const SPRITES = 8
const SPRITE_R = 32

// amber → warmer orange across the hue range, in linear-ish sRGB (0..1).
const colorForHue = (hue: number): [number, number, number] => {
  const t = (hue - HUE_MIN) / (HUE_MAX - HUE_MIN)
  return [1, 0.5 + 0.22 * t, 0.12 + 0.12 * t]
}

// ── WebGL2 renderer ─────────────────────────────────────────────────────────
const VERT = `#version 300 es
in vec2 a_pos;      // device-pixel position
in float a_size;    // point size in device px
in float a_alpha;
in vec3 a_color;
uniform vec2 u_res; // canvas size in device px
out float v_alpha;
out vec3 v_color;
void main() {
  vec2 clip = (a_pos / u_res) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = a_size;
  v_alpha = a_alpha;
  v_color = a_color;
}`

const FRAG = `#version 300 es
precision mediump float;
in float v_alpha;
in vec3 v_color;
out vec4 frag;
void main() {
  // Soft radial falloff that mimics the old radial-gradient sprite.
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  // Premultiplied output for additive (ONE, ONE) blending → glows accumulate.
  frag = vec4(v_color * a * v_alpha, a * v_alpha);
}`

const FLOATS = 7 // x, y, size, alpha, r, g, b

const makeGLRenderer = (gl: WebGL2RenderingContext, count: number) => {
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)
    if (!sh) return null
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    return sh
  }
  const prog = gl.createProgram()
  const vs = compile(gl.VERTEX_SHADER, VERT)
  const fs = compile(gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  const data = new Float32Array(count * FLOATS)
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW)

  const stride = FLOATS * 4
  const attr = (name: string, size: number, offset: number) => {
    const loc = gl.getAttribLocation(prog, name)
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset)
  }
  attr('a_pos', 2, 0)
  attr('a_size', 1, 8)
  attr('a_alpha', 1, 12)
  attr('a_color', 3, 16)
  const uRes = gl.getUniformLocation(prog, 'u_res')

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE)
  gl.clearColor(0, 0, 0, 0)

  return {
    resize() { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight) },
    draw(sparks: Spark[], dpr: number) {
      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i]
        const t = s.life / s.max
        const fade = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85
        const [r, g, b] = colorForHue(s.hue)
        const o = i * FLOATS
        data[o] = s.x * dpr
        data[o + 1] = s.y * dpr
        data[o + 2] = s.r * 8 * dpr
        data[o + 3] = Math.max(0, fade) * 0.9
        data[o + 4] = r
        data[o + 5] = g
        data[o + 6] = b
      }
      gl.uniform2f(uRes, gl.drawingBufferWidth, gl.drawingBufferHeight)
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.POINTS, 0, sparks.length)
    },
    destroy() { gl.deleteBuffer(buf); gl.deleteProgram(prog) },
  }
}

// ── 2D-canvas fallback ──────────────────────────────────────────────────────
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

const make2DRenderer = (ctx: CanvasRenderingContext2D, dpr: number) => {
  const sprites = bakeSprites()
  let w = 0
  let h = 0
  return {
    resize(cssW: number, cssH: number) {
      w = cssW
      h = cssH
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    },
    draw(sparks: Spark[]) {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (const s of sparks) {
        const t = s.life / s.max
        const fade = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85
        const bucket = Math.min(
          SPRITES - 1,
          Math.floor(((s.hue - HUE_MIN) / (HUE_MAX - HUE_MIN)) * SPRITES),
        )
        const d = s.r * 8
        ctx.globalAlpha = Math.max(0, fade) * 0.9
        ctx.drawImage(sprites[bucket], s.x - s.r * 4, s.y - s.r * 4, d, d)
      }
      ctx.globalAlpha = 1
    },
    destroy() { /* nothing to release */ },
  }
}

export default function EmberField() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || reducedMotion) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false })

    let w = 0
    let h = 0
    const pointer = { x: -9999, y: -9999 }

    // Pick the GPU path when available, otherwise the 2D blit.
    const glRenderer = gl ? makeGLRenderer(gl, GL_COUNT) : null
    const ctx2d = glRenderer ? null : canvas.getContext('2d', { alpha: true })
    const renderer2d = ctx2d ? make2DRenderer(ctx2d, dpr) : null
    if (!glRenderer && !renderer2d) return
    const count = glRenderer ? GL_COUNT : FALLBACK_COUNT

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      glRenderer?.resize()
      renderer2d?.resize(w, h)
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
      hue: HUE_MIN + Math.random() * (HUE_MAX - HUE_MIN),
    })

    const sparks: Spark[] = Array.from({ length: count }, () => spawn(true))

    let raf = 0
    let running = true

    const step = () => {
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

        if (s.life >= s.max || s.y < -20) Object.assign(s, spawn())
      }

      if (glRenderer) glRenderer.draw(sparks, dpr)
      else renderer2d?.draw(sparks)

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
      glRenderer?.destroy()
      renderer2d?.destroy()
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
