import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';

const experiences = [
  {
    role: 'AI/ML DEVELOPER INTERN',
    company: 'VERZEO',
    period: 'MAY 2023 – JUL 2023',
    status: 'DEPLOYED',
    details: [
      'Built deep learning models for medical image analysis using TensorFlow and Keras',
      'Implemented CNN architectures for disease classification with 92%+ accuracy',
      'Collaborated on data preprocessing pipelines for large-scale medical datasets',
    ],
  },
  {
    role: 'WEB DEVELOPER INTERN',
    company: 'OASIS INFOBYTE',
    period: 'JAN 2023 – FEB 2023',
    status: 'DEPLOYED',
    details: [
      'Developed responsive web applications using React.js and modern JavaScript',
      'Implemented RESTful API integrations and state management solutions',
      'Optimized front-end performance with code splitting and lazy loading',
    ],
  },
];

const ExperienceSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="experience" className="relative py-32 px-6" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="WORK_LOG" title="EXPERIENCE" number="03" />

        <div className="space-y-6">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.role}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.2 }}
              className="glass-panel-hover border-glow p-8 group relative overflow-hidden"
            >
              {/* Hover accent line */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-500" />

              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-ndot text-lg tracking-wide text-foreground">{exp.role}</h3>
                  <div className="font-ndot text-[10px] tracking-[0.3em] text-muted-foreground mt-1">
                    @ {exp.company}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-muted-foreground">{exp.period}</span>
                  <span className="glass-panel px-2 py-0.5 font-ndot text-[8px] tracking-[0.2em] text-foreground flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
                    {exp.status}
                  </span>
                </div>
              </div>

              <ul className="space-y-2">
                {exp.details.map((detail, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <span className="mt-2 h-[3px] w-[3px] bg-muted-foreground flex-shrink-0" />
                    <span className="font-mono text-xs text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                      {detail}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
