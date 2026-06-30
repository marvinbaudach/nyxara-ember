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
//   2. Playback starts from the first frame the moment the element is ~35%
//      visible, so the reveal is synced to the visitor scrolling onto it.
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

    // Start the reveal from its first frame exactly when the panel scrolls into
    // view (not before), so the motion is synced to the visitor arriving on it.
    const playback = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            v.currentTime = 0
            v.play().catch(() => {})
          } else {
            v.pause()
          }
        }
      },
      { threshold: 0.35 },
    )
    playback.observe(v)

    return () => { preBuffer.disconnect(); playback.disconnect(); }
  }, [])

  // `src` is the universal MP4; the matching VP9/WebM is served first.
  const webm = src.replace(/\.mp4$/, '.webm')

  return (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      className={className}
    >
      <source src={webm} type="video/webm" />
      <source src={src} type="video/mp4" />
    </video>
  )
}
