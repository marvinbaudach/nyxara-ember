// Seamless horizontal viewport strip. Note: the asset budget is exactly 3
// images and 2 videos, each used once. g1 and g2 live in FeaturePairs, so this
// band pairs the remaining still (g3.jpg) with the reveal video (middle.mp4) as
// an asymmetric two-panel strip rather than reusing a frame.
import LazyVideo from './LazyVideo.jsx'

export default function GalleryBand() {
  return (
    <section aria-label="The Ember up close" className="grid grid-cols-1 gap-[2px] border-y border-hairline bg-hairline md:grid-cols-[1fr_0.8fr]">
      <figure className="relative overflow-hidden bg-bg">
        <img
          src="assets/g3.jpg"
          alt="The Ember hero pose in the dark showroom"
          loading="lazy"
          decoding="async"
          className="block h-full w-full object-cover aspect-[9/13] md:aspect-auto"
        />
        <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[oklch(0.11_0.01_50/0.85)] to-transparent p-6 font-sans text-[clamp(0.95rem,1.6vw,1.25rem)] font-medium">
          Ninety nine will <span className="text-accent">exist</span>
        </figcaption>
      </figure>
      <figure className="relative overflow-hidden bg-bg">
        <LazyVideo
          src="assets/middle.mp4"
          poster="assets/g2.jpg"
          className="block h-full w-full object-cover aspect-[9/13] md:aspect-auto"
        />
        <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[oklch(0.11_0.01_50/0.85)] to-transparent p-6 font-sans text-[clamp(0.9rem,1.4vw,1.1rem)] font-medium tracking-[0.02em] text-muted">
          Every angle, <span className="text-accent">revealed</span>
        </figcaption>
      </figure>
    </section>
  )
}
