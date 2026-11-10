import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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
// Minimal Visakhapatnam Micro-Radar Beacon
// ----------------------------------------------------------------------------
const MinimalVisakhapatnamBeacon = ({
  isLight,
  radius,
  globeGroupRef,
}: {
  isLight: boolean;
  radius: number;
  globeGroupRef: React.RefObject<THREE.Group>;
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
      const t = (time * 1.2) % 1;
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
        const coreMat = coreRef.current.material as THREE.MeshBasicMaterial;
        coreMat.opacity = (isLight ? 0.9 : 1.0) * visibility;
      }
    }
  });

  const primaryColor = isLight ? '#09090b' : '#ffffff';

  return (
    <group position={vspPos} quaternion={orientation} ref={beaconGroupRef}>
      {/* High-contrast micro-dot directly on coordinate surface */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.012, 16, 16]} />
        <meshBasicMaterial color={primaryColor} transparent opacity={1} />
      </mesh>

      {/* Single delicate expanding radar ring (tangent to sphere surface) */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.014, 0.018, 32]} />
        <meshBasicMaterial
          color={primaryColor}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------------------------------
// Organic Dot-Matrix Earth Globe (Sampled from Real Continental Coastlines)
// ----------------------------------------------------------------------------
const DotMatrixGlobe = ({ isLight }: { isLight: boolean }) => {
  const globeGroupRef = useRef<THREE.Group>(null);
  const RADIUS = 1.25;

  // 1. Build Point Cloud from High-Resolution Real Continental Coastlines
  const { geometry: dotGeometry, material: dotMaterial } = useMemo(() => {
    const rawData = landPointsData as number[];
    const count = rawData.length / 3;
    const positions = new Float32Array(rawData.length);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = rawData[i * 3] * RADIUS;
      positions[i * 3 + 1] = rawData[i * 3 + 1] * RADIUS;
      positions[i * 3 + 2] = rawData[i * 3 + 2] * RADIUS;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom Shader with strict backface culling & natural distance attenuation
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(isLight ? 0x09090b : 0xffffff) },
        uOpacity: { value: 0.9 },
        uSize: { value: 0.020 },
        uScale: { value: 750.0 },
      },
      vertexShader: `
        uniform float uSize;
        uniform float uScale;
        varying float vFacing;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Compute view-space normal for backface culling
          vec3 viewNormal = normalize(normalMatrix * normalize(position));
          vec3 viewDir = normalize(-mvPosition.xyz);
          vFacing = dot(viewNormal, viewDir);

          // Scaled point size with sizeAttenuation
          gl_PointSize = uSize * (uScale / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vFacing;

        void main() {
          // Discard back hemisphere points to eliminate visual noise
          if (vFacing < 0.0) discard;

          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;
          float edge = smoothstep(0.5, 0.25, dist);

          // Soft horizon falloff near the perimeter
          float horizonFade = smoothstep(0.0, 0.22, vFacing);

          gl_FragColor = vec4(uColor, uOpacity * edge * horizonFade);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat };
  }, [isLight]);

  // Update theme colors cleanly
  useEffect(() => {
    if (dotMaterial) {
      dotMaterial.uniforms.uColor.value.set(isLight ? 0x09090b : 0xffffff);
      dotMaterial.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      dotMaterial.needsUpdate = true;
    }
  }, [isLight, dotMaterial]);

  // 2. Soft Atmospheric Rim Particle Halo (whisper density)
  const haloGeometry = useMemo(() => {
    const haloCount = 200;
    const positions = new Float32Array(haloCount * 3);
    for (let i = 0; i < haloCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = RADIUS * (1.04 + Math.random() * 0.04);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [RADIUS]);

  // Softened Fresnel Atmosphere
  const atmosphereMaterial = useMemo(() => createAtmosphereFresnelMaterial(isLight), [isLight]);

  // Strict Upright Vertical Y-Axis Rotation (Zero Tilt)
  useFrame((_state, delta) => {
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.x = 0;
      globeGroupRef.current.rotation.z = 0;
      globeGroupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
      {/* Globe Group - Perfectly Straight & Upright */}
      <group ref={globeGroupRef} rotation={[0, 0, 0]}>
        {/* Organic Real Continental Coastline Dot Matrix */}
        <points geometry={dotGeometry} material={dotMaterial} />

        {/* Soft Atmospheric Particle Halo */}
        <points geometry={haloGeometry}>
          <pointsMaterial
            size={0.008}
            color={isLight ? '#09090b' : '#ffffff'}
            transparent
            opacity={isLight ? 0.12 : 0.22}
            sizeAttenuation
            depthWrite={false}
          />
        </points>

        {/* Minimal Visakhapatnam Beacon */}
        <MinimalVisakhapatnamBeacon
          isLight={isLight}
          radius={RADIUS}
          globeGroupRef={globeGroupRef}
        />
      </group>

      {/* Softened Fresnel Rim Glow */}
      <mesh material={atmosphereMaterial}>
        <sphereGeometry args={[RADIUS + 0.05, 48, 48]} />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------------------------------
// Background Telemetry Stardust
// ----------------------------------------------------------------------------
const CosmicDust = ({ isLight }: { isLight: boolean }) => {
  const ref = useRef<THREE.Points>(null);
  const count = 280;
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
// Centered Parallax Rig with Smooth Mouse Damping (Zero X/Z Tilt)
// ----------------------------------------------------------------------------
const CenteredParallaxRig = ({ isLight }: { isLight: boolean }) => {
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

  useFrame((_state, delta) => {
    if (!rigRef.current) return;

    // Strict upright alignment: X and Z rotations remain strictly 0
    rigRef.current.rotation.x = 0;
    rigRef.current.rotation.z = 0;

    // Subtle horizontal parallax & gentle translation
    const targetRotY = mouse.current.x * 0.15;
    const targetPosX = mouse.current.x * 0.12;
    const targetPosY = mouse.current.y * 0.08;

    rigRef.current.rotation.y = THREE.MathUtils.damp(rigRef.current.rotation.y, targetRotY, 3.0, delta);
    rigRef.current.position.x = THREE.MathUtils.damp(rigRef.current.position.x, targetPosX, 2.5, delta);
    rigRef.current.position.y = THREE.MathUtils.damp(rigRef.current.position.y, targetPosY, 2.5, delta);

    const targetScale = isDesktop ? 0.95 : 0.75;
    const currentScale = rigRef.current.scale.x;
    const dampedScale = THREE.MathUtils.damp(currentScale, targetScale, 3.0, delta);
    rigRef.current.scale.set(dampedScale, dampedScale, dampedScale);
  });

  return (
    <group ref={rigRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <DotMatrixGlobe isLight={isLight} />
      <CosmicDust isLight={isLight} />
    </group>
  );
};

// ----------------------------------------------------------------------------
// Scene3D Canvas Root - Perfectly Centered Viewport
// ----------------------------------------------------------------------------
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
    <div className="fixed inset-0 z-[1] pointer-events-none flex items-center justify-center overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 46 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.NoToneMapping,
        }}
      >
        <CenteredParallaxRig isLight={isLight} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
