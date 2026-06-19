import { useEffect, useRef } from 'react'

type LazyVideoProps = {
  src: string
  poster?: string
  className?: string
}

// Defers download and playback until the video is near the viewport. With
// preload="none" the file is only fetched when play() is first called.
export default function LazyVideo({ src, poster, className }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) v.play().catch(() => {})
          else v.pause()
        }
      },
      { rootMargin: '300px 0px' },
    )
    io.observe(v)
    return () => io.disconnect()
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
