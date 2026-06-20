import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls, Html, useProgress } from '@react-three/drei'
import { EffectComposer, Bloom, SMAA } from '@react-three/postprocessing'
import * as THREE from 'three'
import { CarModel } from './CarModel'

// A single-point progress readout for the model loader, rendered inside the
// Canvas so drei's <Html> can portal it onto the viewer plane.
const Loader = () => {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="font-sans text-[0.8rem] tracking-[0.25em] uppercase text-muted">
        {progress < 100 ? `${Math.round(progress)}%` : 'Ready'}
      </div>
    </Html>
  )
}

const Scene = () => {
  return (
    <>
      <hemisphereLight intensity={0.45} />
      <ContactShadows
        resolution={1024}
        frames={1}
        position={[0, -1.16, 0]}
        scale={15}
        blur={0.6}
        opacity={0.85}
        far={20}
        color="#000000"
      />
      <CarModel rotation={[0, Math.PI / 1.5, 0]} scale={0.015} />

      {/* Declarative cubemap environment — a row of ceiling light strips filmed
          once by a cubemap camera and applied as reflections. This is what
          sweeps those moving highlight bands across the wet amber paint as the
          car turns. The amber key ring keys the Ember identity. */}
      <Environment resolution={512}>
        {[-9, -6, -3, 0, 3, 6, 9].map((z) => (
          <Lightformer
            key={z}
            intensity={2}
            rotation-x={Math.PI / 2}
            position={[0, 4, z]}
            scale={[10, 1, 1]}
          />
        ))}
        <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-50, 2, 0]} scale={[100, 2, 1]} />
        <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[50, 2, 0]} scale={[100, 2, 1]} />
        <Lightformer
          form="ring"
          color="#ff7a1a"
          intensity={9}
          scale={2}
          position={[10, 5, 10]}
          onUpdate={(self) => { self.lookAt(0, 0, 0); }}
        />
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 1.9}
        minDistance={6}
        maxDistance={14}
        autoRotate
        autoRotateSpeed={0.6}
      />

      <EffectComposer multisampling={4}>
        <Bloom luminanceThreshold={0.55} luminanceSmoothing={0.1} mipmapBlur intensity={1.1} />
        <SMAA />
      </EffectComposer>
    </>
  )
}

const SpinViewer = () => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  // Defer mounting the (heavy) WebGL canvas until the section is about to enter
  // the viewport, and free the GL context when it scrolls far away — keeps the
  // rest of the marketing page light.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setActive(e.isIntersecting)
      },
      { rootMargin: '300px 0px' },
    )
    io.observe(el)
    return () => { io.disconnect(); }
  }, [])

  return (
    <section
      aria-label="Turntable — explore the Ember from every angle"
      className="border-y border-hairline bg-bg"
    >
      <div className="mx-auto max-w-[1400px] px-6 pt-16 md:pt-24">
        <p className="font-sans text-[0.7rem] uppercase tracking-[0.4em] text-muted">Turntable</p>
        <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.05] text-ink">
          Every angle, <span className="text-accent">in your hands</span>
        </h2>
        <p className="mt-4 max-w-xl font-sans text-[clamp(0.95rem,1.4vw,1.1rem)] text-muted">
          Drag to orbit. The Ember turns under a field of light — watch the amber
          clearcoat catch each strip as it rolls.
        </p>
      </div>

      <div ref={wrapRef} className="relative h-[clamp(420px,72vh,760px)] w-full">
        {active && (
          <Canvas
            shadows
            dpr={[1, 1.8]}
            gl={{ logarithmicDepthBuffer: true, antialias: false, toneMapping: THREE.ACESFilmicToneMapping }}
            camera={{ position: [0, 0.5, 15], fov: 25 }}
          >
            <color attach="background" args={['#15151a']} />
            <Suspense fallback={<Loader />}>
              <Scene />
            </Suspense>
          </Canvas>
        )}
        {/* Hint chip */}
        <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-hairline bg-[oklch(0.205_0.014_50/0.7)] px-4 py-1.5 font-sans text-[0.7rem] uppercase tracking-[0.25em] text-muted backdrop-blur">
          Drag to orbit
        </div>
      </div>
    </section>
  )
}

export default SpinViewer
