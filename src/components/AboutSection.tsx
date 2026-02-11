import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';

const AboutSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const diagnostics = [
    { label: 'LOCATION', value: 'HYDERABAD, IN' },
    { label: 'STATUS', value: 'ACTIVE' },
    { label: 'EDUCATION', value: 'B.TECH CSE' },
    { label: 'UNIVERSITY', value: 'GITAM' },
    { label: 'GPA', value: '8.19 / 10' },
    { label: 'FOCUS', value: 'AI/ML + WEB' },
  ];

  return (
    <section id="about" className="relative py-32 px-6" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="SYSTEM_INFO" title="ABOUT" number="01" />

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6"
          >
            <p className="font-body text-base text-muted-foreground leading-relaxed">
              I'm a full-stack developer and AI/ML enthusiast pursuing B.Tech in Computer Science 
              at GITAM University. I specialize in building intelligent, scalable web applications 
              that bridge the gap between cutting-edge AI and practical user experiences.
            </p>
            <p className="font-body text-base text-muted-foreground leading-relaxed">
              From deep learning models for medical imaging to real-time collaborative platforms, 
              I thrive on turning complex problems into elegant solutions. My approach combines 
              clean architecture with innovative thinking.
            </p>
            <div className="pt-4 flex gap-4">
              <a href="https://github.com/muralipaila" target="_blank" className="glass-panel-hover px-4 py-2 font-ndot text-[9px] tracking-[0.2em] text-foreground" data-cursor-hover>
                GITHUB →
              </a>
              <a href="https://linkedin.com/in/muralipaila" target="_blank" className="glass-panel-hover px-4 py-2 font-ndot text-[9px] tracking-[0.2em] text-foreground" data-cursor-hover>
                LINKEDIN →
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
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
