import { useRef, useState } from 'react';
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

  return (
    <section id="skills" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="pointer-events-none absolute inset-0 opacity-40 grid-lines-bg" />
      <div className="mx-auto max-w-7xl relative">
        <SectionHeader label="CAPABILITIES // VERIFIED" title="SKILLS" number="03" />

        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Module Selector Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            className="hud-frame glass-panel p-3 space-y-2 h-fit"
          >
            <HudCorners />
            <div className="font-ndot text-[8px] tracking-[0.35em] text-muted-foreground px-3 py-2 flex items-center justify-between border-b border-border/40 mb-1">
              <span>MODULE SELECT</span>
              <span className="text-[7px] text-foreground/50">06 SYSTEMS</span>
            </div>
            {skillsData.map((cat, i) => {
              const isSelected = active === i;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActive(i)}
                  className={`w-full text-left px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-sm transition-all duration-300 focus:outline-none ${
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
          </motion.div>

          {/* Active Skill Category Display */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="hud-frame glass-panel p-5 sm:p-8 min-h-[360px] sm:min-h-[380px] relative overflow-hidden flex flex-col justify-between"
          >
            <HudCorners />
            {/* Animated Laser Scanning Beam */}
            <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
              <div className="h-px w-1/3 bg-foreground/50 animate-[beam_3.5s_linear_infinite]" />
            </div>

            <div>
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 border-b border-border/40 pb-5 sm:pb-6">
                <div>
                  <div className="font-ndot text-[9px] tracking-[0.35em] text-muted-foreground mb-2 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
                    <span>{current.code} // SUBSYSTEM_ONLINE</span>
                  </div>
                  <h3 className="font-ndot text-xl sm:text-2xl lg:text-3xl text-foreground text-glow tracking-wider">
                    {current.title}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground mt-2 max-w-xl leading-relaxed">
                    {current.description}
                  </p>
                </div>
                <div className="flex items-baseline gap-2 self-start sm:self-auto">
                  <span className="font-ndot text-[9px] tracking-[0.25em] text-muted-foreground">COUNT:</span>
                  <span className="font-ndot text-3xl sm:text-5xl text-foreground/20 leading-none">
                    {String(current.skills.length).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Skill Chips */}
              <div className="flex flex-wrap gap-2 sm:gap-2.5 py-2">
                {current.skills.map((skill, i) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="skill-chip px-3 sm:px-3.5 py-1.5 sm:py-2 font-ndot text-[10px] sm:text-[11px] tracking-[0.16em] text-foreground inline-flex items-center gap-2 border border-border/80 bg-background/50 hover:border-foreground/60 transition-colors duration-200"
                    data-cursor-hover
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground/70" />
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Terminal Telemetry Footer */}
            <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4 border-t border-border/60 pt-4 sm:pt-5">
              {[
                { label: 'BUS_SYNC', state: 'LOCKED' },
                { label: 'PARITY', state: 'STABLE' },
                { label: 'VERIFICATION', state: 'CONFIRMED' },
              ].map((item, i) => (
                <div key={item.label}>
                  <div className="font-ndot text-[7px] sm:text-[8px] tracking-[0.25em] text-muted-foreground mb-1">
                    {item.label}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-mono text-[8px] sm:text-[9px] tracking-wider text-foreground/80 font-bold truncate">
                      {item.state}
                    </span>
                    <div className="hidden sm:flex items-end gap-1 h-3.5">
                      {Array.from({ length: 5 }).map((_, bar) => (
                        <span
                          key={bar}
                          className="signal-bar w-1 bg-foreground/60"
                          style={{
                            height: `${40 + ((i + bar) % 4) * 20}%`,
                            animationDelay: `${bar * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
