'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const BALLS = [
  { color: '#F8F8F8', pos: [-3.5, 0.8, -3], speed: 0.55, phase: 0, size: 0.42 },
  { color: '#CC1111', pos: [2.8, 0.5, -2.5], speed: 0.72, phase: 1.2, size: 0.40 },
  { color: '#E8C820', pos: [-1.2, 1.2, -4], speed: 0.48, phase: 2.1, size: 0.44 },
  { color: '#1B7A3B', pos: [3.8, -0.2, -3.5], speed: 0.65, phase: 0.7, size: 0.41 },
  { color: '#6B3A2A', pos: [-3.0, -0.5, -5], speed: 0.80, phase: 1.8, size: 0.43 },
  { color: '#1A52A8', pos: [1.2, 1.6, -2], speed: 0.42, phase: 3.0, size: 0.45 },
  { color: '#D4568C', pos: [-4.2, 1.0, -4.5], speed: 0.60, phase: 2.5, size: 0.40 },
  { color: '#111111', pos: [4.5, 0.8, -5.5], speed: 0.52, phase: 0.3, size: 0.46 },
  { color: '#CC1111', pos: [0.5, -1.0, -3], speed: 0.70, phase: 1.5, size: 0.40 },
  { color: '#CC1111', pos: [-1.8, 0.2, -5.5], speed: 0.58, phase: 2.8, size: 0.41 },
]

interface BallRef {
  pos: [number, number, number]
  speed: number
  phase: number
}

function Ball({ color, pos, speed, phase, size }: typeof BALLS[number]) {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    ref.current.rotation.x += 0.004 * speed
    ref.current.rotation.z += 0.006 * speed
    ref.current.position.y = pos[1] + Math.sin(t * speed * 0.7 + phase) * 0.35
    ref.current.position.x = pos[0] + Math.cos(t * speed * 0.3 + phase) * 0.12
  })

  return (
    <mesh ref={ref} position={pos as [number, number, number]}>
      <sphereGeometry args={[size, 48, 48]} />
      <meshStandardMaterial
        color={color}
        roughness={0.08}
        metalness={0.05}
        envMapIntensity={1.2}
      />
    </mesh>
  )
}

function Scene() {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(() => {
    const targetX = mouse.current.x * 0.7
    const targetY = -mouse.current.y * 0.4 + 1.5
    ;(camera as THREE.PerspectiveCamera).position.x +=
      (targetX - (camera as THREE.PerspectiveCamera).position.x) * 0.025
    ;(camera as THREE.PerspectiveCamera).position.y +=
      (targetY - (camera as THREE.PerspectiveCamera).position.y) * 0.025
    camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <ambientLight intensity={0.12} color="#ffffff" />
      {/* Gold top spotlight */}
      <pointLight position={[0, 7, 0]} intensity={4} color="#d4af37" distance={18} decay={2} />
      {/* Emerald side fill */}
      <pointLight position={[-7, 2, -1]} intensity={2} color="#0d5c2e" distance={14} decay={2} />
      {/* Red accent */}
      <pointLight position={[7, -1, -2]} intensity={1.5} color="#8b0000" distance={12} decay={2} />
      {/* Subtle front fill */}
      <pointLight position={[0, 0, 8]} intensity={0.4} color="#ffffff" distance={10} decay={2} />
      {/* Rim light from back */}
      <pointLight position={[0, -4, -10]} intensity={1.2} color="#d4af37" distance={16} decay={2} />

      {BALLS.map((b, i) => (
        <Ball key={i} {...b} />
      ))}
    </>
  )
}

export default function BilliardScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 8], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      style={{ position: 'absolute', inset: 0, background: 'transparent' }}
    >
      <Scene />
    </Canvas>
  )
}
