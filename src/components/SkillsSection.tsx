import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { skillsData, SkillCategory } from '@/data/skills';
import { playTactileClick } from '@/utils/audioFeedback';

interface SkillTelemetry {
  spec: string;
  latency: string;
  throughput: string;
  reliability: string;
}

const skillTelemetryData: Record<string, SkillTelemetry> = {
  'Python': { spec: 'SYS.PY312 // CPYTHON', latency: '1.2ms', throughput: 'OPTIMIZED', reliability: '99.99%' },
  'Java': { spec: 'SYS.JVM21 // LTS', latency: '<1.0ms GC', throughput: 'TIER-4 JIT', reliability: '99.98%' },
  'JavaScript': { spec: 'SYS.V8_TURBO', latency: '0.8ms', throughput: 'ASYNC IO', reliability: '99.95%' },
  'TypeScript': { spec: 'SYS.TS_STRICT', latency: '0.0ms RUNTIME', throughput: 'AST VERIFIED', reliability: '100%' },
  'C': { spec: 'SYS.POSIX_C11', latency: '<0.2ms', throughput: 'DIRECT MEMORY', reliability: '99.99%' },
  'C++': { spec: 'SYS.CPP20_SIMD', latency: '<0.3ms', throughput: 'SIMD VECTOR', reliability: '99.99%' },
  'Generative AI': { spec: 'SYS.NEURAL_GEN', latency: '<550ms TTFT', throughput: 'AGENTIC LOOPS', reliability: '99.92%' },
  'Retrieval-Augmented Generation (RAG)': { spec: 'SYS.RAG_HYBRID', latency: '18ms VECTOR', throughput: 'RECALL@5: 94.2%', reliability: '99.94%' },
  'LightRAG': { spec: 'SYS.LIGHTRAG_2', latency: '24ms GRAPH', throughput: 'DUAL GRAPH HOPS', reliability: '99.95%' },
  'LLM Integration': { spec: 'SYS.LLM_STREAM', latency: '<280ms STREAM', throughput: '128K CTX', reliability: '99.90%' },
  'Computer Vision': { spec: 'SYS.CV_CORE', latency: '31.2ms (32 FPS)', throughput: '1080P REALTIME', reliability: '99.88%' },
  'YOLOX': { spec: 'SYS.YOLOX_DET', latency: '14.2ms INFER', throughput: '42.4 mAP', reliability: '99.91%' },
  'ByteTrack': { spec: 'SYS.BYTE_TRACK', latency: '3.1ms ASSOC', throughput: '0 MISSED HITS', reliability: '99.97%' },
  'TensorFlow': { spec: 'SYS.TF_GRAPH', latency: 'GPU TENSOR', throughput: 'XLA COMPILED', reliability: '99.95%' },
  'OpenCV': { spec: 'SYS.CV_MATRIX', latency: '4.8ms FRAME', throughput: 'GPU ACCEL', reliability: '99.96%' },
  'FastAPI': { spec: 'SYS.ASGI_FAST', latency: '14.8ms P99', throughput: '18.4K REQ/SEC', reliability: '99.99%' },
  'Node.js': { spec: 'SYS.NODE_LTS', latency: '1.4ms', throughput: 'UV EVENT POOL', reliability: '99.97%' },
  'Express.js': { spec: 'SYS.EXPRESS_ROUT', latency: '2.1ms', throughput: 'FAST ROUTING', reliability: '99.96%' },
  'Django': { spec: 'SYS.DJANGO_ORM', latency: '18ms P95', throughput: 'ORM CACHED', reliability: '99.98%' },
  'NestJS': { spec: 'SYS.NEST_ARCH', latency: '3.4ms', throughput: 'MODULAR DI', reliability: '99.97%' },
  'React': { spec: 'SYS.REACT_FIBER', latency: '16.6ms (60 FPS)', throughput: 'CONCURRENT UI', reliability: '100%' },
  'Next.js': { spec: 'SYS.NEXT_EDGE', latency: '42ms TTFB', throughput: 'EDGE SSR', reliability: '99.99%' },
  'HTML': { spec: 'SYS.SEMANTIC_DOM', latency: '0ms REFLOW', throughput: 'W3C COMPLIANT', reliability: '100%' },
  'CSS': { spec: 'SYS.GPU_RENDER', latency: '0ms COMPOSIT', throughput: 'GPU HARDWARE', reliability: '100%' },
  'Tailwind CSS': { spec: 'SYS.JIT_CSS', latency: 'SUB-10KB CSS', throughput: 'JIT PURGED', reliability: '100%' },
  'MongoDB': { spec: 'SYS.MONGO_WIRE', latency: '2.4ms QUERY', throughput: 'WIREDTIGER', reliability: '99.99%' },
  'PostgreSQL': { spec: 'SYS.PG_RELATIONAL', latency: '1.8ms ACID', throughput: 'WAL PIPELINE', reliability: '99.99%' },
  'MySQL': { spec: 'SYS.MYSQL_INNODB', latency: '2.2ms', throughput: 'INNODB BUFFER', reliability: '99.98%' },
  'SQLite': { spec: 'SYS.SQLITE_MEM', latency: '0.2ms IN-MEM', throughput: 'ZERO-OVERHEAD', reliability: '100%' },
  'Pipecat': { spec: 'SYS.PIPECAT_RTC', latency: '<400ms E2E', throughput: 'WEBRTC AUDIO', reliability: '99.94%' },
  'Agora AI': { spec: 'SYS.AGORA_SDRTN', latency: '180ms RTN', throughput: '2.1ms JITTER', reliability: '99.99%' },
  'Sarvam STT': { spec: 'SYS.SARVAM_INDIC', latency: '<220ms TRANS', throughput: '8.2% WER', reliability: '99.92%' },
  'Docker': { spec: 'SYS.OCI_CONTAINER', latency: 'ALPINE BASE', throughput: 'MULTI-STAGE', reliability: '99.99%' },
  'AWS': { spec: 'SYS.CLOUD_INFRA', latency: 'MULTI-AZ', throughput: 'ECS CLUSTER', reliability: '99.99%' },
};

const defaultTelemetry: SkillTelemetry = {
  spec: 'PATCH_BAY // ALL_SYSTEMS_ACTIVE',
  latency: '1.2ms AVG',
  throughput: '14.8 GB/s',
  reliability: '99.98%',
};

const SkillsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const activeTelem = hoveredSkill
    ? skillTelemetryData[hoveredSkill] || defaultTelemetry
    : defaultTelemetry;

  const handleSkillHover = (skill: string) => {
    setHoveredSkill(skill);
    playTactileClick('subtle');
  };

  return (
    <section id="skills" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="CAPABILITIES // COMMAND_MATRIX" title="SKILLS" number="03" />

        {/* Live Hardware Telemetry Banner & Dynamic Mini-Oscilloscope Wave */}
        <div className="mb-12 pb-5 border-b border-border/80 flex flex-wrap items-center justify-between gap-4 font-ndot text-[8px] tracking-[0.25em]">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-foreground phosphor-led" />
            <span className="text-foreground uppercase font-semibold">
              HARDWARE_COMMAND_PATCH_BAY // REALTIME_TELEMETRY
            </span>
          </div>

          {/* Mini-Oscilloscope Waveform */}
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground hidden sm:inline">OSCILLOSCOPE:</span>
            <div className="w-28 sm:w-40 h-5 flex items-center overflow-hidden border border-border/60 bg-foreground/[0.02] px-1 rounded-xs">
              <svg className="w-full h-full text-foreground" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path
                  d={`M 0,10 Q 15,${hoveredSkill ? 1 : 6} 30,10 T 60,${hoveredSkill ? 19 : 14} T 90,10 T 100,10`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  className="transition-all duration-300"
                />
              </svg>
            </div>
          </div>

          {/* Active Live Metric Indicators */}
          <div className="flex items-center gap-4 font-mono text-[9px] text-foreground/90">
            <span>SPEC: <strong className="text-foreground">{activeTelem.spec}</strong></span>
            <span className="hidden md:inline">•</span>
            <span>LATENCY: <strong className="text-foreground">{activeTelem.latency}</strong></span>
            <span className="hidden md:inline">•</span>
            <span>THROUGHPUT: <strong className="text-foreground">{activeTelem.throughput}</strong></span>
            <span className="hidden md:inline">•</span>
            <span>UPTIME: <strong className="text-foreground">{activeTelem.reliability}</strong></span>
          </div>
        </div>

        {/* OPEN MATRIX PATCH-BAY (No Boxed Cards) */}
        <div className="divide-y divide-border/60">
          {skillsData.map((sector: SkillCategory, sIdx: number) => (
            <motion.div
              key={sector.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: sIdx * 0.06 }}
              className="py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start group hover:bg-foreground/[0.015] transition-colors"
            >
              {/* Left Column: Sector Code, Title & Architecture Role */}
              <div className="lg:col-span-4 space-y-1.5">
                <div className="flex items-center gap-2 font-mono text-[8.5px] text-muted-foreground tracking-widest">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 group-hover:bg-foreground transition-colors" />
                  <span>SECTOR // {sector.code}</span>
                  <span>•</span>
                  <span>{String(sector.skills.length).padStart(2, '0')} CHANNELS</span>
                </div>

                <h3 className="font-ndot text-lg sm:text-xl text-foreground text-glow tracking-wider">
                  {sector.title}
                </h3>

                <p className="font-body text-xs text-muted-foreground leading-relaxed text-pretty font-normal">
                  {sector.description}
                </p>
              </div>

              {/* Right Column: High-Contrast Typographic Array */}
              <div className="lg:col-span-8 flex flex-wrap items-center gap-2.5 sm:gap-3">
                {sector.skills.map((skill: string, kIdx: number) => {
                  const isHovered = hoveredSkill === skill;
                  return (
                    <div
                      key={skill}
                      onMouseEnter={() => handleSkillHover(skill)}
                      onMouseLeave={() => setHoveredSkill(null)}
                      className={`px-3.5 py-2 rounded-xs border font-ndot transition-all duration-200 cursor-pointer flex items-center gap-2 select-none ${
                        isHovered
                          ? 'border-foreground bg-foreground text-background shadow-[0_0_16px_rgba(255,255,255,0.2)]'
                          : 'border-border/70 bg-transparent text-foreground hover:border-foreground/80 hover:bg-foreground/5'
                      }`}
                      data-cursor-hover
                    >
                      <span
                        className={`font-mono text-[8px] ${
                          isHovered ? 'text-background/80 font-bold' : 'text-foreground/40'
                        }`}
                      >
                        0{kIdx + 1}
                      </span>

                      <span
                        className={`h-1.5 w-1.5 rounded-full transition-all ${
                          isHovered ? 'bg-background scale-125' : 'bg-foreground/70'
                        }`}
                      />

                      <span className="text-[11px] sm:text-xs tracking-[0.15em] font-semibold">
                        {skill}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Hardware Bus Footer */}
        <div className="mt-10 pt-5 border-t border-border/60 flex flex-wrap items-center justify-between gap-4 font-ndot text-[8px] tracking-[0.25em] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
            <span>BUS_INTERFACE: DUAL_CHANNEL_SPI // PARITY: 100% OK</span>
          </div>

          <div className="font-mono text-[8.5px] text-foreground/80">
            TOTAL_ENGAGED_REGISTERS: 34 MODULES // ZERO CONFLICTS
          </div>
        </div>

      </div>
    </section>
  );
};

export default SkillsSection;
