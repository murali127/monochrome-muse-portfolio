import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface BootLoaderProps {
  onComplete: () => void;
}

// Minimal Single-Line Telemetry Stages
const getStatusText = (progress: number): string => {
  if (progress < 36) return 'SYS // CALIBRATING OPTICAL SENSORS';
  if (progress < 76) return 'SYS // MOUNTING NEURAL TOPOLOGY';
  if (progress < 100) return 'SYS // ALL SYSTEMS SYNCHRONIZED';
  return 'READY // MURALI PAILA';
};

const CIRCLE_RADIUS = 104;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const EQUALIZER_BARS = 30;

const BootLoader = ({ onComplete }: BootLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'calibrating' | 'burst' | 'aperture' | 'done'>('calibrating');
  const finishedRef = useRef(false);

  // Trigger Aperture Exit Sequence
  const triggerExit = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setProgress(100);

    // Phase 1: High-contrast phosphor burst flash (120ms)
    setPhase('burst');
    setTimeout(() => {
      // Phase 2: Split curtain aperture opens & reticle expands outward
      setPhase('aperture');

      // Phase 3: Aperture complete -> handoff to homepage
      setTimeout(() => {
        onComplete();
        setPhase('done');
      }, 650);
    }, 120);
  }, [onComplete]);

  // Lock body scroll during intro
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Keyboard controls & reduced motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        triggerExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete, triggerExit]);

  // Smooth graphical progress increment (0 -> 100 in ~1.7s)
  useEffect(() => {
    if (phase !== 'calibrating') return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        // Dynamic acceleration curve
        const step = prev < 35 ? 1.4 : prev < 75 ? 1.8 : prev < 98 ? 1.2 : 1.0;
        const next = Math.min(100, Math.round((prev + step) * 10) / 10);

        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            triggerExit();
          }, 140);
          return 100;
        }
        return next;
      });
    }, 22);

    return () => clearInterval(timer);
  }, [phase, triggerExit]);

  if (phase === 'done') return null;

  // Corner brackets snap inward: offset decreases from 36px to 0px during first 28%
  const snapRatio = Math.min(1, progress / 28);
  const bracketOffset = (1 - snapRatio) * 36;
  const isLocked = snapRatio >= 1;

  const currentStatus = getStatusText(progress);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress / 100);

  const isBurst = phase === 'burst';
  const isAperture = phase === 'aperture';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center select-none overflow-hidden pointer-events-auto">
      {/* =========================================================================
          THE SPLIT CURTAIN APERTURE (Top & Bottom halves slide open on reveal)
          ========================================================================= */}
      {/* Top Half Curtain */}
      <motion.div
        className="fixed inset-x-0 top-0 h-1/2 bg-background z-10 pointer-events-none"
        initial={{ y: '0%' }}
        animate={{
          y: isAperture ? '-100%' : '0%',
        }}
        transition={{
          duration: 0.65,
          ease: [0.16, 1, 0.3, 1], // Quintic deceleration curve
        }}
      >
        <div className="crt-overlay">
          <div className="crt-scanlines" />
          <div className="crt-grain" />
        </div>
      </motion.div>

      {/* Bottom Half Curtain */}
      <motion.div
        className="fixed inset-x-0 bottom-0 h-1/2 bg-background z-10 pointer-events-none"
        initial={{ y: '0%' }}
        animate={{
          y: isAperture ? '100%' : '0%',
        }}
        transition={{
          duration: 0.65,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <div className="crt-overlay">
          <div className="crt-scanlines" />
          <div className="crt-grain" />
        </div>
      </motion.div>

      {/* Horizon Phosphor Seam Laser Line (Flashes along the center aperture seam) */}
      <motion.div
        className="fixed inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-foreground z-30 pointer-events-none"
        initial={{ opacity: 0.4, scaleY: 1 }}
        animate={
          isBurst
            ? { opacity: 1, scaleY: 3 }
            : isAperture
            ? { opacity: [1, 0.8, 0], scaleY: [3, 1, 0] }
            : { opacity: 0.4, scaleY: 1 }
        }
        transition={{ duration: isAperture ? 0.45 : 0.12 }}
        style={{
          boxShadow: isBurst
            ? '0 0 30px hsl(var(--foreground)), 0 0 60px hsl(var(--foreground))'
            : '0 0 10px hsl(var(--foreground) / 0.3)',
        }}
      />

      {/* =========================================================================
          FULL-SCREEN LASER GRID & CROSSHAIR (Locks to [0, 0] center)
          ========================================================================= */}
      <motion.div
        className="fixed inset-0 z-20 pointer-events-none flex items-center justify-center"
        animate={{
          opacity: isAperture ? 0 : 1,
        }}
        transition={{ duration: 0.35 }}
      >
        {/* Horizontal Laser Crosshair */}
        <div className="absolute inset-x-0 h-[1px] bg-foreground/15" />
        {/* Vertical Laser Crosshair */}
        <div className="absolute inset-y-0 w-[1px] bg-foreground/15" />

        {/* Diagonal Corner Reticle Crosshairs */}
        <div className="absolute w-[440px] h-[440px] border border-foreground/10 rounded-full pointer-events-none hidden sm:block" />
        <div className="absolute w-[600px] h-[600px] border border-foreground/5 rounded-full pointer-events-none hidden md:block" />
      </motion.div>

      {/* =========================================================================
          VIEWPORT CORNER TELEMETRY HUD ACCENTS
          ========================================================================= */}
      <motion.div
        className="fixed inset-0 z-25 pointer-events-none p-4 sm:p-6 flex flex-col justify-between"
        animate={{
          opacity: isAperture ? 0 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-ndot text-[9px] sm:text-[11px] tracking-widest text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
            </span>
            <span>FREQ: 1420.405 MHz // STANDBY</span>
          </div>

          <button
            onClick={triggerExit}
            className="pointer-events-auto group flex items-center gap-2 font-ndot text-[9px] sm:text-[10px] tracking-[0.2em] px-2.5 py-1 sm:px-3 sm:py-1.5 border border-border hover:border-foreground bg-background/80 hover:bg-foreground hover:text-background transition-all duration-150 focus:outline-none"
            data-cursor-hover
            title="Skip Intro (Esc or Space)"
          >
            <span className="w-1.5 h-1.5 bg-foreground group-hover:bg-background transition-colors" />
            <span>SKIP [ESC]</span>
          </button>
        </div>

        {/* Bottom Telemetry Row */}
        <div className="flex items-center justify-between font-mono text-[8px] sm:text-[9px] text-muted-foreground/50 tracking-wider">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-ndot text-foreground/80">GEO_LOCK</span>
            <span>•</span>
            <span className="text-foreground/90 font-semibold">17.6868° N, 83.2185° E [VTZ]</span>
          </div>
          <div className="font-ndot tracking-widest text-muted-foreground/60">
            OPTICAL_CORE // 60FPS
          </div>
        </div>
      </motion.div>

      {/* =========================================================================
          CENTRAL MECHANICAL RETICLE & TELEMETRY HUB
          ========================================================================= */}
      <motion.div
        className="relative z-20 flex flex-col items-center justify-center pointer-events-none"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={
          isAperture
            ? {
                scale: 8,
                opacity: 0,
                filter: 'brightness(3)',
              }
            : isBurst
            ? {
                scale: 1.05,
                opacity: 1,
                filter: 'brightness(2.2)',
              }
            : {
                scale: 1,
                opacity: 1,
                filter: 'brightness(1)',
              }
        }
        transition={{
          duration: isAperture ? 0.65 : 0.12,
          ease: isAperture ? [0.16, 1, 0.3, 1] : 'easeOut',
        }}
      >
        {/* The Concentric Reticle Scope Box */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* Target Brackets: Snap inward from outer edges during 0 -> 28% */}
          {/* Top-Left Bracket */}
          <motion.div
            className={`absolute top-0 left-0 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-l-2 transition-colors duration-200 ${
              isLocked ? 'border-foreground shadow-[0_0_8px_hsl(var(--foreground)/0.4)]' : 'border-muted-foreground/60'
            }`}
            animate={{
              x: -bracketOffset,
              y: -bracketOffset,
            }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
          />

          {/* Top-Right Bracket */}
          <motion.div
            className={`absolute top-0 right-0 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-r-2 transition-colors duration-200 ${
              isLocked ? 'border-foreground shadow-[0_0_8px_hsl(var(--foreground)/0.4)]' : 'border-muted-foreground/60'
            }`}
            animate={{
              x: bracketOffset,
              y: -bracketOffset,
            }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
          />

          {/* Bottom-Left Bracket */}
          <motion.div
            className={`absolute bottom-0 left-0 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-l-2 transition-colors duration-200 ${
              isLocked ? 'border-foreground shadow-[0_0_8px_hsl(var(--foreground)/0.4)]' : 'border-muted-foreground/60'
            }`}
            animate={{
              x: -bracketOffset,
              y: bracketOffset,
            }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
          />

          {/* Bottom-Right Bracket */}
          <motion.div
            className={`absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-r-2 transition-colors duration-200 ${
              isLocked ? 'border-foreground shadow-[0_0_8px_hsl(var(--foreground)/0.4)]' : 'border-muted-foreground/60'
            }`}
            animate={{
              x: bracketOffset,
              y: bracketOffset,
            }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
          />

          {/* SVG Concentric Technical Rings */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 240 240">
            {/* Outer Segmented Technical Ring (Counter-Clockwise) */}
            <circle
              cx="120"
              cy="120"
              r="115"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="6 14"
              className="text-foreground/30 animate-spin-ccw origin-center"
            />

            {/* Inner Segmented Notched Ring (Clockwise) */}
            <circle
              cx="120"
              cy="120"
              r="86"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 8"
              className="text-foreground/40 animate-spin-cw origin-center"
            />

            {/* Cardinal Tick Marks (N, S, E, W) */}
            <line x1="120" y1="2" x2="120" y2="12" stroke="currentColor" strokeWidth="2" className="text-foreground/80" />
            <line x1="120" y1="228" x2="120" y2="238" stroke="currentColor" strokeWidth="2" className="text-foreground/80" />
            <line x1="2" y1="120" x2="12" y2="120" stroke="currentColor" strokeWidth="2" className="text-foreground/80" />
            <line x1="228" y1="120" x2="238" y2="120" stroke="currentColor" strokeWidth="2" className="text-foreground/80" />

            {/* Live Circular Progress Perimeter */}
            <circle
              cx="120"
              cy="120"
              r={CIRCLE_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 120 120)"
              className="text-foreground transition-all duration-75 origin-center"
              style={{
                filter: 'drop-shadow(0 0 6px hsl(var(--foreground)/0.6))',
              }}
            />
          </svg>

          {/* Center Digital Telemetry: Big Oversized Percentage & Focal Dot */}
          <div className="flex flex-col items-center justify-center text-center select-none z-10">
            <div className="font-ndot text-5xl sm:text-6xl font-bold tracking-tight text-foreground text-glow tabular-nums">
              {String(Math.floor(progress)).padStart(2, '0')}
            </div>
            <div className="font-ndot text-[10px] tracking-[0.25em] text-muted-foreground/80 mt-0.5">
              PERCENT // APERTURE
            </div>
          </div>
        </div>

        {/* =====================================================================
            GRAPHIC SIGNAL & FREQUENCY EQUALIZER WAVEFORM
            ===================================================================== */}
        <div className="mt-4 flex items-center justify-center gap-[3px] h-6 w-56 sm:w-64 px-2">
          {Array.from({ length: EQUALIZER_BARS }).map((_, i) => {
            const barProgressFactor = Math.min(1, (progress + 15) / 100);
            return (
              <div
                key={i}
                className="w-1 bg-foreground rounded-[1px] origin-bottom transition-all duration-150"
                style={{
                  height: `${Math.max(4, Math.sin((i / EQUALIZER_BARS) * Math.PI) * 20 * barProgressFactor)}px`,
                  animation: `eq-wave 0.85s ease-in-out infinite alternate`,
                  animationDelay: `${(i * 0.03).toFixed(2)}s`,
                  boxShadow: '0 0 4px hsl(var(--foreground)/0.3)',
                }}
              />
            );
          })}
        </div>

        {/* =====================================================================
            MINIMAL 1-LINE SYSTEM STATUS HUD
            ===================================================================== */}
        <div className="mt-3.5 flex items-center gap-2.5 font-ndot text-[11px] sm:text-xs tracking-[0.22em] text-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-ping" />
          <span className="text-glow font-semibold">{currentStatus}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default BootLoader;
