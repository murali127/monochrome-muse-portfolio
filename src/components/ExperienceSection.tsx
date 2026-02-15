import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';

const experiences = [
  {
    role: 'GEN AI ENGINEER INTERN',
    company: 'FARM VAIDYA AI TECH PVT LTD',
    period: 'DEC 2025 – PRESENT',
    status: 'ACTIVE',
    details: [
      'Developed agriculture chatbot using RAG & LightRAG, integrated Agora AI + Sarvam STT for real-time workflows',
      'Built full-stack dashboard for Pipecat logs visualization with role-based access control',
      'Maintain production chatbot handling 300-400+ daily sessions through monitoring & bug fixes',
      'Participated in load testing, deployment support, and cross-team coordination for production stability',
    ],
  },
  {
    role: 'TECHNICAL LEAD',
    company: 'OPEN FORGE, GVPCE',
    period: 'OCT 2024 – PRESENT',
    status: 'ACTIVE',
    details: [
      'Led agile-based full-stack development, improving sprint efficiency by 20%',
      'Directed code reviews and maintained CI/CD pipelines using GitHub Actions',
      'Coordinated team of developers on multiple full-stack projects using MERN stack',
    ],
  },
  {
    role: 'CYBERSECURITY LEAD',
    company: 'GDSC, GVPCE',
    period: 'NOV 2024 – PRESENT',
    status: 'ACTIVE',
    details: [
      'Delivered interactive cybersecurity and blockchain sessions to 100+ students',
      'Initiated capture-the-flag events to promote ethical hacking practices',
      'Organized 3 cybersecurity awareness events promoting safe digital practices',
    ],
  },
  {
    role: 'RESEARCH INTERN',
    company: 'CSIR-CRRI (DELHI)',
    period: 'APR 2025 – MAY 2025',
    status: 'COMPLETED',
    details: [
      'Built real-time Road Safety Scoring System using YOLOX, ByteTrack, OpenCV & Streamlit',
      'Collaborated with senior scientists & IIT Delhi experts on 4-week research project',
      'Implemented ROI-based filtering to improve object detection precision for safety analytics',
      'Achieved 65-70% detection accuracy with limited training datasets',
    ],
  },
  {
    role: 'AI/ML INTERN',
    company: 'INFOSYS SPRINGBOARD',
    period: 'JAN 2025 – APR 2025',
    status: 'COMPLETED',
    details: [
      'Engineered cheque automation pipeline with OCR & Python, reducing manual entry by 25%',
      'Developed AI-powered form processing tool deployed via Streamlit',
      'Proposed unique solution contributing significantly to final product accuracy & team success',
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
