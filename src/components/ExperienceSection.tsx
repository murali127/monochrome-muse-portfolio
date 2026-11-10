import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { experienceData, ExperienceItem } from '@/data/experience';
import { playTactileClick } from '@/utils/audioFeedback';

interface MissionRibbon {
  impact: string;
  stack: string;
  status: string;
  callsign: string;
}

const missionRibbons: Record<string, MissionRibbon> = {
  'farm-vaidya': {
    impact: '400+ CONVERSATIONS/DAY // <450ms SPEECH LATENCY',
    stack: 'LIGHTRAG + AGORA AI + SARVAM STT + FASTAPI',
    status: 'PRODUCTION_ACTIVE [STABLE]',
    callsign: 'NODE_01 // AGRI_VOICE_GENAI',
  },
  'csir-crri': {
    impact: '32 FPS REAL-TIME 1080P // IoU: 0.84',
    stack: 'YOLOX + BYTETRACK + OPENCV + STREAMLIT',
    status: 'RESEARCH_VERIFIED [L4_CLEAR]',
    callsign: 'NODE_02 // CV_ROAD_SAFETY',
  },
  'open-forge': {
    impact: '120+ DEVELOPERS MENTORED // 100% PR AUDIT',
    stack: 'FULL-STACK MERN + GITHUB ACTIONS CI/CD',
    status: 'MISSION_DELIVERED [STABLE]',
    callsign: 'NODE_03 // TECH_LEADERSHIP',
  },
  'gdsc-gvpce': {
    impact: '250+ CTF PARTICIPANTS // ZERO LEAKS',
    stack: 'CRYPTOGRAPHY + LINUX SEC + VULN ASSESS',
    status: 'AIR_GAPPED_VERIFIED [COMPLETED]',
    callsign: 'NODE_04 // DEFENSIVE_SECURITY',
  },
  'infosys-springboard': {
    impact: '98.4% OCR EXTRACTION PRECISION',
    stack: 'TESSERACT OCR + PYTHON + STREAMLIT',
    status: 'PIPELINE_VALIDATED [STABLE]',
    callsign: 'NODE_05 // CHEQUE_OCR_PIPELINE',
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
        <div className="mb-14 pb-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-4 font-ndot text-[8px] tracking-[0.25em] text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground">
            <span className="h-2 w-2 rounded-full bg-foreground phosphor-led" />
            <span>OPEN_DUAL_RAIL_TELEMETRY // CONTINUOUS_FEED</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[8.5px] text-foreground/80">
            <span>ENTRIES: 05 LOADED</span>
            <span>•</span>
            <span>MODE: SCANNABLE_STREAM</span>
            <span>•</span>
            <span>VERIFIED BY: CSIR-CRRI • FARM VAIDYA • GDSC</span>
          </div>
        </div>

        {/* Open Dual-Rail Telemetry Spine (No Boxed Cards) */}
        <div className="relative">
          
          {/* Continuous Glowing Vertical Spine Circuit */}
          <div className="absolute left-[13px] sm:left-[190px] top-2 bottom-6 w-px bg-gradient-to-b from-foreground via-border to-transparent pointer-events-none" />

          {/* All 5 Positions in Continuous Vertical Flow */}
          <div className="space-y-16 sm:space-y-20">
            {experienceData.map((exp: ExperienceItem, idx: number) => {
              const isHovered = hoveredIdx === idx;
              const ribbon = missionRibbons[exp.id] || {
                impact: 'OPERATIONAL_LOGGED',
                stack: 'VERIFIED',
                status: 'ACTIVE',
                callsign: `NODE_0${idx + 1}`,
              };

              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  onMouseEnter={() => handleEntryHover(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="relative grid grid-cols-1 sm:grid-cols-[170px_1fr] gap-6 sm:gap-12 group transition-all duration-300"
                >
                  {/* LEFT RAIL: Coordinate Node & High-Contrast Date Markers */}
                  <div className="relative pl-8 sm:pl-0 sm:text-right flex flex-col justify-start">
                    
                    {/* Glowing Coordinate Node on Spine */}
                    <div
                      className={`absolute left-[7px] sm:left-auto sm:-right-[26px] top-1.5 h-3.5 w-3.5 rounded-full border transition-all duration-300 flex items-center justify-center ${
                        isHovered
                          ? 'border-foreground bg-foreground scale-125 shadow-[0_0_14px_rgba(255,255,255,0.9)]'
                          : 'border-border/80 bg-background group-hover:border-foreground/80'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full transition-colors ${
                          isHovered ? 'bg-background' : 'bg-muted-foreground/60'
                        }`}
                      />
                    </div>

                    {/* Date Period */}
                    <div className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-foreground">
                      {exp.period}
                    </div>

                    {/* Node Index & Status */}
                    <div className="font-ndot text-[8px] tracking-[0.25em] text-muted-foreground mt-1 uppercase">
                      COORD // 0{idx + 1}
                    </div>

                    <div className="font-mono text-[8.5px] text-muted-foreground/80 mt-1">
                      {exp.location}
                    </div>
                  </div>

                  {/* RIGHT RAIL: Open Editorial Content Stream with High-Contrast Shielding */}
                  <div className="pl-8 sm:pl-0 space-y-4 bg-background/92 backdrop-blur-xl p-5 sm:p-7 rounded-sm border border-border/80 hover:border-foreground/60 transition-all shadow-xl">
                    
                    {/* Header Row: Company, Role & Category */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-ndot text-[8.5px] tracking-[0.25em] px-2 py-0.5 rounded-xs border border-border/80 text-foreground/80">
                          {exp.category}
                        </span>
                        <span className="font-mono text-[8px] text-muted-foreground">
                          {ribbon.callsign}
                        </span>
                      </div>

                      <h3 className="font-ndot text-xl sm:text-2xl text-foreground text-glow tracking-wider">
                        {exp.company}
                      </h3>

                      <div className="font-ndot text-xs sm:text-sm tracking-[0.2em] text-foreground/85 font-medium mt-0.5">
                        {exp.role}
                      </div>
                    </div>

                    {/* Inline Telemetry Parameter Ribbons (No Container Cards) */}
                    <div className="flex flex-wrap items-center gap-2 py-1 font-mono text-[9px] sm:text-[10px]">
                      <span className="px-2.5 py-1 rounded-xs border border-border/70 bg-foreground/[0.02] text-foreground inline-flex items-center gap-1.5">
                        <span className="text-muted-foreground font-ndot text-[8px] tracking-wider">IMPACT:</span>
                        <span className="font-semibold">{ribbon.impact}</span>
                      </span>

                      <span className="px-2.5 py-1 rounded-xs border border-border/70 bg-foreground/[0.02] text-foreground inline-flex items-center gap-1.5">
                        <span className="text-muted-foreground font-ndot text-[8px] tracking-wider">STACK:</span>
                        <span>{ribbon.stack}</span>
                      </span>

                      <span className="px-2 py-1 rounded-xs border border-border/70 bg-foreground/[0.02] text-foreground inline-flex items-center gap-1.5 font-ndot text-[8px] tracking-wider">
                        <span className="h-1.5 w-1.5 rounded-full bg-foreground phosphor-led" />
                        {ribbon.status}
                      </span>
                    </div>

                    {/* Role Narrative Summary */}
                    <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty font-normal max-w-4xl">
                      {exp.summary}
                    </p>

                    {/* Visible Technical Contributions */}
                    <div className="space-y-2 pt-2">
                      {exp.contributions.map((contribution, cIdx) => (
                        <div key={cIdx} className="flex items-start gap-2.5 text-xs sm:text-[13px] font-body text-muted-foreground">
                          <span className="font-mono text-[9px] text-foreground/70 shrink-0 mt-0.5">
                            0{cIdx + 1}.
                          </span>
                          <span className="leading-relaxed text-pretty">{contribution}</span>
                        </div>
                      ))}
                    </div>

                    {/* Open Architectural Callouts for Internal Production Systems (If Available) */}
                    {exp.productionHighlights && exp.productionHighlights.length > 0 && (
                      <div className="pt-3 border-t border-border/40 mt-4 space-y-3">
                        <div className="font-ndot text-[8px] tracking-[0.28em] text-muted-foreground uppercase">
                          DEPLOYED INTERNAL PRODUCTION ARCHITECTURE
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          {exp.productionHighlights.map((hl) => (
                            <div
                              key={hl.title}
                              className="p-3.5 border border-border/70 bg-foreground/[0.015] rounded-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-ndot text-xs text-foreground font-semibold">
                                  {hl.title}
                                </span>
                                <span className="font-ndot text-[7px] tracking-[0.2em] px-1.5 py-0.5 rounded-xs border border-border/60 text-muted-foreground">
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
                                    className="font-mono text-[8px] px-1.5 py-0.5 rounded-xs border border-border/50 text-foreground/70"
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

                    {/* Technologies Hairline Ribbon */}
                    <div className="pt-3 border-t border-border/30 flex flex-wrap items-center gap-1.5 font-mono text-[8.5px]">
                      <span className="font-ndot text-[7.5px] tracking-[0.2em] text-muted-foreground mr-1">
                        ENGAGED_REGISTERS:
                      </span>
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-xs border border-border/60 text-foreground/80 hover:text-foreground hover:border-foreground/60 transition-colors"
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
      </div>
    </section>
  );
};

export default ExperienceSection;
