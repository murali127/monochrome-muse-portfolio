import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

const WireframeSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2, 3]} />
        <meshBasicMaterial wireframe color="white" transparent opacity={0.15} />
      </mesh>
    </Float>
  );
};

const FloatingRing = ({ radius, speed, offset }: { radius: number; speed: number; offset: number }) => {
  const ref = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    return new THREE.TorusGeometry(radius, 0.01, 8, 64);
  }, [radius]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * speed + offset;
      ref.current.rotation.z = state.clock.elapsedTime * speed * 0.5;
    }
  });

  return (
    <mesh ref={ref} geometry={geometry}>
      <meshBasicMaterial color="white" transparent opacity={0.1} />
    </mesh>
  );
};

const ParticleCloud = () => {
  const ref = useRef<THREE.Points>(null);
  const count = 500;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 2;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="white" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
};

const Scene3D = () => {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }} gl={{ alpha: true, antialias: true }}>
        <WireframeSphere />
        <FloatingRing radius={3} speed={0.2} offset={0} />
        <FloatingRing radius={3.5} speed={0.15} offset={Math.PI / 3} />
        <FloatingRing radius={4} speed={0.1} offset={Math.PI / 1.5} />
        <ParticleCloud />
      </Canvas>
    </div>
  );
};

export default Scene3D;
