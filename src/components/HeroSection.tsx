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
    status: 'HIGH_CONCURRENCY',
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
    const pullX = (e.clientX - centerX) * 0.28;
    const pullY = (e.clientY - centerY) * 0.28;
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
        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
      }}
      data-cursor-hover
    >
      <div className="flex items-center gap-2">
        {children}
      </div>
      {sublabel && (
        <span className="font-mono text-[7px] sm:text-[7.5px] opacity-60 tracking-widest mt-0.5 group-hover:opacity-90 transition-opacity">
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
    const maxIterations = 14;

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
    }, 45);
  }, [isScrambling]);

  // Initial trigger on mount
  useEffect(() => {
    const timeout = setTimeout(triggerScramble, 650);
    return () => clearTimeout(timeout);
  }, [triggerScramble]);

  // Active Data Bus Track Hover state
  const [activeTrack, setActiveTrack] = useState<BusTrack>(busTracks[0]);

  // 3D Holographic Subject Tilt Tracking via Spring Physics
  const photoContainerRef = useRef<HTMLDivElement>(null);
  const [reticleCoords, setReticleCoords] = useState({ x: 50, y: 45, isLocked: false });

  const springConfig = { stiffness: 180, damping: 20 };
  const tiltX = useSpring(0, springConfig);
  const tiltY = useSpring(0, springConfig);

  const handlePhotoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!photoContainerRef.current) return;
    const rect = photoContainerRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    // Opposing tilt angles for 3D depth parallax against Earth background
    const normX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const normY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    tiltX.set(-normY * 12);
    tiltY.set(normX * 12);

    setReticleCoords({
      x: Math.max(15, Math.min(85, xPct)),
      y: Math.max(15, Math.min(85, yPct)),
      isLocked: true,
    });
  };

  const handlePhotoMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
    setReticleCoords({ x: 50, y: 45, isLocked: false });
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
      className="relative min-h-[94dvh] flex items-center justify-center overflow-hidden pointer-events-none"
    >
      {/* High-Tech Laser Scan Line Sweep */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent animate-scan" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 w-full pt-28 sm:pt-32 pb-14">
        
        {/* Perimeter Telemetry Strip (Coordinates & Dual Clock) */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-8 pb-3 border-b border-border/60 flex flex-wrap items-center justify-between gap-3 font-ndot text-[8px] tracking-[0.25em] text-muted-foreground pointer-events-auto"
        >
          <div className="flex items-center gap-2 text-foreground">
            <span className="h-2 w-2 rounded-full bg-foreground animate-ping" />
            <span>GEO_ORIGIN // 17.6868° N, 83.2185° E [VIZAG]</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[8.5px] text-foreground/80">
            <span>UTC: <strong className="text-foreground">{clock.utc}</strong></span>
            <span>•</span>
            <span>IST: <strong className="text-foreground">{clock.ist}</strong></span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-muted-foreground">ORBITAL_PLANE: NOMINAL</span>
          </div>
        </motion.div>

        {/* Asymmetrical High-Contrast Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* =============================================================== */}
          {/* Left Column: Command Telemetry, Scramble Name & Actions (7 Cols) */}
          {/* =============================================================== */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 pointer-events-auto">
            
            {/* Dynamic Role Beacon Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-3 py-1 rounded-xs border border-border/80 bg-background/90 backdrop-blur-md shadow-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-foreground phosphor-led" />
              <span className="font-ndot text-[8.5px] sm:text-[9px] tracking-[0.25em] text-foreground font-semibold">
                SYS.01 // REAL-TIME AI ARCHITECT & FULL-STACK SYSTEMS
              </span>
              <span className="font-mono text-[7.5px] text-muted-foreground px-1 border border-border/70 rounded-xs">
                NODE_SECURE
              </span>
            </motion.div>

            {/* Kinetic Name Header with Scramble Decoder */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 35 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.35, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={triggerScramble}
                className="font-ndot text-4xl sm:text-7xl lg:text-8xl leading-[0.92] tracking-tight text-foreground text-glow select-none cursor-pointer group"
                title="Click or hover to re-trigger cryptographic decode"
              >
                <div className="flex flex-col">
                  <span>{displayName.split(' ')[0]}</span>
                  <span className="text-muted-foreground/85 transition-colors group-hover:text-foreground">
                    {displayName.split(' ')[1] || 'PAILA'}
                  </span>
                </div>
              </motion.h1>

              <div className="mt-2 font-mono text-[9px] tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <span>[ID: MP-2026 // PRODUCTION_ENGINEER]</span>
                <span>•</span>
                <span className="text-foreground/75 font-ndot text-[8px]">GVPCE(A) VISAKHAPATNAM</span>
              </div>
            </div>

            {/* Editorial Narrative Summary */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="font-body text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed text-pretty font-normal"
            >
              I engineer intelligent AI-powered products and resilient full-stack applications.
              Specialized in production conversational AI, LightRAG knowledge graph architectures,
              real-time Voice AI streaming pipelines, and high-performance FastAPI backends.
            </motion.p>

            {/* ============================================================= */}
            {/* Interactive Data Bus Strip (Replacing generic pills)          */}
            {/* ============================================================= */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="pt-2 border-t border-border/60 space-y-2.5 max-w-xl"
            >
              <div className="flex items-center justify-between font-ndot text-[7.5px] tracking-[0.28em] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-foreground" />
                  DATA_BUS // CORE_ARCHITECTURAL_PIPELINES
                </span>
                <span className="font-mono text-foreground">{activeTrack.status}</span>
              </div>

              {/* Data Bus Track Switchboard */}
              <div className="grid grid-cols-2 gap-2">
                {busTracks.map((track) => {
                  const isActive = activeTrack.id === track.id;
                  return (
                    <button
                      key={track.id}
                      onMouseEnter={() => {
                        setActiveTrack(track);
                        playTactileClick('subtle');
                      }}
                      className={`text-left p-2.5 border transition-all rounded-xs focus:outline-none flex flex-col justify-between group ${
                        isActive
                          ? 'border-foreground bg-background/95 text-foreground shadow-sm'
                          : 'border-border/60 bg-foreground/[0.015] hover:border-foreground/60 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-mono text-[7px] opacity-75">{track.code}</span>
                        {/* Dynamic Mini Signal Bars */}
                        <div className="flex items-end gap-0.5 h-2">
                          <span className={`w-0.5 h-1 ${isActive ? 'bg-foreground' : 'bg-muted-foreground/40'}`} />
                          <span className={`w-0.5 h-2 ${isActive ? 'bg-foreground' : 'bg-muted-foreground/40'}`} />
                          <span className={`w-0.5 h-1.5 ${isActive ? 'bg-foreground' : 'bg-muted-foreground/40'}`} />
                        </div>
                      </div>
                      <div className="font-ndot text-[9px] tracking-wider font-semibold line-clamp-1">
                        {track.label}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Live Metric Banner for Active Track */}
              <div className="p-2.5 rounded-xs border border-border/80 bg-background/90 backdrop-blur-md flex items-center justify-between font-mono text-[9px] text-foreground">
                <span className="text-muted-foreground font-ndot text-[7.5px] tracking-wider uppercase">
                  TELEMETRY:
                </span>
                <span className="font-semibold">{activeTrack.metric}</span>
              </div>
            </motion.div>

            {/* ============================================================= */}
            {/* Tactical Hardware Switch CTA Triggers (Angular Notched Clips) */}
            {/* ============================================================= */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.85, duration: 0.6 }}
              className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2"
            >
              {/* Primary Switch CTA: VIEW WORK */}
              <MagneticHardwareSwitch
                href="#projects"
                sublabel="L2_PIPELINE // VERIFIED"
                className="bg-foreground text-background px-6 py-3 font-ndot text-[10px] sm:text-[11px] tracking-[0.24em] font-bold shadow-[0_0_20px_rgba(255,255,255,0.18)] border border-foreground hover:bg-background hover:text-foreground transition-colors"
              >
                <span>EXECUTE // VIEW WORK</span>
                <span className="font-mono text-xs">→</span>
              </MagneticHardwareSwitch>

              {/* Secondary Switch CTA: ESTABLISH CONTACT */}
              <MagneticHardwareSwitch
                href="#contact"
                sublabel="UPLINK_READY // PORT_443"
                className="bg-background/90 backdrop-blur-md border border-border/90 hover:border-foreground px-6 py-3 font-ndot text-[10px] sm:text-[11px] tracking-[0.24em] text-foreground transition-colors shadow-sm"
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
                className="bg-background/80 border border-border/70 hover:border-foreground/80 px-4 py-3 font-ndot text-[9px] sm:text-[10px] tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>SYSTEM SPEC [CV]</span>
                <span className="font-mono text-xs">↗</span>
              </MagneticHardwareSwitch>
            </motion.div>

          </div>

          {/* =============================================================== */}
          {/* Right Column: Holographic Subject (No Heavy Box Frame) (5 Cols)  */}
          {/* =============================================================== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.45, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative flex justify-center pointer-events-auto select-none"
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
              className="relative w-full max-w-[340px] sm:max-w-[390px] aspect-[4/5] flex items-center justify-center cursor-crosshair group"
            >
              {/* Outer Tactical Crosshair Target Brackets */}
              <div className="absolute -top-3 -left-3 w-5 h-5 border-t border-l border-foreground/50 transition-all duration-300 group-hover:scale-110" />
              <div className="absolute -top-3 -right-3 w-5 h-5 border-t border-r border-foreground/50 transition-all duration-300 group-hover:scale-110" />
              <div className="absolute -bottom-3 -left-3 w-5 h-5 border-b border-l border-foreground/50 transition-all duration-300 group-hover:scale-110" />
              <div className="absolute -bottom-3 -right-3 w-5 h-5 border-b border-r border-foreground/50 transition-all duration-300 group-hover:scale-110" />

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

              {/* Interactive Dynamic HUD Reticle Tracking Cursor */}
              <div
                className="absolute pointer-events-none transition-all duration-75 -translate-x-1/2 -translate-y-1/2 z-20"
                style={{
                  left: `${reticleCoords.x}%`,
                  top: `${reticleCoords.y}%`,
                }}
              >
                <div className="w-12 h-12 border border-foreground/50 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                </div>
                {/* Crosshair Spikes */}
                <div className="absolute top-1/2 -left-3.5 w-2.5 h-px bg-foreground/60" />
                <div className="absolute top-1/2 -right-3.5 w-2.5 h-px bg-foreground/60" />
                <div className="absolute left-1/2 -top-3.5 h-2.5 w-px bg-foreground/60" />
                <div className="absolute left-1/2 -bottom-3.5 h-2.5 w-px bg-foreground/60" />

                {/* Reticle Tag */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap font-ndot text-[6.5px] tracking-[0.2em] px-1.5 py-0.5 rounded-xs bg-background/90 border border-border text-foreground">
                  TARGET_LOCK // DEV_ID: MURALI_PAILA
                </div>
              </div>

              {/* Floating Holographic Micro-Metrics Drawer */}
              <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xs bg-background/92 backdrop-blur-md border border-border/80 font-ndot text-[7px] sm:text-[7.5px] tracking-[0.22em] text-foreground flex justify-between items-center z-10 shadow-lg">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground phosphor-led" />
                  <span>SYSTEM_PULSE: 72 BPM</span>
                </div>
                <span>NEURAL_SYNC: 99.4%</span>
                <span className="font-mono text-[7px] text-muted-foreground">STATUS: DEPLOYED</span>
              </div>
            </motion.div>
          </motion.div>

        </div>

        {/* Global Tech Marquee Ribbon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.15, duration: 0.6 }}
          className="mt-16 sm:mt-20 overflow-hidden border-t border-b border-border/70 py-3 sm:py-3.5 pointer-events-auto bg-background/50 backdrop-blur-sm"
        >
          <div className="marquee-track">
            {[...techStack, ...techStack].map((tech, i) => (
              <span
                key={i}
                className="mx-6 sm:mx-8 font-ndot text-[9px] sm:text-[10px] tracking-[0.3em] text-muted-foreground whitespace-nowrap hover:text-foreground transition-colors"
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
