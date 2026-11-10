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
    // Smooth, graceful radial expansion
    const scale = 1.0 + Math.sin((progress * Math.PI) / 2) * 2.8;
    ringRef.current.scale.set(scale, scale, 1);

    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.pow(1 - progress, 2) * (isLight ? 0.65 : 0.85);
  });

  return (
    <mesh ref={ringRef} position={[0, 0, 0]}>
      {/* Ultra-thin hairline ring */}
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
// Initial Distant Core Beacon (Subtle star pinprick in wide galactic view)
// ----------------------------------------------------------------------------
const EarthCoreBeacon = ({
  cameraZ,
  isLight,
}: {
  cameraZ: number;
  isLight: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const opacity = useMemo(() => {
    return THREE.MathUtils.clamp((cameraZ - 14.0) / 35.0, 0, 1) * (isLight ? 0.5 : 0.8);
  }, [cameraZ, isLight]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const pulse = 1.0 + Math.sin(state.clock.elapsedTime * 4.5) * 0.15;
    meshRef.current.scale.set(pulse, pulse, pulse);
  });

  if (opacity <= 0.01) return null;

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.28, 16, 16]} />
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
// Dot-Matrix Earth Core (Foreground Target, Z: 0)
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
// Layer 1: Spiral Galaxy Vortex (Deep Background, Z: -45 to -110)
// ----------------------------------------------------------------------------
const SpiralGalaxyVortex = ({
  isLight,
  cameraZ,
}: {
  isLight: boolean;
  cameraZ: number;
}) => {
  const galaxyRef = useRef<THREE.Points>(null);
  const count = 9000;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const arms = 2; // Two distinct logarithmic spiral arms
    const baseColor = new THREE.Color(isLight ? 0x09090b : 0xffffff);
    const dimColor = new THREE.Color(isLight ? 0x666666 : 0x888888);

    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 2.2) * 55 + 1.2;
      const armAngle = ((i % arms) * 2 * Math.PI) / arms;
      const spiralAngle = r * 0.28 + armAngle;

      const spread = r * 0.20 + 0.4;
      const jitterX = (Math.random() - 0.5) * spread;
      const jitterY = (Math.random() - 0.5) * spread;
      const jitterZ = (Math.random() - 0.5) * (r * 0.10 + 0.6);

      pos[i * 3] = Math.cos(spiralAngle) * r + jitterX;
      pos[i * 3 + 1] = Math.sin(spiralAngle) * r + jitterY;
      pos[i * 3 + 2] = -45.0 - (r * 0.5) + jitterZ;

      const mix = Math.min(1, r / 40);
      const c = baseColor.clone().lerp(dimColor, mix);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return { positions: pos, colors: col };
  }, [count, isLight]);

  // Deep scale establishes early, gently dims as camera approaches Earth
  const opacity = useMemo(() => {
    const fade = THREE.MathUtils.clamp((cameraZ - 5.5) / 22.0, 0, 1);
    return (isLight ? 0.3 : 0.6) * Math.max(0.06, fade);
  }, [cameraZ, isLight]);

  useFrame((_state, delta) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.z += delta * 0.035;
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
        size={0.014}
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
// Layer 2: Deep 3D Celestial Starfield (3,000 Sharp Floating Points, Motion Parallax)
// Replaces 2D line streaks with real volumetric depth
// ----------------------------------------------------------------------------
const VolumetricCelestialField = ({
  isLight,
}: {
  isLight: boolean;
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 3000;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Distributed in 3D volume around the flight path
      const r = 2.5 + Math.pow(Math.random(), 1.6) * 36;
      const angle = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.sin(angle) * r) * 0.75 + (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = -35 + Math.random() * 120;
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

  // Subtle natural celestial drift
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
// High-Craft Curved Orbital Approach & Volumetric Deceleration
// Starts at [0, 18, 70] -> Smooth Curved Descent -> Snap Shockwave -> Orbital Lock
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
  const [currentCameraZ, setCurrentCameraZ] = useState(70.0);
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

  // Initialize camera: Wide galactic view at [0, 18, 70] looking down at galaxy core
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
      camera.position.set(0, 18, 70);
      camera.lookAt(0, 0, 0);
      persCam.fov = 48;
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
      let targetY = 18.0;
      let targetZ = 70.0;
      let targetFov = 48.0;
      let factor = 0;
      let velText = '0.0c';
      let distText = '142,000 KM';
      let locked = false;

      // -----------------------------------------------------------------------
      // STAGE 1: Opening Poise & Spiral Rotation (0.0s – 0.6s)
      // Camera perched at [0, 18, 70], taking in the wide galactic panorama
      // -----------------------------------------------------------------------
      if (t < 0.6) {
        targetX = 0;
        targetY = 18.0;
        targetZ = 70.0;
        targetFov = 48.0;
        factor = 0;
        velText = '0.0c';
        distText = '142,000 KM';
      }
      // -----------------------------------------------------------------------
      // STAGE 2: Curved Orbital Approach & Natural Deceleration (0.6s – 3.0s)
      // Descends from y: 18 -> 0 while closing from z: 70 -> 5.5 with quartic ease-out
      // -----------------------------------------------------------------------
      else if (t < 3.0) {
        const u = (t - 0.6) / 2.4; // 0 -> 1
        // Silky smooth quartic ease-out curve
        const ease = 1 - Math.pow(1 - u, 4);

        // Gentle lateral curve and descent to ecliptic plane
        targetX = Math.sin(u * Math.PI) * 1.8 * (1 - u);
        targetY = 18.0 * (1 - ease);
        targetZ = 70.0 - (70.0 - 5.5) * ease;

        // Stable FOV: subtle shift from 48 -> 45 (zero fisheye distortion)
        targetFov = 48.0 - (48.0 - 45.0) * ease;

        factor = Math.sin(u * Math.PI) * 0.8;
        velText = (factor * 6.2).toFixed(1) + 'c';
        distText = `${Math.round(142000 - ease * 141600).toLocaleString()} KM`;

        // Trigger gravitational shockwave ripple and beacon as camera enters orbital distance
        if (targetZ <= 8.5 && !isShockwaveTriggered) {
          setIsShockwaveTriggered(true);
        }
        if (targetZ <= 6.5 && !isBeaconIgnited) {
          setIsBeaconIgnited(true);
        }

        // Seamless State Handoff: Trigger Hero UI fade-in during the final 15% deceleration phase
        if (u >= 0.85 && !handoffTriggeredRef.current) {
          handoffTriggeredRef.current = true;
          onWarpComplete?.();
        }
      }
      // -----------------------------------------------------------------------
      // STAGE 3: Final Orbital Docking (3.0s+)
      // Camera locked at [0, 0, 5.5], zero tilt, steady upright rotation
      // -----------------------------------------------------------------------
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

      // Stable FOV update
      persCam.fov = THREE.MathUtils.damp(persCam.fov, targetFov, 8.0, delta);
      persCam.updateProjectionMatrix();

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
      {/* Layer 1: Deep Space Spiral Galaxy Vortex */}
      <SpiralGalaxyVortex isLight={isLight} cameraZ={currentCameraZ} />

      {/* Layer 2: Deep 3D Celestial Starfield (Real volumetric points with natural motion parallax) */}
      <VolumetricCelestialField isLight={isLight} />

      {/* Layer 3: Gravitational Shockwave Ring (Single ultra-thin phosphor ripple on arrival) */}
      <GravitationalShockwave
        isTriggered={isShockwaveTriggered}
        isLight={isLight}
      />

      {/* Layer 4: Centered Dot-Matrix Earth Globe Core */}
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
        camera={{ position: [0, 18, 70.0], fov: 48 }}
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
