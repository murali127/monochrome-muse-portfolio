import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';

const skillCategories = [
  {
    title: 'LANGUAGES',
    code: 'SYS.01',
    skills: ['Python', 'JavaScript', 'C', 'C++', 'Java', 'HTML5', 'CSS3', 'SQL'],
  },
  {
    title: 'FRAMEWORKS',
    code: 'SYS.02',
    skills: ['React.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Streamlit'],
  },
  {
    title: 'DATABASES & TOOLS',
    code: 'SYS.03',
    skills: ['MongoDB', 'MySQL', 'PostgreSQL', 'SQLite', 'Git', 'Docker', 'Postman', 'Netlify'],
  },
  {
    title: 'AI / ML',
    code: 'SYS.04',
    skills: ['RAG', 'LightRAG', 'YOLOX', 'TensorFlow', 'OpenCV', 'NumPy', 'Pandas', 'Gemini API'],
  },
];

const HudCorners = () => (
  <>
    <span className="hud-corner hud-tl" />
    <span className="hud-corner hud-tr" />
    <span className="hud-corner hud-bl" />
    <span className="hud-corner hud-br" />
  </>
);

const SkillsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [active, setActive] = useState(0);
  const current = skillCategories[active];

  return (
    <section id="skills" className="relative py-32 px-6 overflow-hidden" ref={ref}>
      <div className="pointer-events-none absolute inset-0 opacity-40 grid-lines-bg" />
      <div className="mx-auto max-w-7xl relative">
        <SectionHeader label="CAPABILITIES" title="SKILLS" number="02" />

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            className="hud-frame glass-panel p-3 space-y-2"
          >
            <HudCorners />
            <div className="font-ndot text-[8px] tracking-[0.35em] text-muted-foreground px-3 py-2">
              MODULE SELECT
            </div>
            {skillCategories.map((cat, i) => (
              <button
                key={cat.title}
                onClick={() => setActive(i)}
                className={`w-full text-left px-4 py-3 rounded-sm transition-all duration-300 ${
                  active === i ? 'bg-foreground text-background' : 'hover:bg-foreground/5'
                }`}
                data-cursor-hover
              >
                <div className="flex items-center justify-between">
                  <span className="font-ndot text-[10px] tracking-[0.22em]">{cat.title}</span>
                  <span className="font-ndot text-[8px] tracking-[0.2em] opacity-60">{cat.code}</span>
                </div>
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="hud-frame glass-panel p-8 min-h-[380px] relative overflow-hidden"
          >
            <HudCorners />
            <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
              <div className="h-px w-1/3 bg-foreground/50 animate-[beam_3.5s_linear_infinite]" />
            </div>

            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="font-ndot text-[9px] tracking-[0.4em] text-muted-foreground mb-2">
                  {current.code} // LOADED
                </div>
                <h3 className="font-ndot text-3xl text-foreground text-glow">{current.title}</h3>
              </div>
              <div className="font-ndot text-5xl text-foreground/10 leading-none">
                {String(current.skills.length).padStart(2, '0')}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {current.skills.map((skill, i) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="skill-chip px-4 py-2 font-ndot text-[11px] tracking-[0.18em] text-foreground"
                  data-cursor-hover
                >
                  <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-foreground/70" />
                  {skill}
                </motion.span>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6">
              {['LATENCY', 'SYNC', 'STATUS'].map((label, i) => (
                <div key={label}>
                  <div className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground mb-2">{label}</div>
                  <div className="flex items-end gap-1 h-8">
                    {Array.from({ length: 8 }).map((_, bar) => (
                      <span
                        key={bar}
                        className="signal-bar w-1.5 bg-foreground/70"
                        style={{
                          height: `${30 + ((i + bar) % 5) * 14}%`,
                          animationDelay: `${bar * 0.12}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
