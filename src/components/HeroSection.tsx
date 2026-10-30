import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import profilePhoto from '@/assets/murali-photo.png';

const HeroSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const techStack = [
    'PYTHON',
    'REACT',
    'FASTAPI',
    'LIGHTRAG',
    'PIPECAT',
    'AGORA AI',
    'SARVAM STT',
    'NEXT.JS',
    'TYPESCRIPT',
    'MONGODB',
    'POSTGRESQL',
    'OPENCV',
    'DOCKER',
  ];

  const focusAreas = [
    'GEN AI & RAG',
    'VOICE AI PIPELINES',
    'FULL-STACK SYSTEMS',
    'BACKEND APIS',
  ];

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 right-0 h-[1px] bg-foreground/10 animate-scan" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 w-full pt-24 sm:pt-28 pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Left - Text Content */}
          <div className="space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 glass-panel px-3.5 py-1.5 rounded-full"
            >
              <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
              <span className="font-ndot text-[9px] sm:text-[10px] tracking-[0.25em] text-foreground">
                GENAI FULL-STACK DEVELOPER
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-ndot text-4xl sm:text-7xl lg:text-8xl leading-[0.95] sm:leading-[0.9] tracking-tight text-foreground text-glow break-words"
            >
              MURALI
              <br />
              <span className="text-muted-foreground">PAILA</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="font-mono text-xs sm:text-base text-muted-foreground max-w-xl leading-relaxed"
            >
              I build intelligent AI-powered products and scalable full-stack applications.
              Specialized in conversational AI, RAG architectures, real-time Voice AI pipelines,
              and production backend engineering.
            </motion.p>

            {/* Core Focus Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex flex-wrap gap-2 pt-1"
            >
              {focusAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-sm border border-border/80 bg-foreground/[0.03] px-2.5 sm:px-3 py-1 font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] text-foreground/80"
                >
                  {area}
                </span>
              ))}
            </motion.div>

            {/* Primary Calls To Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-2"
            >
              <a
                href="#projects"
                className="nav-cta rounded-full px-6 py-3.5 font-ndot text-[10px] sm:text-[11px] tracking-[0.25em] inline-flex items-center justify-center gap-2 group transition-all"
                data-cursor-hover
              >
                <span>EXPLORE PROJECTS</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>

              <a
                href="#contact"
                className="glass-panel-hover border-glow px-6 py-3.5 font-ndot text-[10px] sm:text-[11px] tracking-[0.25em] text-foreground inline-flex items-center justify-center gap-2 rounded-full"
                data-cursor-hover
              >
                <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                <span>CONTACT ME</span>
              </a>

              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel px-4 py-3.5 font-ndot text-[9px] sm:text-[10px] tracking-[0.2em] text-muted-foreground hover:text-foreground rounded-full transition-colors inline-flex items-center justify-center gap-1.5"
                data-cursor-hover
              >
                <span>VIEW RESUME</span>
                <span>↗</span>
              </a>
            </motion.div>
          </div>

          {/* Right - Profile Photo HUD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex justify-center mt-6 lg:mt-0"
          >
            <div className="relative">
              {/* Tactical Crosshair Markers */}
              <div className="absolute -top-3 sm:-top-4 -left-3 sm:-left-4 w-6 sm:w-8 h-6 sm:h-8 border-t border-l border-foreground/40" />
              <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 w-6 sm:w-8 h-6 sm:h-8 border-t border-r border-foreground/40" />
              <div className="absolute -bottom-3 sm:-bottom-4 -left-3 sm:-left-4 w-6 sm:w-8 h-6 sm:h-8 border-b border-l border-foreground/40" />
              <div className="absolute -bottom-3 sm:-bottom-4 -right-3 sm:-right-4 w-6 sm:w-8 h-6 sm:h-8 border-b border-r border-foreground/40" />

              {/* Pulse Ring */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-[92%] w-[92%] rounded-full border border-foreground/15 animate-pulse-ring" />
              </div>

              {/* Grayscale Profile Photo Container */}
              <div className="relative w-60 h-72 sm:w-72 sm:h-[22rem] lg:w-80 lg:h-96 overflow-hidden glass-panel border border-border">
                <img
                  src={profilePhoto}
                  alt="Murali Paila"
                  className="w-full h-full object-cover grayscale contrast-125"
                  loading="eager"
                />
                {/* Scanline CRT overlay */}
                <div className="absolute inset-0 scanline" />
                <div className="absolute inset-0 bg-background/10 pointer-events-none" />
              </div>

              {/* Hardware Telemetry Label */}
              <div className="absolute -bottom-7 left-0 right-0 text-center">
                <span className="font-ndot text-[8px] tracking-[0.35em] text-muted-foreground">
                  SUBJECT_001 // GENAI_ENGINEER
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tech Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="mt-16 sm:mt-20 overflow-hidden border-t border-b border-border py-3.5 sm:py-4"
        >
          <div className="marquee-track">
            {[...techStack, ...techStack].map((tech, i) => (
              <span
                key={i}
                className="mx-6 sm:mx-8 font-ndot text-[9px] sm:text-[10px] tracking-[0.3em] text-muted-foreground whitespace-nowrap"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
