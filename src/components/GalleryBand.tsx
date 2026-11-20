// Full-bleed band: a single edge-to-edge video. The still (g3.jpg) was dropped —
// it duplicated the orbit video's source frame.
import LazyVideo from './LazyVideo'

export default function GalleryBand() {
  return (
    <section aria-label="The Ember up close" className="relative z-50 overflow-hidden border-y border-hairline bg-bg">
      <LazyVideo
        src="assets/middle.mp4"
        poster="assets/middle_poster.jpg"
        className="block h-[clamp(280px,52vh,820px)] w-full object-cover md:h-[clamp(360px,78vh,900px)]"
      />
    </section>
  )
}
