import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { playTactileClick } from '@/utils/audioFeedback';

const HudCorners = () => (
  <>
    <span className="hud-corner hud-tl" />
    <span className="hud-corner hud-tr" />
    <span className="hud-corner hud-bl" />
    <span className="hud-corner hud-br" />
  </>
);

const coursework = [
  'Data Structures & Algorithms',
  'Object-Oriented Programming',
  'Database Management Systems',
  'Operating Systems',
  'Computer Networks',
];

const EducationSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="education" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="pointer-events-none absolute inset-0 opacity-30 grid-lines-bg" />
      <div className="mx-auto max-w-7xl relative">
        <SectionHeader label="ACADEMIC_RECORD // VERIFIED" title="EDUCATION" number="02" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="hud-frame glass-panel p-5 sm:p-10 relative overflow-hidden"
        >
          <HudCorners />

          {/* Laser scanning beam accent */}
          <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
            <div className="h-px w-1/3 bg-foreground/40 animate-[beam_4s_linear_infinite]" />
          </div>

          <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8 items-start">
            {/* Primary Academic Record */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-ndot text-[9px] tracking-[0.25em] px-2.5 py-1 rounded bg-foreground/10 text-foreground border border-foreground/30 inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                  STATUS // GRADUATED
                </span>
                <span className="font-ndot text-[9px] tracking-[0.25em] text-muted-foreground">
                  DEGREE CONFERRED
                </span>
              </div>

              <div>
                <h3 className="font-ndot text-xl sm:text-2xl lg:text-3xl text-foreground text-glow tracking-wide">
                  BACHELOR OF TECHNOLOGY
                </h3>
                <div className="font-ndot text-sm sm:text-base text-foreground/80 tracking-widest mt-1">
                  INFORMATION TECHNOLOGY
                </div>
                <div className="font-ndot text-[11px] sm:text-xs text-muted-foreground tracking-[0.2em] mt-2 uppercase">
                  Gayatri Vidya Parishad College of Engineering (Autonomous)
                </div>
                <div className="font-body text-xs sm:text-sm text-muted-foreground mt-1 font-normal">
                  Visakhapatnam, Andhra Pradesh, India
                </div>
              </div>

              {/* Core Coursework */}
              <div className="pt-4 border-t border-border/50">
                <div className="font-ndot text-[9px] tracking-[0.3em] text-muted-foreground mb-3">
                  CORE TECHNICAL CURRICULUM
                </div>
                <div className="flex flex-wrap gap-2">
                  {coursework.map((course) => (
                    <span
                      key={course}
                      onMouseEnter={() => playTactileClick('subtle')}
                      className="px-3 py-1.5 font-ndot text-[9px] sm:text-[10px] tracking-[0.16em] text-foreground/90 border border-border/80 bg-background/60 hover:bg-foreground/5 hover:border-foreground/60 transition-colors rounded-xs cursor-default"
                      data-cursor-hover
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Metric & Diagnostics Box */}
            <div className="hud-frame glass-panel p-5 sm:p-6 space-y-5 sm:space-y-6 border border-border/60">
              <HudCorners />

              <div>
                <div className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground mb-1">
                  CUMULATIVE PERFORMANCE
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-ndot text-4xl sm:text-5xl text-foreground text-glow">8.5</span>
                  <span className="font-ndot text-xs sm:text-sm text-muted-foreground tracking-widest">/ 10.0 CGPA</span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-foreground/80 w-[85%]" />
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-border/40 font-ndot text-[9px] tracking-[0.2em]">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>INSTITUTE:</span>
                  <span className="text-foreground">GVPCE(A)</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>PROGRAM:</span>
                  <span className="text-foreground">B.TECH (IT)</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>LOCATION:</span>
                  <span className="text-foreground">VISAKHAPATNAM</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>STATUS:</span>
                  <span className="text-foreground">GRADUATED</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>VERIFICATION:</span>
                  <span className="text-foreground inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                    DEGREE CONFERRED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EducationSection;
