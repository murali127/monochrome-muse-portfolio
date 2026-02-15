import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';

const skillCategories = [
  {
    title: 'LANGUAGES',
    skills: ['Python', 'JavaScript', 'C', 'C++', 'Java', 'HTML5', 'CSS3', 'SQL'],
  },
  {
    title: 'FRAMEWORKS',
    skills: ['React.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Streamlit'],
  },
  {
    title: 'DATABASES & TOOLS',
    skills: ['MongoDB', 'MySQL', 'PostgreSQL', 'SQLite', 'Git', 'Docker', 'Postman', 'Netlify'],
  },
  {
    title: 'AI / ML',
    skills: ['RAG', 'LightRAG', 'YOLOX', 'TensorFlow', 'OpenCV', 'NumPy', 'Pandas', 'Gemini API'],
  },
];

const SkillsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="skills" className="relative py-32 px-6 dot-grid-bg" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="CAPABILITIES" title="SKILLS" number="02" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="glass-panel-hover border-glow p-6 group"
            >
              <div className="font-ndot text-[10px] tracking-[0.3em] text-foreground mb-6 flex items-center gap-2">
                <span className="h-1 w-4 bg-foreground group-hover:w-8 transition-all duration-300" />
                {cat.title}
              </div>
              <div className="space-y-3">
                {cat.skills.map((skill) => (
                  <div key={skill} className="flex items-center gap-3">
                    <span className="h-[3px] w-[3px] bg-muted-foreground" />
                    <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
