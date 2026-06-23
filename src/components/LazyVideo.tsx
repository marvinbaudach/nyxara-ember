import { useEffect, useRef } from 'react'

interface LazyVideoProps {
  src: string
  poster?: string
  className?: string
}

// Two-stage lazy loading so the clip never starts with a long stall:
//   1. A wide pre-buffer margin begins downloading the file well before it
//      scrolls in (preload kicks off via load()), so bytes are already in
//      flight by the time it appears.
//   2. A tight play margin starts/stops playback only when actually near the
//      viewport, so we never decode offscreen.
// Files must be muxed with faststart (moov atom up front) for this to pay off —
// otherwise the browser still waits for the whole download before the 1st frame.
export default function LazyVideo({ src, poster, className }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return

    const preBuffer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            v.preload = 'auto'
            v.load()
            preBuffer.disconnect()
          }
        }
      },
      { rootMargin: '1500px 0px' },
    )
    preBuffer.observe(v)

    const playback = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) v.play().catch(() => {})
          else v.pause()
        }
      },
      { rootMargin: '200px 0px' },
    )
    playback.observe(v)

    return () => { preBuffer.disconnect(); playback.disconnect(); }
  }, [])

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      className={className}
    />
  )
}
