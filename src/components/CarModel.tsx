import * as THREE from 'three'
import { useMemo } from 'react'
import { applyProps } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

// Placeholder model: Lamborghini Urus by Steven Grey (CC-BY-NC-4.0, Sketchfab).
// Swap ./assets/lambo.glb for an Ember model (same node structure) once one
// exists. Paint, trim and lights are retuned here to read as the Ember's
// amber/fire identity instead of the original chrome-yellow showroom car.
const URL = './assets/lambo.glb'

export function CarModel(props: Omit<React.ComponentProps<'primitive'>, 'object'>) {
  const { scene, nodes, materials } = useGLTF(URL)

  useMemo(() => {
    // Original normals look deformed (likely from compression) — recompute on
    // the glass meshes so the windows refract cleanly.
    Object.values(nodes).forEach((node) => {
      const mesh = node as THREE.Mesh
      if (mesh.isMesh && mesh.name.startsWith('glass')) mesh.geometry.computeVertexNormals()
    })
    // Fix inner frame, too light.
    applyProps(materials.FrameBlack, { metalness: 0.75, roughness: 0, color: 'black' })
    // Wheels — matte black instead of chrome.
    applyProps(materials.Chrome, { metalness: 1, roughness: 0, color: '#2a2118' })
    applyProps(materials.BreakDiscs, { metalness: 0.2, roughness: 0.2, color: '#555' })
    applyProps(materials.TiresGum, { metalness: 0, roughness: 0.4, color: '#161310' })
    applyProps(materials.GreyElements, { metalness: 0, color: '#292929' })
    // Front + tail LEDs glow, bypassing tone mapping so they stay bright.
    applyProps(materials.emitbrake, { emissiveIntensity: 4, toneMapped: false })
    applyProps(materials.LightsFrontLed, { emissiveIntensity: 4, toneMapped: false })
    // Body paint — amber resin over a deep base, deep clearcoat for wet shine.
    // Inset the side windows a touch so they sit flush in the frame.
    if (nodes['glass_003']) nodes['glass_003'].scale.setScalar(2.7)
    const body = nodes.yellow_WhiteCar_0 as THREE.Mesh | undefined
    if (body) {
      applyProps(body, {
        material: new THREE.MeshPhysicalMaterial({
          roughness: 0.28,
          metalness: 0.35,
          color: '#7a2c0a',
          envMapIntensity: 1.1,
          clearcoat: 1,
          clearcoatRoughness: 0.06,
          // Warm amber flake under the clearcoat so the body glows like embers
          // when the overhead light strip sweeps across it.
          sheen: 1,
          sheenColor: new THREE.Color('#ff8a2a'),
          sheenRoughness: 0.5,
        }),
      })
    }
  }, [nodes, materials])

  return <primitive object={scene} {...props} />
}

useGLTF.preload(URL)
