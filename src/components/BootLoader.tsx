import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BootLoaderProps {
  onComplete: () => void;
}

interface BootStep {
  text: string;
  tag: string;
  stage: string;
}

const BOOT_STEPS: BootStep[] = [
  { text: '> INITIALIZING NEURAL CORE KERNEL...', tag: '[OK]', stage: 'KERNEL_CORE' },
  { text: '> MOUNTING KNOWLEDGE GRAPH RUNTIMES...', tag: '[OK]', stage: 'GRAPH_RUNTIME' },
  { text: '> CONNECTING REAL-TIME VOICE PIPELINES...', tag: '[OK]', stage: 'VOICE_PIPELINE' },
  { text: '> CALIBRATING TACTILE INTERFACES...', tag: '[OK]', stage: 'TACTILE_UI' },
  { text: '> MURALI_PAILA // ONLINE', tag: '[READY]', stage: 'SYSTEM_READY' },
];

const MEMORY_PAGES = [
  '0x7FFF5FBFFD04 -> MOUNTED',
  '0x00A4F820 [SYS_CLK: 120Hz SYNC]',
  '0x000F42A0 -> DMA_ADDR_MAP [STABLE]',
  '0x10B8C440 [VRAM_BUFFER: 16384KB]',
  '0x7FEA8910 [NEURAL_WEIGHTS: 4.8B FP16]',
  '0x00000000 -> NULL_PTR_GUARD [PASS]',
  '0x8FA20104 [LATENCY: 1.2ms OPTIMAL]',
  '0x20C0AA18 [INTERRUPT_VECTOR: MAPPED]',
];

const SCRAMBLE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_/[]{}*+=#@%';

function getScrambledString(target: string, progress: number): string {
  if (progress >= 1) return target;
  const revealedCount = Math.floor(progress * target.length);
  let result = '';
  for (let i = 0; i < target.length; i++) {
    const ch = target[i];
    if (i < revealedCount || ch === ' ' || ch === '>' || ch === '/' || ch === '.') {
      result += ch;
    } else {
      result += SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
    }
  }
  return result;
}

const SEGMENT_COUNT = 28;

const BootLoader = ({ onComplete }: BootLoaderProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [phase, setPhase] = useState<'booting' | 'collapsing' | 'done'>('booting');
  const [tickerIndex, setTickerIndex] = useState(0);
  const finishedRef = useRef(false);

  // Exit trigger with CRT shutter collapse & iris wipe
  const triggerExit = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPhase('collapsing');

    // Smooth handoff: give the CRT collapse & phosphor laser line 380ms to unveil the 3D globe
    setTimeout(() => {
      onComplete();
      setPhase('done');
    }, 380);
  }, [onComplete]);

  // Lock body scroll while boot loader is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Keyboard navigation & immediate skip
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      setPhase('done');
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

  // Telemetry memory address ticker cycle
  useEffect(() => {
    if (phase !== 'booting') return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % MEMORY_PAGES.length);
    }, 850);
    return () => clearInterval(interval);
  }, [phase]);

  // Main text scrambler & multi-stage boot sequence loop
  useEffect(() => {
    if (phase !== 'booting') return;

    const timer = setInterval(() => {
      setStepProgress((prev) => {
        const next = prev + 0.14; // ~7 ticks (~170ms) per step
        if (next >= 1) {
          setActiveStep((currStep) => {
            const nextStep = currStep + 1;
            if (nextStep >= BOOT_STEPS.length) {
              clearInterval(timer);
              // Brief hold on 100% READY before shutter collapse
              setTimeout(() => {
                triggerExit();
              }, 260);
              return currStep;
            }
            return nextStep;
          });
          return 0;
        }
        return next;
      });
    }, 24);

    return () => clearInterval(timer);
  }, [phase, triggerExit]);

  if (phase === 'done') {
    return null;
  }

  // Calculate overall progress (0% - 100%)
  const rawProgress = ((activeStep + Math.min(1, stepProgress)) / BOOT_STEPS.length) * 100;
  const totalProgress = Math.min(100, Math.round(rawProgress));
  const filledSegments = Math.min(
    SEGMENT_COUNT,
    Math.round((totalProgress / 100) * SEGMENT_COUNT)
  );
  const currentStageName =
    BOOT_STEPS[Math.min(BOOT_STEPS.length - 1, activeStep)].stage;

  return (
    <AnimatePresence>
      <motion.div
        key="bootloader-root"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-background px-4 select-none overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{
          opacity: phase === 'collapsing' ? [1, 1, 0] : 1,
        }}
        transition={{
          duration: 0.38,
          times: [0, 0.65, 1],
          ease: 'easeInOut',
        }}
      >
        {/* CRT Scanline, Sweep Beam & Phosphor Grain Atmosphere */}
        <div className="crt-overlay">
          <div className="crt-scanlines" />
          <div className="crt-beam-sweep" />
          <div className="crt-grain" />
        </div>

        {/* Viewport Edge Telemetry HUD Brackets */}
        <div className="fixed top-3 left-4 sm:top-5 sm:left-6 z-20 flex items-center gap-2.5 font-ndot text-[9px] sm:text-[11px] tracking-widest text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
          </span>
          <span>FREQ: 1420.405 MHz // UPLINK_STANDBY</span>
        </div>

        <div className="fixed top-3 right-4 sm:top-5 sm:right-6 z-20 flex items-center gap-3">
          <button
            onClick={triggerExit}
            className="group flex items-center gap-2 font-ndot text-[9px] sm:text-[10px] tracking-[0.2em] px-2.5 py-1 sm:px-3 sm:py-1.5 border border-border hover:border-foreground bg-background/80 hover:bg-foreground hover:text-background transition-all duration-150 focus:outline-none"
            data-cursor-hover
            title="Skip Boot Sequence (Esc or Space)"
          >
            <span className="w-1.5 h-1.5 bg-foreground group-hover:bg-background transition-colors" />
            <span>SKIP [ESC]</span>
          </button>
        </div>

        {/* Bottom Ambient Memory Address Ticker */}
        <div className="fixed bottom-3 left-4 right-4 sm:bottom-4 sm:left-6 sm:right-6 z-20 flex items-center justify-between font-mono text-[8px] sm:text-[9px] text-muted-foreground/50 tracking-wider">
          <div className="flex items-center gap-2 sm:gap-3 truncate">
            <span className="font-ndot text-foreground/80">SYS_MEM</span>
            <span>•</span>
            <span className="text-foreground/90 font-semibold">{MEMORY_PAGES[tickerIndex]}</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">DMA_LATENCY: 0.8ms</span>
          </div>
          <div className="font-ndot text-[8px] sm:text-[9px] tracking-widest text-muted-foreground/60 shrink-0">
            SECURE_BOOT // ARCH_2026
          </div>
        </div>

        {/* Central Terminal BIOS Card */}
        <motion.div
          className="w-full max-w-lg p-5 sm:p-7 hud-frame glass-panel border border-border relative z-20"
          initial={{ scale: 1, opacity: 1 }}
          animate={
            phase === 'collapsing'
              ? {
                  scaleY: [1, 1.01, 0.002],
                  scaleX: [1, 1.01, 0.35],
                  opacity: [1, 1, 0],
                  filter: ['brightness(1)', 'brightness(1.8)', 'brightness(2)'],
                }
              : { scale: 1, opacity: 1 }
          }
          transition={{
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* Tactical HUD Crosshair Corners */}
          <span className="hud-corner hud-tl" />
          <span className="hud-corner hud-tr" />
          <span className="hud-corner hud-bl" />
          <span className="hud-corner hud-br" />

          {/* BIOS Header */}
          <div className="flex items-center justify-between mb-5 border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-foreground inline-block" />
              <span className="font-ndot text-xs sm:text-sm tracking-[0.22em] text-foreground text-glow font-medium">
                MURALI PAILA // TERMINAL BIOS
              </span>
            </div>
            <div className="font-ndot text-[8px] sm:text-[9px] tracking-widest px-2 py-0.5 border border-foreground/30 text-foreground bg-foreground/5">
              REV_4.2
            </div>
          </div>

          {/* Glitch Decoder Terminal Lines */}
          <div className="space-y-2 font-mono text-xs sm:text-[13px] min-h-[165px] sm:min-h-[175px] py-1">
            {BOOT_STEPS.map((step, idx) => {
              if (idx > activeStep) {
                return (
                  <div key={idx} className="opacity-15 flex items-center gap-2 text-muted-foreground">
                    <span className="font-ndot select-none text-muted-foreground/40">&gt;</span>
                    <span className="tracking-widest">. . . . . . . . . . . . . . . .</span>
                  </div>
                );
              }

              const isCurrent = idx === activeStep;
              const isCompleted = idx < activeStep || (isCurrent && stepProgress >= 1);
              const displayText = isCompleted
                ? step.text
                : getScrambledString(step.text, stepProgress);

              const isReadyTag = step.tag === '[READY]';

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between gap-2 transition-colors duration-100 ${
                    isCurrent
                      ? 'text-foreground'
                      : isCompleted
                      ? 'text-foreground/80'
                      : 'text-muted-foreground/40'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-ndot text-foreground select-none">&gt;</span>
                    <span className="font-mono tracking-tight sm:tracking-normal truncate">
                      {displayText.replace(/^>\s*/, '')}
                    </span>
                    {isCurrent && !isCompleted && (
                      <span className="inline-block w-1.5 h-3.5 bg-foreground animate-pulse ml-0.5" />
                    )}
                  </div>

                  {isCompleted && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.12 }}
                      className={`font-ndot text-[9px] sm:text-[11px] shrink-0 tracking-wider ${
                        isReadyTag
                          ? 'px-2 py-0.5 border border-foreground bg-foreground text-background font-bold shadow-[0_0_12px_hsl(var(--foreground)/0.4)]'
                          : 'text-foreground font-semibold'
                      }`}
                    >
                      {step.tag}
                    </motion.span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Segmented Digital Progress Gauge */}
          <div className="mt-5 pt-4 border-t border-border/80">
            <div className="flex items-baseline justify-between mb-2 font-ndot">
              <div className="text-[10px] sm:text-xs tracking-widest text-muted-foreground">
                STAGE 0{Math.min(5, activeStep + 1)}/05 //{' '}
                <span className="text-foreground font-semibold">{currentStageName}</span>
              </div>
              <div className="text-xl sm:text-2xl tracking-[0.12em] text-foreground text-glow font-bold">
                {String(totalProgress).padStart(3, '0')}%
              </div>
            </div>

            {/* Segmented Blocks */}
            <div className="flex items-center gap-[2px] sm:gap-[3px] py-1">
              {Array.from({ length: SEGMENT_COUNT }).map((_, i) => {
                const isFilled = i < filledSegments;
                return (
                  <div
                    key={i}
                    className={`h-2.5 sm:h-3 flex-1 transition-colors duration-75 ${
                      isFilled
                        ? 'bg-foreground shadow-[0_0_6px_hsl(var(--foreground)/0.4)]'
                        : 'bg-muted/40'
                    }`}
                  />
                );
              })}
            </div>

            {/* Subsystem Telemetry Readout */}
            <div className="flex items-center justify-between font-mono text-[9px] sm:text-[10px] text-muted-foreground/60 mt-2">
              <div className="flex items-center gap-2">
                <span>BUFFER: [{Math.round(totalProgress * 10.24)} KB/S]</span>
                <span>•</span>
                <span>CHECKSUM: 0x{Math.floor(0x1000 + totalProgress * 145.2).toString(16).toUpperCase()}</span>
              </div>
              <div className="font-ndot tracking-wider text-foreground/80">
                {totalProgress === 100 ? 'LINK_READY ✓' : 'PROCESSING_STREAM'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* CRT Phosphor Shutter Laser Line (Horizon collapse flare) */}
        {phase === 'collapsing' && (
          <>
            <motion.div
              className="fixed inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-foreground pointer-events-none z-[10001]"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: [0, 1, 1, 0],
                scaleY: [1, 1.2, 2.5, 0],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 0.36,
                times: [0, 0.28, 0.72, 1],
                ease: 'easeInOut',
              }}
              style={{
                boxShadow:
                  '0 0 25px hsl(var(--foreground)), 0 0 50px hsl(var(--foreground)/0.8)',
              }}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-foreground pointer-events-none z-[10002]"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 2.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 0.25,
                delay: 0.12,
                ease: 'easeOut',
              }}
              style={{
                boxShadow:
                  '0 0 40px hsl(var(--foreground)), 0 0 80px hsl(var(--foreground))',
              }}
            />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default BootLoader;
