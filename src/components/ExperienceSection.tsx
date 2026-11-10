import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { experienceData, ExperienceItem } from '@/data/experience';

const ExperienceSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="experience" className="relative py-24 sm:py-28 px-4 sm:px-6" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="WORK_LOG // VERIFIED" title="EXPERIENCE" number="04" />

        <div className="relative pl-7 sm:pl-12">
          {/* Glowing vertical timeline circuit line */}
          <div className="absolute left-[9px] sm:left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-foreground/50 via-border to-transparent pointer-events-none" />

          <div className="space-y-5">
            {experienceData.map((exp: ExperienceItem, i: number) => {
              const isOpen = openIdx === i;

              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative"
                >
                  {/* Timeline Node Button */}
                  <button
                    className={`absolute -left-7 sm:-left-12 top-6 h-4 w-4 rounded-full border border-foreground/50 transition-all duration-300 focus:outline-none ${
                      isOpen ? 'bg-foreground scale-110 shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'bg-background hover:border-foreground'
                    }`}
                    onClick={() => toggleItem(i)}
                    aria-label={`Toggle details for ${exp.role}`}
                    data-cursor-hover
                  />

                  {/* Main Experience Card */}
                  <div
                    className={`w-full cursor-pointer text-left hud-frame glass-panel-hover p-5 sm:p-8 transition-all duration-300 overflow-hidden ${
                      isOpen ? 'border-glow shadow-[0_0_30px_hsl(var(--foreground)/0.04)]' : ''
                    }`}
                    data-cursor-hover
                    onClick={() => toggleItem(i)}
                  >
                    {/* Tactical Corner Brackets */}
                    <span className="hud-corner hud-tl" />
                    <span className="hud-corner hud-tr" />
                    <span className="hud-corner hud-bl" />
                    <span className="hud-corner hud-br" />

                    {/* Card Header & Primary Telemetry */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground">
                            MISSION_{String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span className="font-ndot text-[8px] tracking-[0.2em] px-2 py-0.5 rounded-sm border border-border/80 bg-foreground/[0.03] text-foreground/80">
                            {exp.category}
                          </span>
                        </div>

                        <h3 className="font-ndot text-lg sm:text-xl tracking-wide text-foreground">
                          {exp.role}
                        </h3>

                        <div className="font-ndot text-[10px] tracking-[0.22em] text-muted-foreground flex flex-wrap items-center gap-1">
                          <span>{exp.company}</span>
                          <span className="mx-1.5 opacity-40">//</span>
                          <span className="font-mono text-[10px] opacity-80">{exp.location}</span>
                        </div>
                      </div>

                      {/* Timeline & Status Badges */}
                      <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
                        <span className="font-mono text-xs text-muted-foreground tracking-wide">
                          {exp.period}
                        </span>
                        <span className="rounded-full border border-border px-2.5 py-0.5 font-ndot text-[8px] tracking-[0.2em] text-foreground inline-flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/80" />
                          {exp.status}
                        </span>
                      </div>
                    </div>

                    {/* Short Role Summary */}
                    <p className="mt-3.5 font-body text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty font-normal">
                      {exp.summary}
                    </p>

                    {/* Expandable Technical Contributions & Production Highlights */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          {/* Key Contributions */}
                          <div className="mt-6 border-t border-border/60 pt-5 space-y-3">
                            <div className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground mb-2">
                              KEY TECHNICAL CONTRIBUTIONS
                            </div>
                            <ul className="space-y-2.5">
                              {exp.contributions.map((contribution, j) => (
                                <li key={j} className="flex items-start gap-3">
                                  <span className="mt-1 font-ndot text-[9px] text-muted-foreground/80 shrink-0">
                                    {String(j + 1).padStart(2, '0')}.
                                  </span>
                                  <span className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty font-normal">
                                    {contribution}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Nested Production Engineering Highlights (e.g. Voice AI & Sevak Dashboard) */}
                          {exp.productionHighlights && exp.productionHighlights.length > 0 && (
                            <div className="mt-6 border-t border-border/60 pt-5 space-y-4">
                              <div className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground">
                                DEPLOYED INTERNAL PRODUCTION SYSTEMS
                              </div>

                              <div className="grid gap-3 sm:grid-cols-2">
                                {exp.productionHighlights.map((hl) => (
                                  <div
                                    key={hl.title}
                                    className="p-4 border border-border/80 bg-foreground/[0.02] rounded-xs space-y-2.5"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-ndot text-xs text-foreground font-semibold">
                                        {hl.title}
                                      </span>
                                      <span className="font-ndot text-[7px] tracking-[0.2em] px-1.5 py-0.5 rounded-xs border border-border/60 text-muted-foreground shrink-0">
                                        {hl.badge}
                                      </span>
                                    </div>
                                    <p className="font-body text-xs text-muted-foreground leading-relaxed font-normal">
                                      {hl.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      {hl.technologies.map((tech) => (
                                        <span
                                          key={tech}
                                          className="font-ndot text-[8px] tracking-[0.1em] px-1.5 py-0.5 border border-border/40 text-foreground/75"
                                        >
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Technologies Applied */}
                          <div className="mt-6 border-t border-border/60 pt-5">
                            <div className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground mb-2.5">
                              TECH ARSENAL
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {exp.technologies.map((t) => (
                                <span
                                  key={t}
                                  className="skill-chip px-2.5 py-1 font-ndot text-[9px] tracking-[0.16em] text-foreground"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Expand/Collapse Indicator */}
                    <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between font-ndot text-[8px] tracking-[0.25em] text-muted-foreground">
                      <span>{isOpen ? 'COLLAPSE MISSION [-]' : 'EXPAND MISSION [+]'}</span>
                      <span className="font-mono text-xs">{isOpen ? '▲' : '▼'}</span>
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
