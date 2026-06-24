// Full-bleed reveal band. The still (g3.jpg) was dropped — it duplicated the
// orbit video's source frame — so this strip is now a single edge-to-edge video.
import LazyVideo from './LazyVideo'

export default function GalleryBand() {
  return (
    <section aria-label="The Ember up close" className="relative z-50 border-y border-hairline bg-bg">
      <figure className="relative overflow-hidden">
        <LazyVideo
          src="assets/middle.mp4"
          poster="assets/middle_poster.jpg"
          className="block h-[clamp(280px,52vh,820px)] w-full object-cover md:h-[clamp(360px,78vh,900px)]"
        />
        <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[oklch(0.11_0.01_50/0.9)] to-transparent p-6 font-mono text-[clamp(0.7rem,1.1vw,0.85rem)] font-medium uppercase tracking-[0.22em] text-muted">
          Every angle, <span className="text-accent">revealed</span>
        </figcaption>
      </figure>
    </section>
  )
}
