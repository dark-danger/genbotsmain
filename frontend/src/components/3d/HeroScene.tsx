"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function ParticleField() {
  const count = 500;
  const mesh = useRef<THREE.Points>(null!);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      // Emerald/cyan palette
      colors[i * 3] = 0.06 + Math.random() * 0.1;
      colors[i * 3 + 1] = 0.5 + Math.random() * 0.3;
      colors[i * 3 + 2] = 0.3 + Math.random() * 0.5;
    }
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.02;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function GlowingSphere() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} scale={1.8}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#10b981"
          emissive="#059669"
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.8}
          distort={0.3}
          speed={2}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
}

function FloatingRings() {
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1.current) {
      ring1.current.rotation.x = t * 0.3;
      ring1.current.rotation.z = t * 0.1;
    }
    if (ring2.current) {
      ring2.current.rotation.y = t * 0.25;
      ring2.current.rotation.x = t * 0.15;
    }
  });

  return (
    <>
      <mesh ref={ring1} position={[0, 0, 0]}>
        <torusGeometry args={[2.8, 0.02, 16, 100]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#06b6d4"
          emissiveIntensity={0.5}
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh ref={ring2} position={[0, 0, 0]}>
        <torusGeometry args={[3.2, 0.015, 16, 100]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.4}
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#10b981" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#06b6d4" />
        <GlowingSphere />
        <FloatingRings />
        <ParticleField />
      </Canvas>
    </div>
  );
}
