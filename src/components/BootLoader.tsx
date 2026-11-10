import { useEffect } from 'react';
import { motion } from 'framer-motion';

export interface TelemetryData {
  velocity: string;
  distance: string;
  isLocked: boolean;
  warpFactor?: number;
  stageName?: string;
  targetTag?: string;
  sectorText?: string;
}

interface BootLoaderProps {
  telemetry: TelemetryData;
  onSkip: () => void;
}

const BootLoader = ({ telemetry, onSkip }: BootLoaderProps) => {
  // Lock body scroll while cinematic warp is in flight
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Listen for Escape or Space to skip immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSkip]);

  const warpSpeedNum = parseFloat(telemetry.velocity) || 0;
  const isDistanceInLightYears = telemetry.distance.includes('LY');

  return (
    <motion.div
      key="cinematic-warp-hud"
      className="fixed inset-0 z-30 pointer-events-none select-none p-4 sm:p-7 flex flex-col justify-between"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        filter: 'blur(8px)',
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
      }}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 font-ndot text-[9px] sm:text-[11px] tracking-widest text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
          </span>
          <span>
            {telemetry.stageName ||
              (telemetry.isLocked
                ? 'ORBIT_STABLE // NODE: VISAKHAPATNAM [ACTIVE]'
                : warpSpeedNum > 4.0
                ? 'GALACTIC_INSERTION // PIERCING_CORE'
                : isDistanceInLightYears
                ? 'DEEP_SPACE // VIRGO_SUPERCLUSTER'
                : 'STELLAR_TRANSIT // CELESTIAL_CORRIDOR')}
          </span>
        </div>

        {/* Tactile Skip Button */}
        <button
          onClick={onSkip}
          className="pointer-events-auto group flex items-center gap-2 font-ndot text-[9px] sm:text-[10px] tracking-[0.2em] px-2.5 py-1 sm:px-3 sm:py-1.5 border border-border/80 hover:border-foreground bg-background/60 hover:bg-foreground hover:text-background transition-all duration-150 focus:outline-none"
          data-cursor-hover
          title="Skip Cinematic Warp (Esc or Space)"
        >
          <span className="w-1.5 h-1.5 bg-foreground group-hover:bg-background transition-colors" />
          <span>SKIP // ESC</span>
        </button>
      </div>

      {/* Center Reticle Lock (Tracks Target Galaxy in Stage 1 & 2) */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
          telemetry.isLocked ? 'opacity-0' : warpSpeedNum > 5.0 ? 'opacity-15' : 'opacity-50'
        }`}
      >
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 border border-foreground/35 rounded-full flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full border border-foreground" />
          <div className="absolute -top-3.5 font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] text-foreground bg-background/85 px-2 border border-foreground/20">
            {telemetry.targetTag ||
              (isDistanceInLightYears
                ? 'DEEP_SPACE // VIRGO_SUPERCLUSTER -> TARGET_LOCKED: MILKY_WAY_GALAXY'
                : 'TARGET_ORBIT: TERRA // THIRD_SOL_ORBIT')}
          </div>
          <div className="absolute top-1/2 left-0 w-3 h-[1px] bg-foreground/60" />
          <div className="absolute top-1/2 right-0 w-3 h-[1px] bg-foreground/60" />
          <div className="absolute left-1/2 top-0 h-3 w-[1px] bg-foreground/60" />
          <div className="absolute left-1/2 bottom-0 h-3 w-[1px] bg-foreground/60" />
        </div>
      </div>

      {/* Bottom Telemetry HUD */}
      <div className="flex items-end justify-between font-mono text-[9px] sm:text-[10px] text-muted-foreground/80 tracking-wider">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                telemetry.isLocked ? 'bg-foreground' : 'bg-foreground animate-ping'
              }`}
            />
            <span className="font-ndot text-foreground text-glow text-[10px] sm:text-[11px]">
              {telemetry.sectorText ||
                (telemetry.isLocked
                  ? 'ORBIT_STABLE // NODE: VISAKHAPATNAM [ACTIVE]'
                  : warpSpeedNum > 4.0
                  ? 'APPROACH_VECTOR: GALACTIC_DISK_INSERTION'
                  : isDistanceInLightYears
                  ? 'SECTOR_00 // MULTI_GALAXY_CLUSTER [ACQUIRING]'
                  : 'APPROACH_VECTOR: SOLAR_SYSTEM [MARS // JUPITER]')}
            </span>
          </div>
          <div className="font-ndot tracking-widest text-muted-foreground">
            WARP_VELOCITY:{' '}
            <span className="text-foreground font-semibold font-mono">
              {telemetry.velocity}
            </span>{' '}
            // DIST:{' '}
            <span className="text-foreground/90 font-mono">
              {telemetry.distance}
            </span>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <div className="font-ndot text-[9px] tracking-widest text-muted-foreground/60">
            {telemetry.isLocked
              ? 'SOLAR_SYSTEM // EARTH ORBITAL INSERTION'
              : 'DEEP_SPACE_TELEMETRY // SECTOR_08'}
          </div>
          <div className="font-mono text-[8px] text-muted-foreground/40 mt-0.5">
            NODE_VTZ: 17.6868° N, 83.2185° E
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BootLoader;
