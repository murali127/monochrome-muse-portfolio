import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import landPointsData from '@/data/earthLandPoints.json';

// ----------------------------------------------------------------------------
// Convert Lat/Lon degrees to 3D Cartesian Vector
// ----------------------------------------------------------------------------
const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

// ----------------------------------------------------------------------------
// Mathematical Fibonacci Sphere Generator (for Neighboring Planets)
// ----------------------------------------------------------------------------
const generateFibonacciSphere = (count: number, radius: number) => {
  const pos = new Float32Array(count * 3);
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    pos[i * 3] = Math.cos(theta) * r * radius;
    pos[i * 3 + 1] = y * radius;
    pos[i * 3 + 2] = Math.sin(theta) * r * radius;
  }
  return pos;
};

// ----------------------------------------------------------------------------
// Planar Concentric Ring Generator (for Saturn's Rings)
// ----------------------------------------------------------------------------
const generateRingPoints = (count: number, innerR: number, outerR: number) => {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = innerR + Math.random() * (outerR - innerR);
    const theta = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(theta) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 0.04;
    pos[i * 3 + 2] = Math.sin(theta) * r;
  }
  return pos;
};

// ----------------------------------------------------------------------------
// Soft Atmospheric Rim Fresnel Glow Shader
// ----------------------------------------------------------------------------
const createAtmosphereFresnelMaterial = (isLight: boolean) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(isLight ? 0x09090b : 0xffffff) },
      uPower: { value: isLight ? 3.8 : 4.4 },
      uIntensity: { value: isLight ? 0.22 : 0.35 },
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

// ----------------------------------------------------------------------------
// Minimal Visakhapatnam Micro-Radar Beacon
// ----------------------------------------------------------------------------
const MinimalVisakhapatnamBeacon = ({
  isLight,
  radius,
  globeGroupRef,
  isIgnited,
}: {
  isLight: boolean;
  radius: number;
  globeGroupRef: React.RefObject<THREE.Group>;
  isIgnited: boolean;
}) => {
  const beaconGroupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // Exact anchor position at Visakhapatnam [17.6868° N, 83.2185° E]
  const vspPos = useMemo(() => latLonToVector3(17.6868, 83.2185, radius * 1.006), [radius]);

  const orientation = useMemo(() => {
    const normal = vspPos.clone().normalize();
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    return q;
  }, [vspPos]);

  useFrame((state) => {
    if (!beaconGroupRef.current || !globeGroupRef.current) return;

    if (!isIgnited) {
      beaconGroupRef.current.visible = false;
      return;
    }

    const worldPos = new THREE.Vector3();
    beaconGroupRef.current.getWorldPosition(worldPos);

    const globeCenter = new THREE.Vector3();
    globeGroupRef.current.getWorldPosition(globeCenter);

    const surfaceNormal = worldPos.clone().sub(globeCenter).normalize();
    const toCamera = state.camera.position.clone().sub(worldPos).normalize();
    const dot = surfaceNormal.dot(toCamera);

    const visibility = THREE.MathUtils.clamp((dot - 0.02) / 0.18, 0, 1);
    beaconGroupRef.current.visible = visibility > 0.001;

    if (visibility > 0.001) {
      const time = state.clock.elapsedTime;
      const t = (time * 1.4) % 1;
      if (ringRef.current) {
        const scale = 1.0 + t * 2.4;
        ringRef.current.scale.set(scale, scale, 1);
        const ringMat = ringRef.current.material as THREE.MeshBasicMaterial;
        ringMat.opacity = Math.pow(1 - t, 1.5) * (isLight ? 0.75 : 0.85) * visibility;
      }

      if (coreRef.current) {
        const pulse = 1.0 + Math.sin(time * 5.0) * 0.18;
        coreRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });

  return (
    <group ref={beaconGroupRef} position={vspPos} quaternion={orientation}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.025, 0.038, 32]} />
        <meshBasicMaterial
          color={isLight ? 0x09090b : 0xffffff}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={coreRef} position={[0, 0.012, 0]}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshBasicMaterial
          color={isLight ? 0x09090b : 0xffffff}
          transparent
          opacity={isLight ? 0.9 : 1.0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------------------------------
// Custom Shader Material for Land Points with GPU Backface Culling
// ----------------------------------------------------------------------------
const createOrganicPointShaderMaterial = (isLight: boolean) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(isLight ? 0x09090b : 0xffffff) },
      uBaseSize: { value: 0.020 },
      uOpacity: { value: isLight ? 0.82 : 0.90 },
    },
    vertexShader: `
      uniform float uBaseSize;
      varying float vFacing;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vec3 viewNormal = normalize(normalMatrix * normal);
        vec3 viewDir = normalize(-mvPosition.xyz);
        vFacing = dot(viewNormal, viewDir);
        gl_PointSize = uBaseSize * (350.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vFacing;
      void main() {
        if (vFacing < 0.0) discard;
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float circleAlpha = smoothstep(0.5, 0.35, dist);
        float horizonAlpha = smoothstep(0.0, 0.22, vFacing);
        gl_FragColor = vec4(uColor, uOpacity * circleAlpha * horizonAlpha);
      }
    `,
    transparent: true,
    blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
    depthWrite: false,
  });
};

// ----------------------------------------------------------------------------
// Gravitational Shockwave Ring (Single ultra-thin phosphor ripple on arrival)
// ----------------------------------------------------------------------------
const GravitationalShockwave = ({
  isTriggered,
  isLight,
}: {
  isTriggered: boolean;
  isLight: boolean;
}) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const startTimeRef = useRef<number | null>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    if (!isTriggered) {
      ringRef.current.visible = false;
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    const duration = 1.1;

    if (elapsed > duration) {
      ringRef.current.visible = false;
      return;
    }

    ringRef.current.visible = true;
    const progress = elapsed / duration;
    const scale = 1.0 + Math.sin((progress * Math.PI) / 2) * 2.8;
    ringRef.current.scale.set(scale, scale, 1);

    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.pow(1 - progress, 2) * (isLight ? 0.65 : 0.85);
  });

  return (
    <mesh ref={ringRef} position={[0, 0, 0]}>
      <ringGeometry args={[1.81, 1.86, 64]} />
      <meshBasicMaterial
        color={isLight ? 0x09090b : 0xffffff}
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

// ----------------------------------------------------------------------------
// Stage 3 & 4: Dot-Matrix Earth Core (Foreground Target, Z: 0)
// Hidden in Stage 1 & 2; emerges in Stage 3; locks in Stage 4
// ----------------------------------------------------------------------------
const DotMatrixGlobe = ({
  isLight,
  isIgnited,
  cameraZ,
}: {
  isLight: boolean;
  isIgnited: boolean;
  cameraZ: number;
}) => {
  const globeGroupRef = useRef<THREE.Group>(null);
  const radius = 1.8;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const rawCoords = landPointsData as unknown as number[];
    const positions = new Float32Array(rawCoords.length);
    const normals = new Float32Array(rawCoords);

    for (let i = 0; i < rawCoords.length; i++) {
      positions[i] = rawCoords[i] * radius;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    return geo;
  }, [radius]);

  const landPointMaterial = useMemo(() => createOrganicPointShaderMaterial(isLight), [isLight]);
  const atmosphereMaterial = useMemo(() => createAtmosphereFresnelMaterial(isLight), [isLight]);

  // Stage 1 & 2: completely hidden; Stage 3: scales up smoothly; Stage 4: scale = 1.0
  const currentScale = useMemo(() => {
    if (cameraZ > 65.0) return 0.0;
    if (cameraZ > 14.0) {
      const p = (65.0 - cameraZ) / (65.0 - 14.0);
      return Math.pow(p, 1.8);
    }
    return 1.0;
  }, [cameraZ]);

  // Pure vertical upright Y-axis planetary rotation (0 tilt)
  useFrame((_state, delta) => {
    if (!globeGroupRef.current) return;
    globeGroupRef.current.rotation.x = 0;
    globeGroupRef.current.rotation.z = 0;
    globeGroupRef.current.rotation.y += delta * 0.15;
  });

  if (currentScale <= 0.001) {
    return null;
  }

  return (
    <group ref={globeGroupRef} scale={[currentScale, currentScale, currentScale]} position={[0, 0, 0]}>
      {/* Organic Dot-Matrix Continents */}
      <points geometry={geometry} material={landPointMaterial} />

      {/* Atmospheric Fresnel Rim Glow */}
      <mesh material={atmosphereMaterial}>
        <sphereGeometry args={[radius * 1.025, 48, 48]} />
      </mesh>

      {/* Visakhapatnam Telemetry Micro-Radar Beacon */}
      <MinimalVisakhapatnamBeacon
        isLight={isLight}
        radius={radius}
        globeGroupRef={globeGroupRef}
        isIgnited={isIgnited}
      />
    </group>
  );
};

// ----------------------------------------------------------------------------
// Stage 1 & 2: Deep Cosmos & Multi-Galaxy Field (Z: 60 to 160)
// Render 3 to 4 distinct miniature galaxy point clusters across deep space
// ----------------------------------------------------------------------------
const MultiGalaxyDeepField = ({
  isLight,
  cameraZ,
}: {
  isLight: boolean;
  cameraZ: number;
}) => {
  const targetGalaxyRef = useRef<THREE.Points>(null);
  const distantGalaxiesRef = useRef<THREE.Points>(null);

  // 1. Target Galaxy (Milky Way) at center: 2-arm logarithmic spiral (~4,200 points)
  const targetData = useMemo(() => {
    const count = 4200;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const arms = 2;
    const baseColor = new THREE.Color(isLight ? 0x09090b : 0xffffff);
    const dimColor = new THREE.Color(isLight ? 0x666666 : 0x888888);

    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 2.2) * 44 + 1.2;
      const armAngle = ((i % arms) * 2 * Math.PI) / arms;
      const spiralAngle = r * 0.28 + armAngle;

      const spread = r * 0.20 + 0.35;
      const jx = (Math.random() - 0.5) * spread;
      const jy = (Math.random() - 0.5) * spread;
      const jz = (Math.random() - 0.5) * (r * 0.10 + 0.5);

      pos[i * 3] = Math.cos(spiralAngle) * r + jx;
      pos[i * 3 + 1] = Math.sin(spiralAngle) * r + jy;
      pos[i * 3 + 2] = jz - (r * 0.08);

      const mix = Math.min(1, r / 35);
      const c = baseColor.clone().lerp(dimColor, mix);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return { pos, col, count };
  }, [isLight]);

  // 2. Three Distant Neighbor Galaxies (Off-axis spiral, Elliptical nebula, Irregular cluster)
  const distantData = useMemo(() => {
    const totalCount = 2800;
    const pos = new Float32Array(totalCount * 3);
    const col = new Float32Array(totalCount * 3);
    const baseColor = new THREE.Color(isLight ? 0x141416 : 0xffffff);
    const dimColor = new THREE.Color(isLight ? 0x777777 : 0x71717a);

    let idx = 0;

    // Galaxy A: Off-axis Andromeda-like Spiral at [-34, 18, 95] (~1,200 points)
    const countA = 1200;
    for (let i = 0; i < countA; i++) {
      const r = Math.pow(Math.random(), 2) * 18 + 0.8;
      const ang = r * 0.35 + ((i % 2) * Math.PI);
      const x = Math.cos(ang) * r + (Math.random() - 0.5) * (r * 0.25);
      const y = (Math.sin(ang) * r + (Math.random() - 0.5) * (r * 0.25)) * 0.6;
      const z = (Math.random() - 0.5) * (r * 0.2);

      // Rotate and position at [-34, 18, 95]
      pos[idx * 3] = -34 + x * 0.85 - y * 0.5;
      pos[idx * 3 + 1] = 18 + x * 0.5 + y * 0.85;
      pos[idx * 3 + 2] = 95 + z;

      const c = baseColor.clone().lerp(dimColor, Math.random() * 0.6);
      col[idx * 3] = c.r; col[idx * 3 + 1] = c.g; col[idx * 3 + 2] = c.b;
      idx++;
    }

    // Galaxy B: Elliptical Nebula at [36, -14, 115] (~900 points)
    const countB = 900;
    for (let i = 0; i < countB; i++) {
      const r = Math.pow(Math.random(), 1.8) * 14;
      const th = Math.random() * Math.PI * 2;
      const x = Math.cos(th) * r;
      const y = Math.sin(th) * (r * 0.65);
      const z = (Math.random() - 0.5) * (r * 0.5);

      pos[idx * 3] = 36 + x;
      pos[idx * 3 + 1] = -14 + y;
      pos[idx * 3 + 2] = 115 + z;

      const c = baseColor.clone().lerp(dimColor, Math.random() * 0.75);
      col[idx * 3] = c.r; col[idx * 3 + 1] = c.g; col[idx * 3 + 2] = c.b;
      idx++;
    }

    // Galaxy C: Irregular Dwarf Cluster at [-26, -22, 135] (~700 points)
    const countC = 700;
    for (let i = 0; i < countC; i++) {
      const x = (Math.random() - 0.5) * 16 + (Math.random() - 0.5) * 6;
      const y = (Math.random() - 0.5) * 12 + (Math.random() - 0.5) * 4;
      const z = (Math.random() - 0.5) * 10;

      pos[idx * 3] = -26 + x;
      pos[idx * 3 + 1] = -22 + y;
      pos[idx * 3 + 2] = 135 + z;

      const c = baseColor.clone().lerp(dimColor, 0.4 + Math.random() * 0.5);
      col[idx * 3] = c.r; col[idx * 3 + 1] = c.g; col[idx * 3 + 2] = c.b;
      idx++;
    }

    return { pos, col, count: totalCount };
  }, [isLight]);

  // Target galaxy opacity dims gently as camera pierces through core
  const targetOpacity = useMemo(() => {
    const fade = THREE.MathUtils.clamp((cameraZ - 5.5) / 30.0, 0, 1);
    return (isLight ? 0.35 : 0.7) * Math.max(0.04, fade);
  }, [cameraZ, isLight]);

  // Distant galaxies naturally drift out and vanish when camera reaches stellar system (Z < 55)
  const distantVisible = cameraZ > 50.0;

  useFrame((_state, delta) => {
    if (targetGalaxyRef.current) {
      targetGalaxyRef.current.rotation.z += delta * 0.035;
    }
    if (distantGalaxiesRef.current) {
      distantGalaxiesRef.current.rotation.z += delta * 0.015;
    }
  });

  return (
    <>
      {/* 1. Target Galaxy (Milky Way) at [0, 0, 0] */}
      <points ref={targetGalaxyRef} position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={targetData.count}
            array={targetData.pos}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={targetData.count}
            array={targetData.col}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.015}
          vertexColors
          transparent
          opacity={targetOpacity}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* 2. Distant Non-Target Galaxies in Deep Cosmos */}
      {distantVisible && (
        <points ref={distantGalaxiesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={distantData.count}
              array={distantData.pos}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={distantData.count}
              array={distantData.col}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.014}
            vertexColors
            transparent
            opacity={isLight ? 0.3 : 0.6}
            sizeAttenuation
            depthWrite={false}
          />
        </points>
      )}
    </>
  );
};

// ----------------------------------------------------------------------------
// Stage 3: Stellar System & Planetary Transit (Mars & Saturn with Telemetry)
// Sweeps past camera as camera travels Z: 60 -> 18, then drifts out of frame
// ----------------------------------------------------------------------------
const TransitPlanets = ({
  isLight,
  cameraZ,
}: {
  isLight: boolean;
  cameraZ: number;
}) => {
  // Only visible during transit phase: Z between 12.0 and 65.0
  const isTransitVisible = cameraZ > 12.0 && cameraZ < 65.0;

  // Mars geometry (radius 0.65, 450 dotted points)
  const marsPoints = useMemo(() => generateFibonacciSphere(450, 0.65), []);

  // Saturn geometry (radius 1.15, 600 points) + Planetary Rings (800 points)
  const saturnPoints = useMemo(() => generateFibonacciSphere(600, 1.15), []);
  const saturnRingPoints = useMemo(() => generateRingPoints(800, 1.65, 2.55), []);

  const pointMat = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.014,
      color: isLight ? 0x09090b : 0xffffff,
      transparent: true,
      opacity: isLight ? 0.75 : 0.9,
      sizeAttenuation: true,
      depthWrite: false,
    });
  }, [isLight]);

  const ringMat = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.012,
      color: isLight ? 0x222225 : 0xe4e4e7,
      transparent: true,
      opacity: isLight ? 0.6 : 0.75,
      sizeAttenuation: true,
      depthWrite: false,
    });
  }, [isLight]);

  if (!isTransitVisible) {
    return null;
  }

  return (
    <group>
      {/* 1. Mars at [7.8, 2.6, 38.0] */}
      <group position={[7.8, 2.6, 38.0]}>
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={450}
              array={marsPoints}
              itemSize={3}
            />
          </bufferGeometry>
          <primitive object={pointMat} attach="material" />
        </points>

        {/* Clean Minimal Telemetry Badge */}
        <Html center distanceFactor={16}>
          <div className="font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] px-2 py-0.5 border border-border/80 bg-background/90 text-foreground whitespace-nowrap shadow-md pointer-events-none select-none">
            MARS // 0.53R // SOL-4
          </div>
        </Html>
      </group>

      {/* 2. Saturn with Tilted Rings at [-9.6, -3.0, 22.0] */}
      <group position={[-9.6, -3.0, 22.0]}>
        {/* Planet Sphere */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={600}
              array={saturnPoints}
              itemSize={3}
            />
          </bufferGeometry>
          <primitive object={pointMat} attach="material" />
        </points>

        {/* Rings tilted at 26.7 deg */}
        <points rotation={[0.465, 0.2, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={800}
              array={saturnRingPoints}
              itemSize={3}
            />
          </bufferGeometry>
          <primitive object={ringMat} attach="material" />
        </points>

        {/* Clean Minimal Telemetry Badge */}
        <Html center distanceFactor={18}>
          <div className="font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] px-2 py-0.5 border border-border/80 bg-background/90 text-foreground whitespace-nowrap shadow-md pointer-events-none select-none">
            SATURN // RING_INCLINE: 26.7° // SOL-6
          </div>
        </Html>
      </group>
    </group>
  );
};

// ----------------------------------------------------------------------------
// Background Volumetric 3D Celestial Starfield (Ambient Space Depth)
// ----------------------------------------------------------------------------
const VolumetricCelestialField = ({ isLight }: { isLight: boolean }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 3000;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.5 + Math.pow(Math.random(), 1.6) * 36;
      const angle = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = Math.sin(angle) * r * 0.75 + (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = -35 + Math.random() * 190;
    }
    return pos;
  }, [count]);

  const mat = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.014,
      color: isLight ? 0x09090b : 0xffffff,
      transparent: true,
      opacity: isLight ? 0.35 : 0.7,
      sizeAttenuation: true,
      depthWrite: false,
    });
  }, [isLight]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.006;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <primitive object={mat} attach="material" />
    </points>
  );
};

// ----------------------------------------------------------------------------
// Ambient Stardust once docked
// ----------------------------------------------------------------------------
const CosmicDust = ({ isLight }: { isLight: boolean }) => {
  const ref = useRef<THREE.Points>(null);
  const count = 260;
  const color = isLight ? '#09090b' : '#ffffff';

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 4.5 + Math.random() * 4.0;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.012;
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
        size={0.012}
        color={color}
        transparent
        opacity={isLight ? 0.08 : 0.22}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

// ----------------------------------------------------------------------------
// Flight Controller: 4-Stage Cosmic Zoom (Multi-Galaxy -> Planetary Transit -> Earth Lock)
// ----------------------------------------------------------------------------
interface FlightTelemetry {
  velocity: string;
  distance: string;
  isLocked: boolean;
  warpFactor: number;
}

const CinematicCameraRig = ({
  isLight,
  skipWarp,
  onWarpComplete,
  onTelemetryUpdate,
}: {
  isLight: boolean;
  skipWarp?: boolean;
  onWarpComplete?: () => void;
  onTelemetryUpdate?: (telemetry: FlightTelemetry) => void;
}) => {
  const { camera } = useThree();
  const rigRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(true);

  // Flight trajectory state
  const timeRef = useRef(0);
  const completedRef = useRef(false);
  const handoffTriggeredRef = useRef(false);
  const [currentCameraZ, setCurrentCameraZ] = useState(160.0);
  const [isBeaconIgnited, setIsBeaconIgnited] = useState(false);
  const [isShockwaveTriggered, setIsShockwaveTriggered] = useState(false);

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

  // Initialize camera: Way back at [0, 20, 160] taking in the multi-galaxy cosmic view
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const persCam = camera as THREE.PerspectiveCamera;

    if (prefersReducedMotion) {
      camera.position.set(0, 0, 5.5);
      camera.lookAt(0, 0, 0);
      persCam.fov = 46;
      persCam.updateProjectionMatrix();

      completedRef.current = true;
      handoffTriggeredRef.current = true;
      setIsBeaconIgnited(true);
      onWarpComplete?.();
      onTelemetryUpdate?.({
        velocity: '0.0c',
        distance: '400 KM',
        isLocked: true,
        warpFactor: 0,
      });
    } else {
      camera.position.set(0, 20, 160);
      camera.lookAt(0, 0, 0);
      persCam.fov = 46;
      persCam.updateProjectionMatrix();
    }
  }, [camera, onWarpComplete, onTelemetryUpdate]);

  useFrame((_state, delta) => {
    const persCam = camera as THREE.PerspectiveCamera;

    // Failsafe & Skip handling: smooth lerp to [0, 0, 5.5], fov 46 within 300ms
    if (skipWarp && !completedRef.current) {
      camera.position.x = THREE.MathUtils.damp(camera.position.x, 0, 14.0, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, 0, 14.0, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, 5.5, 14.0, delta);
      persCam.fov = THREE.MathUtils.damp(persCam.fov, 46, 14.0, delta);
      persCam.updateProjectionMatrix();
      camera.lookAt(0, 0, 0);

      setCurrentCameraZ(camera.position.z);
      setIsBeaconIgnited(true);

      if (!handoffTriggeredRef.current) {
        handoffTriggeredRef.current = true;
        onWarpComplete?.();
      }

      if (Math.abs(camera.position.z - 5.5) < 0.05) {
        completedRef.current = true;
        onTelemetryUpdate?.({
          velocity: '0.0c',
          distance: '400 KM',
          isLocked: true,
          warpFactor: 0,
        });
      }
      return;
    }

    if (!completedRef.current) {
      timeRef.current += delta;
      const t = timeRef.current;

      let targetX = 0;
      let targetY = 20.0;
      let targetZ = 160.0;
      let factor = 0;
      let velText = '0.0c';
      let distText = '2.4M LY';
      let locked = false;

      // =======================================================================
      // STAGE 1: Deep Cosmos & Multi-Galaxy Field (0% – 25%, 0.0s – 0.9s)
      // Camera at [0, 20, 160]; Earth hidden; reticle tracks target galaxy
      // =======================================================================
      if (t < 0.9) {
        const u = t / 0.9;
        targetX = 0;
        targetY = 20.0 - u * 2.0;
        targetZ = 160.0 - u * 10.0;
        factor = 0;
        velText = '0.0c';
        distText = '2.4M LY';
      }
      // =======================================================================
      // STAGE 2: Galactic Insertion & Deceleration (25% – 55%, 0.9s – 2.1s)
      // Plunges Z: 150 -> 60, Y: 18 -> 7; target galaxy expands and pierces core
      // =======================================================================
      else if (t < 2.1) {
        const u = (t - 0.9) / 1.2; // 0 -> 1
        const accel = u * u; // Quadratic acceleration

        targetX = Math.sin(u * Math.PI) * 2.2 * (1 - u);
        targetY = 18.0 - (18.0 - 7.0) * accel;
        targetZ = 150.0 - (150.0 - 60.0) * accel;

        factor = Math.sin(u * Math.PI) * 0.95;
        velText = (factor * 8.4).toFixed(1) + 'c';
        distText = `${Math.round(2400000 - accel * 1800000).toLocaleString()} LY`;
      }
      // =======================================================================
      // STAGE 3: Stellar System & Planetary Transit (55% – 80%, 2.1s – 3.1s)
      // Camera enters system Z: 60 -> 16; sweeps past Mars & Saturn; Earth emerges
      // =======================================================================
      else if (t < 3.1) {
        const u = (t - 2.1) / 1.0; // 0 -> 1
        const ease = 1 - Math.pow(1 - u, 3); // Cubic ease

        targetX = Math.sin(u * Math.PI) * 1.4 * (1 - u);
        targetY = 7.0 - (7.0 - 1.5) * ease;
        targetZ = 60.0 - (60.0 - 16.0) * ease;

        factor = (1 - u) * 0.6;
        velText = (factor * 8.4).toFixed(1) + 'c';
        distText = `${Math.round(480000 - ease * 460000).toLocaleString()} KM`;

        if (targetZ <= 25.0 && !isBeaconIgnited) {
          setIsBeaconIgnited(true);
        }
      }
      // =======================================================================
      // STAGE 4: Orbital Arrival on Earth & Portfolio Lock (80% – 100%, 3.1s – 3.8s)
      // Camera smoothly settles at [0, 0, 5.5], zero tilt; Hero UI reveal triggers
      // =======================================================================
      else if (t < 3.8) {
        const u = (t - 3.1) / 0.7; // 0 -> 1
        const quintic = 1 - Math.pow(1 - u, 4);

        targetX = 0;
        targetY = 1.5 * (1 - quintic);
        targetZ = 16.0 - (16.0 - 5.5) * quintic;

        factor = 0;
        velText = '0.0c';
        distText = `${Math.round(20000 - quintic * 19600).toLocaleString()} KM`;

        if (targetZ <= 8.5 && !isShockwaveTriggered) {
          setIsShockwaveTriggered(true);
        }
        if (!isBeaconIgnited) {
          setIsBeaconIgnited(true);
        }

        // Seamless State Handoff: Trigger Hero UI fade-in during arrival
        if (u >= 0.4 && !handoffTriggeredRef.current) {
          handoffTriggeredRef.current = true;
          onWarpComplete?.();
        }
      }
      // Docked
      else {
        targetX = 0;
        targetY = 0;
        targetZ = 5.5;
        factor = 0;
        velText = '0.0c';
        distText = '400 KM';
        locked = true;

        if (!isBeaconIgnited) {
          setIsBeaconIgnited(true);
        }
        if (!isShockwaveTriggered) {
          setIsShockwaveTriggered(true);
        }
        if (!handoffTriggeredRef.current) {
          handoffTriggeredRef.current = true;
          onWarpComplete?.();
        }

        completedRef.current = true;
      }

      // Smooth delta-time damping
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 7.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 7.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 7.5, delta);
      camera.lookAt(0, 0, 0);

      setCurrentCameraZ(camera.position.z);

      onTelemetryUpdate?.({
        velocity: velText,
        distance: distText,
        isLocked: locked,
        warpFactor: factor,
      });
    }

    // Parallax Rig handling (Gentle mouse translation when docked)
    if (rigRef.current) {
      rigRef.current.rotation.x = 0;
      rigRef.current.rotation.z = 0;

      if (completedRef.current) {
        const targetRotY = mouse.current.x * 0.15;
        const targetPosX = mouse.current.x * 0.12;
        const targetPosY = mouse.current.y * 0.08;

        rigRef.current.rotation.y = THREE.MathUtils.damp(rigRef.current.rotation.y, targetRotY, 3.0, delta);
        rigRef.current.position.x = THREE.MathUtils.damp(rigRef.current.position.x, targetPosX, 2.5, delta);
        rigRef.current.position.y = THREE.MathUtils.damp(rigRef.current.position.y, targetPosY, 2.5, delta);
      }

      const targetScale = isDesktop ? 0.95 : 0.75;
      const currentScale = rigRef.current.scale.x;
      const dampedScale = THREE.MathUtils.damp(currentScale, targetScale, 3.0, delta);
      rigRef.current.scale.set(dampedScale, dampedScale, dampedScale);
    }
  });

  return (
    <>
      {/* Stage 1 & 2: Deep Cosmos Multi-Galaxy Field */}
      <MultiGalaxyDeepField isLight={isLight} cameraZ={currentCameraZ} />

      {/* Stage 2 & 3: Volumetric 3D Celestial Starfield */}
      <VolumetricCelestialField isLight={isLight} />

      {/* Stage 3: Stellar System & Planetary Transit (Mars & Saturn with Telemetry Badges) */}
      <TransitPlanets isLight={isLight} cameraZ={currentCameraZ} />

      {/* Stage 4: Gravitational Shockwave Ripple upon orbital arrival */}
      <GravitationalShockwave
        isTriggered={isShockwaveTriggered}
        isLight={isLight}
      />

      {/* Stage 3 & 4: Centered Dot-Matrix Earth Globe Core */}
      <group ref={rigRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <DotMatrixGlobe
          isLight={isLight}
          isIgnited={isBeaconIgnited}
          cameraZ={currentCameraZ}
        />
        {completedRef.current && <CosmicDust isLight={isLight} />}
      </group>
    </>
  );
};

// ----------------------------------------------------------------------------
// Scene3D Canvas Root - Perfectly Centered Viewport
// ----------------------------------------------------------------------------
interface Scene3DProps {
  skipWarp?: boolean;
  onWarpComplete?: () => void;
  onTelemetryUpdate?: (telemetry: FlightTelemetry) => void;
}

const Scene3D = ({ skipWarp, onWarpComplete, onTelemetryUpdate }: Scene3DProps) => {
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
    <div className="fixed inset-0 z-[1] pointer-events-none flex items-center justify-center overflow-hidden">
      <Canvas
        camera={{ position: [0, 20, 160.0], fov: 46 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.NoToneMapping,
        }}
      >
        <CinematicCameraRig
          isLight={isLight}
          skipWarp={skipWarp}
          onWarpComplete={onWarpComplete}
          onTelemetryUpdate={onTelemetryUpdate}
        />
      </Canvas>
    </div>
  );
};

export default Scene3D;
