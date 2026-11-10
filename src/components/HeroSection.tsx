import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView, useSpring } from 'framer-motion';
import profilePhoto from '@/assets/murali-photo.png';
import { playTactileClick } from '@/utils/audioFeedback';

// ----------------------------------------------------------------------------
// Types & Constants
// ----------------------------------------------------------------------------
interface MagneticSwitchProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  sublabel?: string;
}

const SCRAMBLE_CHARS = '010101_XF94#*&$%+-';
const TARGET_NAME = 'MURALI PAILA';

interface BusTrack {
  id: string;
  label: string;
  code: string;
  metric: string;
  status: string;
}

const busTracks: BusTrack[] = [
  {
    id: 'genai',
    label: 'GEN AI & RAG ARCHITECTURES',
    code: 'BUS.01',
    metric: 'RAG LATENCY: <1.8s // LIGHTRAG + HYBRID GRAPH',
    status: 'ACTIVE_PROD',
  },
  {
    id: 'voice',
    label: 'VOICE AI & STREAMING PIPELINES',
    code: 'BUS.02',
    metric: 'E2E LATENCY: <450ms // PIPECAT + AGORA + SARVAM',
    status: 'REALTIME_RTC',
  },
  {
    id: 'backend',
    label: 'FASTAPI & HIGH-THROUGHPUT BACKENDS',
    code: 'BUS.03',
    metric: 'RPS: 18.4K // ASYNC ASGI // P99: 14.8ms',
    status: 'CONCURRENCY',
  },
  {
    id: 'cv',
    label: 'EDGE COMPUTER VISION & ANALYTICS',
    code: 'BUS.04',
    metric: '32 FPS @ 1080P // YOLOX + BYTETRACK IoU: 0.84',
    status: 'L4_RESEARCH',
  },
];

// ----------------------------------------------------------------------------
// Magnetic Hardware Switch CTA Component (Notched Brutalist Geometry)
// ----------------------------------------------------------------------------
const MagneticHardwareSwitch = ({
  children,
  className = '',
  href,
  target,
  rel,
  onClick,
  sublabel,
}: MagneticSwitchProps) => {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const pullX = (e.clientX - centerX) * 0.22;
    const pullY = (e.clientY - centerY) * 0.22;
    setOffset({ x: pullX, y: pullY });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  const handleClick = () => {
    playTactileClick('toggle');
    onClick?.();
  };

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      ref={ref as any}
      href={href}
      target={target}
      rel={rel}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 25, bounce: 0 }}
      whileTap={{ scale: 0.96 }}
      className={`relative group inline-flex flex-col items-center justify-center pointer-events-auto select-none ${className}`}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
      }}
      data-cursor-hover
    >
      <div className="flex items-center gap-2">
        {children}
      </div>
      {sublabel && (
        <span className="font-mono text-[6.5px] sm:text-[7.5px] opacity-60 tracking-widest mt-0.5 group-hover:opacity-95 transition-opacity">
          {sublabel}
        </span>
      )}
    </Component>
  );
};

// ----------------------------------------------------------------------------
// Hero Section Root Component
// ----------------------------------------------------------------------------
const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  // Real-time Dual Synchronized Telemetry Clock (UTC + IST)
  const [clock, setClock] = useState({ utc: '--:--:--', ist: '--:--:--' });
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.toTimeString().split(' ')[0];
      const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
      const ist = istDate.toTimeString().split(' ')[0];
      setClock({ utc, ist });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Character Decoder / Scramble Effect for Name Header
  const [displayName, setDisplayName] = useState(TARGET_NAME);
  const [isScrambling, setIsScrambling] = useState(false);

  const triggerScramble = useCallback(() => {
    if (isScrambling) return;
    setIsScrambling(true);
    let iteration = 0;
    const maxIterations = 12;

    const interval = setInterval(() => {
      setDisplayName(() =>
        TARGET_NAME.split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration / 1.5) {
              return TARGET_NAME[index];
            }
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join('')
      );

      iteration += 1;
      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayName(TARGET_NAME);
        setIsScrambling(false);
      }
    }, 40);
  }, [isScrambling]);

  useEffect(() => {
    const timeout = setTimeout(triggerScramble, 650);
    return () => clearTimeout(timeout);
  }, [triggerScramble]);

  // Active Data Bus Track Hover state
  const [activeTrack, setActiveTrack] = useState<BusTrack>(busTracks[0]);

  // 3D Holographic Subject Tilt & Hover Reticle Tracking
  const photoContainerRef = useRef<HTMLDivElement>(null);
  const [isPhotoHovered, setIsPhotoHovered] = useState(false);
  const [reticleCoords, setReticleCoords] = useState({ x: 50, y: 50 });

  const springConfig = { stiffness: 180, damping: 20 };
  const tiltX = useSpring(0, springConfig);
  const tiltY = useSpring(0, springConfig);

  const handlePhotoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!photoContainerRef.current) return;
    const rect = photoContainerRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    const normX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const normY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    tiltX.set(-normY * 10);
    tiltY.set(normX * 10);

    setReticleCoords({
      x: Math.max(12, Math.min(88, xPct)),
      y: Math.max(12, Math.min(88, yPct)),
    });
    if (!isPhotoHovered) {
      setIsPhotoHovered(true);
      playTactileClick('subtle');
    }
  };

  const handlePhotoMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
    setIsPhotoHovered(false);
  };

  const techStack = [
    'PYTHON',
    'FASTAPI',
    'LIGHTRAG',
    'PIPECAT',
    'AGORA AI',
    'SARVAM STT',
    'REACT',
    'NEXT.JS',
    'TYPESCRIPT',
    'DOCKER',
    'AWS',
    'MONGODB',
    'POSTGRESQL',
    'OPENCV',
    'YOLOX',
  ];

  return (
    <section
      ref={ref}
      className="relative min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between overflow-hidden pointer-events-none"
    >
      {/* High-Tech Laser Scan Line Sweep */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent animate-scan" />
      </div>

      {/* Main Hero Viewport Wrapper */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 w-full pt-16 sm:pt-20 lg:pt-16 pb-2 sm:pb-4 flex-1 flex flex-col justify-between">
        
        {/* =============================================================== */}
        {/* Top Perimeter Telemetry Strip (Responsive Stack on Mobile)     */}
        {/* =============================================================== */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-4 sm:mb-6 pb-2.5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 font-ndot text-[8px] sm:text-[8.5px] tracking-[0.2em] sm:tracking-[0.25em] text-muted-foreground pointer-events-auto"
        >
          <div className="flex items-center gap-2 text-foreground">
            <span className="h-2 w-2 rounded-full bg-foreground animate-ping shrink-0" />
            <span className="truncate">GEO_ORIGIN // 17.6868° N, 83.2185° E [VIZAG]</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono text-[8px] sm:text-[8.5px] text-foreground/80">
            <span>UTC: <strong className="text-foreground">{clock.utc}</strong></span>
            <span>•</span>
            <span>IST: <strong className="text-foreground">{clock.ist}</strong></span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline text-muted-foreground">ORBITAL_PLANE: NOMINAL</span>
          </div>
        </motion.div>

        {/* =============================================================== */}
        {/* Core Content Grid: 100vh Fits Comfortably on Desktop            */}
        {/* =============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center flex-1 my-auto">
          
          {/* Left Column: Command Telemetry, Scramble Name & Actions (7 Cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 pointer-events-auto">
            
            {/* Dynamic Role Beacon Badge */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xs border border-border/80 bg-background/90 backdrop-blur-md shadow-sm max-w-full"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-foreground phosphor-led shrink-0" />
              <span className="font-ndot text-[8px] sm:text-[8.5px] tracking-[0.18em] sm:tracking-[0.22em] text-foreground font-semibold truncate">
                SYS.01 // REAL-TIME AI ARCHITECT & FULL-STACK SYSTEMS
              </span>
              <span className="hidden sm:inline-block font-mono text-[7px] text-muted-foreground px-1 border border-border/70 rounded-xs shrink-0">
                NODE_SECURE
              </span>
            </motion.div>

            {/* Kinetic Name Header with Scramble Decoder (Clean 2-Line Separation) */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={triggerScramble}
                className="font-ndot text-4xl sm:text-6xl md:text-7xl lg:text-[76px] leading-[0.95] tracking-tight text-foreground text-glow select-none cursor-pointer group"
                title="Click or hover to re-trigger cryptographic decode"
              >
                <div className="flex flex-col whitespace-nowrap drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]">
                  <span className="block">{displayName.split(' ')[0]}</span>
                  <span className="block text-muted-foreground/85 transition-colors group-hover:text-foreground">
                    {displayName.split(' ')[1] || 'PAILA'}
                  </span>
                </div>
              </motion.h1>

              <div className="mt-2 font-mono text-[8px] sm:text-[8.5px] tracking-[0.18em] text-muted-foreground flex flex-wrap items-center gap-2">
                <span>[ID: MP-2026 // PRODUCTION_ENGINEER]</span>
                <span>•</span>
                <span className="text-foreground/75 font-ndot text-[7.5px] sm:text-[8px]">GVPCE(A) VISAKHAPATNAM</span>
              </div>
            </div>

            {/* Editorial Narrative Summary */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="font-body text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed text-pretty font-normal"
            >
              I engineer intelligent AI-powered products and resilient full-stack applications.
              Specialized in production conversational AI, LightRAG knowledge graph architectures,
              real-time Voice AI streaming pipelines, and high-performance FastAPI backends.
            </motion.p>

            {/* ============================================================= */}
            {/* Interactive Data Bus Strip (Compact Responsive Layout)        */}
            {/* ============================================================= */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="pt-2 border-t border-border/60 space-y-2 max-w-xl"
            >
              <div className="flex items-center justify-between font-ndot text-[7.5px] tracking-[0.24em] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-foreground" />
                  DATA_BUS // CORE_ARCHITECTURAL_PIPELINES
                </span>
                <span className="font-mono text-foreground text-[8px]">{activeTrack.status}</span>
              </div>

              {/* Data Bus Track Switchboard: 1 Col Mobile -> 2 Col Desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                {busTracks.map((track) => {
                  const isActive = activeTrack.id === track.id;
                  return (
                    <button
                      key={track.id}
                      onMouseEnter={() => {
                        setActiveTrack(track);
                        playTactileClick('subtle');
                      }}
                      className={`text-left p-2 border transition-all rounded-xs focus:outline-none flex flex-col justify-between group ${
                        isActive
                          ? 'border-foreground bg-background/95 text-foreground shadow-sm'
                          : 'border-border/60 bg-foreground/[0.015] hover:border-foreground/60 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-0.5">
                        <span className="font-mono text-[7px] opacity-75">{track.code}</span>
                        {/* Dynamic Mini Signal Bars */}
                        <div className="flex items-end gap-0.5 h-1.5">
                          <span className={`w-0.5 h-1 ${isActive ? 'bg-foreground' : 'bg-muted-foreground/40'}`} />
                          <span className={`w-0.5 h-1.5 ${isActive ? 'bg-foreground' : 'bg-muted-foreground/40'}`} />
                          <span className={`w-0.5 h-1 ${isActive ? 'bg-foreground' : 'bg-muted-foreground/40'}`} />
                        </div>
                      </div>
                      <div className="font-ndot text-[8.5px] sm:text-[9px] tracking-wider font-semibold truncate">
                        {track.label}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Live Metric Banner for Active Track */}
              <div className="p-2 rounded-xs border border-border/80 bg-background/90 backdrop-blur-md flex items-center justify-between font-mono text-[8px] sm:text-[8.5px] text-foreground">
                <span className="text-muted-foreground font-ndot text-[7px] tracking-wider uppercase shrink-0 mr-2">
                  TELEMETRY:
                </span>
                <span className="font-semibold truncate">{activeTrack.metric}</span>
              </div>
            </motion.div>

            {/* ============================================================= */}
            {/* Tactical Hardware Switch CTA Triggers                         */}
            {/* ============================================================= */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 pt-1"
            >
              {/* Primary Switch CTA: VIEW WORK */}
              <MagneticHardwareSwitch
                href="#projects"
                sublabel="L2_PIPELINE // VERIFIED"
                className="bg-foreground text-background px-5 py-2.5 font-ndot text-[9.5px] sm:text-[10px] tracking-[0.2em] font-bold shadow-[0_0_15px_rgba(255,255,255,0.18)] border border-foreground hover:bg-background hover:text-foreground transition-colors"
              >
                <span>EXECUTE // VIEW WORK</span>
                <span className="font-mono text-xs">→</span>
              </MagneticHardwareSwitch>

              {/* Secondary Switch CTA: ESTABLISH CONTACT */}
              <MagneticHardwareSwitch
                href="#contact"
                sublabel="UPLINK_READY // PORT_443"
                className="bg-background/90 backdrop-blur-md border border-border/90 hover:border-foreground px-5 py-2.5 font-ndot text-[9.5px] sm:text-[10px] tracking-[0.2em] text-foreground transition-colors shadow-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-foreground phosphor-led" />
                <span>ESTABLISH CONTACT</span>
              </MagneticHardwareSwitch>

              {/* System Spec CV Link */}
              <MagneticHardwareSwitch
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                sublabel="PDF // 1.2 MB // VERIFIED"
                className="bg-background/80 border border-border/70 hover:border-foreground/80 px-3.5 py-2.5 font-ndot text-[8.5px] sm:text-[9px] tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>SYSTEM SPEC [CV]</span>
                <span className="font-mono text-xs">↗</span>
              </MagneticHardwareSwitch>
            </motion.div>

          </div>

          {/* =============================================================== */}
          {/* Right Column: Holographic Subject (No Permanent Chin Ring)     */}
          {/* =============================================================== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative flex justify-center pointer-events-auto select-none my-auto"
            style={{ perspective: 1000 }}
          >
            <motion.div
              ref={photoContainerRef}
              onMouseMove={handlePhotoMouseMove}
              onMouseLeave={handlePhotoMouseLeave}
              style={{
                rotateX: tiltX,
                rotateY: tiltY,
                transformStyle: 'preserve-3d',
              }}
              className="relative w-full max-w-[280px] sm:max-w-[340px] lg:max-h-[50vh] aspect-[4/5] flex items-center justify-center cursor-crosshair group"
            >
              {/* Outer Tactical Crosshair Target Brackets */}
              <div className="absolute -top-2.5 -left-2.5 w-4 h-4 border-t border-l border-foreground/50 transition-all duration-300 group-hover:scale-110" />
              <div className="absolute -top-2.5 -right-2.5 w-4 h-4 border-t border-r border-foreground/50 transition-all duration-300 group-hover:scale-110" />
              <div className="absolute -bottom-2.5 -left-2.5 w-4 h-4 border-b border-l border-foreground/50 transition-all duration-300 group-hover:scale-110" />
              <div className="absolute -bottom-2.5 -right-2.5 w-4 h-4 border-b border-r border-foreground/50 transition-all duration-300 group-hover:scale-110" />

              {/* Developer Portrait with Holographic Alpha Vignette Dissolve */}
              <div
                className="relative w-full h-full overflow-hidden flex items-center justify-center"
                style={{
                  maskImage:
                    'radial-gradient(ellipse 85% 85% at 50% 45%, black 45%, rgba(0,0,0,0.85) 65%, transparent 100%)',
                  WebkitMaskImage:
                    'radial-gradient(ellipse 85% 85% at 50% 45%, black 45%, rgba(0,0,0,0.85) 65%, transparent 100%)',
                }}
              >
                <img
                  src={profilePhoto}
                  alt="Murali Paila - GenAI Full-Stack Developer"
                  className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-[1.03]"
                  loading="eager"
                />

                {/* Active CRT Phosphor Scanline Overlay */}
                <div className="absolute inset-0 scanline pointer-events-none opacity-60 mix-blend-overlay" />
              </div>

              {/* Dynamic HUD Reticle: STRICTLY HIDDEN BY DEFAULT, ONLY VISIBLE ON HOVER */}
              <div
                className={`absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 z-20 transition-opacity duration-200 ${
                  isPhotoHovered ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  left: `${reticleCoords.x}%`,
                  top: `${reticleCoords.y}%`,
                }}
              >
                <div className="w-11 h-11 border border-foreground/60 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                </div>
                {/* Crosshair Spikes */}
                <div className="absolute top-1/2 -left-3 w-2 h-px bg-foreground/70" />
                <div className="absolute top-1/2 -right-3 w-2 h-px bg-foreground/70" />
                <div className="absolute left-1/2 -top-3 h-2 w-px bg-foreground/70" />
                <div className="absolute left-1/2 -bottom-3 h-2 w-px bg-foreground/70" />

                {/* Reticle Tag */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap font-ndot text-[6px] tracking-[0.2em] px-1.5 py-0.5 rounded-xs bg-background/90 border border-border text-foreground shadow-md">
                  TARGET_LOCK // DEV_ID: MURALI_PAILA
                </div>
              </div>

              {/* Floating Holographic Micro-Metrics Drawer */}
              <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xs bg-background/92 backdrop-blur-md border border-border/80 font-ndot text-[7px] tracking-[0.2em] text-foreground flex justify-between items-center z-10 shadow-lg">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground phosphor-led" />
                  <span>PULSE: 72 BPM</span>
                </div>
                <span>SYNC: 99.4%</span>
                <span className="font-mono text-[6.5px] text-muted-foreground">DEPLOYED</span>
              </div>
            </motion.div>
          </motion.div>

        </div>

        {/* Global Tech Marquee Ribbon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="mt-4 sm:mt-6 overflow-hidden border-t border-b border-border/70 py-2 sm:py-2.5 pointer-events-auto bg-background/50 backdrop-blur-sm"
        >
          <div className="marquee-track">
            {[...techStack, ...techStack].map((tech, i) => (
              <span
                key={i}
                className="mx-5 sm:mx-8 font-ndot text-[8.5px] sm:text-[9.5px] tracking-[0.28em] text-muted-foreground whitespace-nowrap hover:text-foreground transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
