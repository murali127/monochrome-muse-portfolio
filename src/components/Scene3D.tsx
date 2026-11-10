import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import landPointsData from '@/data/earthLandPoints.json';

// ----------------------------------------------------------------------------
// Flight Telemetry Interface
// ----------------------------------------------------------------------------
export interface FlightTelemetry {
  velocity: string;
  distance: string;
  isLocked: boolean;
  warpFactor: number;
  stageName?: string;
  targetTag?: string;
  sectorText?: string;
}

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
// Mathematical Fibonacci Sphere Generator
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
// Concentric Dotted Orbit Track Generator
// ----------------------------------------------------------------------------
const generateDottedOrbit = (radius: number, count: number) => {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    pos[i * 3] = Math.cos(angle) * radius;
    pos[i * 3 + 1] = 0;
    pos[i * 3 + 2] = Math.sin(angle) * radius;
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
// Minimal Visakhapatnam Micro-Radar Beacon (17.6868° N, 83.2185° E)
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
// Stage 4 & 5: Dot-Matrix Earth Core (Z: 0, Centered, Strictly 0 Axial Tilt)
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

  // 1. Crisp Coastline Land Points (8,950 points from high-contrast mask)
  const landGeometry = useMemo(() => {
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

  // 2. Structural Ocean Grid (2,200 points) so oceans maintain faint coordinate telemetry
  const oceanPositions = useMemo(() => generateFibonacciSphere(2200, radius * 0.998), [radius]);

  const landPointMaterial = useMemo(() => createOrganicPointShaderMaterial(isLight), [isLight]);
  const atmosphereMaterial = useMemo(() => createAtmosphereFresnelMaterial(isLight), [isLight]);

  const oceanMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.008,
      color: isLight ? 0x3f3f46 : 0xd4d4d8,
      transparent: true,
      opacity: isLight ? 0.07 : 0.14,
      sizeAttenuation: true,
      depthWrite: false,
    });
  }, [isLight]);

  // Scale choreography across the descent:
  // Z > 90: scale = 0 (hidden)
  // Z 90 -> 25: emerges smoothly from distance
  // Z 25 -> 5.5: expands to full 1.0 heroic scale
  const currentScale = useMemo(() => {
    if (cameraZ > 90.0) return 0.0;
    if (cameraZ > 25.0) {
      const p = (90.0 - cameraZ) / (90.0 - 25.0);
      return 0.02 + 0.26 * Math.pow(p, 1.8);
    }
    if (cameraZ > 5.5) {
      const p = (25.0 - cameraZ) / (25.0 - 5.5);
      return 0.28 + 0.72 * (1 - Math.pow(1 - p, 3));
    }
    return 1.0;
  }, [cameraZ]);

  // Strict 0 Axial Tilt: Vertical upright planetary rotation on Y-axis
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
      {/* Structural Ocean Coordinate Points (Whisper-quiet telemetry grid) */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2200}
            array={oceanPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <primitive object={oceanMaterial} attach="material" />
      </points>

      {/* Organic Dot-Matrix Continents */}
      <points geometry={landGeometry} material={landPointMaterial} />

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
// Stage 1 & 2: Deep Cosmos & Galaxy Cluster Field (Camera Z: 240 -> 90)
// Populated with 4 to 5 distinct mini galaxy point clusters; Milky Way is target
// ----------------------------------------------------------------------------
const MultiGalaxyClusterField = ({
  isLight,
  cameraZ,
}: {
  isLight: boolean;
  cameraZ: number;
}) => {
  const targetGalaxyRef = useRef<THREE.Points>(null);
  const distantGalaxiesRef = useRef<THREE.Points>(null);

  // Active during Stage 1 and Stage 2 (Z > 85.0)
  const isClusterActive = cameraZ > 85.0;

  // 1. Target Milky Way Galaxy at [0, 0, 0]: 2-arm logarithmic spiral (~4,600 points)
  const targetData = useMemo(() => {
    const count = 4600;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const arms = 2;
    const baseColor = new THREE.Color(isLight ? 0x09090b : 0xffffff);
    const dimColor = new THREE.Color(isLight ? 0x666666 : 0x888888);

    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 2.2) * 48 + 1.2;
      const armAngle = ((i % arms) * 2 * Math.PI) / arms;
      const spiralAngle = r * 0.28 + armAngle;

      const spread = r * 0.20 + 0.35;
      const jx = (Math.random() - 0.5) * spread;
      const jy = (Math.random() - 0.5) * spread;
      const jz = (Math.random() - 0.5) * (r * 0.10 + 0.5);

      pos[i * 3] = Math.cos(spiralAngle) * r + jx;
      pos[i * 3 + 1] = Math.sin(spiralAngle) * r + jy;
      pos[i * 3 + 2] = jz - r * 0.08;

      const mix = Math.min(1, r / 38);
      const c = baseColor.clone().lerp(dimColor, mix);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return { pos, col, count };
  }, [isLight]);

  // 2. Four Distant Neighbor Galaxies (Off-axis spiral, Elliptical nebula, Barred spiral, Dwarf cluster)
  const distantData = useMemo(() => {
    const totalCount = 3400;
    const pos = new Float32Array(totalCount * 3);
    const col = new Float32Array(totalCount * 3);
    const baseColor = new THREE.Color(isLight ? 0x141416 : 0xffffff);
    const dimColor = new THREE.Color(isLight ? 0x777777 : 0x71717a);

    let idx = 0;

    // Galaxy A: Off-axis Andromeda-like Spiral at [-44, 26, 110] (~1,100 points)
    const countA = 1100;
    for (let i = 0; i < countA; i++) {
      const r = Math.pow(Math.random(), 2) * 19 + 0.8;
      const ang = r * 0.35 + (i % 2) * Math.PI;
      const x = Math.cos(ang) * r + (Math.random() - 0.5) * (r * 0.25);
      const y = (Math.sin(ang) * r + (Math.random() - 0.5) * (r * 0.25)) * 0.6;
      const z = (Math.random() - 0.5) * (r * 0.2);

      pos[idx * 3] = -44 + x * 0.85 - y * 0.5;
      pos[idx * 3 + 1] = 26 + x * 0.5 + y * 0.85;
      pos[idx * 3 + 2] = 110 + z;

      const c = baseColor.clone().lerp(dimColor, Math.random() * 0.6);
      col[idx * 3] = c.r;
      col[idx * 3 + 1] = c.g;
      col[idx * 3 + 2] = c.b;
      idx++;
    }

    // Galaxy B: Elliptical Nebula at [48, -20, 130] (~850 points)
    const countB = 850;
    for (let i = 0; i < countB; i++) {
      const r = Math.pow(Math.random(), 1.8) * 15;
      const th = Math.random() * Math.PI * 2;
      const x = Math.cos(th) * r;
      const y = Math.sin(th) * (r * 0.65);
      const z = (Math.random() - 0.5) * (r * 0.5);

      pos[idx * 3] = 48 + x;
      pos[idx * 3 + 1] = -20 + y;
      pos[idx * 3 + 2] = 130 + z;

      const c = baseColor.clone().lerp(dimColor, Math.random() * 0.75);
      col[idx * 3] = c.r;
      col[idx * 3 + 1] = c.g;
      col[idx * 3 + 2] = c.b;
      idx++;
    }

    // Galaxy C: Barred Spiral at [36, 28, 95] (~850 points)
    const countC = 850;
    for (let i = 0; i < countC; i++) {
      let x = 0;
      let y = 0;
      if (i < 300) {
        // Central bar
        x = (Math.random() - 0.5) * 12;
        y = (Math.random() - 0.5) * 2.2;
      } else {
        // 2 sweeping arms extending from bar tips
        const side = i % 2 === 0 ? 1 : -1;
        const dist = Math.random() * 8.5;
        const ang = dist * 0.45;
        x = side * 6 + Math.cos(ang) * dist * side;
        y = side * 1.1 + Math.sin(ang) * dist;
      }
      const z = (Math.random() - 0.5) * 2.5;

      pos[idx * 3] = 36 + x;
      pos[idx * 3 + 1] = 28 + y;
      pos[idx * 3 + 2] = 95 + z;

      const c = baseColor.clone().lerp(dimColor, Math.random() * 0.7);
      col[idx * 3] = c.r;
      col[idx * 3 + 1] = c.g;
      col[idx * 3 + 2] = c.b;
      idx++;
    }

    // Galaxy D: Irregular Dwarf Cluster at [-38, -28, 150] (~600 points)
    const countD = 600;
    for (let i = 0; i < countD; i++) {
      const x = (Math.random() - 0.5) * 16 + (Math.random() - 0.5) * 6;
      const y = (Math.random() - 0.5) * 12 + (Math.random() - 0.5) * 4;
      const z = (Math.random() - 0.5) * 10;

      pos[idx * 3] = -38 + x;
      pos[idx * 3 + 1] = -28 + y;
      pos[idx * 3 + 2] = 150 + z;

      const c = baseColor.clone().lerp(dimColor, 0.4 + Math.random() * 0.5);
      col[idx * 3] = c.r;
      col[idx * 3 + 1] = c.g;
      col[idx * 3 + 2] = c.b;
      idx++;
    }

    return { pos, col, count: totalCount };
  }, [isLight]);

  // Target Milky Way fades out as camera punches through toward Orion Arm (Z: 140 -> 85)
  const targetOpacity = useMemo(() => {
    if (cameraZ > 140.0) return isLight ? 0.45 : 0.85;
    const fade = THREE.MathUtils.clamp((cameraZ - 85.0) / (140.0 - 85.0), 0, 1);
    return (isLight ? 0.45 : 0.85) * Math.pow(fade, 1.4);
  }, [cameraZ, isLight]);

  // Distant non-target galaxies fade to 0 in Stage 2 (Z: 160 -> 90)
  const distantOpacity = useMemo(() => {
    if (cameraZ > 160.0) return isLight ? 0.35 : 0.7;
    const fade = THREE.MathUtils.clamp((cameraZ - 90.0) / (160.0 - 90.0), 0, 1);
    return (isLight ? 0.35 : 0.7) * fade;
  }, [cameraZ, isLight]);

  useFrame((_state, delta) => {
    if (targetGalaxyRef.current) {
      targetGalaxyRef.current.rotation.z += delta * 0.035;
    }
    if (distantGalaxiesRef.current) {
      distantGalaxiesRef.current.rotation.z += delta * 0.015;
    }
  });

  if (!isClusterActive) {
    return null;
  }

  return (
    <>
      {/* 1. Target Milky Way Galaxy at [0, 0, 0] */}
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

        {/* Tactical Reticle Badge targeting Milky Way in Stage 1 */}
        {cameraZ > 155.0 && (
          <Html center position={[0, 0, 0]} distanceFactor={70}>
            <div className="font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] px-2.5 py-1 border border-border/80 bg-background/90 text-foreground whitespace-nowrap shadow-xl pointer-events-none select-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-ping" />
              <span>DEEP_SPACE // VIRGO_SUPERCLUSTER -&gt; TARGET_LOCKED: MILKY_WAY_GALAXY</span>
            </div>
          </Html>
        )}
      </points>

      {/* 2. Distant Non-Target Galaxies */}
      {distantOpacity > 0.01 && (
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
            opacity={distantOpacity}
            sizeAttenuation
            depthWrite={false}
          />
        </points>
      )}
    </>
  );
};

// ----------------------------------------------------------------------------
// Stage 3: Solar System & Planetary Transit (Camera Z: 90 -> 25)
// Central Sun Node + Dashed Orbit Rings + Mars & Jupiter + Approaching Earth Marker
// ----------------------------------------------------------------------------
const SolarSystemField = ({
  isLight,
  cameraZ,
}: {
  isLight: boolean;
  cameraZ: number;
}) => {
  // Only active when entering local system: Z between 14.0 and 95.0
  const isSystemActive = cameraZ > 14.0 && cameraZ < 95.0;

  // Fade out as camera approaches Earth lock (Z: 25 -> 14)
  const systemOpacity = useMemo(() => {
    if (cameraZ > 25.0) return 1.0;
    return THREE.MathUtils.clamp((cameraZ - 14.0) / (25.0 - 14.0), 0, 1);
  }, [cameraZ]);

  // Mars geometry (radius 0.62, 450 dotted points)
  const marsPoints = useMemo(() => generateFibonacciSphere(450, 0.62), []);

  // Jupiter geometry (radius 1.45, 750 points with equatorial bands)
  const jupiterPoints = useMemo(() => {
    const count = 750;
    const pos = new Float32Array(count * 3);
    const radius = 1.45;
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      // Slight oblate flattening for gas giant realism
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * 0.93 * Math.cos(phi);
      pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return pos;
  }, []);

  // Central Sun Core & Corona Points (located at [-18, 7, -15])
  const sunPos: [number, number, number] = useMemo(() => [-18, 7, -15], []);
  const sunCoronaPoints = useMemo(() => {
    const count = 420;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.4 + Math.pow(Math.random(), 1.5) * 3.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  // Tactical Dashed Concentric Orbit Rings centered around the Sun
  const orbit1 = useMemo(() => generateDottedOrbit(12.0, 180), []);
  const orbit2 = useMemo(() => generateDottedOrbit(18.0, 260), []);
  const orbit3 = useMemo(() => generateDottedOrbit(24.5, 360), []); // Terra Orbit passing near [0, 0, 0]
  const orbit4 = useMemo(() => generateDottedOrbit(34.0, 440), []); // Mars Orbit
  const orbit5 = useMemo(() => generateDottedOrbit(48.0, 560), []); // Jupiter Orbit

  const pointMat = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.015,
      color: isLight ? 0x09090b : 0xffffff,
      transparent: true,
      opacity: (isLight ? 0.75 : 0.9) * systemOpacity,
      sizeAttenuation: true,
      depthWrite: false,
    });
  }, [isLight, systemOpacity]);

  const orbitMat = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.011,
      color: isLight ? 0x52525b : 0xa1a1aa,
      transparent: true,
      opacity: (isLight ? 0.35 : 0.55) * systemOpacity,
      sizeAttenuation: true,
      depthWrite: false,
    });
  }, [isLight, systemOpacity]);

  const sunMat = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.022,
      color: isLight ? 0x09090b : 0xffffff,
      transparent: true,
      opacity: (isLight ? 0.85 : 1.0) * systemOpacity,
      sizeAttenuation: true,
      depthWrite: false,
    });
  }, [isLight, systemOpacity]);

  if (!isSystemActive || systemOpacity <= 0.001) {
    return null;
  }

  return (
    <group>
      {/* 1. Central Sun Node & Corona at [-18, 7, -15] */}
      <group position={sunPos}>
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={420}
              array={sunCoronaPoints}
              itemSize={3}
            />
          </bufferGeometry>
          <primitive object={sunMat} attach="material" />
        </points>

        {/* Tactical Dashed Orbit Tracks in Ecliptic Plane */}
        <group rotation={[0.18, 0, 0]}>
          {[orbit1, orbit2, orbit3, orbit4, orbit5].map((orb, i) => (
            <points key={i}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={orb.length / 3}
                  array={orb}
                  itemSize={3}
                />
              </bufferGeometry>
              <primitive object={orbitMat} attach="material" />
            </points>
          ))}
        </group>

        {/* Sun Telemetry Badge */}
        <Html center distanceFactor={28}>
          <div className="font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] px-2 py-0.5 border border-border/80 bg-background/90 text-foreground whitespace-nowrap shadow-md pointer-events-none select-none">
            SOL // TYPE G2V // STAR_NODE
          </div>
        </Html>
      </group>

      {/* 2. Mars at [-8.5, 3.8, 55.0] (Drifts past upper-left) */}
      <group position={[-8.5, 3.8, 55.0]}>
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

        <Html center distanceFactor={18}>
          <div className="font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] px-2 py-0.5 border border-border/80 bg-background/90 text-foreground whitespace-nowrap shadow-md pointer-events-none select-none">
            MARS // 1.524 AU
          </div>
        </Html>
      </group>

      {/* 3. Jupiter at [14.2, -4.5, 72.0] (Distant right flank) */}
      <group position={[14.2, -4.5, 72.0]}>
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={750}
              array={jupiterPoints}
              itemSize={3}
            />
          </bufferGeometry>
          <primitive object={pointMat} attach="material" />
        </points>

        <Html center distanceFactor={22}>
          <div className="font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] px-2 py-0.5 border border-border/80 bg-background/90 text-foreground whitespace-nowrap shadow-md pointer-events-none select-none">
            JUPITER // GAS_GIANT
          </div>
        </Html>
      </group>

      {/* 4. Approaching Earth Target Marker (Visible while camera is Z: 90 -> 32) */}
      {cameraZ > 32.0 && (
        <group position={[0, 0, 0]}>
          <Html center distanceFactor={20}>
            <div className="font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] px-2.5 py-1 border border-border/80 bg-background/90 text-foreground whitespace-nowrap shadow-xl pointer-events-none select-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-ping" />
              <span>TARGET_ORBIT: TERRA // THIRD_SOL_ORBIT</span>
            </div>
          </Html>
        </group>
      )}
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
      const r = 2.5 + Math.pow(Math.random(), 1.6) * 45;
      const angle = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = Math.sin(angle) * r * 0.75 + (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = -40 + Math.random() * 280;
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
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.005;
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
// Flight Controller: 5-Stage Scientific Cosmic Descent
// Stage 1: Deep Cosmos / Galaxy Cluster (Progress 0.0 – 0.20 | Z: 240 -> 160)
// Stage 2: Milky Way Galactic Insertion (Progress 0.20 – 0.45 | Z: 160 -> 90)
// Stage 3: Entering Solar System (Progress 0.45 – 0.75 | Z: 90 -> 25)
// Stage 4: Atmospheric Insertion & Earth Lock (Progress 0.75 – 0.95 | Z: 25 -> 5.5)
// Stage 5: Visakhapatnam Beacon & Hero Reveal (Progress 0.95 – 1.0 | Z: 5.5)
// ----------------------------------------------------------------------------
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
  const [currentCameraZ, setCurrentCameraZ] = useState(240.0);
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

  // Initialize camera: Deep Cosmos at [0, 22, 240] taking in the Virgo Supercluster
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
        stageName: 'ORBIT_STABLE // NODE: VISAKHAPATNAM [ACTIVE]',
        targetTag: 'NODE: VISAKHAPATNAM [17.6868° N, 83.2185° E]',
        sectorText: 'ORBIT_STABLE // NODE: VISAKHAPATNAM [ACTIVE]',
      });
    } else {
      camera.position.set(0, 22, 240);
      camera.lookAt(0, 0, 0);
      persCam.fov = 46;
      persCam.updateProjectionMatrix();
    }
  }, [camera, onWarpComplete, onTelemetryUpdate]);

  useFrame((_state, delta) => {
    const persCam = camera as THREE.PerspectiveCamera;

    // Failsafe & Skip handling: Smooth lerp to [0, 0, 5.5] within 300ms
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
          stageName: 'ORBIT_STABLE // NODE: VISAKHAPATNAM [ACTIVE]',
          targetTag: 'NODE: VISAKHAPATNAM [17.6868° N, 83.2185° E]',
          sectorText: 'ORBIT_STABLE // NODE: VISAKHAPATNAM [ACTIVE]',
        });
      }
      return;
    }

    if (!completedRef.current) {
      timeRef.current += delta;
      const t = timeRef.current;

      let targetX = 0;
      let targetY = 22.0;
      let targetZ = 240.0;
      let factor = 0;
      let velText = '0.0c';
      let distText = '54M LY';
      let locked = false;
      let stageName = 'DEEP_SPACE // VIRGO_SUPERCLUSTER';
      let targetTag = 'DEEP_SPACE // VIRGO_SUPERCLUSTER -> TARGET_LOCKED: MILKY_WAY_GALAXY';
      let sectorText = 'SECTOR_00 // MULTI_GALAXY_CLUSTER';

      // =======================================================================
      // STAGE 1: Deep Cosmos / Galaxy Cluster (Progress 0.0 – 0.20 | 0.0s – 0.85s)
      // Camera Z: 240 -> 160 | Earth hidden | Targeting Milky Way
      // =======================================================================
      if (t < 0.85) {
        const u = t / 0.85;
        targetX = 0;
        targetY = 22.0 - u * 6.0;
        targetZ = 240.0 - u * 80.0;
        factor = 0;
        velText = '0.0c';
        distText = `${Math.round(54000000 - u * 28000000).toLocaleString()} LY`;
        stageName = 'DEEP_SPACE // VIRGO_SUPERCLUSTER';
        targetTag = 'DEEP_SPACE // VIRGO_SUPERCLUSTER -> TARGET_LOCKED: MILKY_WAY_GALAXY';
        sectorText = 'SECTOR_00 // MULTI_GALAXY_CLUSTER [ACQUIRING]';
      }
      // =======================================================================
      // STAGE 2: Entering the Milky Way Galaxy (Progress 0.20 – 0.45 | 0.85s – 1.95s)
      // Camera Z: 160 -> 90 | Distant clusters fade | Punching toward Orion Arm
      // =======================================================================
      else if (t < 1.95) {
        const u = (t - 0.85) / 1.1; // 0 -> 1
        const accel = Math.pow(u, 1.8);

        targetX = Math.sin(u * Math.PI) * 2.4 * (1 - u);
        targetY = 16.0 - (16.0 - 6.0) * accel;
        targetZ = 160.0 - (160.0 - 90.0) * accel;

        factor = Math.sin(u * Math.PI) * 0.95;
        velText = (8.5 - u * 2.3).toFixed(1) + 'c';
        distText = `${Math.round(26000000 - accel * 25974000).toLocaleString()} LY`;
        stageName = 'ORION_CYGNUS_ARM // SOLAR_NEIGHBORHOOD_ACQUIRED';
        targetTag = 'ORION_CYGNUS_ARM // SOLAR_NEIGHBORHOOD_ACQUIRED';
        sectorText = 'APPROACH_VECTOR: GALACTIC_DISK_INSERTION';
      }
      // =======================================================================
      // STAGE 3: Entering the Solar System (Progress 0.45 – 0.75 | 1.95s – 3.25s)
      // Camera Z: 90 -> 25 | Sun + Orbit Rings + Mars & Jupiter pass by | Earth emerges
      // =======================================================================
      else if (t < 3.25) {
        const u = (t - 1.95) / 1.3; // 0 -> 1
        const ease = 1 - Math.pow(1 - u, 3);

        targetX = Math.sin(u * Math.PI) * 1.5 * (1 - u);
        targetY = 6.0 - (6.0 - 1.5) * ease;
        targetZ = 90.0 - (90.0 - 25.0) * ease;

        factor = (1 - u) * 0.65;
        velText = (6.2 - u * 4.8).toFixed(1) + 'c';
        distText = (48.0 - ease * 47.0).toFixed(1) + ' AU';
        stageName = 'TARGET_ORBIT: TERRA // THIRD_SOL_ORBIT';
        targetTag = 'TARGET_ORBIT: TERRA // THIRD_SOL_ORBIT';
        sectorText = 'APPROACH_VECTOR: SOLAR_SYSTEM [MARS // JUPITER]';
      }
      // =======================================================================
      // STAGE 4: Atmospheric Insertion & Earth Lock (Progress 0.75 – 0.95 | 3.25s – 4.10s)
      // Camera Z: 25 -> 5.5 | Other bodies fade | Earth expands to 1.0 upright
      // =======================================================================
      else if (t < 4.10) {
        const u = (t - 3.25) / 0.85; // 0 -> 1
        const quintic = 1 - Math.pow(1 - u, 4);

        targetX = 0;
        targetY = 1.5 * (1 - quintic);
        targetZ = 25.0 - (25.0 - 5.5) * quintic;

        factor = 0;
        velText = ((1 - u) * 1.4).toFixed(1) + 'c';
        distText = `${Math.round(42000 - quintic * 41600).toLocaleString()} KM`;
        stageName = 'ATMOSPHERIC_INSERTION // TERRA_APPROACH';
        targetTag = 'TERRA // ORBITAL_LOCK_ENGAGED';
        sectorText = 'APPROACH_VECTOR: TERRA_ATMOSPHERIC_INSERTION';

        if (targetZ <= 7.0 && !isShockwaveTriggered) {
          setIsShockwaveTriggered(true);
        }
        if (!isBeaconIgnited) {
          setIsBeaconIgnited(true);
        }

        // Seamless State Handoff: Trigger Hero UI fade & slide-in during final approach
        if (u >= 0.75 && !handoffTriggeredRef.current) {
          handoffTriggeredRef.current = true;
          onWarpComplete?.();
        }
      }
      // =======================================================================
      // STAGE 5: Visakhapatnam Beacon & Hero Reveal (Progress 0.95 – 1.0 | t >= 4.10s)
      // Camera resting at [0, 0, 5.5] | Beacon ignites at 17.6868° N, 83.2185° E
      // =======================================================================
      else {
        targetX = 0;
        targetY = 0;
        targetZ = 5.5;
        factor = 0;
        velText = '0.0c';
        distText = '400 KM';
        locked = true;
        stageName = 'ORBIT_STABLE // NODE: VISAKHAPATNAM [ACTIVE]';
        targetTag = 'NODE: VISAKHAPATNAM [17.6868° N, 83.2185° E]';
        sectorText = 'ORBIT_STABLE // NODE: VISAKHAPATNAM [ACTIVE]';

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
        stageName,
        targetTag,
        sectorText,
      });
    }

    // Parallax Rig handling (Gentle subtle mouse translation when docked)
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
      {/* Stage 1 & 2: Deep Cosmos Multi-Galaxy Cluster Field */}
      <MultiGalaxyClusterField isLight={isLight} cameraZ={currentCameraZ} />

      {/* Ambient Depth: Volumetric 3D Celestial Starfield */}
      <VolumetricCelestialField isLight={isLight} />

      {/* Stage 3: Local Solar System Transit (Sun Node + Orbit Tracks + Mars & Jupiter) */}
      <SolarSystemField isLight={isLight} cameraZ={currentCameraZ} />

      {/* Stage 4: Gravitational Shockwave Ripple upon orbital arrival */}
      <GravitationalShockwave
        isTriggered={isShockwaveTriggered}
        isLight={isLight}
      />

      {/* Stage 4 & 5: Centered Dot-Matrix Earth Globe Core (Strict 0 Axial Tilt) */}
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
// Scene3D Canvas Root - Centered Viewport
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
        camera={{ position: [0, 22, 240.0], fov: 46 }}
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
