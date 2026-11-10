import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
// Minimal Visakhapatnam Micro-Radar Beacon (Ignites when orbital lock reached)
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

  // Normal quaternion so the ripple ring lies perfectly tangent to the sphere surface
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

    // 1. Backface Culling: Calculate dot product between surface normal and camera vector
    const worldPos = new THREE.Vector3();
    beaconGroupRef.current.getWorldPosition(worldPos);

    const globeCenter = new THREE.Vector3();
    globeGroupRef.current.getWorldPosition(globeCenter);

    const surfaceNormal = worldPos.clone().sub(globeCenter).normalize();
    const toCamera = state.camera.position.clone().sub(worldPos).normalize();
    const dot = surfaceNormal.dot(toCamera);

    // Smooth visibility fade when rotating to the back hemisphere
    const visibility = THREE.MathUtils.clamp((dot - 0.02) / 0.18, 0, 1);
    beaconGroupRef.current.visible = visibility > 0.001;

    if (visibility > 0.001) {
      const time = state.clock.elapsedTime;

      // 2. Single delicate expanding radar ring that softly fades out
      const t = (time * 1.4) % 1;
      if (ringRef.current) {
        const scale = 1.0 + t * 2.4;
        ringRef.current.scale.set(scale, scale, 1);
        const ringMat = ringRef.current.material as THREE.MeshBasicMaterial;
        ringMat.opacity = Math.pow(1 - t, 1.5) * (isLight ? 0.75 : 0.85) * visibility;
      }

      // 3. Small glowing core dot pulse
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
// Atmospheric Shockwave Ripple (Emits upon orbital brake)
// ----------------------------------------------------------------------------
const AtmosphericShockwave = ({
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
    const duration = 0.85;

    if (elapsed > duration) {
      ringRef.current.visible = false;
      return;
    }

    ringRef.current.visible = true;
    const progress = elapsed / duration;
    // Rapid initial blast with smooth expansion
    const scale = 1.0 + Math.sin((progress * Math.PI) / 2) * 3.4;
    ringRef.current.scale.set(scale, scale, 1);

    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.pow(1 - progress, 2) * (isLight ? 0.8 : 0.95);
  });

  return (
    <mesh ref={ringRef} position={[0, 0, 0]}>
      <ringGeometry args={[1.82, 1.96, 64]} />
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
// Initial Distant Core Beacon (Intense star in deep space before Earth expands)
// ----------------------------------------------------------------------------
const EarthCoreBeacon = ({
  cameraZ,
  isLight,
}: {
  cameraZ: number;
  isLight: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Intense star beacon in the distance, fading when camera approaches
  const opacity = useMemo(() => {
    return THREE.MathUtils.clamp((cameraZ - 12.0) / 35.0, 0, 1) * (isLight ? 0.7 : 0.9);
  }, [cameraZ, isLight]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const pulse = 1.0 + Math.sin(state.clock.elapsedTime * 6.0) * 0.2;
    meshRef.current.scale.set(pulse, pulse, pulse);
  });

  if (opacity <= 0.01) return null;

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.35, 16, 16]} />
      <meshBasicMaterial
        color={isLight ? 0x09090b : 0xffffff}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
};

// ----------------------------------------------------------------------------
// Layer 3: The Dot-Matrix Earth Core (Foreground Target, Z: 0)
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

  // Build points geometry once from true continental coastline coordinates
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

  // Pure vertical upright Y-axis planetary rotation (0 tilt)
  useFrame((_state, delta) => {
    if (!globeGroupRef.current) return;
    globeGroupRef.current.rotation.x = 0;
    globeGroupRef.current.rotation.z = 0;
    globeGroupRef.current.rotation.y += delta * 0.15;
  });

  return (
    <group ref={globeGroupRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
      {/* 1. Distant Glowing Center Pinprick before Earth expands */}
      <EarthCoreBeacon cameraZ={cameraZ} isLight={isLight} />

      {/* 2. Organic Dot-Matrix Continents */}
      <points geometry={geometry} material={landPointMaterial} />

      {/* 3. Soft Atmospheric Fresnel Rim Glow */}
      <mesh material={atmosphereMaterial}>
        <sphereGeometry args={[radius * 1.025, 48, 48]} />
      </mesh>

      {/* 4. Visakhapatnam Telemetry Micro-Radar Beacon */}
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
// Layer 1: The Spiral Galaxy Vortex (Deep Background, Z: -50 to -150)
// 2-arm logarithmic spiral galaxy with ~12,000 monochromatic stars
// ----------------------------------------------------------------------------
const SpiralGalaxyVortex = ({
  isLight,
  cameraZ,
}: {
  isLight: boolean;
  cameraZ: number;
}) => {
  const galaxyRef = useRef<THREE.Points>(null);
  const count = 12000;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const arms = 2; // Two distinct logarithmic spiral arms
    const baseColor = new THREE.Color(isLight ? 0x09090b : 0xffffff);
    const dimColor = new THREE.Color(isLight ? 0x666666 : 0x888888);

    for (let i = 0; i < count; i++) {
      // Logarithmic spiral distribution
      const r = Math.pow(Math.random(), 2.4) * 65 + 1.2;
      const armAngle = ((i % arms) * 2 * Math.PI) / arms;
      const spiralAngle = r * 0.28 + armAngle;

      const spread = r * 0.22 + 0.5;
      const jitterX = (Math.random() - 0.5) * spread;
      const jitterY = (Math.random() - 0.5) * spread;
      const jitterZ = (Math.random() - 0.5) * (r * 0.12 + 0.8);

      pos[i * 3] = Math.cos(spiralAngle) * r + jitterX;
      pos[i * 3 + 1] = Math.sin(spiralAngle) * r + jitterY;
      // Positioned deep in background between -45 and -110
      pos[i * 3 + 2] = -45.0 - (r * 0.6) + jitterZ;

      const mix = Math.min(1, r / 45);
      const c = baseColor.clone().lerp(dimColor, mix);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return { positions: pos, colors: col };
  }, [count, isLight]);

  // Deep scale establishes early, gently dims as camera approaches Earth
  const opacity = useMemo(() => {
    const fade = THREE.MathUtils.clamp((cameraZ - 5.5) / 25.0, 0, 1);
    return (isLight ? 0.35 : 0.65) * Math.max(0.08, fade);
  }, [cameraZ, isLight]);

  useFrame((_state, delta) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.z += delta * 0.04;
    }
  });

  return (
    <points ref={galaxyRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        vertexColors
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

// ----------------------------------------------------------------------------
// Layer 2: Relativistic Warp Streaks (Midground, Z: -20 to +90)
// 1,500 particles stretching into elongated light streaks rushing past peripheral vision
// ----------------------------------------------------------------------------
const RelativisticWarpStreaks = ({
  warpVelocity,
  cameraZ,
  isLight,
}: {
  warpVelocity: number;
  cameraZ: number;
  isLight: boolean;
}) => {
  const lineRef = useRef<THREE.LineSegments>(null);
  const count = 1500;

  // Star corridor data
  const stars = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const radius = 1.2 + Math.random() * 26;
      const angle = Math.random() * Math.PI * 2;
      data.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: Math.random() * 110 - 20,
        speed: 1.8 + Math.random() * 2.6,
      });
    }
    return data;
  }, [count]);

  const positions = useMemo(() => new Float32Array(count * 6), [count]);

  useFrame((_state, delta) => {
    if (!lineRef.current) return;
    const posAttr = lineRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    // Relativistic streak elongation along Z
    const streakLen = warpVelocity * 14.0 + 0.04;
    const speedMultiplier = warpVelocity * 55.0 + 1.2;

    for (let i = 0; i < count; i++) {
      const star = stars[i];

      // Fly backwards past camera
      star.z += star.speed * speedMultiplier * delta;

      // Wrap around when past camera
      if (star.z > cameraZ + 5) {
        star.z = cameraZ - 65 - Math.random() * 25;
      }

      // Head vertex
      arr[i * 6] = star.x;
      arr[i * 6 + 1] = star.y;
      arr[i * 6 + 2] = star.z;

      // Tail vertex (streaked backwards along -Z)
      arr[i * 6 + 3] = star.x;
      arr[i * 6 + 4] = star.y;
      arr[i * 6 + 5] = star.z - streakLen;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count * 2}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={isLight ? 0x09090b : 0xffffff}
        transparent
        opacity={Math.max(0.12, warpVelocity * 0.85)}
        depthWrite={false}
      />
    </lineSegments>
  );
};

// ----------------------------------------------------------------------------
// Background Ambient Telemetry Stardust once docked
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
// Cinematic Camera Flight Choreographer (Spiral Slingshot & Dolly Zoom)
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
  const [warpVelocity, setWarpVelocity] = useState(0);
  const [currentCameraZ, setCurrentCameraZ] = useState(90.0);
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

  // Initial setup: starts way back at [0, 12, 90] with 12deg pitch downward
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const persCam = camera as THREE.PerspectiveCamera;

    if (prefersReducedMotion) {
      camera.position.set(0, 0, 5.5);
      camera.lookAt(0, 0, 0);
      persCam.fov = 45;
      persCam.updateProjectionMatrix();

      completedRef.current = true;
      setIsBeaconIgnited(true);
      onWarpComplete?.();
      onTelemetryUpdate?.({
        velocity: '0.0c',
        distance: '400 KM',
        isLocked: true,
        warpFactor: 0,
      });
    } else {
      camera.position.set(0, 12, 90);
      camera.lookAt(0, 0, 0);
      persCam.fov = 45;
      persCam.updateProjectionMatrix();
    }
  }, [camera, onWarpComplete, onTelemetryUpdate]);

  useFrame((_state, delta) => {
    const persCam = camera as THREE.PerspectiveCamera;

    // Failsafe & Skip handling: smooth lerp to [0, 0, 5.5], fov 45 within 350ms
    if (skipWarp && !completedRef.current) {
      camera.position.x = THREE.MathUtils.damp(camera.position.x, 0, 14.0, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, 0, 14.0, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, 5.5, 14.0, delta);
      persCam.fov = THREE.MathUtils.damp(persCam.fov, 45, 14.0, delta);
      persCam.updateProjectionMatrix();
      camera.lookAt(0, 0, 0);

      setCurrentCameraZ(camera.position.z);
      setWarpVelocity(0);
      setIsBeaconIgnited(true);

      if (Math.abs(camera.position.z - 5.5) < 0.05) {
        completedRef.current = true;
        onWarpComplete?.();
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
      let targetY = 12.0;
      let targetZ = 90.0;
      let targetFov = 45.0;
      let factor = 0;
      let velText = '0.0c';
      let distText = '142,000 KM';
      let locked = false;

      // =======================================================================
      // PHASE 1: Deep Silence & Spiral Rotation (0.0s – 1.0s)
      // Camera starts far back at [0, 12, 90], 12deg pitch downward
      // =======================================================================
      if (t < 1.0) {
        targetX = 0;
        targetY = 12.0;
        targetZ = 90.0;
        targetFov = 45.0;
        factor = 0;
        velText = '0.0c';
        distText = '142,000 KM';
      }
      // =======================================================================
      // PHASE 2: Gravitational Slingshot & Lens Distortion (1.0s – 2.4s)
      // Camera corkscrews into vortex, plunges Z: 90 -> 12, FOV 45 -> 85
      // =======================================================================
      else if (t < 2.4) {
        const u = (t - 1.0) / 1.4; // 0 -> 1
        const accel = u * u; // Exponential acceleration curve

        // Corkscrew spiral trajectory descending towards ecliptic plane
        targetX = Math.sin(u * Math.PI * 1.5) * 4.2 * (1 - u);
        targetY = 12.0 * Math.cos((u * Math.PI) / 2);
        targetZ = 90.0 - (90.0 - 10.0) * accel;

        // Dynamic FOV Expansion (Dolly Zoom / Vertigo Tunnel-Vision stretch)
        factor = Math.sin(u * Math.PI);
        targetFov = 45.0 + factor * 40.0; // Expands up to 85deg

        // Procedural micro-shake during maximum warp velocity
        const shakeMag = factor * 0.12;
        targetX += Math.sin(t * 60.0) * shakeMag;
        targetY += Math.cos(t * 75.0) * (shakeMag * 0.7);

        velText = (factor * 8.4).toFixed(1) + 'c';
        distText = `${Math.round(142000 - accel * 132000).toLocaleString()} KM`;
      }
      // =======================================================================
      // PHASE 3: The Orbital Brake & Atmospheric Shockwave (2.4s – 3.4s)
      // Camera aggressively brakes: Z -> 5.5, FOV 85 -> 45, Shockwave ripple fires
      // =======================================================================
      else if (t < 3.4) {
        const v = (t - 2.4) / 1.0; // 0 -> 1
        const quintic = 1 - Math.pow(1 - v, 4); // Aggressive deceleration curve

        targetX = THREE.MathUtils.damp(camera.position.x, 0, 10.0, delta);
        targetY = THREE.MathUtils.damp(camera.position.y, 0, 10.0, delta);
        targetZ = 10.0 - (10.0 - 5.5) * quintic;

        // Snap FOV back from 85 -> 45 for perspective compression impact
        const fovSnap = 1 - Math.pow(1 - v, 3);
        targetFov = 85.0 - (85.0 - 45.0) * fovSnap;

        factor = (1 - v) * 0.35;
        velText = (factor * 8.4).toFixed(1) + 'c';
        distText = `${Math.round(10000 - quintic * 9600).toLocaleString()} KM`;

        // Trigger shockwave ripple upon hitting orbital speed
        if (!isShockwaveTriggered) {
          setIsShockwaveTriggered(true);
        }

        // Ignite Visakhapatnam telemetry beacon as camera enters orbit
        if (targetZ <= 6.2 && !isBeaconIgnited) {
          setIsBeaconIgnited(true);
        }
      }
      // =======================================================================
      // PHASE 4: Lock-On & System Handoff (3.4s – 4.0s)
      // Earth settles upright, beacon pulses, handoff to Hero section
      // =======================================================================
      else {
        targetX = 0;
        targetY = 0;
        targetZ = 5.5;
        targetFov = 45.0;
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

        if (t >= 3.8 && !completedRef.current) {
          completedRef.current = true;
          onWarpComplete?.();
        }
      }

      // Smooth position damping
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 10.0, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 10.0, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 8.5, delta);
      camera.lookAt(0, 0, 0);

      // Apply dynamic FOV with projection matrix update
      persCam.fov = THREE.MathUtils.damp(persCam.fov, targetFov, 9.0, delta);
      persCam.updateProjectionMatrix();

      setCurrentCameraZ(camera.position.z);
      setWarpVelocity(factor);

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
      {/* Layer 1: The Spiral Galaxy Vortex (Deep Background, Z: -50 to -150) */}
      <SpiralGalaxyVortex isLight={isLight} cameraZ={currentCameraZ} />

      {/* Layer 2: Relativistic Warp Streaks (Midground, Z: -20 to +90) */}
      <RelativisticWarpStreaks
        warpVelocity={warpVelocity}
        cameraZ={currentCameraZ}
        isLight={isLight}
      />

      {/* Atmospheric Shockwave Ripple (Ignites on orbital brake) */}
      <AtmosphericShockwave
        isTriggered={isShockwaveTriggered}
        isLight={isLight}
      />

      {/* Layer 3: The Dot-Matrix Earth Core (Foreground Target, Z: 0) */}
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
        camera={{ position: [0, 12, 90.0], fov: 45 }}
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
