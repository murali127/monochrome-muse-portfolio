import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';

const projects = [
  {
    title: 'MEDIVISION AI',
    type: 'AI / DEEP LEARNING',
    description: 'AI-powered medical image analysis platform using CNN architectures for disease detection and classification with 92%+ accuracy.',
    tech: ['TENSORFLOW', 'KERAS', 'PYTHON', 'OPENCV'],
    metrics: { accuracy: '92%+', models: '3', dataset: '10K+' },
  },
  {
    title: 'SMARTCAMPUS',
    type: 'FULL-STACK WEB APP',
    description: 'Comprehensive campus management system with real-time analytics, attendance tracking, and automated reporting.',
    tech: ['REACT', 'DJANGO', 'MYSQL', 'REST API'],
    metrics: { users: '500+', uptime: '99.9%', apis: '25+' },
  },
  {
    title: 'CHATBOT NLP',
    type: 'NLP / AI',
    description: 'Intelligent conversational AI chatbot with natural language understanding, context awareness, and multi-turn dialogue.',
    tech: ['PYTHON', 'NLP', 'TENSORFLOW', 'FLASK'],
    metrics: { accuracy: '89%', intents: '50+', response: '<1s' },
  },
  {
    title: 'PORTFOLIO 3D',
    type: 'CREATIVE / WEB',
    description: 'This immersive Nothing-themed portfolio with Three.js 3D graphics, particle systems, and glassmorphism UI.',
    tech: ['REACT', 'THREE.JS', 'FRAMER', 'TAILWIND'],
    metrics: { fps: '60', effects: '10+', score: '95+' },
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
