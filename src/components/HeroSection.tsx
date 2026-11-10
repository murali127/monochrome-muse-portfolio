import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import profilePhoto from '@/assets/murali-photo.png';

interface MagneticButtonProps {
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
}: MagneticButtonProps) => {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    // Fluid magnetic pull factor
    const pullX = (e.clientX - centerX) * 0.28;
    const pullY = (e.clientY - centerY) * 0.28;
    setOffset({ x: pullX, y: pullY });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      ref={ref as any}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
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

const HeroSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Real-time live clock: UTC & IST (Visakhapatnam)
  const [clock, setClock] = useState({ utc: '--:--:--', ist: '--:--:--' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // UTC time
      const utcHours = String(now.getUTCHours()).padStart(2, '0');
      const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
      const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');

      // IST time (UTC + 5:30)
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

  // Targeting HUD Box reticle coordinates on mouse hover
  const hudBoxRef = useRef<HTMLDivElement>(null);
  const [hudCoords, setHudCoords] = useState({
    azimuth: 184.2,
    elevation: 42.6,
    isLocked: false,
    reticleX: 50,
    reticleY: 50,
  });

  const handleHudMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hudBoxRef.current) return;
    const rect = hudBoxRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 100;
    const relY = ((e.clientY - rect.top) / rect.height) * 100;
    const az = (180 + ((relX - 50) / 50) * 18.5).toFixed(1);
    const el = (42 + ((50 - relY) / 50) * 12.0).toFixed(1);

    setHudCoords({
      azimuth: parseFloat(az),
      elevation: parseFloat(el),
      isLocked: true,
      reticleX: Math.max(10, Math.min(90, relX)),
      reticleY: Math.max(10, Math.min(90, relY)),
    });
  };

  const handleHudMouseLeave = () => {
    setHudCoords({
      azimuth: 184.2,
      elevation: 42.6,
      isLocked: false,
      reticleX: 50,
      reticleY: 50,
    });
  };

  const techStack = [
    'PYTHON',
    'REACT',
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
    'GEN AI & RAG',
    'VOICE AI PIPELINES',
    'FULL-STACK SYSTEMS',
    'BACKEND APIS',
  ];

  return (
    <section ref={ref} className="relative min-h-[92dvh] flex items-center justify-center overflow-hidden">
      {/* Laser scan line sweep */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 right-0 h-[1px] bg-foreground/10 animate-scan" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 w-full pt-28 sm:pt-32 pb-16">
        {/* Asymmetrical High-Contrast Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Hero Narrative & Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            {/* Telemetry Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 glass-panel px-3.5 py-1.5 rounded-full border border-foreground/15 shadow-[0_0_20px_rgba(255,255,255,0.04)]"
            >
              <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
              <span className="font-ndot text-[8px] sm:text-[9.5px] tracking-[0.25em] text-foreground">
                SYS.01 // ORBITAL_NOMINAL // GENAI DEVELOPER
              </span>
            </motion.div>

            {/* Display Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="font-ndot text-4xl sm:text-7xl lg:text-8xl leading-[0.95] sm:leading-[0.88] tracking-tight text-foreground text-glow break-words text-balance"
            >
              MURALI
              <br />
              <span className="text-muted-foreground/85">PAILA</span>
            </motion.h1>

            {/* Body Copy - High-Legibility Modern Sans (Space Grotesk) */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="font-body text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed text-pretty font-normal"
            >
              I engineer intelligent AI-powered products and scalable full-stack applications.
              Specialized in production conversational AI, RAG knowledge graph architectures,
              real-time Voice AI pipelines, and high-performance backend systems.
            </motion.p>

            {/* Core Focus Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.75, duration: 0.5 }}
              className="flex flex-wrap gap-2 pt-1"
            >
              {focusAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-xs border border-border/80 bg-foreground/[0.03] px-2.5 sm:px-3 py-1 font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] text-foreground/80 hover:border-foreground/50 transition-colors"
                >
                  {area}
                </span>
              ))}
            </motion.div>

            {/* Fluid Magnetic CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9, duration: 0.6 }}
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
              transition={{ delay: 1.1, duration: 0.6 }}
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
                <span className="text-foreground/90">ORBIT_STATUS: STABLE</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive Targeting HUD Box (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative flex justify-center mt-4 lg:mt-0"
          >
            <div
              ref={hudBoxRef}
              onMouseMove={handleHudMouseMove}
              onMouseLeave={handleHudMouseLeave}
              className="relative p-3.5 sm:p-4 glass-panel border border-border/80 rounded-sm shadow-2xl group cursor-crosshair max-w-[340px] sm:max-w-[380px] w-full"
            >
              {/* Tactical Reticle Corner Brackets */}
              <div className="absolute -top-2.5 -left-2.5 w-5 h-5 border-t-2 border-l-2 border-foreground/60 transition-all duration-300 group-hover:scale-110" />
              <div className="absolute -top-2.5 -right-2.5 w-5 h-5 border-t-2 border-r-2 border-foreground/60 transition-all duration-300 group-hover:scale-110" />
              <div className="absolute -bottom-2.5 -left-2.5 w-5 h-5 border-b-2 border-l-2 border-foreground/60 transition-all duration-300 group-hover:scale-110" />
              <div className="absolute -bottom-2.5 -right-2.5 w-5 h-5 border-b-2 border-r-2 border-foreground/60 transition-all duration-300 group-hover:scale-110" />

              {/* HUD Header Telemetry Strip */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60 font-ndot text-[8px] tracking-[0.25em] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${hudCoords.isLocked ? 'bg-foreground' : 'bg-muted-foreground'} animate-pulse`} />
                  <span className="text-foreground">TARGET_LOCK: {hudCoords.isLocked ? 'ACTIVE' : 'STANDBY'}</span>
                </div>
                <span>FOCAL_ZONE // 01</span>
              </div>

              {/* Profile Image Viewport */}
              <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xs border border-border bg-muted/40 dark:bg-black transition-colors duration-300">
                {/* Tech grid texture for transparent portrait in light & dark mode */}
                <div className="absolute inset-0 dot-grid-bg opacity-40 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-foreground/5 pointer-events-none" />

                <img
                  src={profilePhoto}
                  alt="Murali Paila"
                  className="relative z-[1] w-full h-full object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-[1.03]"
                  loading="eager"
                />

                {/* CRT Scanline Overlay */}
                <div className="absolute inset-0 scanline pointer-events-none z-[2]" />

                {/* Tactical Reticle Crosshairs Follower */}
                <div
                  className="absolute pointer-events-none transition-all duration-100 -translate-x-1/2 -translate-y-1/2 z-[3]"
                  style={{
                    left: `${hudCoords.reticleX}%`,
                    top: `${hudCoords.reticleY}%`,
                  }}
                >
                  <div className="w-10 h-10 border border-foreground/40 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-foreground/60" />
                  </div>
                  <div className="absolute top-1/2 -left-3 w-2 h-px bg-foreground/50" />
                  <div className="absolute top-1/2 -right-3 w-2 h-px bg-foreground/50" />
                  <div className="absolute left-1/2 -top-3 h-2 w-px bg-foreground/50" />
                  <div className="absolute left-1/2 -bottom-3 h-2 w-px bg-foreground/50" />
                </div>

                {/* Floating On-Screen Telemetry Overlay */}
                <div className="absolute bottom-2 left-2 right-2 p-2 glass-panel rounded-xs text-[7px] sm:text-[8px] font-ndot tracking-[0.2em] text-foreground/90 flex justify-between items-center border border-border/80 pointer-events-none backdrop-blur-sm z-[3]">
                  <span>AZ: {hudCoords.azimuth}°</span>
                  <span>EL: {hudCoords.elevation}°</span>
                  <span>RANGE: 384,400 KM</span>
                </div>
              </div>

              {/* Hardware Telemetry Label */}
              <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between font-ndot text-[7.5px] sm:text-[8px] tracking-[0.28em] text-muted-foreground">
                <span>SUBJECT: MURALI_PAILA</span>
                <span className="text-foreground/80">CLASS: PRODUCTION_ENGINEER</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tech Marquee Ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.25, duration: 0.6 }}
          className="mt-16 sm:mt-20 overflow-hidden border-t border-b border-border py-3.5 sm:py-4"
        >
          <div className="marquee-track">
            {[...techStack, ...techStack].map((tech, i) => (
              <span
                key={i}
                className="mx-6 sm:mx-8 font-ndot text-[9px] sm:text-[10px] tracking-[0.3em] text-muted-foreground whitespace-nowrap"
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
