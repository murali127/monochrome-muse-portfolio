import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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
// Lat/Lon Navigation Grid Geometry (Equator, Parallels, Meridians)
// ----------------------------------------------------------------------------
const createLatLonGridGeometry = (radius: number) => {
  const points: number[] = [];
  const r = radius * 1.002;

  // 1. Latitude Parallels (Equator, Tropics, Polar bounds)
  const latitudes = [-60, -30, 0, 30, 60];
  const lonStep = 5; // Every 5 degrees

  latitudes.forEach((lat) => {
    const phi = (90 - lat) * (Math.PI / 180);
    for (let lon = -180; lon < 180; lon += lonStep) {
      const theta = (lon + 180) * (Math.PI / 180);
      points.push(
        -(r * Math.sin(phi) * Math.cos(theta)),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }
  });

  // 2. Longitude Meridians (Prime meridian, Pacific anti-meridian, quadrants)
  const longitudes = [-135, -90, -45, 0, 45, 90, 135, 180];
  const latStep = 4; // Every 4 degrees from -80 to +80

  longitudes.forEach((lon) => {
    const theta = (lon + 180) * (Math.PI / 180);
    for (let lat = -80; lat <= 80; lat += latStep) {
      const phi = (90 - lat) * (Math.PI / 180);
      points.push(
        -(r * Math.sin(phi) * Math.cos(theta)),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  return geo;
};

// ----------------------------------------------------------------------------
// Atmospheric Fresnel Rim Shader Material
// ----------------------------------------------------------------------------
const createAtmosphereFresnelMaterial = (isLight: boolean) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(isLight ? 0x09090b : 0xffffff) },
      uPower: { value: isLight ? 2.5 : 3.5 },
      uIntensity: { value: isLight ? 0.38 : 0.65 },
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
// Minimal, Tactile Visakhapatnam Beacon (Subtle pulse point & expanding ripple)
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
      const t = (time * 1.25) % 1;
      if (ringRef.current) {
        const scale = 1.0 + t * 2.6;
        ringRef.current.scale.set(scale, scale, 1);
        const ringMat = ringRef.current.material as THREE.MeshBasicMaterial;
        ringMat.opacity = Math.pow(1 - t, 1.4) * (isLight ? 0.85 : 0.9) * visibility;
      }

      // 3. Small glowing core dot pulse
      if (coreRef.current) {
        const pulse = 1.0 + Math.sin(time * 4.5) * 0.15;
        coreRef.current.scale.set(pulse, pulse, pulse);
        const coreMat = coreRef.current.material as THREE.MeshBasicMaterial;
        coreMat.opacity = (isLight ? 0.95 : 1.0) * visibility;
      }
    }
  });

  const primaryColor = isLight ? '#09090b' : '#ffffff';

  return (
    <group position={vspPos} quaternion={orientation} ref={beaconGroupRef}>
      {/* High-contrast core dot directly on coordinate surface */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.016, 16, 16]} />
        <meshBasicMaterial color={primaryColor} transparent opacity={1} />
      </mesh>

      {/* Single delicate expanding radar ring (tangent to sphere surface) */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.018, 0.024, 32]} />
        <meshBasicMaterial
          color={primaryColor}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------------------------------
// High-Density Dot-Matrix Earth Globe Component (Zero Tilt, Straight Y Rotation)
// ----------------------------------------------------------------------------
const DotMatrixGlobe = ({ isLight }: { isLight: boolean }) => {
  const globeGroupRef = useRef<THREE.Group>(null);

  const RADIUS = 1.25;
  const POINT_COUNT = 14000;

  // 1. Generate Uniform Fibonacci Point Cloud Sphere (Dual-Layer Density: Land + Ocean)
  const { geometry: dotGeometry, material: dotMaterial } = useMemo(() => {
    const positions = new Float32Array(POINT_COUNT * 3);
    const brightness = new Float32Array(POINT_COUNT);
    const sizes = new Float32Array(POINT_COUNT);

    for (let i = 0; i < POINT_COUNT; i++) {
      // Golden Spiral / Fibonacci sphere distribution ensuring 100% spherical coverage
      const phi = Math.acos(1 - (2 * (i + 0.5)) / POINT_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const lat = 90 - (phi * 180) / Math.PI;
      let lon = (((theta * 180) / Math.PI) % 360) - 180;
      if (lon < -180) lon += 360;
      if (lon > 180) lon -= 360;

      const isLand = checkIsLand(lon, lat);

      // Land nodes are elevated slightly and render significantly larger & brighter
      const r = isLand ? RADIUS * 1.006 : RADIUS;
      positions[i * 3] = -(r * Math.sin(phi) * Math.cos(theta));
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      // Land = 1.0 (bright, high-density), Ocean = 0.0 (subtle visible coordinate matrix)
      brightness[i] = isLand ? 1.0 : 0.0;
      sizes[i] = isLand ? 0.026 : 0.012;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aBrightness', new THREE.BufferAttribute(brightness, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    // Antialiased Circular Point Shader Material with Dual Density
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uLandColor: { value: new THREE.Color(isLight ? 0x09090b : 0xffffff) },
        uOceanColor: { value: new THREE.Color(isLight ? 0x71717a : 0x666666) },
        uLandAlpha: { value: 1.0 },
        uOceanAlpha: { value: isLight ? 0.25 : 0.28 },
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
        uniform float uLandAlpha;
        uniform float uOceanAlpha;
        varying float vBrightness;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;
          float edge = smoothstep(0.5, 0.22, dist);

          vec3 col = mix(uOceanColor, uLandColor, vBrightness);
          float alpha = mix(uOceanAlpha, uLandAlpha, vBrightness) * edge;

          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    return { geometry: geo, material: mat };
  }, [isLight]);

  // Update shader uniforms smoothly on theme toggle
  useEffect(() => {
    if (dotMaterial) {
      dotMaterial.uniforms.uLandColor.value.set(isLight ? 0x09090b : 0xffffff);
      dotMaterial.uniforms.uOceanColor.value.set(isLight ? 0x71717a : 0x666666);
      dotMaterial.uniforms.uLandAlpha.value = 1.0;
      dotMaterial.uniforms.uOceanAlpha.value = isLight ? 0.25 : 0.28;
      dotMaterial.needsUpdate = true;
    }
  }, [isLight, dotMaterial]);

  // 2. Subtle Navigation Grid (Equator, Parallels, Meridians) - Never disappears over oceans
  const gridGeometry = useMemo(() => createLatLonGridGeometry(RADIUS), [RADIUS]);

  // 3. Atmospheric Rim Particle Halo
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
  }, [RADIUS]);

  // Fresnel Atmosphere
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
        {/* Physical Core Sphere - Gives solid architectural 3D volume & occludes backside points */}
        <mesh>
          <sphereGeometry args={[RADIUS * 0.990, 48, 48]} />
          <meshBasicMaterial
            color={isLight ? '#f2f2f5' : '#040406'}
            transparent
            opacity={isLight ? 0.94 : 0.92}
          />
        </mesh>

        {/* High-Density Points Earth (Dual-Density Land + Ocean Grid) */}
        <points geometry={dotGeometry} material={dotMaterial} />

        {/* Subtle Navigational Latitude & Longitude Coordinate Parallels */}
        <points geometry={gridGeometry}>
          <pointsMaterial
            size={0.010}
            color={isLight ? '#09090b' : '#ffffff'}
            transparent
            opacity={isLight ? 0.16 : 0.22}
            sizeAttenuation
            depthWrite={false}
          />
        </points>

        {/* Atmospheric Particle Halo */}
        <points geometry={haloGeometry}>
          <pointsMaterial
            size={0.014}
            color={isLight ? '#09090b' : '#ffffff'}
            transparent
            opacity={isLight ? 0.18 : 0.38}
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

      {/* Atmospheric Fresnel Rim Glow / Ambient Rim Shadow */}
      <mesh material={atmosphereMaterial}>
        <sphereGeometry args={[RADIUS + 0.08, 48, 48]} />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------------------------------
// Background Telemetry Stardust
// ----------------------------------------------------------------------------
const CosmicDust = ({ isLight }: { isLight: boolean }) => {
  const ref = useRef<THREE.Points>(null);
  const count = 350;
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
        size={0.016}
        color={color}
        transparent
        opacity={isLight ? 0.12 : 0.35}
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
