"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, MeshDistortMaterial, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function ProductMesh({ color = "#10b981" }: { color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group>
        {/* Main body - circuit board shape */}
        <mesh ref={meshRef} castShadow>
          <boxGeometry args={[2, 0.15, 1.4]} />
          <meshStandardMaterial
            color="#1a1a2e"
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
        {/* Chip */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.6, 0.12, 0.6]} />
          <meshStandardMaterial
            color="#0f0f23"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
        {/* Chip label glow */}
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.4, 0.01, 0.4]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            roughness={0.1}
          />
        </mesh>
        {/* Pins - left */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`l-${i}`} position={[-1.05, -0.02, -0.6 + i * 0.17]}>
            <boxGeometry args={[0.15, 0.06, 0.04]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        {/* Pins - right */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`r-${i}`} position={[1.05, -0.02, -0.6 + i * 0.17]}>
            <boxGeometry args={[0.15, 0.06, 0.04]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        {/* LED indicators */}
        <mesh position={[0.7, 0.1, -0.5]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={2}
          />
        </mesh>
        <mesh position={[0.7, 0.1, -0.35]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={2}
          />
        </mesh>
        {/* Capacitor */}
        <mesh position={[-0.6, 0.2, 0.4]}>
          <cylinderGeometry args={[0.08, 0.08, 0.25, 16]} />
          <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* USB connector */}
        <mesh position={[-0.85, 0.05, 0]}>
          <boxGeometry args={[0.3, 0.12, 0.35]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#10b981" wireframe />
    </mesh>
  );
}

interface ProductViewerProps {
  className?: string;
  color?: string;
}

export function ProductViewer({ className = "", color = "#10b981" }: ProductViewerProps) {
  return (
    <div className={`w-full h-full min-h-[300px] ${className}`}>
      <Canvas
        camera={{ position: [3, 2, 3], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#06b6d4" />
        <Suspense fallback={<LoadingFallback />}>
          <ProductMesh color={color} />
          <ContactShadows
            position={[0, -0.5, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
          />
        </Suspense>
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.8}
          minDistance={3}
          maxDistance={8}
          autoRotate
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
}
