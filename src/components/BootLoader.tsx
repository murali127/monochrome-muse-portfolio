import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BootLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const bootLines = [
    '> BREWING COFFEE... ☕',
    '> CHARGING CREATIVE NEURONS...',
    '> DEBUGGING LAST NIGHT\'S BUGS... 🐛',
    '> DOWNLOADING UNLIMITED MOTIVATION...',
    '> INSTALLING CONFIDENCE.EXE...',
    '> SYNCING WITH FUTURE OPPORTUNITIES...',
    '> MURALI_PAILA.EXE LOADED ✓',
    '> READY TO BUILD SOMETHING EPIC_',
  ];

  useEffect(() => {
    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < bootLines.length) {
        setLines(prev => [...prev, bootLines[lineIndex]]);
        setProgress(((lineIndex + 1) / bootLines.length) * 100);
        lineIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setDone(true);
          setTimeout(onComplete, 600);
        }, 400);
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-full max-w-lg px-8">
            <div className="mb-8 font-ndot text-xl tracking-widest text-foreground text-glow">
              MURALI PAILA
            </div>
            <div className="mb-6 space-y-1 font-mono text-xs text-muted-foreground">
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {line}
                </motion.div>
              ))}
            </div>
            <div className="relative h-[2px] w-full overflow-hidden bg-muted">
              <motion.div
                className="absolute left-0 top-0 h-full bg-foreground"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <div className="mt-2 font-mono text-[10px] text-muted-foreground">
              {Math.round(progress)}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootLoader;
