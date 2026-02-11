import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';

const achievements = [
  { title: 'SMART INDIA HACKATHON', detail: 'National level finalist — Built AI-powered solution', year: '2023' },
  { title: 'CODING COMPETITIONS', detail: 'Multiple wins in university-level coding contests', year: '2022-23' },
  { title: 'RESEARCH PAPER', detail: 'Published work on deep learning in medical imaging', year: '2023' },
  { title: 'OPEN SOURCE', detail: 'Active contributor to ML/AI open source projects', year: 'ONGOING' },
  { title: 'CERTIFICATIONS', detail: 'TensorFlow, Python, Web Development certifications', year: '2022-23' },
  { title: 'LEADERSHIP', detail: 'Led technical teams in multiple project deliveries', year: '2023' },
];

const AchievementsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-32 px-6" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="ACHIEVEMENTS" title="MILESTONES" number="05" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-panel-hover p-6 group relative overflow-hidden"
              data-cursor-hover
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground">{a.year}</span>
                <span className="h-1 w-1 bg-foreground/30 group-hover:bg-foreground transition-colors duration-300" />
              </div>
              <h4 className="font-ndot text-sm tracking-wide text-foreground mb-2">{a.title}</h4>
              <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">{a.detail}</p>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-foreground/0 group-hover:bg-foreground/20 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;
