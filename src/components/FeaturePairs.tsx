import { motion } from 'framer-motion'
import { ease } from '../anim'
import { usePrefersReducedMotion } from '../hooks'
import { lqip } from '../lqip.generated'

interface FeatureBlockProps {
  img: string
  alt: string
  heading: string
  body: string
  reverse?: boolean
}

// The image is revealed by a clip-path that sweeps open horizontally as the
// block enters the viewport. Uses whileInView (no scroll-linked measurement) so
// it stays smooth and warning free. The text is always in place. Reduced motion
// is read live: the wipe gets a zero-length transition, so it snaps to the end
// state even when the preference flips after mount.
const FeatureBlock = ({ img, alt, heading, body, reverse }: FeatureBlockProps) => {
  const from = reverse ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'
  const to = 'inset(0 0 0 0)'
  const avif = img.replace(/\.jpg$/, '.avif')
  const reduced = usePrefersReducedMotion()
  const key = img.replace(/^.*\/|\.jpg$/g, '') // e.g. assets/g1.jpg → g1

  return (
    <motion.div
      initial={reduced ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className={`relative grid w-full items-center gap-[clamp(2rem,5vw,5rem)] border-t border-hairline pt-[clamp(4rem,9vh,9rem)] md:grid-cols-2 ${
        reverse ? 'md:[&>figure]:order-2' : ''
      }`}
    >
      <figure
        className="relative overflow-hidden bg-cover bg-center"
        // Tiny inline AVIF preview, blurred up behind the real image so there's
        // no empty box while it streams in (the image paints over it).
        style={{ backgroundImage: lqip[key] ? `url(${lqip[key]})` : undefined }}
      >
        <picture>
          <source srcSet={avif} type="image/avif" />
          <motion.img
            src={img}
            alt={alt}
            loading="lazy"
            decoding="async"
            variants={{ hidden: { clipPath: from, scale: 1.06 }, show: { clipPath: to, scale: 1 } }}
            transition={reduced ? { duration: 0 } : { duration: 1.1, ease }}
            className="block h-[clamp(300px,52vh,560px)] w-full object-cover"
          />
        </picture>
      </figure>
      <div>
        <h2 className="font-display text-[clamp(2rem,4.5vw,3.75rem)] font-normal leading-[1.05]">{heading}</h2>
        <p className="mt-6 max-w-[42ch] font-sans text-[1.08rem] text-muted">{body}</p>
      </div>
    </motion.div>
  )
}

const FeaturePairs = () => {
  return (
    <section className="wrap relative flex flex-col gap-[clamp(4rem,10vh,10rem)] py-[clamp(4rem,9vh,9rem)]">
      <FeatureBlock
        img="assets/g1.jpg"
        alt="The Ember low inside a dark concrete tunnel at night"
        heading="Born in the dark"
        body="Each Ember is shaped in a sealed chamber across eleven weeks, then driven once at night before it is finished."
      />
      <FeatureBlock
        reverse
        img="assets/g2.jpg"
        alt="Macro of the rear exhaust nozzles and glowing light blade"
        heading="Fire on command"
        body="Twin titanium afterburners ignite above 7000 rpm and throw a four metre flame. The light blade across the nose burns the same amber as the trail."
      />
    </section>
  )
}

export default FeaturePairs
