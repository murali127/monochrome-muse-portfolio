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
      const t = (time * 1.3) % 1;
      if (ringRef.current) {
        const scale = 1.0 + t * 2.2;
        ringRef.current.scale.set(scale, scale, 1);
        const ringMat = ringRef.current.material as THREE.MeshBasicMaterial;
        ringMat.opacity = Math.pow(1 - t, 1.5) * (isLight ? 0.75 : 0.85) * visibility;
      }

      // 3. Small glowing core dot pulse
      if (coreRef.current) {
        const pulse = 1.0 + Math.sin(time * 4.5) * 0.15;
        coreRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });

  return (
    <group ref={beaconGroupRef} position={vspPos} quaternion={orientation}>
      {/* Delicate Expanding Radar Pulse Ring */}
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

      {/* Subtle Glowing Core Dot */}
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
// Dotted Matrix Earth Globe (High-Craft Continental Coastlines)
// ----------------------------------------------------------------------------
const DotMatrixGlobe = ({
  isLight,
  isIgnited,
}: {
  isLight: boolean;
  isIgnited: boolean;
}) => {
  const globeGroupRef = useRef<THREE.Group>(null);
  const radius = 1.8;

  // Build points geometry once from true continental coastline coordinates
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const rawCoords = landPointsData as number[][];
    const positions = new Float32Array(rawCoords.length * 3);
    const normals = new Float32Array(rawCoords.length * 3);

    for (let i = 0; i < rawCoords.length; i++) {
      const [nx, ny, nz] = rawCoords[i];
      positions[i * 3] = nx * radius;
      positions[i * 3 + 1] = ny * radius;
      positions[i * 3 + 2] = nz * radius;

      normals[i * 3] = nx;
      normals[i * 3 + 1] = ny;
      normals[i * 3 + 2] = nz;
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
      {/* 1. Organic Dot-Matrix Continents */}
      <points geometry={geometry} material={landPointMaterial} />

      {/* 2. Soft Atmospheric Fresnel Rim Glow */}
      <mesh material={atmosphereMaterial}>
        <sphereGeometry args={[radius * 1.025, 48, 48]} />
      </mesh>

      {/* 3. Visakhapatnam Telemetry Micro-Radar Beacon */}
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
// Deep Space Rotating Spiral Galaxy Point Cloud (Stage 1)
// ----------------------------------------------------------------------------
const SpiralGalaxy = ({
  isLight,
  cameraZ,
}: {
  isLight: boolean;
  cameraZ: number;
}) => {
  const galaxyRef = useRef<THREE.Points>(null);
  const count = 1800;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const arms = 3;
    const baseColor = new THREE.Color(isLight ? 0x09090b : 0xffffff);
    const dimColor = new THREE.Color(isLight ? 0x555555 : 0x777777);

    for (let i = 0; i < count; i++) {
      // Concentrated core with wide outer logarithmic spiral arms
      const r = Math.pow(Math.random(), 2.2) * 36 + 1.8;
      const armAngle = ((i % arms) * 2 * Math.PI) / arms;
      const spiralAngle = r * 0.32 + armAngle;

      const jitterX = (Math.random() - 0.5) * (r * 0.25 + 0.6);
      const jitterY = (Math.random() - 0.5) * (r * 0.25 + 0.6);
      const jitterZ = (Math.random() - 0.5) * (r * 0.15 + 0.4);

      pos[i * 3] = Math.cos(spiralAngle) * r + jitterX;
      pos[i * 3 + 1] = Math.sin(spiralAngle) * r + jitterY;
      pos[i * 3 + 2] = jitterZ - (r * 0.08);

      const mix = Math.min(1, r / 30);
      const c = baseColor.clone().lerp(dimColor, mix);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return { positions: pos, colors: col };
  }, [count, isLight]);

  // Fade galaxy as camera moves deep into orbit
  const opacity = useMemo(() => {
    const fade = THREE.MathUtils.clamp((cameraZ - 6.0) / 25.0, 0, 1);
    return (isLight ? 0.35 : 0.65) * fade;
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
        size={0.016}
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
// Hyperspace Motion-Blur Warp Lines (Stage 2)
// ----------------------------------------------------------------------------
const WarpStreaks = ({
  warpVelocity,
  cameraZ,
  isLight,
}: {
  warpVelocity: number;
  cameraZ: number;
  isLight: boolean;
}) => {
  const lineRef = useRef<THREE.LineSegments>(null);
  const count = 420;

  // Star data: [x, y, z, baseSpeed]
  const stars = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const radius = 1.0 + Math.random() * 22;
      const angle = Math.random() * Math.PI * 2;
      data.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: (Math.random() - 0.5) * 60,
        speed: 1.6 + Math.random() * 2.4,
      });
    }
    return data;
  }, [count]);

  const positions = useMemo(() => new Float32Array(count * 6), [count]);

  useFrame((_state, delta) => {
    if (!lineRef.current) return;
    const posAttr = lineRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    const streakLen = warpVelocity * 7.5 + 0.03;
    const speedMultiplier = warpVelocity * 40.0 + 1.2;

    for (let i = 0; i < count; i++) {
      const star = stars[i];

      // Fly along Z towards camera
      star.z += star.speed * speedMultiplier * delta;

      // Recycle when passing camera plane
      if (star.z > cameraZ + 4) {
        star.z = cameraZ - 42 - Math.random() * 14;
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
        opacity={Math.max(0.08, warpVelocity * 0.75)}
        depthWrite={false}
      />
    </lineSegments>
  );
};

// ----------------------------------------------------------------------------
// Background Telemetry Stardust (Ambient Space Dust once docked)
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
// Cinematic Camera Rig & Flight Controller (Galaxy -> Warp -> Orbital Lock)
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
  const [currentCameraZ, setCurrentCameraZ] = useState(48.0);
  const [isBeaconIgnited, setIsBeaconIgnited] = useState(false);

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

  // Initialize camera position
  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      camera.position.set(0, 0, 5.5);
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
      camera.position.set(0, 0, 48.0);
    }
  }, [camera, onWarpComplete, onTelemetryUpdate]);

  useFrame((_state, delta) => {
    // Check if skip was triggered
    if (skipWarp && !completedRef.current) {
      completedRef.current = true;
      camera.position.z = 5.5;
      setCurrentCameraZ(5.5);
      setWarpVelocity(0);
      setIsBeaconIgnited(true);
      onWarpComplete?.();
      onTelemetryUpdate?.({
        velocity: '0.0c',
        distance: '400 KM',
        isLocked: true,
        warpFactor: 0,
      });
      return;
    }

    if (!completedRef.current) {
      timeRef.current += delta;
      const t = timeRef.current;

      let targetZ = 48.0;
      let factor = 0;
      let velText = '0.0c';
      let distText = '142,000 KM';
      let locked = false;

      // STAGE 1: Deep Galaxy & Starfield (0.0s – 1.0s)
      if (t < 1.0) {
        targetZ = 48.0;
        factor = 0;
        velText = '0.0c';
        distText = '142,000 KM';
      }
      // STAGE 2: Hyperspace Warp & Camera Dive (1.0s – 2.6s)
      else if (t < 2.6) {
        const u = (t - 1.0) / 1.6; // 0 -> 1
        // Smoothstep curve for warp acceleration
        const smoothU = u * u * (3 - 2 * u);
        targetZ = 48.0 - (48.0 - 7.5) * smoothU;

        // Peak warp velocity of 8.4c
        factor = Math.sin(u * Math.PI);
        velText = (factor * 8.4).toFixed(1) + 'c';
        distText = `${Math.round(142000 - smoothU * 130000).toLocaleString()} KM`;
      }
      // STAGE 3: Orbital Deceleration & Focal Lock (2.6s – 3.6s)
      else if (t < 3.6) {
        const v = (t - 2.6) / 1.0; // 0 -> 1
        // Quintic deceleration curve: smoothly bleeds off momentum
        const quintic = 1 - Math.pow(1 - v, 4);
        targetZ = 7.5 - (7.5 - 5.5) * quintic;

        factor = (1 - v) * 0.45;
        velText = (factor * 8.4).toFixed(1) + 'c';
        distText = `${Math.round(12000 - quintic * 11600).toLocaleString()} KM`;

        if (targetZ <= 6.0 && !isBeaconIgnited) {
          setIsBeaconIgnited(true);
        }
      }
      // STAGE 4: Docked in Orbit (3.6s+)
      else {
        targetZ = 5.5;
        factor = 0;
        velText = '0.0c';
        distText = '400 KM';
        locked = true;

        if (!isBeaconIgnited) {
          setIsBeaconIgnited(true);
        }

        completedRef.current = true;
        onWarpComplete?.();
      }

      // Smooth camera position damping
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 8.0, delta);
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
      {/* 1. Deep Space Spiral Galaxy (Visible far back, fades on orbital approach) */}
      <SpiralGalaxy isLight={isLight} cameraZ={currentCameraZ} />

      {/* 2. Hyperspace Motion-Blur Warp Lines */}
      <WarpStreaks
        warpVelocity={warpVelocity}
        cameraZ={currentCameraZ}
        isLight={isLight}
      />

      {/* 3. Centered Dot-Matrix Earth Globe */}
      <group ref={rigRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <DotMatrixGlobe isLight={isLight} isIgnited={isBeaconIgnited} />
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
        camera={{ position: [0, 0, 48.0], fov: 46 }}
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
