import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';

const AboutSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const diagnostics = [
    { label: 'LOCATION', value: 'VISAKHAPATNAM, IN' },
    { label: 'EDUCATION', value: 'B.TECH IT (CGPA: 8.5/10)' },
    { label: 'INSTITUTE', value: 'GVPCE (A), VISAKHAPATNAM' },
    { label: 'CORE STACK', value: 'PYTHON • FASTAPI • REACT' },
    { label: 'FOCUS', value: 'GENAI • RAG • VOICE AI' },
    { label: 'KEY ROLES', value: 'FARM VAIDYA • OPEN FORGE • GDSC' },
  ];

  const focusCapabilities = [
    'Generative AI & RAG Architectures',
    'Real-Time Voice AI Pipelines',
    'Python & FastAPI Backend Services',
    'Full-Stack Web Applications',
    'Computer Vision & Object Analytics',
  ];

  return (
    <section id="about" className="relative py-24 sm:py-28 px-4 sm:px-6" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="SYSTEM_PROFILE" title="ABOUT" number="01" />

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column - Core Narrative */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7 space-y-5 sm:space-y-6"
          >
            <div className="font-ndot text-xs sm:text-sm tracking-[0.2em] text-foreground">
              ENGINEERING INTELLIGENT SYSTEMS FROM CONCEPT TO PRODUCTION
            </div>

            <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed text-pretty font-normal">
              I am a GenAI Full-Stack Developer with a B.Tech in Information Technology from Gayatri Vidya
              Parishad College of Engineering (Autonomous), Visakhapatnam (GPA: 8.5/10). My work centers on
              engineering intelligent, production-ready systems that unite cutting-edge AI architectures with robust
              full-stack infrastructure.
            </p>

            <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed text-pretty font-normal">
              My hands-on experience includes developing knowledge-graph agricultural chatbots and real-time audio
              streaming workflows as a GenAI Engineer Intern at Farm Vaidya AI Tech, architecting computer vision safety
              scoring systems at CSIR-CRRI, and leading engineering delivery as Technical Lead at Open Forge and
              Cybersecurity Lead at GDSC GVPCE.
            </p>

            <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed text-pretty font-normal">
              I enjoy taking technical concepts end-to-end into working products—ranging from retrieval-augmented
              reasoning engines and voice interfaces to responsive dashboards, high-throughput APIs, and polished
              user applications.
            </p>

            {/* Core Capability Checklist */}
            <div className="pt-2">
              <div className="font-ndot text-[9px] tracking-[0.3em] text-muted-foreground mb-3">
                PRIMARY TECHNICAL DOMAINS
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {focusCapabilities.map((cap) => (
                  <div
                    key={cap}
                    className="flex items-center gap-2.5 p-2.5 rounded-sm border border-border/80 bg-foreground/[0.02]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                    <span className="font-ndot text-[10px] tracking-[0.14em] text-foreground/90">
                      {cap}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - System Diagnostics HUD Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 w-full"
          >
            <div className="hud-frame glass-panel p-5 sm:p-7 relative overflow-hidden">
              <span className="hud-corner hud-tl" />
              <span className="hud-corner hud-tr" />
              <span className="hud-corner hud-bl" />
              <span className="hud-corner hud-br" />

              <div className="flex items-center justify-between mb-5 border-b border-border/60 pb-3">
                <span className="font-ndot text-[9px] tracking-[0.3em] text-muted-foreground">
                  OPERATIONAL PARAMETERS
                </span>
                <span className="font-ndot text-[8px] tracking-[0.2em] px-2 py-0.5 rounded border border-border text-foreground">
                  STATUS // ACTIVE
                </span>
              </div>

              <div className="space-y-3.5">
                {diagnostics.map((d) => (
                  <div
                    key={d.label}
                    className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/30 pb-2.5 gap-1"
                  >
                    <span className="font-ndot text-[9px] tracking-[0.25em] text-muted-foreground">
                      {d.label}
                    </span>
                    <span className="font-ndot text-[10px] sm:text-[11px] tracking-[0.12em] text-foreground break-all sm:break-normal">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="font-ndot text-[8px] tracking-[0.25em] text-muted-foreground">
                  IDENTITY VERIFIED
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
                  <span className="font-ndot text-[8px] tracking-[0.2em] text-foreground">ONLINE</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
