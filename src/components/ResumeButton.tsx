import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playTactileClick } from '@/utils/audioFeedback';

interface ResumeButtonProps {
  label?: string;
  className?: string;
  resumeUrl?: string;
  sublabel?: string;
}

const HEX_CHARS = '0123456789ABCDEF';

export const ResumeButton = ({
  label = 'SYSTEM SPEC [CV]',
  className = '',
  resumeUrl = '/resume.pdf',
}: ResumeButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isDecoupling, setIsDecoupling] = useState(false);
  const [decoupleStage, setDecoupleStage] = useState<'IDLE' | 'AUTH' | 'DECRYPT' | 'DISPATCH'>('IDLE');
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Live cryptographic rolling checksum
  const [liveHash, setLiveHash] = useState('0x7F94...9A4B');

  // Detect touch devices to avoid viewport obstruction on mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
      setIsTouchDevice(!hasFinePointer);
    }
  }, []);

  // Hex hash scrambler on hover
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isHovered && !isDecoupling) {
      let ticks = 0;
      interval = setInterval(() => {
        ticks++;
        if (ticks < 8) {
          const r1 = HEX_CHARS[Math.floor(Math.random() * 16)];
          const r2 = HEX_CHARS[Math.floor(Math.random() * 16)];
          const r3 = HEX_CHARS[Math.floor(Math.random() * 16)];
          const r4 = HEX_CHARS[Math.floor(Math.random() * 16)];
          setLiveHash(`0x${r1}${r2}94...${r3}${r4}4B`);
        } else {
          setLiveHash('0x7F94...9A4B');
          if (interval) clearInterval(interval);
        }
      }, 45);
    } else {
      setLiveHash('0x7F94...9A4B');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovered, isDecoupling]);

  // Magnetic Pull Physics
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current || isTouchDevice) return;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const pullX = (e.clientX - centerX) * 0.22;
    const pullY = (e.clientY - centerY) * 0.22;
    setOffset({ x: pullX, y: pullY });
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) {
      setIsHovered(true);
      playTactileClick('subtle');
    }
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Biometric Authorization & Data Beam Decoupling Click Sequence
  const handleClick = useCallback(() => {
    if (isDecoupling) return;

    setIsDecoupling(true);
    playTactileClick('shutter');

    if (isTouchDevice) {
      // Rapid tap feedback for touchscreens
      setDecoupleStage('AUTH');
      setTimeout(() => {
        setDecoupleStage('DISPATCH');
        playTactileClick('toggle');
        window.open(resumeUrl, '_blank');
        setTimeout(() => {
          setIsDecoupling(false);
          setDecoupleStage('IDLE');
        }, 400);
      }, 220);
      return;
    }

    // Full 450ms holographic transmission release for desktop
    setDecoupleStage('AUTH');

    setTimeout(() => {
      setDecoupleStage('DECRYPT');
      playTactileClick('subtle');

      setTimeout(() => {
        setDecoupleStage('DISPATCH');
        playTactileClick('toggle');

        setTimeout(() => {
          window.open(resumeUrl, '_blank');
          setTimeout(() => {
            setIsDecoupling(false);
            setDecoupleStage('IDLE');
            setIsHovered(false);
          }, 500);
        }, 140);
      }, 160);
    }, 150);
  }, [isDecoupling, isTouchDevice, resumeUrl]);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Micro-HUD Popover: Holographic Data Decryption Preview            */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {isHovered && !isTouchDevice && !isDecoupling && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full mb-3.5 left-1/2 -translate-x-1/2 pointer-events-none select-none z-50 w-[300px] sm:w-[340px]"
          >
            {/* HUD Enclosure Box */}
            <div className="relative p-3.5 rounded-sm border border-foreground/35 bg-background/96 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] overflow-hidden">
              {/* Tactical Hairline Corner Brackets */}
              <div className="absolute top-1 left-1 font-mono text-[9px] text-foreground/50 leading-none">┌</div>
              <div className="absolute top-1 right-1 font-mono text-[9px] text-foreground/50 leading-none">┐</div>
              <div className="absolute bottom-1 left-1 font-mono text-[9px] text-foreground/50 leading-none">└</div>
              <div className="absolute bottom-1 right-1 font-mono text-[9px] text-foreground/50 leading-none">┘</div>

              {/* Laser CRT Scanline Sweep */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-foreground/10 to-transparent animate-scan" />
                <div className="absolute inset-0 scanline opacity-40" />
              </div>

              {/* HUD Header Strip */}
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border/70 font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-ping" />
                  <span className="text-foreground font-semibold">DECRYPT: SPEC_V2.6</span>
                </div>
                <span className="font-mono text-[7px] text-foreground/60">INTEGRITY // 100%</span>
              </div>

              {/* Dual-Column Preview Architecture */}
              <div className="grid grid-cols-[56px_1fr] gap-3 items-center">
                {/* Left Column: Stylized Blueprint Wireframe Document (48px x 64px) */}
                <div className="w-[52px] h-[68px] rounded-xs border border-foreground/30 bg-foreground/[0.03] p-1.5 flex flex-col justify-between shadow-inner relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground/10 to-transparent pointer-events-none" />

                  {/* Document Header Skeleton */}
                  <div className="flex items-center gap-1 pb-1 border-b border-foreground/20">
                    <div className="w-2.5 h-2.5 rounded-full bg-foreground/40 shrink-0" />
                    <div className="h-1 w-5 bg-foreground/50 rounded-xs" />
                  </div>

                  {/* Wireframe Text Skeleton Lines */}
                  <div className="space-y-1 my-0.5">
                    <div className="h-0.5 w-full bg-foreground/35 rounded-xs animate-pulse" />
                    <div className="h-0.5 w-3/4 bg-foreground/30 rounded-xs" />
                    <div className="h-0.5 w-5/6 bg-foreground/30 rounded-xs" />
                    <div className="h-0.5 w-2/3 bg-foreground/25 rounded-xs" />
                    <div className="h-0.5 w-full bg-foreground/30 rounded-xs" />
                  </div>

                  {/* Document Watermark */}
                  <div className="pt-0.5 border-t border-foreground/15 flex justify-between items-center text-[5.5px] font-mono text-muted-foreground">
                    <span>PDF</span>
                    <span className="text-foreground/80">V2.6</span>
                  </div>
                </div>

                {/* Right Column: Live Cryptographic Checksum & Payload Telemetry */}
                <div className="space-y-1 font-ndot text-[7.5px] sm:text-[8px] tracking-[0.2em]">
                  <div className="text-foreground flex items-center justify-between">
                    <span className="text-muted-foreground">SPEC_TYPE:</span>
                    <span className="font-semibold text-foreground/90">PRODUCTION_ENGINEER</span>
                  </div>
                  <div className="text-foreground flex items-center justify-between">
                    <span className="text-muted-foreground">PAYLOAD:</span>
                    <span className="font-mono text-[7px] text-foreground/90">1.24 MB // PDF_STREAM</span>
                  </div>
                  <div className="text-foreground flex items-center justify-between pt-0.5 border-t border-border/40">
                    <span className="text-muted-foreground">CHECKSUM:</span>
                    <span className="font-mono text-[7.5px] text-foreground font-bold tracking-tight">
                      {liveHash}
                    </span>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[6.5px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-foreground/80" />
                      AES-256-GCM
                    </span>
                    <span className="text-foreground">CLICK TO DECOUPLE</span>
                  </div>
                </div>
              </div>

              {/* Downward Anchor Pip */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 border-r border-b border-foreground/35 bg-background" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------ */}
      {/* Trigger Button with Biometric Authorization Decoupling Sequence   */}
      {/* ------------------------------------------------------------------ */}
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        animate={{
          x: offset.x,
          y: offset.y,
          scale: isDecoupling ? 0.98 : 1,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25, bounce: 0 }}
        whileTap={{ scale: 0.95 }}
        className={`relative group inline-flex items-center justify-center gap-2 rounded-full px-5 sm:px-6 py-3.5 font-ndot text-[9px] sm:text-[10px] tracking-[0.22em] transition-all duration-200 cursor-pointer overflow-hidden select-none ${
          isDecoupling
            ? 'bg-foreground text-background font-bold border border-foreground shadow-[0_0_25px_rgba(255,255,255,0.4)]'
            : isHovered
            ? 'glass-panel border-foreground text-foreground shadow-[0_0_20px_rgba(255,255,255,0.12)]'
            : 'glass-panel border-border/80 text-muted-foreground hover:text-foreground hover:border-foreground/60'
        } ${className}`}
        data-cursor-hover
      >
        {/* Phosphorescent Strobe Staged Decoupling Ring */}
        {isDecoupling && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0.9 }}
            animate={{ scale: 2.3, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border-2 border-foreground pointer-events-none"
          />
        )}

        {/* Ambient Subtle Scanline on Button */}
        <span className="absolute inset-0 scanline opacity-25 pointer-events-none" />

        {/* Dynamic Multi-Stage Label Shift */}
        {decoupleStage === 'IDLE' && (
          <>
            <span className="relative z-10">{label}</span>
            <span className="relative z-10 font-mono text-xs transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </>
        )}

        {decoupleStage === 'AUTH' && (
          <span className="relative z-10 flex items-center gap-2 text-background font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-background animate-ping" />
            <span>AUTHENTICATING...</span>
          </span>
        )}

        {decoupleStage === 'DECRYPT' && (
          <span className="relative z-10 flex items-center gap-2 text-background font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-background animate-pulse" />
            <span>DECRYPTING_PAYLOAD</span>
          </span>
        )}

        {decoupleStage === 'DISPATCH' && (
          <span className="relative z-10 flex items-center gap-2 text-background font-bold">
            <span>UPLINK_DISPATCHED // OK</span>
            <span className="font-mono text-xs">✓</span>
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default ResumeButton;
