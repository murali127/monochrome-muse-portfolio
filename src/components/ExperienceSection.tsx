import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { experienceData, ExperienceItem } from '@/data/experience';
import { playTactileClick } from '@/utils/audioFeedback';

interface MissionRibbon {
  impact: string;
  stack: string;
  env: string;
  callsign: string;
}

const missionRibbons: Record<string, MissionRibbon> = {
  'farm-vaidya': {
    impact: '400+ DAILY SESSIONS // <450ms SPEECH LATENCY',
    stack: 'LIGHTRAG + AGORA AI + SARVAM STT',
    env: 'LINUX / FASTAPI / DOCKER',
    callsign: 'NODE_01 // VIZAG',
  },
  'csir-crri': {
    impact: '32 FPS REAL-TIME 1080P // IoU: 0.84',
    stack: 'YOLOX + BYTETRACK + OPENCV',
    env: 'STREAMLIT / PYTHON',
    callsign: 'NODE_02 // NEW DELHI',
  },
  'open-forge': {
    impact: '120+ DEVELOPERS MENTORED // 100% PR AUDIT',
    stack: 'FULL-STACK MERN + GITHUB ACTIONS',
    env: 'NODE.JS / CI-CD',
    callsign: 'NODE_03 // GVPCE(A)',
  },
  'gdsc-gvpce': {
    impact: '250+ CTF PARTICIPANTS // ZERO LEAKS',
    stack: 'CRYPTOGRAPHY + LINUX SEC',
    env: 'AIR-GAPPED NETWORKS',
    callsign: 'NODE_04 // DEFENSIVE_SEC',
  },
  'infosys-springboard': {
    impact: '98.4% OCR EXTRACTION PRECISION',
    stack: 'TESSERACT OCR + PYTHON',
    env: 'PYTHON / STREAMLIT',
    callsign: 'NODE_05 // CHEQUE_OCR',
  },
};

const ExperienceSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const handleEntryHover = (idx: number) => {
    setHoveredIdx(idx);
    playTactileClick('subtle');
  };

  return (
    <section id="experience" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="MISSION_LOG // VERIFIED_HISTORY" title="EXPERIENCE" number="04" />

        {/* Top Telemetry Header Ribbon */}
        <div className="mb-12 pb-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-4 font-ndot text-[8px] tracking-[0.25em] text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground">
            <span className="h-2 w-2 rounded-full bg-foreground phosphor-led" />
            <span>TACTICAL_FLIGHT_LOG // SYSTEMS_CHRONICLE</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[8.5px] text-foreground/80">
            <span>ENTRIES: 05 LOADED</span>
            <span>•</span>
            <span>STATUS: CONTINUOUS_SPINE_ALIGNED</span>
            <span>•</span>
            <span>NODES: CSIR-CRRI • FARM VAIDYA • GDSC</span>
          </div>
        </div>

        {/* Tactical Flight Log: Continuous Center Spine Grid */}
        <div className="relative">
          {experienceData.map((exp: ExperienceItem, idx: number) => {
            const isHovered = hoveredIdx === idx;
            const ribbon = missionRibbons[exp.id] || {
              impact: 'OPERATIONAL_LOGGED',
              stack: 'VERIFIED',
              env: 'LINUX / CLOUD',
              callsign: `NODE_0${idx + 1}`,
            };

            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 25 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: idx * 0.07 }}
                onMouseEnter={() => handleEntryHover(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="group relative grid grid-cols-[28px_1fr] md:grid-cols-[180px_48px_1fr] gap-3 md:gap-4 items-start pb-8 sm:pb-10 last:pb-0"
              >
                {/* Column 1: Date / Coordinate Rail (Desktop >= 768px) */}
                <div className="hidden md:flex flex-col items-end text-right pt-1.5 space-y-1">
                  <div className="font-mono text-xs lg:text-sm font-semibold tracking-wider text-foreground leading-tight">
                    {exp.period}
                  </div>
                  <div className="font-ndot text-[8px] tracking-[0.25em] text-muted-foreground uppercase">
                    {ribbon.callsign}
                  </div>
                  <div className="font-mono text-[8.5px] text-muted-foreground/80">
                    {exp.location}
                  </div>
                </div>

                {/* Column 2: Center Glowing Bus Line with Tactile Node */}
                <div className="relative flex flex-col items-center justify-start h-full pt-1.5 self-stretch">
                  {/* Continuous Vertical Spine Circuit */}
                  <div
                    className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] ${
                      idx === experienceData.length - 1
                        ? 'bg-gradient-to-b from-border/70 via-border/40 to-transparent'
                        : 'bg-border/60 group-hover:bg-foreground/40'
                    } transition-colors`}
                  />

                  {/* Tactile Node */}
                  <div
                    className={`relative z-10 w-4 h-4 rounded-full border bg-background flex items-center justify-center transition-all duration-300 ${
                      isHovered
                        ? 'border-foreground ring-2 ring-foreground/80 scale-125 shadow-[0_0_14px_rgba(255,255,255,0.85)]'
                        : 'border-foreground/60 group-hover:border-foreground'
                    }`}
                  >
                    {/* Inner active dot */}
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        isHovered ? 'bg-foreground' : 'bg-foreground/70'
                      }`}
                    />

                    {/* Radar ping ring on hover */}
                    {isHovered && (
                      <span className="absolute -inset-1 rounded-full border border-foreground/60 animate-ping pointer-events-none" />
                    )}
                  </div>
                </div>

                {/* Column 3: Unified Mission Report */}
                <div className="space-y-4 bg-background/65 backdrop-blur-md p-5 sm:p-7 rounded-xs border border-border/60 hover:border-foreground/50 transition-all shadow-xl">
                  {/* Mobile Date Header (< 768px) */}
                  <div className="md:hidden flex items-center justify-between gap-2 pb-2 mb-1 border-b border-border/40 font-mono text-[10px] text-muted-foreground">
                    <span className="font-semibold text-foreground tracking-wide">{exp.period}</span>
                    <span className="font-ndot text-[8px] tracking-widest">{ribbon.callsign}</span>
                  </div>

                  {/* Header Row: Company, Role & Category */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border/40 pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-ndot text-[8.5px] tracking-[0.25em] text-muted-foreground uppercase">
                          {exp.category}
                        </span>
                        <span className="text-border/80">•</span>
                        <span className="font-mono text-[8px] text-muted-foreground">
                          {ribbon.callsign}
                        </span>
                      </div>

                      <h3 className="font-ndot text-lg sm:text-xl md:text-2xl text-foreground text-glow tracking-wider font-bold">
                        {exp.company}
                      </h3>

                      <div className="font-ndot text-xs sm:text-sm tracking-[0.18em] text-foreground/85 font-medium mt-0.5">
                        {exp.role}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0 flex items-center mt-1 sm:mt-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs font-mono text-[8.5px] tracking-wider border ${
                          exp.status === 'ACTIVE'
                            ? 'border-foreground/80 bg-foreground/10 text-foreground font-semibold'
                            : 'border-border/80 bg-foreground/[0.02] text-muted-foreground'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            exp.status === 'ACTIVE'
                              ? 'bg-foreground animate-pulse'
                              : 'border border-muted-foreground'
                          }`}
                        />
                        <span>
                          {exp.status === 'ACTIVE' ? '● PRODUCTION_ACTIVE' : '○ MISSION_ACCOMPLISHED'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Parameter Ribbon: Single horizontal strip with hairline borders */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2 px-3 border border-border/50 bg-foreground/[0.02] font-mono text-[9px] sm:text-[10px] text-foreground/90">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="font-ndot text-[8px] tracking-wider text-muted-foreground">IMPACT:</span>
                      <span className="font-semibold text-foreground">{ribbon.impact}</span>
                    </div>
                    <span className="text-border/60 hidden sm:inline">|</span>
                    <div className="inline-flex items-center gap-1.5">
                      <span className="font-ndot text-[8px] tracking-wider text-muted-foreground">STACK:</span>
                      <span>{ribbon.stack}</span>
                    </div>
                    <span className="text-border/60 hidden sm:inline">|</span>
                    <div className="inline-flex items-center gap-1.5">
                      <span className="font-ndot text-[8px] tracking-wider text-muted-foreground">ENV:</span>
                      <span>{ribbon.env}</span>
                    </div>
                  </div>

                  {/* Role Narrative Summary */}
                  <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty font-normal max-w-4xl">
                    {exp.summary}
                  </p>

                  {/* Chronological Action Logs */}
                  <div className="space-y-2 pt-1">
                    {exp.contributions.map((contribution, cIdx) => (
                      <div
                        key={cIdx}
                        className="flex items-start gap-2.5 text-xs sm:text-[13px] font-body text-muted-foreground group/log"
                      >
                        <span className="font-mono text-[9.5px] text-foreground/80 font-semibold shrink-0 mt-0.5 tracking-wider">
                          [{cIdx < 9 ? '0' : ''}{cIdx + 1}]
                        </span>
                        <span className="leading-relaxed text-pretty text-foreground/85 group-hover/log:text-foreground transition-colors">
                          {contribution}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Internal Production Architecture (If Available) */}
                  {exp.productionHighlights && exp.productionHighlights.length > 0 && (
                    <div className="pt-3 border-t border-border/40 mt-3 space-y-2.5">
                      <div className="font-ndot text-[8px] tracking-[0.25em] text-muted-foreground uppercase flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full" />
                        <span>INTERNAL PRODUCTION ARCHITECTURE</span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        {exp.productionHighlights.map((hl) => (
                          <div
                            key={hl.title}
                            className="p-3 border border-border/60 bg-foreground/[0.015] rounded-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-ndot text-xs text-foreground font-semibold">
                                {hl.title}
                              </span>
                              <span className="font-ndot text-[7px] tracking-[0.2em] px-1.5 py-0.5 rounded-xs border border-border/50 text-muted-foreground">
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
                                  className="font-mono text-[8px] px-1.5 py-0.5 rounded-xs border border-border/40 text-foreground/75"
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

                  {/* Engaged Tech Registers */}
                  <div className="pt-3 border-t border-border/30 flex flex-wrap items-center gap-1.5 font-mono text-[8.5px]">
                    <span className="font-ndot text-[7.5px] tracking-[0.2em] text-muted-foreground mr-1">
                      ENGAGED_REGISTERS:
                    </span>
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-xs border border-border/50 text-foreground/80 hover:text-foreground hover:border-foreground/60 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
