import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { motion } from 'framer-motion'

function FloatingPlanet() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 2, 1]} intensity={1.2} />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 48, 48]} />
        <meshStandardMaterial color="#1aa8ff" roughness={0.25} metalness={0.6} emissive="#0b3a6a" />
      </mesh>
      <mesh position={[3, -1, -2]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#00c2ff" roughness={0.35} metalness={0.7} emissive="#045a6b" />
      </mesh>
      <mesh position={[-3, 1, -3]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.35} metalness={0.7} emissive="#0b3a6a" />
      </mesh>
    </>
  )
}

export default function ThreeBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} style={{ opacity: 0.9 }}>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate />
        <FloatingPlanet />
      </Canvas>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute inset-0 bg-gradient-to-b from-brand-500/25 via-transparent to-transparent"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,143,255,0.22),transparent_55%)]" />
    </div>
  )
}
