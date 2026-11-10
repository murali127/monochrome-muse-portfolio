import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import profilePhoto from '@/assets/murali-photo.png';
import { playTactileClick } from '@/utils/audioFeedback';

// ----------------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------------
interface MagneticCTAProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  'data-cursor-hover'?: boolean;
}

const MagneticCTA = ({
  children,
  className = '',
  href,
  target,
  rel,
  onClick,
}: MagneticCTAProps) => {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const pullX = (e.clientX - centerX) * 0.25;
    const pullY = (e.clientY - centerY) * 0.25;
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
      className={className}
      data-cursor-hover
    >
      {children}
    </Component>
  );
};

// ----------------------------------------------------------------------------
// Interactive Cybernetic Scramble Word Component
// ----------------------------------------------------------------------------
const SCRAMBLE_GLYPHS = '01XF94#*+-_/<>';

interface ScrambleWordProps {
  text: string;
  className?: string;
}

const ScrambleWord = ({ text, className = '' }: ScrambleWordProps) => {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const scramble = () => {
    if (isGlitching) return;
    playTactileClick('subtle');
    setIsGlitching(true);
    let iteration = 0;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return text[index];
            return SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsGlitching(false);
        setDisplayText(text);
      }
      iteration += 1;
    }, 32);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <span
      onMouseEnter={scramble}
      className={`inline-block relative cursor-pointer select-none transition-all duration-200 ${className} ${
        isGlitching ? 'animate-glitch text-white' : ''
      }`}
      data-cursor-hover
    >
      {/* Glitch chromatic split shadows when active */}
      {isGlitching && (
        <>
          <span className="absolute inset-0 text-foreground/40 translate-x-[2px] -translate-y-[1px] pointer-events-none select-none blur-[0.5px]">
            {displayText}
          </span>
          <span className="absolute inset-0 text-foreground/40 -translate-x-[2px] translate-y-[1px] pointer-events-none select-none blur-[0.5px]">
            {displayText}
          </span>
        </>
      )}
      <span className="relative z-10">{displayText}</span>
    </span>
  );
};

// ----------------------------------------------------------------------------
// Main Hero Section
// ----------------------------------------------------------------------------
const HeroSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Active Focus Pill State
  const [activeFocusPill, setActiveFocusPill] = useState<number | null>(null);

  // Real-time live clock: UTC & IST (Visakhapatnam)
  const [clock, setClock] = useState({ utc: '--:--:--', ist: '--:--:--' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcHours = String(now.getUTCHours()).padStart(2, '0');
      const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
      const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');

      const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
      const istHours = String(istDate.getUTCHours()).padStart(2, '0');
      const istMinutes = String(istDate.getUTCMinutes()).padStart(2, '0');
      const istSeconds = String(istDate.getUTCSeconds()).padStart(2, '0');

      setClock({
        utc: `${utcHours}:${utcMinutes}:${utcSeconds}`,
        ist: `${istHours}:${istMinutes}:${istSeconds}`,
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Hologram 3D Parallax & Hover Reticle Tracking
  const hudBoxRef = useRef<HTMLDivElement>(null);
  const [hudCoords, setHudCoords] = useState({
    azimuth: 184.2,
    elevation: 42.6,
    isLocked: false,
    reticleX: 50,
    reticleY: 50,
  });

  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleHudMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hudBoxRef.current) return;
    const rect = hudBoxRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const relX = (x / rect.width) * 100;
    const relY = (y / rect.height) * 100;

    const az = (180 + ((relX - 50) / 50) * 18.5).toFixed(1);
    const el = (42 + ((50 - relY) / 50) * 12.0).toFixed(1);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((centerY - y) / centerY) * 7;
    const rotY = ((x - centerX) / centerX) * 7;

    setTilt({ rotateX: rotX, rotateY: rotY });
    setHudCoords({
      azimuth: parseFloat(az),
      elevation: parseFloat(el),
      isLocked: true,
      reticleX: Math.max(8, Math.min(92, relX)),
      reticleY: Math.max(8, Math.min(92, relY)),
    });
  };

  const handleHudMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setHudCoords((prev) => ({
      ...prev,
      isLocked: false,
    }));
  };

  const techStack = [
    'PYTHON',
    'REACT 19',
    'FASTAPI',
    'LIGHTRAG',
    'PIPECAT',
    'AGORA AI',
    'SARVAM STT',
    'NEXT.JS',
    'TYPESCRIPT',
    'MONGODB',
    'POSTGRESQL',
    'OPENCV',
    'DOCKER',
  ];

  const focusAreas = [
    {
      name: 'GEN AI & RAG',
      telemetry: 'LIGHTRAG // HYBRID GRAPH',
    },
    {
      name: 'VOICE AI PIPELINES',
      telemetry: 'PIPECAT + AGORA RTC // <450ms',
    },
    {
      name: 'FULL-STACK SYSTEMS',
      telemetry: 'REACT 19 + TAILWIND // 60 FPS',
    },
    {
      name: 'BACKEND APIS',
      telemetry: 'FASTAPI ASYNC // P99: 14.8ms',
    },
  ];

  return (
    <section ref={ref} className="relative min-h-[92dvh] flex items-center justify-center overflow-hidden">
      {/* Subtle Laser scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 right-0 h-[1px] bg-foreground/10 animate-scan" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 w-full pt-24 sm:pt-28 pb-12 sm:pb-16">
        {/* Asymmetrical High-Craft Layout: Left Narrative (6 cols) & Right Holographic Pod (6 cols) */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Architectural Editorial Narrative (6 cols) */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6">
            
            {/* Status Telemetry Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="inline-flex items-center gap-3 glass-panel px-3.5 py-1.5 rounded-full border border-foreground/15 shadow-[0_0_20px_rgba(255,255,255,0.04)]"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
                </span>
                <span className="font-ndot text-[8px] sm:text-[9.5px] tracking-[0.25em] text-foreground">
                  SYS.01 // ORBITAL_NOMINAL // GENAI ARCHITECT
                </span>
              </div>
            </motion.div>

            {/* Display Headline: Signature Nothing OS Dot-Matrix Typography with Interactive Cybernetic Glitch */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="group/headline relative inline-block select-none"
            >
              <h1 className="font-ndot text-5xl sm:text-7xl lg:text-8xl leading-[0.95] sm:leading-[0.88] tracking-tight text-foreground text-glow break-words text-balance">
                <ScrambleWord
                  text="MURALI"
                  className="hover:text-white hover:drop-shadow-[0_0_30px_rgba(255,255,255,0.7)]"
                />
                <br />
                <ScrambleWord
                  text="PAILA"
                  className="text-muted-foreground/85 hover:text-foreground hover:drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                />
              </h1>

              {/* Tactical micro-tag on hover */}
              <div className="flex items-center gap-2 mt-2 opacity-0 group-hover/headline:opacity-100 transition-opacity duration-300">
                <span className="h-1 w-1 rounded-full bg-foreground animate-ping" />
                <span className="font-ndot text-[7.5px] sm:text-[8.5px] tracking-[0.25em] text-muted-foreground uppercase">
                  [IDENTIFIER // CRYPTO_VERIFIED: MP-2026 // HOVER_TO_DECODE]
                </span>
              </div>
            </motion.div>

            {/* Body Copy - High-Legibility Modern Sans */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="font-body text-sm sm:text-base text-muted-foreground max-w-lg leading-relaxed font-normal text-pretty"
            >
              I engineer intelligent AI-powered products and scalable full-stack applications.
              Specialized in production conversational AI, LightRAG knowledge graph architectures,
              real-time Voice AI pipelines, and high-performance backend systems.
            </motion.p>

            {/* Interactive Capability Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-wrap gap-2 pt-1 max-w-lg"
            >
              {focusAreas.map((area, idx) => {
                const isActive = activeFocusPill === idx;
                return (
                  <button
                    key={area.name}
                    type="button"
                    onMouseEnter={() => playTactileClick('subtle')}
                    onClick={() => {
                      setActiveFocusPill(isActive ? null : idx);
                      playTactileClick('toggle');
                    }}
                    className={`relative rounded-xs border px-3 sm:px-3.5 py-1.5 font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] transition-all duration-200 text-left cursor-pointer ${
                      isActive
                        ? 'border-foreground bg-foreground text-background font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                        : 'border-border/80 bg-background/50 text-foreground/85 hover:border-foreground/50 hover:bg-foreground/5'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1 w-1 rounded-full ${isActive ? 'bg-background' : 'bg-foreground/60'}`} />
                      <span>{isActive ? area.telemetry : area.name}</span>
                    </div>
                  </button>
                );
              })}
            </motion.div>

            {/* Fluid Magnetic CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.85, duration: 0.6 }}
              className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-2"
            >
              <MagneticCTA
                href="#projects"
                className="nav-cta rounded-full px-6 py-3.5 font-ndot text-[10px] sm:text-[11px] tracking-[0.25em] inline-flex items-center justify-center gap-2 group shadow-lg"
              >
                <span>VIEW WORK</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1 font-mono">→</span>
              </MagneticCTA>

              <MagneticCTA
                href="#contact"
                className="glass-panel-hover border-glow px-6 py-3.5 font-ndot text-[10px] sm:text-[11px] tracking-[0.25em] text-foreground inline-flex items-center justify-center gap-2 rounded-full border border-border"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
                <span>CONTACT</span>
              </MagneticCTA>

              <MagneticCTA
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel px-4 py-3.5 font-ndot text-[9px] sm:text-[10px] tracking-[0.2em] text-muted-foreground hover:text-foreground rounded-full transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <span>SYSTEM SPEC [CV]</span>
                <span className="font-mono text-xs">↗</span>
              </MagneticCTA>
            </motion.div>

            {/* Real-Time Telemetry Bar (Active Live Clock & Coordinates) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-y-2 gap-x-6 text-[8px] sm:text-[9px] font-ndot tracking-[0.2em] text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                <span className="text-foreground">UTC // IST CLOCK:</span>
                <span className="font-mono text-[9px] sm:text-[10px] text-foreground font-semibold tabular-nums">
                  {clock.utc} UTC / {clock.ist} IST
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span>VISAKHAPATNAM [17.68° N, 83.21° E]</span>
                <span className="text-foreground/40">•</span>
                <span className="text-foreground/90">ORBIT: NOMINAL</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Seamless Holographic Avatar (6 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative flex justify-center lg:justify-end mt-4 lg:mt-0"
            style={{ perspective: 1000 }}
          >
            <motion.div
              ref={hudBoxRef}
              onMouseMove={handleHudMouseMove}
              onMouseLeave={handleHudMouseLeave}
              animate={{
                rotateX: tilt.rotateX,
                rotateY: tilt.rotateY,
              }}
              transition={{ type: 'spring', stiffness: 280, damping: 25, mass: 0.5 }}
              className="relative max-w-[320px] sm:max-w-[360px] w-full select-none cursor-crosshair group"
            >
              {/* Soft Ambient Radial Aura */}
              <div className="absolute inset-0 -inset-y-4 bg-gradient-to-t from-foreground/[0.04] via-transparent to-transparent blur-3xl pointer-events-none rounded-full" />

              {/* Minimalist Hairline HUD Corner Crosshairs */}
              <div className="absolute -top-3 -left-3 font-mono text-[10px] text-foreground/40 pointer-events-none">┌</div>
              <div className="absolute -top-3 -right-3 font-mono text-[10px] text-foreground/40 pointer-events-none">┐</div>
              <div className="absolute -bottom-3 -left-3 font-mono text-[10px] text-foreground/40 pointer-events-none">└</div>
              <div className="absolute -bottom-3 -right-3 font-mono text-[10px] text-foreground/40 pointer-events-none">┘</div>

              {/* HUD Header Strip */}
              <div className="flex items-center justify-between pb-2 mb-2 font-ndot text-[7.5px] sm:text-[8px] tracking-[0.25em] text-muted-foreground border-b border-border/40">
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${hudCoords.isLocked ? 'bg-foreground' : 'bg-muted-foreground/60'} animate-pulse`} />
                  <span className="text-foreground">TARGET_LOCK: {hudCoords.isLocked ? 'ACTIVE' : 'STANDBY'}</span>
                </div>
                <span>FOCAL_PLANE // 01</span>
              </div>

              {/* Complete Developer Portrait (Uncropped, aspect-[788/1080], Organic Soft Fade at Base) */}
              <div className="relative w-full aspect-[788/1080] overflow-hidden rounded-md border border-border/40 bg-gradient-to-b from-transparent via-background/20 to-background/80 transition-colors">
                
                {/* Subtle dot texture */}
                <div className="absolute inset-0 dot-grid-bg opacity-20 pointer-events-none" />

                {/* Complete Developer Portrait Image */}
                <img
                  src={profilePhoto}
                  alt="Murali Paila - GenAI Engineer"
                  className="relative z-[1] w-full h-full object-contain grayscale contrast-125 transition-transform duration-500 group-hover:scale-[1.015]"
                  style={{
                    maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                  }}
                  loading="eager"
                />

                {/* Subtle Scanline CRT Overlay */}
                <div className="absolute inset-0 scanline pointer-events-none z-[2] opacity-60" />

                {/* Tactical Reticle Crosshairs: Only Visible On Hover */}
                {hudCoords.isLocked && (
                  <div
                    className="absolute pointer-events-none transition-all duration-75 -translate-x-1/2 -translate-y-1/2 z-[3]"
                    style={{
                      left: `${hudCoords.reticleX}%`,
                      top: `${hudCoords.reticleY}%`,
                    }}
                  >
                    <div className="w-9 h-9 border border-foreground/80 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                    </div>
                    <div className="absolute top-1/2 -left-2.5 w-2 h-px bg-foreground/80" />
                    <div className="absolute top-1/2 -right-2.5 w-2 h-px bg-foreground/80" />
                    <div className="absolute left-1/2 -top-2.5 h-2 w-px bg-foreground/80" />
                    <div className="absolute left-1/2 -bottom-2.5 h-2 w-px bg-foreground/80" />

                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap font-ndot text-[7px] tracking-[0.2em] px-2 py-0.5 rounded-xs bg-background/95 border border-border text-foreground shadow-lg backdrop-blur-md">
                      TARGET_LOCK // MURALI_PAILA
                    </div>
                  </div>
                )}

                {/* Live Neural / Comms Waveform Overlay */}
                <div className="absolute bottom-2 left-2 right-2 p-2 glass-panel rounded-xs text-[7px] sm:text-[8px] font-ndot tracking-[0.2em] text-foreground/90 flex justify-between items-center border border-border/60 pointer-events-none backdrop-blur-md z-[3]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">NEURAL:</span>
                    <div className="flex items-center gap-0.5 h-2">
                      {[40, 85, 60, 100, 50, 35, 75].map((h, i) => (
                        <span
                          key={i}
                          className="w-[2px] bg-foreground/80 rounded-full animate-pulse"
                          style={{
                            height: `${h}%`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '0.8s',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <span>AZ: {hudCoords.azimuth}°</span>
                  <span>EL: {hudCoords.elevation}°</span>
                </div>
              </div>

              {/* Hardware Telemetry Label */}
              <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between font-ndot text-[7.5px] sm:text-[8px] tracking-[0.25em] text-muted-foreground">
                <span>SUBJECT: MURALI_PAILA</span>
                <span className="text-foreground/80">CLASS: PRODUCTION_ENGINEER</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Tech Marquee Ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.25, duration: 0.6 }}
          className="mt-12 sm:mt-16 overflow-hidden border-t border-b border-border py-3 sm:py-3.5"
        >
          <div className="marquee-track">
            {[...techStack, ...techStack].map((tech, i) => (
              <span
                key={i}
                className="mx-6 sm:mx-8 font-ndot text-[9px] sm:text-[10px] tracking-[0.28em] text-muted-foreground whitespace-nowrap hover:text-foreground transition-colors"
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
