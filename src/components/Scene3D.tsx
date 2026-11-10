import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ----------------------------------------------------------------------------
// Continent Polygons for Earth Landmass Ray-Casting & Sampling
// ----------------------------------------------------------------------------
const CONTINENT_POLYGONS: number[][][] = [
  // North America & Central America
  [
    [-168, 65], [-160, 71], [-140, 70], [-130, 55], [-125, 50], [-120, 35],
    [-115, 30], [-110, 23], [-109, 23], [-112, 29], [-105, 20], [-95, 16],
    [-88, 14], [-83, 9], [-77, 8], [-82, 10], [-88, 16], [-90, 20],
    [-97, 26], [-90, 30], [-82, 25], [-80, 25], [-80, 28], [-75, 35],
    [-71, 41], [-65, 45], [-60, 47], [-55, 49], [-60, 52], [-64, 58],
    [-70, 62], [-80, 63], [-85, 55], [-95, 60], [-95, 65], [-115, 69],
    [-135, 70], [-150, 68], [-168, 65]
  ],
  // Greenland
  [
    [-50, 60], [-40, 65], [-20, 70], [-18, 80], [-35, 83], [-55, 82],
    [-55, 72], [-50, 60]
  ],
  // South America
  [
    [-77, 8], [-74, 11], [-62, 11], [-60, 8], [-50, 0], [-44, -2],
    [-35, -5], [-35, -8], [-38, -13], [-39, -18], [-43, -23], [-48, -26],
    [-53, -33], [-58, -35], [-65, -42], [-66, -48], [-67, -54], [-70, -53],
    [-74, -50], [-73, -42], [-71, -30], [-70, -20], [-76, -14], [-81, -5],
    [-80, 1], [-77, 8]
  ],
  // Eurasia (Europe & Asia)
  [
    [-9, 37], [-9, 43], [-2, 43], [-1, 46], [-4, 48], [1, 51], [3, 51],
    [7, 54], [8, 55], [10, 57], [11, 55], [12, 56], [13, 60], [18, 65],
    [25, 71], [30, 68], [25, 60], [20, 55], [35, 65], [40, 68], [60, 70],
    [75, 73], [100, 76], [125, 74], [145, 72], [170, 67], [180, 66],
    [180, 64], [170, 63], [162, 56], [158, 52], [156, 56], [150, 59],
    [140, 54], [135, 48], [131, 43], [129, 41], [129, 35], [126, 35],
    [125, 38], [122, 40], [118, 38], [122, 32], [122, 30], [119, 26],
    [114, 22], [109, 21], [108, 16], [109, 11], [105, 9], [101, 12],
    [100, 7], [99, 13], [101, 6], [104, 1], [103, 1], [100, 4], [98, 10],
    [98, 16], [93, 20], [90, 23], [88, 22], [84, 18], [80, 13], [77.5, 8.1],
    [75, 12], [73, 19], [70, 21], [69, 23], [67, 25], [62, 25], [58, 24],
    [56, 26], [50, 26], [48, 30], [54, 22], [58, 20], [53, 16], [45, 13],
    [43, 13], [41, 18], [38, 23], [35, 28], [34, 31], [35, 33], [36, 36],
    [32, 36], [28, 37], [28, 41], [23, 38], [21, 39], [20, 40], [18, 41],
    [15, 40], [12, 44], [9, 44], [14, 37], [16, 38], [7, 43], [3, 43],
    [0, 40], [-2, 37], [-5, 36], [-9, 37]
  ],
  // Africa
  [
    [32, 31], [33, 28], [37, 23], [40, 18], [43, 12], [51, 12], [51, 10],
    [45, 2], [40, -3], [39, -8], [40, -14], [35, -20], [33, -26], [28, -32],
    [26, -34], [18, -34], [15, -28], [14, -22], [12, -16], [12, -10],
    [9, -4], [9, 1], [9, 4], [3, 6], [-2, 5], [-7, 4], [-11, 7], [-13, 9],
    [-17, 15], [-16, 21], [-13, 27], [-10, 30], [-6, 35], [-2, 35], [3, 37],
    [10, 37], [11, 33], [15, 32], [20, 32], [25, 32], [30, 31], [32, 31]
  ],
  // Australia
  [
    [142, -11], [138, -17], [136, -12], [131, -12], [128, -14], [122, -17],
    [118, -20], [114, -22], [113, -26], [115, -34], [121, -34], [128, -32],
    [134, -33], [138, -35], [144, -38], [148, -38], [151, -34], [153, -28],
    [151, -23], [146, -17], [142, -11]
  ],
  // Antarctica
  [
    [-180, -68], [-140, -66], [-100, -68], [-60, -64], [-40, -70],
    [0, -68], [40, -66], [80, -68], [120, -65], [160, -67], [180, -68],
    [180, -90], [-180, -90]
  ],
  // Major Islands (UK, Japan, Madagascar, Sri Lanka)
  [[-5, 50], [-3, 50], [1, 52], [0, 54], [-2, 57], [-4, 58], [-5, 55], [-4, 52], [-5, 50]],
  [[130, 33], [133, 34], [137, 35], [141, 38], [141, 43], [145, 44], [139, 41], [130, 33]],
  [[44, -13], [50, -15], [48, -25], [44, -25], [44, -13]],
  [[80, 10], [82, 8], [81, 6], [80, 7], [80, 10]]
];

// Ray-casting point-in-polygon test
const isPointInPolygon = (point: [number, number], vs: number[][]) => {
  const x = point[0];
  const y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];
    const yi = vs[i][1];
    const xj = vs[j][0];
    const yj = vs[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// Check if (lon, lat) is within any continent landmass
const checkIsLand = (lon: number, lat: number): boolean => {
  for (let p = 0; p < CONTINENT_POLYGONS.length; p++) {
    if (isPointInPolygon([lon, lat], CONTINENT_POLYGONS[p])) {
      return true;
    }
  }
  return false;
};

// Convert Lat/Lon degrees to 3D Cartesian Vector
const latLonToVector3 = (lat: number, lon: number, radius: number): [number, number, number] => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  ];
};

// ----------------------------------------------------------------------------
// Atmospheric Fresnel Rim Shader Material
// ----------------------------------------------------------------------------
const createAtmosphereFresnelMaterial = (isLight: boolean) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(isLight ? 0x050508 : 0xffffff) },
      uPower: { value: 3.5 },
      uIntensity: { value: isLight ? 0.4 : 0.7 },
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
// High-Density Dot-Matrix Earth Globe Component
// ----------------------------------------------------------------------------
const DotMatrixGlobe = ({ isLight }: { isLight: boolean }) => {
  const globeGroupRef = useRef<THREE.Group>(null);
  const beaconRingRef = useRef<THREE.Mesh>(null);
  const orbitSatelliteRef = useRef<THREE.Group>(null);

  // Scaled down radius for balanced hero composition
  const RADIUS = 1.25;
  const ORBIT_RADIUS = 1.75;
  const POINT_COUNT = 18000;

  // 1. Generate Fibonacci Point Cloud Sphere with Land/Ocean Sampling
  const { geometry: dotGeometry, material: dotMaterial } = useMemo(() => {
    const positions = new Float32Array(POINT_COUNT * 3);
    const brightness = new Float32Array(POINT_COUNT);
    const sizes = new Float32Array(POINT_COUNT);

    for (let i = 0; i < POINT_COUNT; i++) {
      // Golden Spiral / Fibonacci sphere distribution
      const phi = Math.acos(1 - (2 * (i + 0.5)) / POINT_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const lat = 90 - (phi * 180) / Math.PI;
      let lon = ((theta * 180) / Math.PI) % 360;
      if (lon > 180) lon -= 360;
      if (lon < -180) lon += 360;

      const isLand = checkIsLand(lon, lat);

      // Land nodes are elevated slightly and render significantly larger & brighter
      const r = isLand ? RADIUS * 1.008 : RADIUS;
      positions[i * 3] = -(r * Math.sin(phi) * Math.cos(theta));
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      brightness[i] = isLand ? 1.0 : 0.0;
      sizes[i] = isLand ? 0.022 : 0.011;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aBrightness', new THREE.BufferAttribute(brightness, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    // Custom Antialiased Circular Point Shader Material
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uLandColor: { value: new THREE.Color(isLight ? 0x0a0a0c : 0xffffff) },
        uOceanColor: { value: new THREE.Color(isLight ? 0xd5d7dd : 0x18181c) },
        uOpacity: { value: 1.0 },
      },
      vertexShader: `
        attribute float aBrightness;
        attribute float aSize;
        varying float vBrightness;

        void main() {
          vBrightness = aBrightness;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (350.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uLandColor;
        uniform vec3 uOceanColor;
        uniform float uOpacity;
        varying float vBrightness;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;
          float edge = smoothstep(0.5, 0.22, dist);

          vec3 col = mix(uOceanColor, uLandColor, vBrightness);
          float alpha = mix(0.06, 0.95, vBrightness) * uOpacity * edge;

          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat };
  }, [isLight]);

  // Update shader uniforms smoothly on theme toggle
  useEffect(() => {
    if (dotMaterial) {
      dotMaterial.uniforms.uLandColor.value.set(isLight ? 0x0a0a0c : 0xffffff);
      dotMaterial.uniforms.uOceanColor.value.set(isLight ? 0xd5d7dd : 0x18181c);
      dotMaterial.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      dotMaterial.needsUpdate = true;
    }
  }, [isLight, dotMaterial]);

  // 2. Atmospheric Rim Particle Halo
  const haloGeometry = useMemo(() => {
    const haloCount = 650;
    const positions = new Float32Array(haloCount * 3);
    for (let i = 0; i < haloCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = RADIUS * (1.05 + Math.random() * 0.06);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // 3. Visakhapatnam Coordinates [17.6868° N, 83.2185° E]
  const vspPos = useMemo(() => latLonToVector3(17.6868, 83.2185, RADIUS * 1.018), []);
  const stemGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0.06, 0.06, 0], 3));
    return geo;
  }, []);

  // Fresnel Atmosphere
  const atmosphereMaterial = useMemo(() => createAtmosphereFresnelMaterial(isLight), [isLight]);

  // Frame animation loop with delta time (60 FPS)
  useFrame((state, delta) => {
    // Continuous axial rotation of the dot-matrix planet along its local polar axis
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y += delta * 0.15;
    }

    // Revolving telemetry beacon node along opposing orbital trajectory
    if (orbitSatelliteRef.current) {
      orbitSatelliteRef.current.rotation.y += delta * 0.45;
    }

    // Visakhapatnam radar beacon pulse
    if (beaconRingRef.current) {
      const pulse = 1 + (Math.sin(state.clock.elapsedTime * 4.5) + 1) * 0.55;
      beaconRingRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Earth System with True Axial Tilt: 23.4° on Z-axis                 */}
      {/* ------------------------------------------------------------------ */}
      <group rotation={[0, 0, -23.44 * (Math.PI / 180)]}>
        
        {/* Continuous Axial Rotating Dot-Matrix Globe */}
        <group ref={globeGroupRef}>
          {/* High-Density Points Earth */}
          <points geometry={dotGeometry} material={dotMaterial} />

          {/* Atmospheric Particle Halo */}
          <points geometry={haloGeometry}>
            <pointsMaterial
              size={0.014}
              color={isLight ? '#0a0a0c' : '#ffffff'}
              transparent
              opacity={isLight ? 0.22 : 0.4}
              sizeAttenuation
            />
          </points>

          {/* Visakhapatnam Rotating Tactical HUD Node */}
          <group position={vspPos}>
            {/* Pulsing Beacon Pip */}
            <mesh>
              <sphereGeometry args={[0.02, 12, 12]} />
              <meshBasicMaterial color={isLight ? '#000000' : '#ffffff'} />
            </mesh>

            {/* Radar Pulse Wave Ring */}
            <mesh ref={beaconRingRef} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.026, 0.038, 24]} />
              <meshBasicMaterial
                color={isLight ? '#000000' : '#ffffff'}
                transparent
                opacity={0.75}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Tactical Stem Line */}
            <lineSegments geometry={stemGeometry}>
              <lineBasicMaterial
                color={isLight ? '#000000' : '#ffffff'}
                transparent
                opacity={0.65}
              />
            </lineSegments>

            {/* Locked Floating HUD Readout Tag */}
            <Html position={[0.06, 0.06, 0]} distanceFactor={5.5} style={{ pointerEvents: 'none' }}>
              <div className="font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] px-2.5 py-1 rounded-xs border border-foreground/40 bg-background/85 text-foreground backdrop-blur-md whitespace-nowrap shadow-xl flex items-center gap-1.5 select-none transition-colors">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-ping" />
                <span>LAT: 17.68° N // LON: 83.21° E - VISAKHAPATNAM NODE</span>
              </div>
            </Html>
          </group>
        </group>

        {/* Subtle Atmospheric Fresnel Rim Glow */}
        <mesh material={atmosphereMaterial}>
          <sphereGeometry args={[RADIUS + 0.09, 48, 48]} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* Elliptical Orbital Guide Ring tilted at opposing angle (15°)       */}
      {/* ------------------------------------------------------------------ */}
      <group rotation={[15 * (Math.PI / 180), 0, 15 * (Math.PI / 180)]}>
        {/* Orbital Trajectory Ring */}
        <mesh>
          <torusGeometry args={[ORBIT_RADIUS, 0.0035, 8, 120]} />
          <meshBasicMaterial
            color={isLight ? '#000000' : '#ffffff'}
            transparent
            opacity={isLight ? 0.2 : 0.35}
          />
        </mesh>

        {/* Orbiting Telemetry Satellite Rig */}
        <group ref={orbitSatelliteRef}>
          <group position={[ORBIT_RADIUS, 0, 0]}>
            {/* Satellite Core Box */}
            <mesh>
              <boxGeometry args={[0.04, 0.022, 0.025]} />
              <meshBasicMaterial color={isLight ? '#000000' : '#ffffff'} />
            </mesh>
            {/* Solar Array Wings */}
            <mesh position={[0, 0.042, 0]}>
              <boxGeometry args={[0.025, 0.055, 0.003]} />
              <meshBasicMaterial color={isLight ? '#222222' : '#cccccc'} />
            </mesh>
            <mesh position={[0, -0.042, 0]}>
              <boxGeometry args={[0.025, 0.055, 0.003]} />
              <meshBasicMaterial color={isLight ? '#222222' : '#cccccc'} />
            </mesh>
            {/* Sensor Beacon Pip */}
            <mesh position={[0.022, 0, 0]}>
              <sphereGeometry args={[0.009, 8, 8]} />
              <meshBasicMaterial color={isLight ? '#000000' : '#ffffff'} />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
};

// ----------------------------------------------------------------------------
// Background Telemetry Stardust
// ----------------------------------------------------------------------------
const CosmicDust = ({ isLight }: { isLight: boolean }) => {
  const ref = useRef<THREE.Points>(null);
  const count = 350;
  const color = isLight ? '#0a0a0a' : '#ffffff';

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
        size={0.016}
        color={color}
        transparent
        opacity={isLight ? 0.18 : 0.35}
        sizeAttenuation
      />
    </points>
  );
};

// ----------------------------------------------------------------------------
// Centered Parallax Rig with Smooth Mouse Damping
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

  useFrame((state, delta) => {
    if (!rigRef.current) return;

    // Perfectly centered root coordinates [0, 0, 0] with subtle parallax tilt
    const targetRotX = mouse.current.y * 0.22;
    const targetRotY = mouse.current.x * 0.26;
    const targetPosX = mouse.current.x * 0.12;
    const targetPosY = mouse.current.y * 0.08;

    rigRef.current.rotation.x = THREE.MathUtils.damp(rigRef.current.rotation.x, targetRotX, 3.2, delta);
    rigRef.current.rotation.y = THREE.MathUtils.damp(rigRef.current.rotation.y, targetRotY, 3.2, delta);
    rigRef.current.position.x = THREE.MathUtils.damp(rigRef.current.position.x, targetPosX, 2.5, delta);
    rigRef.current.position.y = THREE.MathUtils.damp(rigRef.current.position.y, targetPosY, 2.5, delta);

    const targetScale = isDesktop ? 0.95 : 0.75;
    const currentScale = rigRef.current.scale.x;
    const dampedScale = THREE.MathUtils.damp(currentScale, targetScale, 3.0, delta);
    rigRef.current.scale.set(dampedScale, dampedScale, dampedScale);
  });

  return (
    <group ref={rigRef} position={[0, 0, 0]}>
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
