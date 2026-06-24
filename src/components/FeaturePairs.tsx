import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ease } from '../anim'

interface FeatureBlockProps {
  img: string
  alt: string
  caption: ReactNode
  heading: string
  body: string
  reverse?: boolean
}

// Horizontal structural build-up: the image is revealed by a clip-path that
// sweeps open horizontally as the block enters the viewport. Uses whileInView
// (no scroll-linked measurement) so it stays smooth and warning free.
const FeatureBlock = ({ img, alt, caption, heading, body, reverse }: FeatureBlockProps) => {
  const from = reverse ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'
  const to = 'inset(0 0 0 0)'

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-18%' }}
      className={`relative mx-auto grid max-w-[1200px] items-center gap-[clamp(2rem,5vw,5rem)] border-t border-hairline pt-[clamp(4rem,9vh,9rem)] md:grid-cols-2 ${
        reverse ? 'md:[&>figure]:order-2' : ''
      }`}
    >
      <figure className="relative overflow-hidden">
        <motion.img
          src={img}
          alt={alt}
          loading="lazy"
          decoding="async"
          variants={{ hidden: { clipPath: from, scale: 1.06 }, show: { clipPath: to, scale: 1 } }}
          transition={{ duration: 1.1, ease }}
          className="block h-[clamp(300px,52vh,560px)] w-full object-cover"
        />
        <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[oklch(0.11_0.01_50/0.9)] to-transparent p-6 font-mono text-[clamp(0.7rem,1.1vw,0.85rem)] font-medium uppercase tracking-[0.22em]">
          {caption}
        </figcaption>
      </figure>
      <motion.div
        variants={{
          hidden: { opacity: 0, x: reverse ? 40 : -40 },
          show: { opacity: 1, x: 0 },
        }}
        transition={{ duration: 0.9, delay: 0.15, ease }}
      >
        <h3 className="font-display text-[clamp(2rem,4vw,3.4rem)] font-normal leading-[1.05]">{heading}</h3>
        <p className="mt-6 max-w-[42ch] font-sans text-[1.08rem] text-muted">{body}</p>
      </motion.div>
    </motion.div>
  )
}

const FeaturePairs = () => {
  return (
    <section className="relative flex flex-col gap-[clamp(4rem,10vh,10rem)] px-[8vw] py-[clamp(4rem,9vh,9rem)]">
      <FeatureBlock
        img="assets/g1.jpg"
        alt="The Ember low inside a dark concrete tunnel at night"
        caption={<>1340 horses, <span className="text-accent">unleashed</span></>}
        heading="Born in the dark"
        body="Each Ember is shaped in a sealed chamber across eleven weeks, then driven once at night before it ships. You receive the exact car the engineers feared."
      />
      <FeatureBlock
        reverse
        img="assets/g2.jpg"
        alt="Macro of the rear exhaust nozzles and glowing light blade"
        caption={<>Four metre <span className="text-accent">flame</span></>}
        heading="Fire on command"
        body="Twin titanium afterburners ignite above 7000 rpm and throw a four metre flame. The light blade across the nose burns the same amber as the trail."
      />
    </section>
  )
}

export default FeaturePairs
