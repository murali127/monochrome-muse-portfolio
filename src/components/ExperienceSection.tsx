import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import SectionHeader from './SectionHeader';

const experiences = [
  {
    role: 'GEN AI ENGINEER INTERN',
    company: 'FARM VAIDYA AI TECH PVT LTD',
    period: 'DEC 2025 – PRESENT',
    status: 'ACTIVE',
    details: [
      'Developed agriculture chatbot using RAG & LightRAG, integrated Agora AI + Sarvam STT for real-time workflows',
      'Built full-stack dashboard for Pipecat logs visualization with role-based access control',
      'Maintain production chatbot handling 300-400+ daily sessions through monitoring & bug fixes',
      'Participated in load testing, deployment support, and cross-team coordination for production stability',
    ],
  },
  {
    role: 'TECHNICAL LEAD',
    company: 'OPEN FORGE, GVPCE',
    period: 'OCT 2024 – PRESENT',
    status: 'ACTIVE',
    details: [
      'Led agile-based full-stack development, improving sprint efficiency by 20%',
      'Directed code reviews and maintained CI/CD pipelines using GitHub Actions',
      'Coordinated team of developers on multiple full-stack projects using MERN stack',
    ],
  },
  {
    role: 'CYBERSECURITY LEAD',
    company: 'GDSC, GVPCE',
    period: 'NOV 2024 – PRESENT',
    status: 'ACTIVE',
    details: [
      'Delivered interactive cybersecurity and blockchain sessions to 100+ students',
      'Initiated capture-the-flag events to promote ethical hacking practices',
      'Organized 3 cybersecurity awareness events promoting safe digital practices',
    ],
  },
  {
    role: 'RESEARCH INTERN',
    company: 'CSIR-CRRI (DELHI)',
    period: 'APR 2025 – MAY 2025',
    status: 'COMPLETED',
    details: [
      'Built real-time Road Safety Scoring System using YOLOX, ByteTrack, OpenCV & Streamlit',
      'Collaborated with senior scientists & IIT Delhi experts on 4-week research project',
      'Implemented ROI-based filtering to improve object detection precision for safety analytics',
      'Achieved 65-70% detection accuracy with limited training datasets',
    ],
  },
  {
    role: 'AI/ML INTERN',
    company: 'INFOSYS SPRINGBOARD',
    period: 'JAN 2025 – APR 2025',
    status: 'COMPLETED',
    details: [
      'Engineered cheque automation pipeline with OCR & Python, reducing manual entry by 25%',
      'Developed AI-powered form processing tool deployed via Streamlit',
      'Proposed unique solution contributing significantly to final product accuracy & team success',
    ],
  },
];

const ExperienceSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section id="experience" className="relative py-32 px-6" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="WORK_LOG" title="EXPERIENCE" number="03" />

        <div className="relative pl-8 sm:pl-12">
          <div className="absolute left-[11px] sm:left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-foreground/50 via-border to-transparent" />

          <div className="space-y-4">
            {experiences.map((exp, i) => {
              const open = openIdx === i;
              return (
                <motion.div
                  key={exp.role + exp.company}
                  initial={{ opacity: 0, x: 24 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.55, delay: i * 0.08 }}
                  className="relative"
                >
                  <button
                    className={`absolute -left-8 sm:-left-12 top-6 h-4 w-4 rounded-full border border-foreground/40 ${
                      open ? 'bg-foreground' : 'bg-background'
                    }`}
                    onClick={() => setOpenIdx(i)}
                    aria-label={`Open ${exp.role}`}
                  >
                    {exp.status === 'ACTIVE' && (
                      <span className="absolute inset-0 rounded-full bg-foreground/40 animate-ping" />
                    )}
                  </button>

                  <div
                    className={`w-full cursor-pointer text-left hud-frame glass-panel-hover p-6 sm:p-8 overflow-hidden ${
                      open ? 'border-glow' : ''
                    }`}
                    data-cursor-hover
                    onClick={() => setOpenIdx(i)}
                  >
                    <span className="hud-corner hud-tl" />
                    <span className="hud-corner hud-tr" />
                    <span className="hud-corner hud-bl" />
                    <span className="hud-corner hud-br" />

                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground mb-2">
                          MISSION_{String(i + 1).padStart(2, '0')}
                        </div>
                        <h3 className="font-ndot text-lg tracking-wide text-foreground">{exp.role}</h3>
                        <div className="font-ndot text-[10px] tracking-[0.25em] text-muted-foreground mt-1">
                          {exp.company}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-muted-foreground">{exp.period}</span>
                        <span className="rounded-full border border-border px-3 py-1 font-ndot text-[8px] tracking-[0.2em] text-foreground inline-flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${exp.status === 'ACTIVE' ? 'bg-foreground animate-pulse' : 'bg-muted-foreground'}`} />
                          {exp.status}
                        </span>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <ul className="mt-6 space-y-3 border-t border-border pt-5">
                            {exp.details.map((detail, j) => (
                              <li key={j} className="flex items-start gap-3">
                                <span className="mt-1.5 font-ndot text-[9px] text-muted-foreground">
                                  {String(j + 1).padStart(2, '0')}
                                </span>
                                <span className="font-mono text-xs text-muted-foreground leading-relaxed">
                                  {detail}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
