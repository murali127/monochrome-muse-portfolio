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
    <section id="projects" className="relative py-32 px-6 grid-lines-bg" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="OUTPUT_LOG" title="PROJECTS" number="04" />

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="glass-panel-hover border-glow p-8 group relative overflow-hidden"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              data-cursor-hover
            >
              {/* Corner accents */}
              <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-foreground/0 group-hover:border-foreground/20 transition-all duration-500" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-foreground/0 group-hover:border-foreground/20 transition-all duration-500" />

              <div className="flex items-center justify-between mb-4">
                <span className="font-ndot text-[9px] tracking-[0.3em] text-muted-foreground">{project.type}</span>
                <span className="font-mono text-[10px] text-muted-foreground">#{String(i + 1).padStart(2, '0')}</span>
              </div>

              <h3 className="font-ndot text-2xl text-foreground mb-3 text-glow">{project.title}</h3>

              <p className="font-mono text-xs text-muted-foreground leading-relaxed mb-6 group-hover:text-foreground/70 transition-colors duration-300">
                {project.description}
              </p>

              {/* Metrics */}
              <div className="flex gap-4 mb-6">
                {Object.entries(project.metrics).map(([key, val]) => (
                  <div key={key} className="glass-panel px-3 py-1.5">
                    <div className="font-ndot text-sm text-foreground">{val}</div>
                    <div className="font-ndot text-[7px] tracking-[0.2em] text-muted-foreground">{key.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              {/* Tech tags */}
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span key={t} className="font-ndot text-[8px] tracking-[0.2em] text-muted-foreground border border-border px-2 py-1 group-hover:border-foreground/20 group-hover:text-foreground/60 transition-all duration-300">
                    {t}
                  </span>
                ))}
              </div>

              {/* Hover reveal line */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-[1px] bg-foreground/30"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: hoveredIdx === i ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                style={{ transformOrigin: 'left' }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
