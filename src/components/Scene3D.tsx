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
  const phi = Math.PI * (3 - Math.sqrt(5));
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
// Planetary Rings Generator (for Saturn)
// ----------------------------------------------------------------------------
const generateRingPoints = (count: number, innerR: number, outerR: number) => {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = innerR + Math.random() * (outerR - innerR);
    const theta = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(theta) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
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
  radius = 1.55,
}: {
  isTriggered: boolean;
  isLight: boolean;
  radius?: number;
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
      <ringGeometry args={[radius * 1.006, radius * 1.034, 64]} />
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
  const radius = 1.55;

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

  // Scale choreography: Earth scales up rapidly as camera descends into final approach (Z: 22 -> 5.5)
  const currentScale = useMemo(() => {
    if (cameraZ > 24.0) return 0.0;
    if (cameraZ > 5.5) {
      const p = (24.0 - cameraZ) / (24.0 - 5.5);
      return 0.15 + 0.85 * (1 - Math.pow(1 - p, 3));
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
      {/* Structural Ocean Coordinate Points */}
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
// Stage 1 & 2: Deep Cosmos & Galaxy Cluster Field (Camera Z: 240 -> 75)
// Featuring High-Visibility HUD Framing & Target Label (14px - 16px font-ndot)
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

  const isClusterActive = cameraZ > 70.0;

  // 1. Target Milky Way Galaxy at [0, 0, 0]: 2-arm logarithmic spiral (~4,600 points)
  const targetData = useMemo(() => {
    const count = 4600;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const arms = 2;
    const baseColor = new THREE.Color(isLight ? 0x09090b : 0xffffff);
    const dimColor = new THREE.Color(isLight ? 0x666666 : 0x888888);

    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 2.2) * 50 + 1.2;
      const armAngle = ((i % arms) * 2 * Math.PI) / arms;
      const spiralAngle = r * 0.28 + armAngle;

      const spread = r * 0.20 + 0.35;
      const jx = (Math.random() - 0.5) * spread;
      const jy = (Math.random() - 0.5) * spread;
      const jz = (Math.random() - 0.5) * (r * 0.10 + 0.5);

      pos[i * 3] = Math.cos(spiralAngle) * r + jx;
      pos[i * 3 + 1] = Math.sin(spiralAngle) * r + jy;
      pos[i * 3 + 2] = jz - r * 0.08;

      const mix = Math.min(1, r / 40);
      const c = baseColor.clone().lerp(dimColor, mix);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return { pos, col, count };
  }, [isLight]);

  // 2. Four Distant Neighbor Galaxies
  const distantData = useMemo(() => {
    const totalCount = 3200;
    const pos = new Float32Array(totalCount * 3);
    const col = new Float32Array(totalCount * 3);
    const baseColor = new THREE.Color(isLight ? 0x141416 : 0xffffff);
    const dimColor = new THREE.Color(isLight ? 0x777777 : 0x71717a);

    let idx = 0;

    // Galaxy A: Off-axis Andromeda-like Spiral at [-46, 28, 110]
    const countA = 1000;
    for (let i = 0; i < countA; i++) {
      const r = Math.pow(Math.random(), 2) * 20 + 0.8;
      const ang = r * 0.35 + (i % 2) * Math.PI;
      const x = Math.cos(ang) * r + (Math.random() - 0.5) * (r * 0.25);
      const y = (Math.sin(ang) * r + (Math.random() - 0.5) * (r * 0.25)) * 0.6;
      const z = (Math.random() - 0.5) * (r * 0.2);

      pos[idx * 3] = -46 + x * 0.85 - y * 0.5;
      pos[idx * 3 + 1] = 28 + x * 0.5 + y * 0.85;
      pos[idx * 3 + 2] = 110 + z;

      const c = baseColor.clone().lerp(dimColor, Math.random() * 0.6);
      col[idx * 3] = c.r; col[idx * 3 + 1] = c.g; col[idx * 3 + 2] = c.b;
      idx++;
    }

    // Galaxy B: Elliptical Nebula at [50, -22, 130]
    const countB = 800;
    for (let i = 0; i < countB; i++) {
      const r = Math.pow(Math.random(), 1.8) * 15;
      const th = Math.random() * Math.PI * 2;
      pos[idx * 3] = 50 + Math.cos(th) * r;
      pos[idx * 3 + 1] = -22 + Math.sin(th) * (r * 0.65);
      pos[idx * 3 + 2] = 130 + (Math.random() - 0.5) * (r * 0.5);

      const c = baseColor.clone().lerp(dimColor, Math.random() * 0.75);
      col[idx * 3] = c.r; col[idx * 3 + 1] = c.g; col[idx * 3 + 2] = c.b;
      idx++;
    }

    // Galaxy C: Barred Spiral at [38, 30, 95]
    const countC = 800;
    for (let i = 0; i < countC; i++) {
      let x = 0;
      let y = 0;
      if (i < 280) {
        x = (Math.random() - 0.5) * 12;
        y = (Math.random() - 0.5) * 2.2;
      } else {
        const side = i % 2 === 0 ? 1 : -1;
        const dist = Math.random() * 8.5;
        const ang = dist * 0.45;
        x = side * 6 + Math.cos(ang) * dist * side;
        y = side * 1.1 + Math.sin(ang) * dist;
      }
      pos[idx * 3] = 38 + x;
      pos[idx * 3 + 1] = 30 + y;
      pos[idx * 3 + 2] = 95 + (Math.random() - 0.5) * 2.5;

      const c = baseColor.clone().lerp(dimColor, Math.random() * 0.7);
      col[idx * 3] = c.r; col[idx * 3 + 1] = c.g; col[idx * 3 + 2] = c.b;
      idx++;
    }

    // Galaxy D: Dwarf Cluster at [-40, -30, 150]
    const countD = 600;
    for (let i = 0; i < countD; i++) {
      pos[idx * 3] = -40 + (Math.random() - 0.5) * 18;
      pos[idx * 3 + 1] = -30 + (Math.random() - 0.5) * 14;
      pos[idx * 3 + 2] = 150 + (Math.random() - 0.5) * 10;

      const c = baseColor.clone().lerp(dimColor, 0.4 + Math.random() * 0.5);
      col[idx * 3] = c.r; col[idx * 3 + 1] = c.g; col[idx * 3 + 2] = c.b;
      idx++;
    }

    return { pos, col, count: totalCount };
  }, [isLight]);

  // Target Milky Way fades out as camera reaches solar overview (Z: 140 -> 75)
  const targetOpacity = useMemo(() => {
    if (cameraZ > 140.0) return isLight ? 0.45 : 0.85;
    const fade = THREE.MathUtils.clamp((cameraZ - 75.0) / (140.0 - 75.0), 0, 1);
    return (isLight ? 0.45 : 0.85) * Math.pow(fade, 1.4);
  }, [cameraZ, isLight]);

  // Distant non-target galaxies fade to 0 in Stage 2 (Z: 170 -> 100)
  const distantOpacity = useMemo(() => {
    if (cameraZ > 170.0) return isLight ? 0.35 : 0.7;
    const fade = THREE.MathUtils.clamp((cameraZ - 100.0) / (170.0 - 100.0), 0, 1);
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

        {/* High-Visibility HUD Galaxy Reticle & Tactical Framing (14px - 16px font-ndot) */}
        {cameraZ > 145.0 && (
          <Html center position={[0, 9.5, 0]} distanceFactor={65}>
            <div className="font-ndot tracking-widest text-foreground bg-background/95 border-2 border-foreground/80 px-4 py-3 shadow-[0_0_30px_rgba(255,255,255,0.18)] dark:shadow-[0_0_30px_rgba(255,255,255,0.25)] select-none pointer-events-none rounded-none min-w-[320px] sm:min-w-[390px]">
              {/* Tactical Bracket Header */}
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-foreground/30">
                <div className="flex items-center gap-2 text-foreground font-bold text-[12px] sm:text-[14px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground animate-ping" />
                  <span>┌── [ TARGET ACQUIRED ] ─────────────</span>
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] text-muted-foreground">
                  SECTOR_08
                </span>
              </div>

              {/* Bold Title */}
              <div className="text-[14px] sm:text-[16px] font-bold text-foreground tracking-wider leading-tight">
                MILKY WAY GALAXY // SECTOR 08
              </div>

              {/* High-Contrast Coordinates Footer */}
              <div className="text-[11px] sm:text-[12px] text-muted-foreground font-mono mt-1.5 tracking-wider flex items-center justify-between">
                <span>COORDINATES: RA 17h 45.6m | DEC -29° 00'</span>
                <span className="text-foreground/80 font-ndot text-[10px]">└──────┘</span>
              </div>
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
// Stage 3 & 4: Full Solar System Overview & Planetary Orbital Dance
// Sun at [0, 0, 0] + Orbit Tracks + Revolving Planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn)
// Followed by Target Lock on Earth's 3rd orbit and smooth center handoff
// ----------------------------------------------------------------------------
const FullSolarSystemOverview = ({
  isLight,
  cameraZ,
  earthWorldPosRef,
  isEarthLocked,
}: {
  isLight: boolean;
  cameraZ: number;
  earthWorldPosRef: React.MutableRefObject<THREE.Vector3>;
  isEarthLocked: boolean;
}) => {
  // Active when camera enters Solar System overview (Z: 75 -> 5.5)
  const isSystemActive = cameraZ < 75.0;

  // Planetary mesh refs to animate revolutions
  const mercuryRef = useRef<THREE.Group>(null);
  const venusRef = useRef<THREE.Group>(null);
  const earthNodeRef = useRef<THREE.Group>(null);
  const marsRef = useRef<THREE.Group>(null);
  const jupiterRef = useRef<THREE.Group>(null);
  const saturnRef = useRef<THREE.Group>(null);
  const solarGroupRef = useRef<THREE.Group>(null);

  // Fade out other planets and Sun as camera locks onto Earth (Z: 25 -> 7.0)
  const outerBodiesOpacity = useMemo(() => {
    if (cameraZ > 24.0) return 1.0;
    return THREE.MathUtils.clamp((cameraZ - 7.0) / (24.0 - 7.0), 0, 1);
  }, [cameraZ]);

  // Radii of planets' orbits
  const rMercury = 4.8;
  const rVenus = 7.6;
  const rEarth = 11.5;
  const rMars = 16.0;
  const rJupiter = 23.5;
  const rSaturn = 31.0;

  // Dashed orbital tracks
  const trackMercury = useMemo(() => generateDottedOrbit(rMercury, 180), [rMercury]);
  const trackVenus = useMemo(() => generateDottedOrbit(rVenus, 240), [rVenus]);
  const trackEarth = useMemo(() => generateDottedOrbit(rEarth, 340), [rEarth]);
  const trackMars = useMemo(() => generateDottedOrbit(rMars, 420), [rMars]);
  const trackJupiter = useMemo(() => generateDottedOrbit(rJupiter, 540), [rJupiter]);
  const trackSaturn = useMemo(() => generateDottedOrbit(rSaturn, 660), [rSaturn]);

  // Planet point spheres
  const mercuryPts = useMemo(() => generateFibonacciSphere(120, 0.32), []);
  const venusPts = useMemo(() => generateFibonacciSphere(180, 0.46), []);
  const earthNodePts = useMemo(() => generateFibonacciSphere(260, 0.54), []);
  const marsPts = useMemo(() => generateFibonacciSphere(160, 0.42), []);
  const jupiterPts = useMemo(() => generateFibonacciSphere(520, 1.25), []);
  const saturnPts = useMemo(() => generateFibonacciSphere(420, 0.95), []);
  const saturnRings = useMemo(() => generateRingPoints(550, 1.35, 2.2), []);

  // Sun Core & Corona Points at [0, 0, 0]
  const sunCoronaPoints = useMemo(() => {
    const count = 480;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.4 + Math.pow(Math.random(), 1.6) * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  const pointMat = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.015,
      color: isLight ? 0x09090b : 0xffffff,
      transparent: true,
      opacity: (isLight ? 0.75 : 0.95) * outerBodiesOpacity,
      sizeAttenuation: true,
      depthWrite: false,
    });
  }, [isLight, outerBodiesOpacity]);

  const earthNodeMat = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.016,
      color: isLight ? 0x09090b : 0xffffff,
      transparent: true,
      // Fades out as the full dot-matrix Earth globe scales in
      opacity: cameraZ > 14.0 ? (isLight ? 0.85 : 1.0) : Math.max(0, (cameraZ - 6.0) / 8.0),
      sizeAttenuation: true,
      depthWrite: false,
    });
  }, [isLight, cameraZ]);

  const orbitMat = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.011,
      color: isLight ? 0x52525b : 0xa1a1aa,
      transparent: true,
      opacity: (isLight ? 0.35 : 0.55) * outerBodiesOpacity,
      sizeAttenuation: true,
      depthWrite: false,
    });
  }, [isLight, outerBodiesOpacity]);

  const sunMat = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.024,
      color: isLight ? 0x09090b : 0xffffff,
      transparent: true,
      opacity: (isLight ? 0.85 : 1.0) * outerBodiesOpacity,
      sizeAttenuation: true,
      depthWrite: false,
    });
  }, [isLight, outerBodiesOpacity]);

  // Animate planetary revolutions along their orbital paths
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Smooth orbital angular speeds
    const angMerc = t * 1.6;
    const angVenus = t * 1.15;
    const angEarth = t * 0.85;
    const angMars = t * 0.65;
    const angJup = t * 0.38;
    const angSat = t * 0.25;

    if (mercuryRef.current) {
      mercuryRef.current.position.set(Math.cos(angMerc) * rMercury, 0, Math.sin(angMerc) * rMercury);
    }
    if (venusRef.current) {
      venusRef.current.position.set(Math.cos(angVenus) * rVenus, 0, Math.sin(angVenus) * rVenus);
    }
    if (earthNodeRef.current) {
      const ex = Math.cos(angEarth) * rEarth;
      const ez = Math.sin(angEarth) * rEarth;
      earthNodeRef.current.position.set(ex, 0, ez);
      earthWorldPosRef.current.set(ex, 0, ez);
    }
    if (marsRef.current) {
      marsRef.current.position.set(Math.cos(angMars) * rMars, 0, Math.sin(angMars) * rMars);
    }
    if (jupiterRef.current) {
      jupiterRef.current.position.set(Math.cos(angJup) * rJupiter, 0, Math.sin(angJup) * rJupiter);
    }
    if (saturnRef.current) {
      saturnRef.current.position.set(Math.cos(angSat) * rSaturn, 0, Math.sin(angSat) * rSaturn);
    }

    // During Earth Lock, smooth translation centering Earth to [0, 0, 0]
    if (solarGroupRef.current) {
      if (isEarthLocked && earthNodeRef.current) {
        const targetOffsetX = -earthNodeRef.current.position.x;
        const targetOffsetZ = -earthNodeRef.current.position.z;
        solarGroupRef.current.position.x = THREE.MathUtils.damp(solarGroupRef.current.position.x, targetOffsetX, 4.0, delta);
        solarGroupRef.current.position.z = THREE.MathUtils.damp(solarGroupRef.current.position.z, targetOffsetZ, 4.0, delta);
      } else {
        solarGroupRef.current.position.set(0, 0, 0);
      }
    }
  });

  if (!isSystemActive) {
    return null;
  }

  return (
    <group ref={solarGroupRef}>
      {/* 1. Central Illuminated Sun Node at [0, 0, 0] */}
      {outerBodiesOpacity > 0.01 && (
        <group position={[0, 0, 0]}>
          <points>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={480}
                array={sunCoronaPoints}
                itemSize={3}
              />
            </bufferGeometry>
            <primitive object={sunMat} attach="material" />
          </points>

          <mesh>
            <sphereGeometry args={[1.5, 24, 24]} />
            <meshBasicMaterial
              color={isLight ? 0x09090b : 0xffffff}
              transparent
              opacity={0.85 * outerBodiesOpacity}
            />
          </mesh>

          {/* Sun Telemetry Badge */}
          {cameraZ > 35.0 && (
            <Html center position={[0, 3.2, 0]} distanceFactor={36}>
              <div className="font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] px-2 py-0.5 border border-border/80 bg-background/90 text-foreground whitespace-nowrap shadow-md pointer-events-none select-none">
                SOL // TYPE G2V // STAR_NODE
              </div>
            </Html>
          )}
        </group>
      )}

      {/* 2. Concentric Dotted Orbit Tracks */}
      {outerBodiesOpacity > 0.01 && (
        <group>
          {[trackMercury, trackVenus, trackEarth, trackMars, trackJupiter, trackSaturn].map((track, i) => (
            <points key={i}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={track.length / 3}
                  array={track}
                  itemSize={3}
                />
              </bufferGeometry>
              <primitive object={orbitMat} attach="material" />
            </points>
          ))}
        </group>
      )}

      {/* 3. Planets Revolved in Real-time */}
      {/* Mercury */}
      {outerBodiesOpacity > 0.01 && (
        <group ref={mercuryRef}>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={120} array={mercuryPts} itemSize={3} />
            </bufferGeometry>
            <primitive object={pointMat} attach="material" />
          </points>
        </group>
      )}

      {/* Venus */}
      {outerBodiesOpacity > 0.01 && (
        <group ref={venusRef}>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={180} array={venusPts} itemSize={3} />
            </bufferGeometry>
            <primitive object={pointMat} attach="material" />
          </points>
        </group>
      )}

      {/* Earth (Terra) - 3rd Orbit */}
      <group ref={earthNodeRef}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={260} array={earthNodePts} itemSize={3} />
          </bufferGeometry>
          <primitive object={earthNodeMat} attach="material" />
        </points>

        {/* High-Visibility Target Identification Reticle when Locked on Earth */}
        {isEarthLocked && cameraZ > 12.0 && (
          <Html center position={[0, 1.8, 0]} distanceFactor={28}>
            <div className="font-ndot tracking-widest text-foreground bg-background/95 border-2 border-foreground px-3 py-2 shadow-2xl pointer-events-none select-none whitespace-nowrap flex flex-col gap-0.5 rounded-none min-w-[280px]">
              <div className="flex items-center gap-1.5 text-foreground font-bold text-[12px] sm:text-[14px]">
                <span className="w-2.5 h-2.5 rounded-full bg-foreground animate-ping" />
                <span>TARGET IDENTIFIED: TERRA (EARTH)</span>
              </div>
              <div className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
                ORBIT_03 // HABITABLE ZONE // 1.000 AU
              </div>
            </div>
          </Html>
        )}
      </group>

      {/* Mars */}
      {outerBodiesOpacity > 0.01 && (
        <group ref={marsRef}>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={160} array={marsPts} itemSize={3} />
            </bufferGeometry>
            <primitive object={pointMat} attach="material" />
          </points>
          <Html center distanceFactor={22}>
            <div className="font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] px-2 py-0.5 border border-border/80 bg-background/90 text-foreground whitespace-nowrap shadow-md pointer-events-none select-none">
              MARS // 1.524 AU
            </div>
          </Html>
        </group>
      )}

      {/* Jupiter */}
      {outerBodiesOpacity > 0.01 && (
        <group ref={jupiterRef}>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={520} array={jupiterPts} itemSize={3} />
            </bufferGeometry>
            <primitive object={pointMat} attach="material" />
          </points>
          <Html center distanceFactor={26}>
            <div className="font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] px-2 py-0.5 border border-border/80 bg-background/90 text-foreground whitespace-nowrap shadow-md pointer-events-none select-none">
              JUPITER // GAS_GIANT
            </div>
          </Html>
        </group>
      )}

      {/* Saturn with Tilted Rings */}
      {outerBodiesOpacity > 0.01 && (
        <group ref={saturnRef}>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={420} array={saturnPts} itemSize={3} />
            </bufferGeometry>
            <primitive object={pointMat} attach="material" />
          </points>

          {/* Saturn Rings tilted at 26.7 deg */}
          <points rotation={[0.465, 0.2, 0]}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={550} array={saturnRings} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
              size={0.012}
              color={isLight ? 0x222225 : 0xe4e4e7}
              transparent
              opacity={(isLight ? 0.6 : 0.75) * outerBodiesOpacity}
              sizeAttenuation
              depthWrite={false}
            />
          </points>

          <Html center distanceFactor={28}>
            <div className="font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] px-2 py-0.5 border border-border/80 bg-background/90 text-foreground whitespace-nowrap shadow-md pointer-events-none select-none">
              SATURN // RINGED_GIANT
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
// Stage 1: Deep Cosmos & Galaxy Cluster (Z: 220 -> 150)
// Stage 2: Entering Milky Way Galaxy (Z: 150 -> 75)
// Stage 3: Full Solar System Overview (Angled overhead [0, 35, 60], tilted ~30°)
// Stage 4: Target Acquisition & Lock on Earth (Overhead plunge Z: 60 -> 5.5)
// Stage 5: Visakhapatnam Beacon & Hero Reveal (Z: 5.5, Y: 0)
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
  const [currentCameraZ, setCurrentCameraZ] = useState(220.0);
  const [isBeaconIgnited, setIsBeaconIgnited] = useState(false);
  const [isShockwaveTriggered, setIsShockwaveTriggered] = useState(false);
  const [isEarthLocked, setIsEarthLocked] = useState(false);
  const earthWorldPosRef = useRef<THREE.Vector3>(new THREE.Vector3(11.5, 0, 0));

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

  // Initialize camera: Deep Cosmos at [0, 22, 220]
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
      setIsEarthLocked(true);
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
      camera.position.set(0, 22, 220);
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
      setIsEarthLocked(true);

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
      let targetZ = 220.0;
      let factor = 0;
      let velText = '0.0c';
      let distText = '54M LY';
      let locked = false;
      let stageName = 'DEEP_SPACE // VIRGO_SUPERCLUSTER';
      let targetTag = 'DEEP_SPACE // VIRGO_SUPERCLUSTER -> TARGET_LOCKED: MILKY_WAY_GALAXY';
      let sectorText = 'SECTOR_00 // MULTI_GALAXY_CLUSTER [ACQUIRING]';

      // =======================================================================
      // STAGE 1: Deep Cosmos & Galaxy Cluster (0.0s – 1.1s)
      // Camera Z: 220 -> 150 | Earth hidden | High-visibility HUD galaxy reticle
      // =======================================================================
      if (t < 1.1) {
        const u = t / 1.1;
        targetX = 0;
        targetY = 22.0 - u * 2.0;
        targetZ = 220.0 - u * 70.0;
        factor = 0;
        velText = '0.0c';
        distText = `${Math.round(54000000 - u * 28000000).toLocaleString()} LY`;
        stageName = 'DEEP_SPACE // VIRGO_SUPERCLUSTER';
        targetTag = 'DEEP_SPACE // VIRGO_SUPERCLUSTER -> TARGET_LOCKED: MILKY_WAY_GALAXY';
        sectorText = 'SECTOR_00 // MULTI_GALAXY_CLUSTER [ACQUIRING]';
      }
      // =======================================================================
      // STAGE 2: Entering Milky Way Galaxy (1.1s – 2.0s)
      // Camera Z: 150 -> 75 | Punching through galactic core toward solar system
      // =======================================================================
      else if (t < 2.0) {
        const u = (t - 1.1) / 0.9;
        const accel = Math.pow(u, 1.8);

        targetX = Math.sin(u * Math.PI) * 2.5 * (1 - u);
        targetY = 20.0 + (32.0 - 20.0) * accel;
        targetZ = 150.0 - (150.0 - 75.0) * accel;

        factor = Math.sin(u * Math.PI) * 0.95;
        velText = (8.5 - u * 2.5).toFixed(1) + 'c';
        distText = `${Math.round(26000000 - accel * 25990000).toLocaleString()} LY`;
        stageName = 'ORION_CYGNUS_ARM // SOLAR_NEIGHBORHOOD_ACQUIRED';
        targetTag = 'ORION_CYGNUS_ARM // SOLAR_NEIGHBORHOOD_ACQUIRED';
        sectorText = 'APPROACH_VECTOR: GALACTIC_DISK_INSERTION';
      }
      // =======================================================================
      // STAGE 3: Full Solar System Overview (The Grand System View) (2.0s – 3.4s)
      // Camera descends to angled overhead vantage [0, 35, 60] tilted down ~30°
      // Full planetary dance revolving around the central illuminated Sun
      // =======================================================================
      else if (t < 3.4) {
        const u = (t - 2.0) / 1.4;
        const ease = 1 - Math.pow(1 - u, 3);

        targetX = 0;
        targetY = 32.0 + (35.0 - 32.0) * ease;
        targetZ = 75.0 - (75.0 - 60.0) * ease;

        factor = 0.35;
        velText = '1.2c';
        distText = (65.0 - ease * 40.0).toFixed(1) + ' AU';
        stageName = 'SOL SYSTEM // HELIOCENTRIC ORBITAL GRID';
        targetTag = 'SOL SYSTEM // HELIOCENTRIC ORBITAL GRID';
        sectorText = 'SOLAR_DISC_OVERVIEW // REVOLVING_PLANETARY_SYSTEM';

        if (isEarthLocked) {
          setIsEarthLocked(false);
        }
      }
      // =======================================================================
      // STAGE 4: Target Acquisition & Lock on Earth (3.4s – 4.6s)
      // Reticle sweeps and locks onto 3rd orbit (Earth)
      // Camera plunges from overhead [0, 35, 60] straight down to [0, 0, 5.5]
      // =======================================================================
      else if (t < 4.6) {
        const u = (t - 3.4) / 1.2;
        const quintic = 1 - Math.pow(1 - u, 4);

        if (!isEarthLocked) {
          setIsEarthLocked(true);
        }

        targetX = 0;
        targetY = 35.0 * (1 - quintic);
        targetZ = 60.0 - (60.0 - 5.5) * quintic;

        factor = (1 - u) * 0.5;
        velText = ((1 - u) * 1.8).toFixed(1) + 'c';
        distText = `${Math.round(42000 - quintic * 41600).toLocaleString()} KM`;
        stageName = 'TARGET IDENTIFIED: TERRA (EARTH) // HABITABLE ZONE';
        targetTag = 'TARGET IDENTIFIED: TERRA (EARTH) // HABITABLE ZONE';
        sectorText = 'APPROACH_VECTOR: TERRA_ATMOSPHERIC_INSERTION';

        if (targetZ <= 7.0 && !isShockwaveTriggered) {
          setIsShockwaveTriggered(true);
        }
        if (!isBeaconIgnited) {
          setIsBeaconIgnited(true);
        }

        // Trigger Hero UI fade-in during arrival
        if (u >= 0.70 && !handoffTriggeredRef.current) {
          handoffTriggeredRef.current = true;
          onWarpComplete?.();
        }
      }
      // =======================================================================
      // STAGE 5: Visakhapatnam Beacon & Hero Reveal (t >= 4.6s)
      // Camera resting at [0, 0, 5.5], zero tilt | Beacon active at 17.6868° N, 83.2185° E
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
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 7.0, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 7.0, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 7.0, delta);
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

      const targetScale = isDesktop ? 0.90 : 0.72;
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

      {/* Stage 3 & 4: Full Solar System Overview (Sun Node + Orbit Tracks + Revolving Planets) */}
      <FullSolarSystemOverview
        isLight={isLight}
        cameraZ={currentCameraZ}
        earthWorldPosRef={earthWorldPosRef}
        isEarthLocked={isEarthLocked}
      />

      {/* Stage 4: Gravitational Shockwave Ripple upon orbital arrival */}
      <GravitationalShockwave
        isTriggered={isShockwaveTriggered}
        isLight={isLight}
        radius={1.55}
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
        camera={{ position: [0, 22, 220.0], fov: 46 }}
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
