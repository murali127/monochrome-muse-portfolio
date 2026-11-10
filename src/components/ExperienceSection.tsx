import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { experienceData, ExperienceItem } from '@/data/experience';
import { playTactileClick } from '@/utils/audioFeedback';

const missionTelemetry: Record<string, { impact: string; stack: string; status: string; code: string }> = {
  'farm-vaidya': {
    impact: 'IMPACT: 400+ CONVERSATIONS/DAY // <450ms LATENCY',
    stack: 'STACK: LIGHTRAG + AGORA AI + SARVAM STT + FASTAPI',
    status: 'PRODUCTION_ACTIVE [STABLE]',
    code: 'SEC_REC // 0xFA81',
  },
  'csir-crri': {
    impact: 'IMPACT: 32 FPS REAL-TIME 1080P // IoU: 0.84',
    stack: 'STACK: YOLOX + BYTETRACK + OPENCV + STREAMLIT',
    status: 'RESEARCH_VERIFIED [L4_CLEAR]',
    code: 'SEC_REC // 0xCB42',
  },
  'open-forge': {
    impact: 'IMPACT: 120+ ENGINEERS MENTORED // 100% PR AUDIT',
    stack: 'STACK: FULL-STACK ARCH + GITHUB ACTIONS CI/CD',
    status: 'MISSION_DELIVERED [STABLE]',
    code: 'SEC_REC // 0x8E19',
  },
  'gdsc-gvpce': {
    impact: 'IMPACT: 250+ CTF PARTICIPANTS // DEFENSIVE AUDITS',
    stack: 'STACK: CRYPTOGRAPHY + LINUX SEC + VULN ASSESS',
    status: 'AIR_GAPPED [COMPLETED]',
    code: 'SEC_REC // 0x5D99',
  },
  'infosys-springboard': {
    impact: 'IMPACT: 98.4% OCR EXTRACTION PRECISION',
    stack: 'STACK: TESSERACT OCR + PYTHON + STREAMLIT',
    status: 'PIPELINE_VALIDATED [STABLE]',
    code: 'SEC_REC // 0x112C',
  },
};

const ExperienceSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const handleSelectMission = (idx: number) => {
    setActiveIdx(idx);
    playTactileClick('toggle');
  };

  const activeExp: ExperienceItem = experienceData[activeIdx] || experienceData[0];
  const activeTelem = missionTelemetry[activeExp.id] || {
    impact: 'IMPACT: METRIC_LOGGED',
    stack: 'STACK: VERIFIED',
    status: 'ACTIVE',
    code: 'SEC_REC // 0x0000',
  };

  return (
    <section id="experience" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="MISSION_LOG // FLIGHT_RECORDER" title="EXPERIENCE" number="04" />

        {/* Flight Recorder Reel Top Console */}
        <div className="mb-8 p-4 hud-frame glass-panel border border-border/80 rounded-sm flex flex-wrap items-center justify-between gap-4 font-ndot text-[8px] tracking-[0.25em] text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground">
            <span className="h-2 w-2 rounded-full bg-foreground animate-ping" />
            <span>BLACK_BOX // FLIGHT_RECORDER_REEL: ARMED</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[8.5px] text-foreground/80">
            <span>REEL_SPEED: 15 IPS</span>
            <span className="hidden sm:inline">•</span>
            <span>TIMECODE: [00:14:22:18]</span>
            <span className="hidden sm:inline">•</span>
            <span>CHANNELS: 05 TRACKS</span>
          </div>
        </div>

        {/* Tactical Mission Selector & Cartridge Dock */}
        <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
          
          {/* LEFT: Cassette / Reel Track Selector */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hud-frame glass-panel p-3.5 space-y-2 h-fit border border-border/80 rounded-sm"
          >
            <span className="hud-corner hud-tl" />
            <span className="hud-corner hud-tr" />
            <span className="hud-corner hud-bl" />
            <span className="hud-corner hud-br" />

            <div className="font-ndot text-[8px] tracking-[0.35em] text-muted-foreground px-3 py-2 flex items-center justify-between border-b border-border/40 mb-1">
              <span>MISSION CASSETTES</span>
              <span className="font-mono text-foreground">05 LOADED</span>
            </div>

            {experienceData.map((exp: ExperienceItem, i: number) => {
              const isSelected = activeIdx === i;
              return (
                <button
                  key={exp.id}
                  onClick={() => handleSelectMission(i)}
                  className={`w-full text-left p-3 rounded-xs transition-all duration-200 focus:outline-none relative group ${
                    isSelected
                      ? 'bg-foreground text-background font-medium shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                      : 'hover:bg-foreground/5 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/60'
                  }`}
                  data-cursor-hover
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-ndot text-[8px] tracking-[0.3em]">
                      MISSION_{String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`font-mono text-[8px] tracking-widest ${
                        isSelected ? 'opacity-90 font-bold' : 'opacity-40'
                      }`}
                    >
                      {exp.period.split(' – ')[0]}
                    </span>
                  </div>

                  <div className="font-ndot text-[10px] tracking-wide truncate">
                    {exp.company}
                  </div>
                  <div
                    className={`font-mono text-[8.5px] truncate mt-0.5 ${
                      isSelected ? 'text-background/80' : 'text-muted-foreground/70'
                    }`}
                  >
                    {exp.role}
                  </div>
                </button>
              );
            })}

            <div className="pt-3 px-3 border-t border-border/30 flex items-center justify-between font-ndot text-[7.5px] tracking-[0.2em] text-muted-foreground">
              <span>DATA_BUS: ACTIVE</span>
              <span className="text-foreground font-mono">PARITY: OK</span>
            </div>
          </motion.div>

          {/* RIGHT: Active Mission Cartridge Full Telemetry */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hud-frame glass-panel p-6 sm:p-8 border border-border/80 rounded-sm relative shadow-2xl min-h-[520px] flex flex-col justify-between"
          >
            <span className="hud-corner hud-tl" />
            <span className="hud-corner hud-tr" />
            <span className="hud-corner hud-bl" />
            <span className="hud-corner hud-br" />

            <div>
              {/* Mission Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4 mb-6">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-ndot text-[9px] tracking-[0.3em] px-2.5 py-1 rounded-xs border border-foreground/30 bg-foreground/[0.04] text-foreground font-semibold">
                    MISSION_{String(activeIdx + 1).padStart(2, '0')}
                  </span>
                  <span className="font-ndot text-[8px] tracking-[0.2em] px-2 py-0.5 rounded-xs border border-border text-muted-foreground">
                    {activeExp.category}
                  </span>
                  <span className="font-mono text-[8px] text-muted-foreground">
                    {activeTelem.code}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground tracking-wide">
                    {activeExp.period}
                  </span>
                  <span className="font-ndot text-[8px] tracking-[0.2em] px-2 py-0.5 rounded border border-border text-foreground flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                    {activeExp.status}
                  </span>
                </div>
              </div>

              {/* Company & Role Headline */}
              <div className="mb-6">
                <h3 className="font-ndot text-2xl sm:text-3xl text-foreground text-glow tracking-wider mb-1">
                  {activeExp.role}
                </h3>
                <div className="font-ndot text-xs sm:text-sm tracking-[0.22em] text-muted-foreground flex flex-wrap items-center gap-2">
                  <span className="text-foreground/90">{activeExp.company}</span>
                  <span className="opacity-40">//</span>
                  <span className="font-mono text-[11px] opacity-80">{activeExp.location}</span>
                </div>
              </div>

              {/* Mission Operational Parameter Badges */}
              <div className="grid sm:grid-cols-3 gap-2.5 mb-6">
                <div className="p-2.5 rounded-xs border border-border/80 bg-foreground/[0.02]">
                  <div className="font-ndot text-[7px] tracking-[0.25em] text-muted-foreground uppercase mb-1">
                    OPERATIONAL_IMPACT
                  </div>
                  <div className="font-mono text-[9.5px] text-foreground font-medium leading-tight">
                    {activeTelem.impact}
                  </div>
                </div>

                <div className="p-2.5 rounded-xs border border-border/80 bg-foreground/[0.02]">
                  <div className="font-ndot text-[7px] tracking-[0.25em] text-muted-foreground uppercase mb-1">
                    STACK_ENGAGED
                  </div>
                  <div className="font-mono text-[9.5px] text-foreground font-medium leading-tight">
                    {activeTelem.stack}
                  </div>
                </div>

                <div className="p-2.5 rounded-xs border border-border/80 bg-foreground/[0.02]">
                  <div className="font-ndot text-[7px] tracking-[0.25em] text-muted-foreground uppercase mb-1">
                    FLIGHT_STATUS
                  </div>
                  <div className="font-mono text-[9.5px] text-foreground font-semibold flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground phosphor-led" />
                    {activeTelem.status}
                  </div>
                </div>
              </div>

              {/* Mission Summary */}
              <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty font-normal mb-6">
                {activeExp.summary}
              </p>

              {/* Technical Contributions */}
              <div className="border-t border-border/40 pt-5 space-y-3 mb-6">
                <div className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground mb-3 flex items-center justify-between">
                  <span>LOGGED ACTION ITEMS & TECHNICAL CONTRIBUTIONS</span>
                  <span className="font-mono text-foreground/60">{activeExp.contributions.length} RECORDS</span>
                </div>

                <div className="space-y-2.5">
                  {activeExp.contributions.map((contribution, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <span className="font-ndot text-[8.5px] text-muted-foreground/80 shrink-0 font-mono mt-0.5">
                        [{String(j + 1).padStart(2, '0')}]
                      </span>
                      <span className="font-body text-xs sm:text-[13px] text-muted-foreground leading-relaxed font-normal text-pretty">
                        {contribution}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nested Production Engineering Highlights (if available) */}
              {activeExp.productionHighlights && activeExp.productionHighlights.length > 0 && (
                <div className="border-t border-border/40 pt-5 mb-6">
                  <div className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground mb-3">
                    DEPLOYED INTERNAL PRODUCTION SYSTEMS
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {activeExp.productionHighlights.map((hl) => (
                      <div
                        key={hl.title}
                        className="p-3.5 border border-border/80 bg-foreground/[0.02] rounded-xs space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-ndot text-xs text-foreground font-semibold">
                            {hl.title}
                          </span>
                          <span className="font-ndot text-[7px] tracking-[0.2em] px-1.5 py-0.5 rounded-xs border border-border/60 text-muted-foreground shrink-0">
                            {hl.badge}
                          </span>
                        </div>
                        <p className="font-body text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                          {hl.description}
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {hl.technologies.map((t) => (
                            <span
                              key={t}
                              className="font-mono text-[8px] px-1.5 py-0.5 rounded-xs bg-foreground/[0.04] border border-border/50 text-foreground/80"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Tech Strip */}
            <div className="border-t border-border/60 pt-4 flex flex-wrap items-center justify-between gap-3 font-ndot text-[8px] tracking-[0.2em]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-muted-foreground mr-1">PRIMARY_ENGINES:</span>
                {activeExp.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded-xs border border-border/70 bg-foreground/[0.02] text-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="font-mono text-muted-foreground text-[8px]">
                REC_BLOCK: 0x{String(activeIdx * 2048 + 4096).toString(16).toUpperCase()}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
