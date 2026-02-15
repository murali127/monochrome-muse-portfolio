import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';

const AboutSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '200px 0px' });

  const diagnostics = [
    { label: 'LOCATION', value: 'VISAKHAPATNAM, IN' },
    { label: 'STATUS', value: 'ACTIVE' },
    { label: 'EDUCATION', value: 'B.TECH IT' },
    { label: 'UNIVERSITY', value: 'GVPCE(A)' },
    { label: 'GPA', value: '8.5 / 10' },
    { label: 'FOCUS', value: 'GEN AI + FULL-STACK' },
  ];

  return (
    <section id="about" className="relative py-32 px-6" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="SYSTEM_INFO" title="ABOUT" number="01" />

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <p className="font-body text-base text-muted-foreground leading-relaxed">
              I'm a Gen AI Engineer and Full-Stack Developer pursuing B.Tech in Information Technology 
              at Gayatri Vidya Parishad College of Engineering. I specialize in building intelligent, 
              production-ready applications from RAG-powered chatbots to scalable full-stack dashboards.
            </p>
            <p className="font-body text-base text-muted-foreground leading-relaxed">
              Currently working at Farm Vaidya AI Tech on real-time agriculture chatbots with LightRAG 
              integration. Previously built computer vision systems at CSIR-CRRI and OCR solutions at 
              Infosys Springboard. I turn complex AI challenges into elegant, deployable solutions.
            </p>
            <div className="pt-4 flex gap-4">
              <a href="https://github.com/murali127" target="_blank" className="glass-panel-hover px-4 py-2 font-ndot text-[9px] tracking-[0.2em] text-foreground" data-cursor-hover>
                GITHUB →
              </a>
              <a href="https://www.linkedin.com/in/muralipaila/" target="_blank" className="glass-panel-hover px-4 py-2 font-ndot text-[9px] tracking-[0.2em] text-foreground" data-cursor-hover>
                LINKEDIN →
              </a>
              <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="glass-panel-hover border-glow px-4 py-2 font-ndot text-[9px] tracking-[0.2em] text-foreground" data-cursor-hover>
                VIEW RESUME
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="glass-panel border-glow p-6 space-y-4"
          >
            <div className="font-ndot text-[10px] tracking-[0.3em] text-foreground mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-foreground animate-pulse" />
              SYSTEM DIAGNOSTICS
            </div>
            {diagnostics.map((d, i) => (
              <div key={d.label} className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="font-ndot text-[9px] tracking-[0.2em] text-muted-foreground">{d.label}</span>
                <span className="font-mono text-xs text-foreground">{d.value}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
