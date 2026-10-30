import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const bootLines: string[] = [
  '> INITIALIZING NEURAL CORE KERNEL...',
  '> LOADING GENAI & RAG SUBSYSTEMS...',
  '> MOUNTING KNOWLEDGE GRAPH RUNTIMES...',
  '> CONNECTING REAL-TIME VOICE PIPELINES...',
  '> VERIFYING BACKEND MICROSERVICES...',
  '> INITIALIZING 3D TELEMETRY SCENE...',
  '> MURALI_PAILA.SYS ONLINE ✓',
  '> WORKSPACE READY // INITIALIZE_',
];

const BootLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);
  const completedRef = useRef(false);

  const finishBoot = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setDone(true);
    setTimeout(() => {
      onComplete();
    }, 250);
  };

  useEffect(() => {
    // Respect user's reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishBoot();
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        finishBoot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev < bootLines.length) {
          return prev + 1;
        }
        clearInterval(interval);
        setTimeout(() => {
          finishBoot();
        }, 300);
        return prev;
      });
    }, 200);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const progress = Math.min(100, Math.round((visibleCount / bootLines.length) * 100));
  const displayedLines = bootLines.slice(0, visibleCount);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background px-4"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={finishBoot}
        >
          <div className="w-full max-w-lg p-6 sm:p-8 hud-frame glass-panel border border-border relative">
            <span className="hud-corner hud-tl" />
            <span className="hud-corner hud-tr" />
            <span className="hud-corner hud-bl" />
            <span className="hud-corner hud-br" />

            <div className="flex items-center justify-between mb-6 border-b border-border/60 pb-3">
              <div className="font-ndot text-base sm:text-lg tracking-widest text-foreground text-glow">
                MURALI PAILA // SYSTEM_BOOT
              </div>
              <button
                onClick={finishBoot}
                className="font-ndot text-[8px] tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                data-cursor-hover
              >
                SKIP [ESC]
              </button>
            </div>

            <div className="mb-6 space-y-1.5 font-mono text-xs sm:text-sm text-muted-foreground min-h-[180px]">
              {displayedLines.map((line, i) => {
                const isSuccess = Boolean(line && line.includes('✓'));
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.12 }}
                    className={isSuccess ? 'text-foreground font-semibold' : ''}
                  >
                    {line}
                  </motion.div>
                );
              })}
            </div>

            <div className="relative h-[2px] w-full overflow-hidden bg-muted">
              <motion.div
                className="absolute left-0 top-0 h-full bg-foreground"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
              <span>INITIALIZING MODULES</span>
              <span>{progress}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootLoader;
