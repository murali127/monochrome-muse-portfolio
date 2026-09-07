import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';

const projects = [
  {
    title: 'SEVAK DASHBOARD',
    type: 'PRODUCTION DASHBOARD',
    description: 'Full-stack dashboard to fetch Pipecat logs with multi-level auth (master, superadmin, admin, user). Supports 300-400+ daily chatbot sessions with real-time visualization.',
    tech: ['MERN STACK', 'PIPECAT', 'RBAC', 'REAL-TIME'],
    metrics: { sessions: '400+', roles: '4', uptime: '99%' },
  },
  {
    title: 'COUNSELING FORMS',
    type: 'FULL-STACK WEB APP',
    description: '1:1 digital replica of physical counseling form. 100% paperless with 3-level RBAC, automated data extraction, time-bound access. Proposed for college-wide adoption.',
    tech: ['MONGODB', 'EXPRESS', 'REACT', 'NODE.JS'],
    metrics: { paper: '0%', roles: '3', status: 'PROPOSED' },
  },
  {
    title: 'CHECKMATE',
    type: 'AI / OCR',
    description: 'Cheque validation system using OCR and Gemini API. Detects, extracts, and stores cheque data from PDFs with 80% accuracy through optimized prompting.',
    tech: ['PYTHON', 'STREAMLIT', 'GEMINI API', 'OCR'],
    metrics: { accuracy: '80%', format: 'PDF', deploy: 'LIVE' },
  },
  {
    title: 'ASK ME AI CHATBOT',
    type: 'AI / NLP',
    description: 'PDF querying chatbot with context-aware Q&A using Streamlit and Gemini API. Achieves 75% accuracy for document-based queries.',
    tech: ['PYTHON', 'STREAMLIT', 'GEMINI', 'NLP'],
    metrics: { accuracy: '75%', queries: 'PDF', response: '<2s' },
  },
  {
    title: 'EVENT RSVP',
    type: 'FULL-STACK',
    description: 'RSVP management system with token-based auth. Built in both MERN stack and Java Servlets. Complete architecture with comprehensive API testing.',
    tech: ['MERN', 'JAVA', 'JWT', 'POSTMAN'],
    metrics: { stacks: '2', tests: '15+', apis: '10+' },
  },
];

const ProjectsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section id="projects" className="relative py-32 px-6 overflow-hidden" ref={ref}>
      <div className="pointer-events-none absolute inset-0 opacity-30 dot-grid-bg" />
      <div className="mx-auto max-w-7xl relative">
        <SectionHeader label="OUTPUT_LOG" title="PROJECTS" number="04" />

        <div className="grid md:grid-cols-2 gap-5">
          {projects.map((project, i) => (
            <motion.article
              key={project.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`hud-frame glass-panel group relative overflow-hidden p-8 ${
                i === 0 ? 'md:col-span-2 md:grid md:grid-cols-2 md:gap-10' : ''
              }`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                transform: hoveredIdx === i ? 'translateY(-4px)' : undefined,
                transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                boxShadow: hoveredIdx === i ? '0 0 40px hsl(var(--foreground) / 0.08)' : undefined,
              }}
              data-cursor-hover
            >
              <span className="hud-corner hud-tl" />
              <span className="hud-corner hud-tr" />
              <span className="hud-corner hud-bl" />
              <span className="hud-corner hud-br" />

              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute left-0 right-0 h-16 bg-gradient-to-b from-foreground/5 to-transparent animate-[scan_4s_linear_infinite]" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-ndot text-[9px] tracking-[0.3em] text-muted-foreground">{project.type}</span>
                  <span className="font-ndot text-[10px] tracking-[0.2em] text-foreground/50">
                    PRJ_{String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="font-ndot text-2xl sm:text-3xl text-foreground mb-4 text-glow">{project.title}</h3>

                <p className="font-mono text-xs text-muted-foreground leading-relaxed mb-6 max-w-xl">
                  {project.description}
                </p>
              </div>

              <div className="flex flex-col justify-end">
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {Object.entries(project.metrics).map(([key, val]) => (
                    <div key={key} className="border border-border/80 px-3 py-3">
                      <div className="font-ndot text-lg text-foreground">{val}</div>
                      <div className="font-ndot text-[7px] tracking-[0.22em] text-muted-foreground">{key.toUpperCase()}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border px-3 py-1 font-ndot text-[8px] tracking-[0.18em] text-muted-foreground group-hover:border-foreground/30 group-hover:text-foreground/80 transition-all duration-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
