import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import profilePhoto from '@/assets/murali-photo.png';

const HeroSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const techStack = [
    'REACT', 'PYTHON', 'TENSORFLOW', 'FLUTTER', 'DJANGO', 'FIGMA',
    'FIREBASE', 'MYSQL', 'GIT', 'DOCKER', 'LINUX', 'THREE.JS',
  ];

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 right-0 h-[1px] bg-foreground/10 animate-scan" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="inline-flex items-center gap-2 glass-panel px-3 py-1"
            >
              <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
              <span className="font-ndot text-[10px] tracking-[0.3em] text-foreground">
                AVAILABLE FOR WORK
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-ndot text-5xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-tight text-foreground text-glow"
            >
              MURALI
              <br />
              <span className="text-muted-foreground">PAILA</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="font-mono text-sm text-muted-foreground max-w-md leading-relaxed"
            >
              Full-Stack Developer & AI/ML Enthusiast crafting intelligent digital experiences 
              with clean architecture and innovative solutions.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="flex gap-8"
            >
              {[
                { label: 'PROJECTS', value: '10+' },
                { label: 'EXPERIENCE', value: '2YRS' },
                { label: 'TECH STACK', value: '15+' },
              ].map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <div className="font-ndot text-2xl text-foreground">{stat.value}</div>
                  <div className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="flex gap-4"
            >
              <a
                href="#contact"
                className="glass-panel-hover border-glow px-6 py-3 font-ndot text-[10px] tracking-[0.3em] text-foreground inline-flex items-center gap-2"
                data-cursor-hover
              >
                <span className="h-1.5 w-1.5 bg-foreground" />
                CONTACT ME
              </a>
              <a
                href="#projects"
                className="glass-panel-hover px-6 py-3 font-ndot text-[10px] tracking-[0.3em] text-muted-foreground hover:text-foreground"
                data-cursor-hover
              >
                VIEW WORK →
              </a>
            </motion.div>
          </div>

          {/* Right - Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex justify-center"
          >
            <div className="relative">
              {/* Crosshair markers */}
              <div className="absolute -top-4 -left-4 w-8 h-8 border-t border-l border-foreground/30" />
              <div className="absolute -top-4 -right-4 w-8 h-8 border-t border-r border-foreground/30" />
              <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b border-l border-foreground/30" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b border-r border-foreground/30" />

              {/* Pulse ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-[90%] w-[90%] rounded-full border border-foreground/10 animate-pulse-ring" />
              </div>

              {/* Photo */}
              <div className="relative w-64 h-80 lg:w-80 lg:h-96 overflow-hidden glass-panel">
                <img
                  src={profilePhoto}
                  alt="Murali Paila"
                  className="w-full h-full object-cover grayscale contrast-125"
                />
                {/* Overlay scanline */}
                <div className="absolute inset-0 scanline" />
                <div className="absolute inset-0 bg-background/10" />
              </div>

              {/* Label */}
              <div className="absolute -bottom-8 left-0 right-0 text-center">
                <span className="font-ndot text-[8px] tracking-[0.4em] text-muted-foreground">
                  SUBJECT_001 // DEVELOPER
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tech marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="mt-24 overflow-hidden border-t border-b border-border py-4"
        >
          <div className="marquee-track">
            {[...techStack, ...techStack].map((tech, i) => (
              <span key={i} className="mx-8 font-ndot text-[10px] tracking-[0.3em] text-muted-foreground whitespace-nowrap">
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
