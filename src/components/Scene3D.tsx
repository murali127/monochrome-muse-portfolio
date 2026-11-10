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
// Unified Single-Entity Earth Globe (Statically Anchored at [0, 0, 0])
// Scales continuously from 0.12 (Solar System view) to 1.0 (Portfolio Dock)
// ----------------------------------------------------------------------------
const DotMatrixGlobe = ({
  isLight,
  isIgnited,
  scale,
}: {
  isLight: boolean;
  isIgnited: boolean;
  scale: number;
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

  // Strict 0 Axial Tilt: Vertical upright planetary rotation on Y-axis
  useFrame((_state, delta) => {
    if (!globeGroupRef.current) return;
    globeGroupRef.current.rotation.x = 0;
    globeGroupRef.current.rotation.z = 0;
    globeGroupRef.current.rotation.y += delta * 0.15;
  });

  if (scale <= 0.001) {
    return null;
  }

  return (
    <group ref={globeGroupRef} scale={[scale, scale, scale]} position={[0, 0, 0]}>
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
// Stage 1 & 2: Deep Cosmos & Galaxy Cluster Field (Camera Z: 200 -> 75)
// High-Visibility HUD Framing & Target Label (14px - 16px font-ndot)
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

  const isClusterActive = cameraZ > 65.0;

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

  const targetOpacity = useMemo(() => {
    if (cameraZ > 130.0) return isLight ? 0.45 : 0.85;
    const fade = THREE.MathUtils.clamp((cameraZ - 70.0) / (130.0 - 70.0), 0, 1);
    return (isLight ? 0.45 : 0.85) * Math.pow(fade, 1.4);
  }, [cameraZ, isLight]);

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

        {/* High-Visibility HUD Galaxy Reticle & Tactical Framing */}
        {cameraZ > 135.0 && (
          <Html center position={[0, 9.5, 0]} distanceFactor={65}>
            <div className="font-ndot tracking-widest text-foreground bg-background/95 border-2 border-foreground/80 px-4 py-3 shadow-[0_0_30px_rgba(255,255,255,0.18)] dark:shadow-[0_0_30px_rgba(255,255,255,0.25)] select-none pointer-events-none rounded-none min-w-[320px] sm:min-w-[390px]">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-foreground/30">
                <div className="flex items-center gap-2 text-foreground font-bold text-[12px] sm:text-[14px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground animate-ping" />
                  <span>┌── [ TARGET ACQUIRED ] ─────────────</span>
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] text-muted-foreground">
                  SECTOR_08
                </span>
              </div>

              <div className="text-[14px] sm:text-[16px] font-bold text-foreground tracking-wider leading-tight">
                MILKY WAY GALAXY // SECTOR 08
              </div>

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
// Stage 3 & 4: Relative Solar System Rig
// Sun and planets revolve in an inverted frame where Earth is fixed at [0, 0, 0]
// ----------------------------------------------------------------------------
const RelativeSolarSystemRig = ({
  isLight,
  outerBodiesOpacity,
}: {
  isLight: boolean;
  outerBodiesOpacity: number;
}) => {
  const solarRigRef = useRef<THREE.Group>(null);
  const mercuryRef = useRef<THREE.Group>(null);
  const venusRef = useRef<THREE.Group>(null);
  const marsRef = useRef<THREE.Group>(null);
  const jupiterRef = useRef<THREE.Group>(null);
  const saturnRef = useRef<THREE.Group>(null);

  // Orbit radii from Sun
  const rMercury = 4.8;
  const rVenus = 7.6;
  const rEarth = 12.0; // Distance between Sun and Earth
  const rMars = 16.5;
  const rJupiter = 24.0;
  const rSaturn = 32.0;

  // Concentric dotted orbit tracks centered on the Sun
  const trackMercury = useMemo(() => generateDottedOrbit(rMercury, 180), [rMercury]);
  const trackVenus = useMemo(() => generateDottedOrbit(rVenus, 240), [rVenus]);
  const trackEarth = useMemo(() => generateDottedOrbit(rEarth, 340), [rEarth]);
  const trackMars = useMemo(() => generateDottedOrbit(rMars, 420), [rMars]);
  const trackJupiter = useMemo(() => generateDottedOrbit(rJupiter, 540), [rJupiter]);
  const trackSaturn = useMemo(() => generateDottedOrbit(rSaturn, 660), [rSaturn]);

  const mercuryPts = useMemo(() => generateFibonacciSphere(120, 0.32), []);
  const venusPts = useMemo(() => generateFibonacciSphere(180, 0.46), []);
  const marsPts = useMemo(() => generateFibonacciSphere(160, 0.42), []);
  const jupiterPts = useMemo(() => generateFibonacciSphere(520, 1.25), []);
  const saturnPts = useMemo(() => generateFibonacciSphere(420, 0.95), []);
  const saturnRings = useMemo(() => generateRingPoints(550, 1.35, 2.2), []);

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

  // Dynamic relative solar positioning:
  // Rig offset = [-cos(theta) * 12, 0, -sin(theta) * 12]
  // This mathematically anchors the 3rd orbit track right on world origin [0, 0, 0] (Earth)!
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const thetaEarth = 0.65 + t * 0.06;

    if (solarRigRef.current) {
      solarRigRef.current.position.set(
        -Math.cos(thetaEarth) * rEarth,
        0,
        -Math.sin(thetaEarth) * rEarth
      );
    }

    // Relative planetary revolutions around the Sun
    if (mercuryRef.current) {
      const a = t * 1.6;
      mercuryRef.current.position.set(Math.cos(a) * rMercury, 0, Math.sin(a) * rMercury);
    }
    if (venusRef.current) {
      const a = t * 1.15;
      venusRef.current.position.set(Math.cos(a) * rVenus, 0, Math.sin(a) * rVenus);
    }
    if (marsRef.current) {
      const a = t * 0.65;
      marsRef.current.position.set(Math.cos(a) * rMars, 0, Math.sin(a) * rMars);
    }
    if (jupiterRef.current) {
      const a = t * 0.38;
      jupiterRef.current.position.set(Math.cos(a) * rJupiter, 0, Math.sin(a) * rJupiter);
    }
    if (saturnRef.current) {
      const a = t * 0.25;
      saturnRef.current.position.set(Math.cos(a) * rSaturn, 0, Math.sin(a) * rSaturn);
    }
  });

  if (outerBodiesOpacity <= 0.001) {
    return null;
  }

  return (
    <group ref={solarRigRef}>
      {/* 1. Central Illuminated Sun Node inside Rig */}
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

        <Html center position={[0, 3.2, 0]} distanceFactor={36}>
          <div className="font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] px-2 py-0.5 border border-border/80 bg-background/90 text-foreground whitespace-nowrap shadow-md pointer-events-none select-none">
            SOL // TYPE G2V // STAR_NODE
          </div>
        </Html>
      </group>

      {/* 2. Concentric Dotted Orbit Tracks (3rd track passes exactly through [0, 0, 0]) */}
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

      {/* 3. Planets (Mercury, Venus, Mars, Jupiter, Saturn) */}
      <group ref={mercuryRef}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={120} array={mercuryPts} itemSize={3} />
          </bufferGeometry>
          <primitive object={pointMat} attach="material" />
        </points>
      </group>

      <group ref={venusRef}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={180} array={venusPts} itemSize={3} />
          </bufferGeometry>
          <primitive object={pointMat} attach="material" />
        </points>
      </group>

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

      <group ref={saturnRef}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={420} array={saturnPts} itemSize={3} />
          </bufferGeometry>
          <primitive object={pointMat} attach="material" />
        </points>

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
    </group>
  );
};

// ----------------------------------------------------------------------------
// Target Identification Reticle (Anchored above Earth at [0, 0, 0])
// Fades cleanly out before camera descends below Z = 20
// ----------------------------------------------------------------------------
const EarthTargetReticle = ({
  isLocked,
  cameraZ,
}: {
  isLocked: boolean;
  cameraZ: number;
}) => {
  const opacity = useMemo(() => {
    if (!isLocked) return 0;
    if (cameraZ <= 14.0) return 0;
    if (cameraZ >= 24.0) return 1;
    return (cameraZ - 14.0) / (24.0 - 14.0);
  }, [isLocked, cameraZ]);

  if (opacity <= 0.01) {
    return null;
  }

  return (
    <group position={[0, 0, 0]}>
      <Html center position={[0, 1.8, 0]} distanceFactor={30}>
        <div
          style={{ opacity }}
          className="font-ndot tracking-widest text-foreground bg-background/95 border-2 border-foreground px-3.5 py-2.5 shadow-2xl pointer-events-none select-none whitespace-nowrap flex flex-col gap-0.5 rounded-none min-w-[290px] transition-opacity duration-150"
        >
          <div className="flex items-center gap-2 text-foreground font-bold text-[12px] sm:text-[14px]">
            <span className="w-2.5 h-2.5 rounded-full bg-foreground animate-ping" />
            <span>TARGET IDENTIFIED: TERRA (EARTH)</span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
            ORBIT_03 // HABITABLE ZONE // 1.000 AU
          </div>
        </div>
      </Html>
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
// Flight Controller: Relative Camera Inversion Architecture
// Earth is PERMANENTLY at [0, 0, 0] | Camera is ALWAYS looking directly at [0, 0, 0]
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

  const timeRef = useRef(0);
  const completedRef = useRef(false);
  const handoffTriggeredRef = useRef(false);

  const [currentCameraZ, setCurrentCameraZ] = useState(200.0);
  const [earthScale, setEarthScale] = useState(0.0);
  const [solarRigOpacity, setSolarRigOpacity] = useState(0.0);
  const [isEarthLocked, setIsEarthLocked] = useState(false);
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
      setEarthScale(1.0);
      setSolarRigOpacity(0.0);
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
      camera.position.set(0, 20, 200);
      camera.lookAt(0, 0, 0);
      persCam.fov = 46;
      persCam.updateProjectionMatrix();
    }
  }, [camera, onWarpComplete, onTelemetryUpdate]);

  useFrame((_state, delta) => {
    const persCam = camera as THREE.PerspectiveCamera;

    // Failsafe & Skip handling: Continuous smooth damp to [0, 0, 5.5], lookAt [0, 0, 0]
    if (skipWarp && !completedRef.current) {
      camera.position.x = THREE.MathUtils.damp(camera.position.x, 0, 14.0, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, 0, 14.0, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, 5.5, 14.0, delta);
      persCam.fov = THREE.MathUtils.damp(persCam.fov, 46, 14.0, delta);
      persCam.updateProjectionMatrix();
      camera.lookAt(0, 0, 0);

      setCurrentCameraZ(camera.position.z);
      setEarthScale(THREE.MathUtils.damp(earthScale, 1.0, 12.0, delta));
      setSolarRigOpacity(0.0);
      setIsEarthLocked(true);

      if (!handoffTriggeredRef.current) {
        handoffTriggeredRef.current = true;
        onWarpComplete?.();
      }

      if (Math.abs(camera.position.z - 5.5) < 0.05) {
        setEarthScale(1.0);
        setIsBeaconIgnited(true);
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
      let targetY = 20.0;
      let targetZ = 200.0;
      let factor = 0;
      let velText = '0.0c';
      let distText = '54M LY';
      let locked = false;
      let stageName = 'DEEP_SPACE // VIRGO_SUPERCLUSTER';
      let targetTag = 'DEEP_SPACE // VIRGO_SUPERCLUSTER -> TARGET_LOCKED: MILKY_WAY_GALAXY';
      let sectorText = 'SECTOR_00 // MULTI_GALAXY_CLUSTER [ACQUIRING]';

      // =======================================================================
      // STAGE 1: Deep Cosmos & Galaxy Cluster (0.0s – 1.0s)
      // Camera: [0, 20, 200] -> [0, 18, 140] | Earth scale: 0.0
      // =======================================================================
      if (t < 1.0) {
        const u = t / 1.0;
        targetX = 0;
        targetY = 20.0 - u * 2.0;
        targetZ = 200.0 - u * 60.0;
        factor = 0;
        velText = '0.0c';
        distText = `${Math.round(54000000 - u * 28000000).toLocaleString()} LY`;
        setEarthScale(0.0);
        setSolarRigOpacity(0.0);
        stageName = 'DEEP_SPACE // VIRGO_SUPERCLUSTER';
        targetTag = 'DEEP_SPACE // VIRGO_SUPERCLUSTER -> TARGET_LOCKED: MILKY_WAY_GALAXY';
        sectorText = 'SECTOR_00 // MULTI_GALAXY_CLUSTER [ACQUIRING]';
      }
      // =======================================================================
      // STAGE 2: Entering Milky Way Galaxy (1.0s – 1.9s)
      // Camera: [0, 18, 140] -> [0, 16, 75] | Core plunge | Earth scale: 0.0
      // =======================================================================
      else if (t < 1.9) {
        const u = (t - 1.0) / 0.9;
        const accel = Math.pow(u, 1.8);

        targetX = 0;
        targetY = 18.0 - (18.0 - 16.0) * accel;
        targetZ = 140.0 - (140.0 - 75.0) * accel;

        factor = Math.sin(u * Math.PI) * 0.95;
        velText = (8.5 - u * 2.5).toFixed(1) + 'c';
        distText = `${Math.round(26000000 - accel * 25990000).toLocaleString()} LY`;
        setEarthScale(0.0);
        setSolarRigOpacity(0.0);
        stageName = 'ORION_CYGNUS_ARM // SOLAR_NEIGHBORHOOD_ACQUIRED';
        targetTag = 'ORION_CYGNUS_ARM // SOLAR_NEIGHBORHOOD_ACQUIRED';
        sectorText = 'APPROACH_VECTOR: GALACTIC_DISK_INSERTION';
      }
      // =======================================================================
      // STAGE 3: Full Solar System Overview (1.9s – 3.2s)
      // Camera arrives at [0, 16, 42], looking at [0, 0, 0]
      // Earth scale: 0.12 (forms crisp node on 3rd orbit) | Solar System visible
      // =======================================================================
      else if (t < 3.2) {
        const u = (t - 1.9) / 1.3;
        const ease = 1 - Math.pow(1 - u, 3);

        targetX = 0;
        targetY = 16.0;
        targetZ = 75.0 - (75.0 - 42.0) * ease;

        factor = 0.35;
        velText = '1.2c';
        distText = (65.0 - ease * 40.0).toFixed(1) + ' AU';

        // Earth is at 0.12 scale on orbit 3; Solar System is at full opacity
        setEarthScale(0.12);
        setSolarRigOpacity(1.0);
        setIsEarthLocked(false);

        stageName = 'SOL SYSTEM // HELIOCENTRIC ORBITAL GRID';
        targetTag = 'SOL SYSTEM // HELIOCENTRIC ORBITAL GRID';
        sectorText = 'SOLAR_DISC_OVERVIEW // REVOLVING_PLANETARY_SYSTEM';
      }
      // =======================================================================
      // STAGE 4: Continuous Descent to Earth (3.2s – 4.4s)
      // Camera curve: [0, 16, 42] -> [0, 0, 5.5], always looking at [0, 0, 0]
      // Earth scale: 0.12 -> 1.0 (single continuous mesh) | Solar system fades to 0
      // =======================================================================
      else if (t < 4.4) {
        const u = (t - 3.2) / 1.2;
        const quintic = 1 - Math.pow(1 - u, 4);

        if (!isEarthLocked) {
          setIsEarthLocked(true);
        }

        targetX = 0;
        targetY = 16.0 * (1 - quintic);
        targetZ = 42.0 - (42.0 - 5.5) * quintic;

        // Smooth continuous Earth scale from 0.12 up to 1.0
        setEarthScale(THREE.MathUtils.lerp(0.12, 1.0, quintic));

        // Solar system fades out smoothly as camera approaches
        setSolarRigOpacity(Math.max(0, 1 - quintic * 1.6));

        factor = (1 - u) * 0.5;
        velText = ((1 - u) * 1.8).toFixed(1) + 'c';
        distText = `${Math.round(42000 - quintic * 41600).toLocaleString()} KM`;
        stageName = 'TARGET IDENTIFIED: TERRA (EARTH) // HABITABLE ZONE';
        targetTag = 'TARGET IDENTIFIED: TERRA (EARTH) // HABITABLE ZONE';
        sectorText = 'APPROACH_VECTOR: TERRA_ATMOSPHERIC_INSERTION';

        if (u >= 0.75 && !handoffTriggeredRef.current) {
          handoffTriggeredRef.current = true;
          onWarpComplete?.();
        }
      }
      // =======================================================================
      // STAGE 5: Portflio Dock & Beacon Ignition (t >= 4.4s)
      // Camera at [0, 0, 5.5], looking at [0, 0, 0] | Beacon ignites
      // =======================================================================
      else {
        targetX = 0;
        targetY = 0;
        targetZ = 5.5;
        factor = 0;
        velText = '0.0c';
        distText = '400 KM';
        locked = true;

        setEarthScale(1.0);
        setSolarRigOpacity(0.0);

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

      // Continuous, rock-solid camera motion directly toward [0, 0, 5.5]
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

      {/* Stage 3 & 4: Relative Solar System Rig (Sun & Planets offset, revolving around Earth) */}
      <RelativeSolarSystemRig
        isLight={isLight}
        outerBodiesOpacity={solarRigOpacity}
      />

      {/* Target Acquisition HUD Reticle (Anchored above Earth at [0, 0, 0], fades out before docking) */}
      <EarthTargetReticle
        isLocked={isEarthLocked}
        cameraZ={currentCameraZ}
      />

      {/* Stage 5: Gravitational Shockwave Ripple upon orbital arrival */}
      <GravitationalShockwave
        isTriggered={isShockwaveTriggered}
        isLight={isLight}
        radius={1.55}
      />

      {/* Unified Single Earth: Permanently anchored at [0, 0, 0] */}
      <group ref={rigRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <DotMatrixGlobe
          isLight={isLight}
          isIgnited={isBeaconIgnited}
          scale={earthScale}
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
        camera={{ position: [0, 20, 200.0], fov: 46 }}
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
