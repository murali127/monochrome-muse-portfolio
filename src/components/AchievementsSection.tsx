import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';

const achievements = [
  { title: 'DTI IDEATHON 2024', detail: 'Top 2 finalist — Developed innovative MERN stack platform', year: '2024' },
  { title: 'PRODUCTION SYSTEM', detail: 'Sevak Dashboard supporting 300-400+ daily sessions in production', year: '2025' },
  { title: 'CISCO CERTIFICATIONS', detail: 'CCNA, Python Essentials, Introduction to Cybersecurity', year: '2024-25' },
  { title: 'TECHNICAL LEAD', detail: 'Open Forge GVPCE — Improved sprint efficiency by 20%, CI/CD pipeline management', year: '2024-26' },
  { title: 'CYBERSECURITY LEAD', detail: 'GDSC GVPCE — 3 events + 100+ students, CTF competitions organized', year: '2024-26' },
  { title: 'INFOSYS SPRINGBOARD', detail: 'Proposed unique solution contributing to product accuracy & team success', year: '2025' },
  { title: 'POSTMAN API EXPERT', detail: 'API Fundamentals Student Expert certification', year: '2025' },
  { title: 'NIT ROURKELA', detail: 'Deep Learning certification', year: '2024' },
  { title: 'NPTEL BLOCKCHAIN', detail: 'Blockchain Technology certification', year: '2024' },
  { title: 'COURSERA', detail: 'Foundations of Cybersecurity', year: '2024' },
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
