import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Atmospheric Rim Glow Shader (Fresnel effect)
const createAtmosphereMaterial = (isLight: boolean) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(isLight ? 0x0a0a0a : 0xffffff) },
      uPower: { value: 3.2 },
      uIntensity: { value: isLight ? 0.55 : 0.85 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uPower;
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = 1.0 - max(dot(normal, viewDir), 0.0);
        fresnel = pow(fresnel, uPower) * uIntensity;
        gl_FragColor = vec4(uColor, fresnel);
      }
    `,
    transparent: true,
    blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
    side: THREE.FrontSide,
    depthWrite: false,
  });
};

// Procedural Planet Body with Latitude/Longitude & Topographic Relief
const PlanetBody = ({ isLight }: { isLight: boolean }) => {
  const coreRef = useRef<THREE.Group>(null);
  const color = isLight ? '#0a0a0a' : '#ffffff';

  // Generate latitude and longitude coordinate lines
  const { lineGeometry, dotsGeometry } = useMemo(() => {
    const linesPoints: number[] = [];
    const radius = 2.0;

    // Parallels (Latitude lines)
    const latitudes = [-70, -50, -30, -10, 0, 10, 30, 50, 70];
    latitudes.forEach((lat) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const r = radius * Math.sin(phi);
      const y = radius * Math.cos(phi);
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const theta1 = (i / segments) * Math.PI * 2;
        const theta2 = ((i + 1) / segments) * Math.PI * 2;
        linesPoints.push(
          r * Math.cos(theta1), y, r * Math.sin(theta1),
          r * Math.cos(theta2), y, r * Math.sin(theta2)
        );
      }
    });

    // Meridians (Longitude lines)
    const meridians = 18;
    for (let m = 0; m < meridians; m++) {
      const theta = (m / meridians) * Math.PI * 2;
      const segments = 48;
      for (let i = 0; i <= segments; i++) {
        const phi1 = (i / segments) * Math.PI;
        const phi2 = ((i + 1) / segments) * Math.PI;
        linesPoints.push(
          radius * Math.sin(phi1) * Math.cos(theta),
          radius * Math.cos(phi1),
          radius * Math.sin(phi1) * Math.sin(theta),
          radius * Math.sin(phi2) * Math.cos(theta),
          radius * Math.cos(phi2),
          radius * Math.sin(phi2) * Math.sin(theta)
        );
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linesPoints, 3));

    // Surface relief data points (topographic radar scatter)
    const dotCount = 750;
    const dotPositions = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = radius * (1.002 + Math.sin(theta * 6.0) * Math.cos(phi * 6.0) * 0.015);
      dotPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      dotPositions[i * 3 + 1] = r * Math.cos(phi);
      dotPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));

    return { lineGeometry: lineGeo, dotsGeometry: dotGeo };
  }, []);

  const atmosphereMaterial = useMemo(() => createAtmosphereMaterial(isLight), [isLight]);

  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.05;
    }
  });

  return (
    <group ref={coreRef}>
      {/* Dark/Light Opaque Base Sphere (blocks background objects from showing through) */}
      <mesh>
        <sphereGeometry args={[1.98, 48, 48]} />
        <meshBasicMaterial
          color={isLight ? '#f5f5f5' : '#050505'}
          transparent
          opacity={isLight ? 0.92 : 0.88}
        />
      </mesh>

      {/* High-craft Geodesic Wireframe Overlay */}
      <mesh>
        <icosahedronGeometry args={[2.0, 3]} />
        <meshBasicMaterial
          wireframe
          color={color}
          transparent
          opacity={isLight ? 0.09 : 0.14}
        />
      </mesh>

      {/* Lat-Long Coordinate Meridians and Parallels */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={isLight ? 0.16 : 0.26}
          linewidth={1}
        />
      </lineSegments>

      {/* Surface Topographic Scatter Dots */}
      <points geometry={dotsGeometry}>
        <pointsMaterial
          size={isLight ? 0.022 : 0.026}
          color={color}
          transparent
          opacity={isLight ? 0.35 : 0.65}
          sizeAttenuation
        />
      </points>

      {/* Ethereal Atmospheric Rim Glow (Fresnel Shader Shell) */}
      <mesh material={atmosphereMaterial}>
        <sphereGeometry args={[2.14, 48, 48]} />
      </mesh>
    </group>
  );
};

// Orbital Rings with Independent Micro-Velocities
const OrbitalRings = ({ isLight }: { isLight: boolean }) => {
  const innerRingRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Group>(null);
  const color = isLight ? '#0a0a0a' : '#ffffff';

  // Inner ring: Segmented hairline track + dotted debris
  const { innerDebrisGeo, innerTrackGeo } = useMemo(() => {
    const count = 700;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.03;
      const r = 2.9 + Math.random() * 0.32;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.06;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    const debris = new THREE.BufferGeometry();
    debris.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const track = new THREE.TorusGeometry(3.06, 0.005, 6, 120);
    return { innerDebrisGeo: debris, innerTrackGeo: track };
  }, []);

  // Outer ring: Wider segmented debris band + hairline concentric track
  const { outerDebrisGeo, outerTrackGeo } = useMemo(() => {
    const count = 1100;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.02;
      const r = 3.8 + Math.random() * 0.45;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.08;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    const debris = new THREE.BufferGeometry();
    debris.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const track = new THREE.TorusGeometry(4.02, 0.004, 6, 140);
    return { outerDebrisGeo: debris, outerTrackGeo: track };
  }, []);

  useFrame((state) => {
    if (innerRingRef.current) {
      innerRingRef.current.rotation.y = state.clock.elapsedTime * 0.065;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y = state.clock.elapsedTime * -0.038;
    }
  });

  return (
    <group rotation={[Math.PI * 0.38, -0.15, Math.PI * 0.12]}>
      {/* Inner Concentric Ring */}
      <group ref={innerRingRef}>
        <mesh geometry={innerTrackGeo}>
          <meshBasicMaterial color={color} transparent opacity={isLight ? 0.15 : 0.28} />
        </mesh>
        <points geometry={innerDebrisGeo}>
          <pointsMaterial
            size={0.02}
            color={color}
            transparent
            opacity={isLight ? 0.35 : 0.55}
            sizeAttenuation
          />
        </points>
      </group>

      {/* Outer Concentric Ring */}
      <group ref={outerRingRef}>
        <mesh geometry={outerTrackGeo}>
          <meshBasicMaterial color={color} transparent opacity={isLight ? 0.12 : 0.22} />
        </mesh>
        <points geometry={outerDebrisGeo}>
          <pointsMaterial
            size={0.018}
            color={color}
            transparent
            opacity={isLight ? 0.3 : 0.5}
            sizeAttenuation
          />
        </points>
      </group>
    </group>
  );
};

// Ambient Star Dust Particles
const CosmicDust = ({ isLight }: { isLight: boolean }) => {
  const ref = useRef<THREE.Points>(null);
  const count = 450;
  const color = isLight ? '#0a0a0a' : '#ffffff';

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 4.5 + Math.random() * 5.0;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.015;
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
      <pointsMaterial
        size={0.018}
        color={color}
        transparent
        opacity={isLight ? 0.22 : 0.4}
        sizeAttenuation
      />
    </points>
  );
};

// Parent Parallax Rig with Smooth Mouse Damping
const PlanetaryRig = ({ isLight }: { isLight: boolean }) => {
  const rigRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useFrame((state, delta) => {
    if (!rigRef.current) return;

    // Anchor position: offset to the right on desktop to frame the hero, centered on mobile
    const basePosX = isDesktop ? 1.6 : 0;
    const basePosY = isDesktop ? 0.15 : 0.6;
    const basePosZ = isDesktop ? 0 : -0.8;
    const baseScale = isDesktop ? 1.05 : 0.78;

    // Target rotation based on cursor parallax
    const targetRotX = mouse.current.y * 0.3;
    const targetRotY = mouse.current.x * 0.4;
    const targetPosX = basePosX + mouse.current.x * 0.35;
    const targetPosY = basePosY + mouse.current.y * 0.25;

    // Smooth exponential damping
    rigRef.current.rotation.x = THREE.MathUtils.damp(rigRef.current.rotation.x, targetRotX, 3.2, delta);
    rigRef.current.rotation.y = THREE.MathUtils.damp(rigRef.current.rotation.y, targetRotY, 3.2, delta);
    rigRef.current.position.x = THREE.MathUtils.damp(rigRef.current.position.x, targetPosX, 2.8, delta);
    rigRef.current.position.y = THREE.MathUtils.damp(rigRef.current.position.y, targetPosY, 2.8, delta);
    rigRef.current.position.z = THREE.MathUtils.damp(rigRef.current.position.z, basePosZ, 2.8, delta);

    const currentScale = rigRef.current.scale.x;
    const dampedScale = THREE.MathUtils.damp(currentScale, baseScale, 3.0, delta);
    rigRef.current.scale.set(dampedScale, dampedScale, dampedScale);
  });

  return (
    <group ref={rigRef}>
      <PlanetBody isLight={isLight} />
      <OrbitalRings isLight={isLight} />
      <CosmicDust isLight={isLight} />
    </group>
  );
};

const Scene3D = () => {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setIsLight(document.documentElement.classList.contains('light'));
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 7.8], fov: 52 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.NoToneMapping,
        }}
      >
        <PlanetaryRig isLight={isLight} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
