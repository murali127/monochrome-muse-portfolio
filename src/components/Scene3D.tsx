import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

const WireframeSphere = ({ color }: { color: string }) => {
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
        <meshBasicMaterial wireframe color={color} transparent opacity={0.12} />
      </mesh>
    </Float>
  );
};

const FloatingRing = ({ radius, speed, offset, color }: { radius: number; speed: number; offset: number; color: string }) => {
  const ref = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    return new THREE.TorusGeometry(radius, 0.008, 8, 100);
  }, [radius]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * speed + offset;
      ref.current.rotation.z = state.clock.elapsedTime * speed * 0.5;
    }
  });

  return (
    <mesh ref={ref} geometry={geometry}>
      <meshBasicMaterial color={color} transparent opacity={0.08} />
    </mesh>
  );
};

const ParticleCloud = ({ color }: { color: string }) => {
  const ref = useRef<THREE.Points>(null);
  const count = 500;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 3;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.025;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
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
      <pointsMaterial size={0.018} color={color} transparent opacity={0.35} sizeAttenuation />
    </points>
  );
};

const Scene3D = () => {
  const [color, setColor] = useState('white');

  useEffect(() => {
    const updateColor = () => {
      const isLight = document.documentElement.classList.contains('light');
      setColor(isLight ? 'black' : 'white');
    };

    updateColor();
    const observer = new MutationObserver(updateColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <WireframeSphere color={color} />
        <FloatingRing radius={3} speed={0.2} offset={0} color={color} />
        <FloatingRing radius={3.5} speed={0.15} offset={Math.PI / 3} color={color} />
        <FloatingRing radius={4} speed={0.1} offset={Math.PI / 1.5} color={color} />
        <ParticleCloud color={color} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
