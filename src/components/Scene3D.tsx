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

const DNAHelix = ({ color }: { color: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const count = 40;

  const { spheres, connections } = useMemo(() => {
    const s: { pos: THREE.Vector3; strand: number }[] = [];
    const c: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 4;
      const y = (i / count) * 8 - 4;
      const r = 1.2;
      const p1 = new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r);
      const p2 = new THREE.Vector3(Math.cos(t + Math.PI) * r, y, Math.sin(t + Math.PI) * r);
      s.push({ pos: p1, strand: 0 }, { pos: p2, strand: 1 });
      if (i % 4 === 0) c.push({ start: p1, end: p2 });
    }
    return { spheres: s, connections: c };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={[5, 0, -3]}>
      {spheres.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.35} />
        </mesh>
      ))}
      {connections.map((c, i) => {
        const mid = new THREE.Vector3().lerpVectors(c.start, c.end, 0.5);
        const dir = new THREE.Vector3().subVectors(c.end, c.start);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0), dir.normalize()
        );
        return (
          <mesh key={`c-${i}`} position={mid} quaternion={quat}>
            <cylinderGeometry args={[0.005, 0.005, len, 4]} />
            <meshBasicMaterial color={color} transparent opacity={0.15} />
          </mesh>
        );
      })}
    </group>
  );
};

const OrbitingDots = ({ color }: { color: string }) => {
  const ref = useRef<THREE.Group>(null);
  const dotCount = 60;

  const dots = useMemo(() => {
    const arr: { angle: number; radius: number; speed: number; yOffset: number; size: number }[] = [];
    for (let i = 0; i < dotCount; i++) {
      arr.push({
        angle: (i / dotCount) * Math.PI * 2,
        radius: 2.5 + Math.random() * 2,
        speed: 0.1 + Math.random() * 0.15,
        yOffset: (Math.random() - 0.5) * 3,
        size: 0.015 + Math.random() * 0.025,
      });
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.children.forEach((child, i) => {
      const d = dots[i];
      const a = d.angle + t * d.speed;
      child.position.set(
        Math.cos(a) * d.radius,
        d.yOffset + Math.sin(t * 0.5 + i) * 0.3,
        Math.sin(a) * d.radius
      );
    });
  });

  return (
    <group ref={ref}>
      {dots.map((d, i) => (
        <mesh key={i}>
          <sphereGeometry args={[d.size, 6, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
};

const GridPlane = ({ color }: { color: string }) => {
  const ref = useRef<THREE.GridHelper>(null);

  useFrame((state) => {
    if (ref.current) {
      (ref.current.material as THREE.Material).opacity = 0.04 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <gridHelper
      ref={ref}
      args={[30, 30, color, color]}
      position={[0, -4, 0]}
      rotation={[0, 0, 0]}
    >
      <meshBasicMaterial attach="material" color={color} transparent opacity={0.04} />
    </gridHelper>
  );
};

const ParticleCloud = ({ color }: { color: string }) => {
  const ref = useRef<THREE.Points>(null);
  const count = 600;

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

const WireframeTorus = ({ color }: { color: string }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.08;
      ref.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });

  return (
    <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh ref={ref} position={[-5, 1, -2]}>
        <torusKnotGeometry args={[1, 0.3, 100, 16]} />
        <meshBasicMaterial wireframe color={color} transparent opacity={0.06} />
      </mesh>
    </Float>
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
      <Canvas camera={{ position: [0, 0, 8], fov: 55 }} gl={{ alpha: true, antialias: true }}>
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
