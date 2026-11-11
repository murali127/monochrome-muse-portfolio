import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playTactileClick } from '@/utils/audioFeedback';

interface ResumeButtonProps {
  label?: string;
  className?: string;
  resumeUrl?: string;
}

const GLYPHS = '01XF94#*+-_/<>';

export const ResumeButton = ({
  label = 'RESUME',
  className = '',
  resumeUrl = '/resume.pdf',
}: ResumeButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isEjecting, setIsEjecting] = useState(false);
  const [ejectStage, setEjectStage] = useState<'IDLE' | 'EJECTING' | 'OPENED'>('IDLE');
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Decoder text shuffle for hover transformation
  const [displayLabel, setDisplayLabel] = useState(label);
  const scrambleTimer = useRef<NodeJS.Timeout | null>(null);

  // Detect touch devices to avoid viewport obstruction on mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
      setIsTouchDevice(!hasFinePointer);
    }
  }, []);

  // Internal Decoder Flip: "RESUME" -> "MURALI_PAILA.PDF" on hover
  useEffect(() => {
    if (isTouchDevice || isEjecting) return;

    if (isHovered) {
      let iteration = 0;
      const targetText = 'MURALI_PAILA.PDF';

      if (scrambleTimer.current) clearInterval(scrambleTimer.current);

      scrambleTimer.current = setInterval(() => {
        setDisplayLabel(
          targetText
            .split('')
            .map((char, index) => {
              if (index < iteration) return targetText[index];
              return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            })
            .join('')
        );

        if (iteration >= targetText.length) {
          if (scrambleTimer.current) clearInterval(scrambleTimer.current);
          setDisplayLabel(targetText);
        }
        iteration += 2;
      }, 20);
    } else {
      if (scrambleTimer.current) clearInterval(scrambleTimer.current);
      setDisplayLabel(label);
    }

    return () => {
      if (scrambleTimer.current) clearInterval(scrambleTimer.current);
    };
  }, [isHovered, isTouchDevice, isEjecting, label]);

  // Magnetic Pull Physics
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current || isTouchDevice || isEjecting) return;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const pullX = (e.clientX - centerX) * 0.22;
    const pullY = (e.clientY - centerY) * 0.22;
    setOffset({ x: pullX, y: pullY });
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice && !isEjecting) {
      setIsHovered(true);
      playTactileClick('subtle');
    }
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Tactile Ejection Sequence on Click
  const handleClick = useCallback(() => {
    if (isEjecting) return;

    setIsEjecting(true);
    playTactileClick('shutter');

    if (isTouchDevice) {
      // Instant tap feedback on mobile
      setEjectStage('EJECTING');
      setTimeout(() => {
        setEjectStage('OPENED');
        playTactileClick('toggle');
        window.open(resumeUrl, '_blank');
        setTimeout(() => {
          setIsEjecting(false);
          setEjectStage('IDLE');
        }, 350);
      }, 150);
      return;
    }

    // 220ms Tactile Cartridge Ejection Sequence on Desktop
    setEjectStage('EJECTING');

    setTimeout(() => {
      setEjectStage('OPENED');
      playTactileClick('toggle');

      setTimeout(() => {
        window.open(resumeUrl, '_blank');
        setTimeout(() => {
          setIsEjecting(false);
          setEjectStage('IDLE');
          setIsHovered(false);
        }, 400);
      }, 100);
    }, 140);
  }, [isEjecting, isTouchDevice, resumeUrl]);

  return (
    <div
      className="relative inline-flex flex-col items-center"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ------------------------------------------------------------------ */}
      {/* The Sci-Fi Twist: Miniature Isometric Holographic Paper Projector   */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {isHovered && !isTouchDevice && !isEjecting && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.8 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            exit={
              isEjecting
                ? { y: 24, scaleY: 0.08, scaleX: 0.6, opacity: 0, transition: { duration: 0.16 } }
                : { opacity: 0, y: 8, scale: 0.85, transition: { duration: 0.15 } }
            }
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full mb-2 pointer-events-none select-none z-30 flex flex-col items-center"
            style={{ perspective: 600 }}
          >
            {/* Isometric 3D Angled Holographic Blueprint Sheet */}
            <motion.div
              animate={{
                y: [-2, -6, -2],
                rotateX: [16, 20, 16],
                rotateY: [-10, -6, -10],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-14 h-20 rounded-xs border border-foreground/60 bg-background/95 backdrop-blur-md p-1.5 shadow-[0_8px_30px_rgba(255,255,255,0.15)] flex flex-col justify-between overflow-hidden"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Corner Reticle Brackets */}
              <div className="absolute top-0.5 left-0.5 font-mono text-[7px] text-foreground/70 leading-none">┌</div>
              <div className="absolute top-0.5 right-0.5 font-mono text-[7px] text-foreground/70 leading-none">┐</div>
              <div className="absolute bottom-0.5 left-0.5 font-mono text-[7px] text-foreground/70 leading-none">└</div>
              <div className="absolute bottom-0.5 right-0.5 font-mono text-[7px] text-foreground/70 leading-none">┘</div>

              {/* CRT Scanline Sweep */}
              <div className="absolute inset-0 scanline opacity-40 pointer-events-none" />
              <div className="absolute inset-x-0 h-4 bg-gradient-to-b from-transparent via-foreground/15 to-transparent pointer-events-none animate-scan" />

              {/* Blueprint Document Header */}
              <div className="flex items-center justify-between pb-1 border-b border-foreground/25">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                  <div className="h-1 w-4 bg-foreground/60 rounded-full" />
                </div>
                <span className="font-mono text-[5.5px] text-foreground font-bold">V2.6</span>
              </div>

              {/* Sequentially Glowing Phosphor Skeleton Lines */}
              <div className="space-y-1 my-0.5">
                <div className="h-[1.5px] w-full bg-foreground/50 rounded-full animate-pulse" />
                <div className="h-[1.5px] w-4/5 bg-foreground/40 rounded-full" />
                <div className="h-[1.5px] w-full bg-foreground/45 rounded-full" />
                <div className="h-[1.5px] w-2/3 bg-foreground/35 rounded-full" />
                <div className="h-[1.5px] w-5/6 bg-foreground/45 rounded-full" />
              </div>

              {/* Document Base Telemetry Tag */}
              <div className="pt-0.5 border-t border-foreground/20 flex justify-between items-center font-mono text-[5px] text-muted-foreground">
                <span className="text-foreground/80">PDF</span>
                <span className="text-foreground font-semibold">1.2MB</span>
              </div>
            </motion.div>

            {/* Upward Holographic Light Projector Beam Cone */}
            <div
              className="w-8 h-4 opacity-70 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(255,255,255,0.25), transparent)',
                clipPath: 'polygon(25% 100%, 75% 100%, 100% 0%, 0% 0%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------ */}
      {/* Tactile Pill Button with Internal Scramble & Laser Scan Sweep     */}
      {/* ------------------------------------------------------------------ */}
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        animate={{
          x: offset.x,
          y: offset.y,
          scale: isEjecting ? 0.96 : 1,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25, bounce: 0 }}
        whileTap={{ scale: 0.94 }}
        className={`relative group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 font-ndot text-[9px] sm:text-[10px] tracking-[0.22em] transition-all duration-200 cursor-pointer overflow-hidden select-none min-w-[145px] sm:min-w-[160px] ${
          isEjecting
            ? 'bg-foreground text-background font-bold border-2 border-foreground ring-2 ring-foreground/40 shadow-[0_0_30px_rgba(255,255,255,0.4)]'
            : isHovered
            ? 'glass-panel border-foreground text-foreground shadow-[0_0_20px_rgba(255,255,255,0.15)] bg-foreground/[0.08]'
            : 'glass-panel border-border/80 text-muted-foreground hover:text-foreground hover:border-foreground/70'
        } ${className}`}
        data-cursor-hover
      >
        {/* White Border Strobe Shockwave upon Ejection */}
        {isEjecting && (
          <motion.span
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border-2 border-foreground pointer-events-none"
          />
        )}

        {/* Laser Scanning Beam sweeping inside button when hovered */}
        {isHovered && !isEjecting && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-x-0 h-[1.5px] bg-foreground shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-scan" />
          </div>
        )}

        {/* Ambient CRT Scanline Overlay */}
        <span className="absolute inset-0 scanline opacity-20 pointer-events-none" />

        {/* Button Content States */}
        {ejectStage === 'IDLE' && (
          <div className="relative z-10 flex items-center justify-center gap-2 w-full">
            {isHovered ? (
              <div className="flex items-center gap-1.5 text-foreground animate-fadeIn">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-ping shrink-0" />
                <span className="truncate max-w-[150px]">{displayLabel}</span>
                <span className="font-mono text-xs shrink-0">↗</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span>{label}</span>
                <span className="font-mono text-xs transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </div>
            )}
          </div>
        )}

        {ejectStage === 'EJECTING' && (
          <span className="relative z-10 flex items-center gap-1.5 text-background font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-background animate-ping" />
            <span>EJECTING...</span>
          </span>
        )}

        {ejectStage === 'OPENED' && (
          <span className="relative z-10 flex items-center gap-1.5 text-background font-bold">
            <span>OPENED</span>
            <span className="font-mono text-xs">✓</span>
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default ResumeButton;
