import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { skillsData, SkillCategory } from '@/data/skills';

const HudCorners = () => (
  <>
    <span className="hud-corner hud-tl" />
    <span className="hud-corner hud-tr" />
    <span className="hud-corner hud-bl" />
    <span className="hud-corner hud-br" />
  </>
);

const SkillsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [active, setActive] = useState(0);
  const current: SkillCategory = skillsData[active] || skillsData[0];

  // Simulated live telemetry fluctuation for flight deck console
  const [telemetry, setTelemetry] = useState({
    freq: '1420.405',
    throughput: '12.8',
    packets: '48,920',
    cycle: 840,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry({
        freq: (1420.4 + Math.random() * 0.02).toFixed(3),
        throughput: (12.4 + Math.random() * 0.8).toFixed(1),
        packets: `${Math.floor(48900 + Math.random() * 150).toLocaleString()}`,
        cycle: Math.floor(820 + Math.random() * 40),
      });
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="skills" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="pointer-events-none absolute inset-0 opacity-40 grid-lines-bg" />
      <div className="mx-auto max-w-7xl relative">
        <SectionHeader label="CAPABILITIES // AVIONICS" title="SKILLS" number="03" />

        <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
          {/* Module Selector Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            className="hud-frame glass-panel p-3 space-y-2 h-fit border border-border/80 rounded-sm"
          >
            <HudCorners />
            <div className="font-ndot text-[8px] tracking-[0.35em] text-muted-foreground px-3 py-2 flex items-center justify-between border-b border-border/40 mb-1">
              <span>AVIONICS SUBSYSTEMS</span>
              <span className="text-[7px] text-foreground/50">06 ACTIVE</span>
            </div>
            {skillsData.map((cat, i) => {
              const isSelected = active === i;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActive(i)}
                  className={`w-full text-left px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-sm transition-all duration-200 focus:outline-none ${
                    isSelected
                      ? 'bg-foreground text-background font-medium shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                      : 'hover:bg-foreground/5 text-muted-foreground hover:text-foreground'
                  }`}
                  data-cursor-hover
                >
                  <div className="flex items-center justify-between">
                    <span className="font-ndot text-[9px] sm:text-[10px] tracking-[0.2em]">{cat.title}</span>
                    <span
                      className={`font-ndot text-[8px] tracking-[0.2em] ${
                        isSelected ? 'opacity-80' : 'opacity-40'
                      }`}
                    >
                      {cat.code}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Quick Diagnostic Footer inside selector */}
            <div className="pt-2 px-3 border-t border-border/30 flex items-center justify-between font-ndot text-[7px] tracking-[0.2em] text-muted-foreground">
              <span>SYS_BUS: ONLINE</span>
              <span className="flex items-center gap-1 text-foreground/80">
                <span className="h-1 w-1 rounded-full bg-foreground animate-ping" />
                LOCKED
              </span>
            </div>
          </motion.div>

          {/* Active Skill Category: Tactical Flight / Terminal Console */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="hud-frame glass-panel p-5 sm:p-8 min-h-[460px] relative overflow-hidden flex flex-col justify-between border border-border/80 rounded-sm shadow-2xl"
          >
            <HudCorners />
            {/* Animated Laser Scanning Beam */}
            <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
              <div className="h-px w-1/3 bg-foreground/60 animate-[beam_3s_linear_infinite]" />
            </div>

            <div>
              {/* Flight Console Tactical Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3 mb-5 font-ndot text-[8px] tracking-[0.25em] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
                  <span className="text-foreground">{current.code} // FLIGHT_CONSOLE_ONLINE</span>
                </div>
                <div className="flex items-center gap-4 text-foreground/75">
                  <span>RF_FREQ: {telemetry.freq} MHz</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">CYCLE: {telemetry.cycle} Hz</span>
                  <span className="hidden sm:inline">•</span>
                  <span>THROUGHPUT: {telemetry.throughput} GB/s</span>
                </div>
              </div>

              {/* Header Title & Description */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-ndot text-2xl sm:text-3xl lg:text-4xl text-foreground text-glow tracking-wider">
                    {current.title}
                  </h3>
                  {/* Modern Sans Space Grotesk Description for fatigue-free reading */}
                  <p className="font-body text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed text-pretty font-normal">
                    {current.description}
                  </p>
                </div>
                <div className="flex items-baseline gap-2 self-start sm:self-auto shrink-0">
                  <span className="font-ndot text-[9px] tracking-[0.25em] text-muted-foreground">MODULES:</span>
                  <span className="font-ndot text-3xl sm:text-5xl text-foreground/25 leading-none">
                    {String(current.skills.length).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Tactical Avionics Skill Modules */}
              <div className="py-2">
                <div className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground mb-3 flex items-center justify-between">
                  <span>ENGAGED REGISTERS & TECHNOLOGIES</span>
                  <span>PARITY: 100% OK</span>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {current.skills.map((skill, i) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.035 }}
                      className="group/chip skill-chip px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xs border border-border/80 bg-background/60 hover:border-foreground/80 hover:bg-foreground/10 transition-all flex items-center gap-2.5 cursor-default"
                      data-cursor-hover
                    >
                      <span className="font-mono text-[8px] text-foreground/40 group-hover/chip:text-foreground">
                        [{String(i + 1).padStart(2, '0')}]
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground/75 group-hover/chip:scale-125 transition-transform" />
                      <span className="font-ndot text-[10px] sm:text-[11px] tracking-[0.16em] text-foreground">
                        {skill}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Dynamic Signal Spectrum / Oscilloscope Readout */}
              <div className="mt-6 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between font-ndot text-[7.5px] sm:text-[8px] tracking-[0.25em] text-muted-foreground mb-2">
                  <span>REAL-TIME SPECTRAL DENSITY // SIGNAL ARRAY</span>
                  <span className="font-mono">{telemetry.packets} PKTS PROCESSED</span>
                </div>
                <div className="flex items-end gap-1 h-6 sm:h-8 overflow-hidden bg-foreground/[0.02] p-1 border border-border/40 rounded-xs">
                  {Array.from({ length: 36 }).map((_, barIdx) => (
                    <span
                      key={barIdx}
                      className="signal-bar flex-1 bg-foreground/60 transition-all duration-300"
                      style={{
                        height: `${20 + ((barIdx * 11 + (active * 7)) % 80)}%`,
                        animationDelay: `${(barIdx % 6) * 0.12}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* High-Density Terminal Telemetry Footer */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 border-t border-border/60 pt-4 sm:pt-5 font-ndot">
              <div>
                <div className="text-[7px] sm:text-[8px] tracking-[0.25em] text-muted-foreground mb-0.5">
                  UPLINK_STATUS
                </div>
                <div className="text-[9px] sm:text-[10px] tracking-wider text-foreground font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-ping" />
                  SYNCHRONIZED
                </div>
              </div>

              <div>
                <div className="text-[7px] sm:text-[8px] tracking-[0.25em] text-muted-foreground mb-0.5">
                  FLIGHT_VECTOR
                </div>
                <div className="text-[9px] sm:text-[10px] tracking-wider text-foreground font-semibold font-mono">
                  184.2° N / +42.6°
                </div>
              </div>

              <div>
                <div className="text-[7px] sm:text-[8px] tracking-[0.25em] text-muted-foreground mb-0.5">
                  MEMORY_PARITY
                </div>
                <div className="text-[9px] sm:text-[10px] tracking-wider text-foreground font-semibold">
                  0x00_VERIFIED
                </div>
              </div>

              <div>
                <div className="text-[7px] sm:text-[8px] tracking-[0.25em] text-muted-foreground mb-0.5">
                  SECURITY_GATE
                </div>
                <div className="text-[9px] sm:text-[10px] tracking-wider text-foreground font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                  AIR_GAPPED
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
