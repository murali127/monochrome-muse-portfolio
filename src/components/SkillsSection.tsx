import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { skillsData, SkillCategory } from '@/data/skills';
import { playTactileClick } from '@/utils/audioFeedback';

const HudCorners = () => (
  <>
    <span className="hud-corner hud-tl" />
    <span className="hud-corner hud-tr" />
    <span className="hud-corner hud-bl" />
    <span className="hud-corner hud-br" />
  </>
);

const skillBenchmarks: Record<string, { spec: string; benchmark: string }> = {
  'Python': { spec: 'SYS.PY312 // CPYTHON', benchmark: 'LATENCY: 1.2ms // CONCURRENCY: OPTIMIZED' },
  'Java': { spec: 'SYS.JVM21 // OPENJDK', benchmark: 'GC PAUSE: <1.0ms // JIT TIER-4 ENGAGED' },
  'JavaScript': { spec: 'SYS.V8_TURBO', benchmark: 'EVENT LOOP: ZERO-LAG // JIT OPTIMIZED' },
  'TypeScript': { spec: 'SYS.TS_STRICT', benchmark: 'ZERO RUNTIME OVERHEAD // AST VERIFIED' },
  'C': { spec: 'SYS.POSIX_C11', benchmark: 'DIRECT MEMORY POINTERS // HEAP OPT' },
  'C++': { spec: 'SYS.CPP20_SIMD', benchmark: 'ZERO-COST ABSTRACTIONS // SIMD ACCEL' },
  'Generative AI': { spec: 'SYS.NEURAL_GEN', benchmark: 'AGENTIC LOOPS // MULTI-MODAL REASONING' },
  'Retrieval-Augmented Generation (RAG)': { spec: 'SYS.RAG_HYBRID', benchmark: 'RECALL@5: 94.2% // HYBRID DENSE + SPARSE' },
  'LightRAG': { spec: 'SYS.LIGHTRAG_2', benchmark: 'DUAL GRAPH RETRIEVAL // GRAPH HOPS: 2' },
  'LLM Integration': { spec: 'SYS.LLM_ORCH', benchmark: 'STREAMING TOKENS // TTFT: <280ms' },
  'Computer Vision': { spec: 'SYS.CV_CORE', benchmark: '30 FPS REAL-TIME // 1080P INFERENCE' },
  'YOLOX': { spec: 'SYS.YOLOX_DET', benchmark: 'ANCHOR-FREE DETECTOR // 42.4 mAP' },
  'ByteTrack': { spec: 'SYS.BYTE_TRACK', benchmark: 'MULTI-OBJECT TRACKING // ZERO MISSED HITS' },
  'TensorFlow': { spec: 'SYS.TF_GRAPH', benchmark: 'XLA COMPILED // TENSOR CORES ACTIVE' },
  'OpenCV': { spec: 'SYS.CV_MATRIX', benchmark: 'HARDWARE ACCELERATED // MATRIX OPS' },
  'FastAPI': { spec: 'SYS.ASGI_FAST', benchmark: 'THROUGHPUT: 18.4K REQ/S // P99: 14.8ms' },
  'Node.js': { spec: 'SYS.NODE_LTS', benchmark: 'ASYNC I/O // LIBUV EVENT POOL' },
  'Express.js': { spec: 'SYS.EXPRESS_ROUT', benchmark: 'MINIMALIST ROUTING // LOW MEMORY FOOTPRINT' },
  'Django': { spec: 'SYS.DJANGO_ORM', benchmark: 'ORM OPTIMIZED // SECURE SESSION CACHE' },
  'NestJS': { spec: 'SYS.NEST_ARCH', benchmark: 'ENTERPRISE DI // MODULAR CONTROLLERS' },
  'React': { spec: 'SYS.REACT_FIBER', benchmark: 'CONCURRENT RECONCILER // 60 FPS PIPELINE' },
  'Next.js': { spec: 'SYS.NEXT_EDGE', benchmark: 'EDGE SSR // HYBRID STATIC GENERATION' },
  'HTML': { spec: 'SYS.SEMANTIC_DOM', benchmark: 'W3C COMPLIANT // ZERO A11Y DEFECTS' },
  'CSS': { spec: 'SYS.GPU_RENDER', benchmark: 'GPU COMPOSITOR LAYERS // ZERO REFLOW' },
  'Tailwind CSS': { spec: 'SYS.JIT_CSS', benchmark: 'JIT COMPILER // SUB-10KB COMPILED CSS' },
  'MongoDB': { spec: 'SYS.MONGO_WIRE', benchmark: 'DOCUMENT INDEXES // WIREDTIGER CACHE' },
  'PostgreSQL': { spec: 'SYS.PG_RELATIONAL', benchmark: 'ACID WAL LOGGING // CONNECTION POOL' },
  'MySQL': { spec: 'SYS.MYSQL_INNODB', benchmark: 'INNODB BUFFER POOL // CLUSTERED INDEX' },
  'SQLite': { spec: 'SYS.SQLITE_MEM', benchmark: 'ZERO-CONFIG IN-MEMORY // ACID ATOMIC' },
  'Pipecat': { spec: 'SYS.PIPECAT_RTC', benchmark: 'FRAMEWORK PIPELINES // WEBRTC INTEGRATED' },
  'Agora AI': { spec: 'SYS.AGORA_SDRTN', benchmark: 'SUB-400ms REAL-TIME VOICE // JITTER: 2ms' },
  'Sarvam STT': { spec: 'SYS.SARVAM_INDIC', benchmark: 'INDIC MULTILINGUAL STT // WER: 8.2%' },
  'Docker': { spec: 'SYS.OCI_CONTAINER', benchmark: 'CONTAINER DAEMON // MULTI-STAGE BUILDS' },
  'AWS': { spec: 'SYS.CLOUD_INFRA', benchmark: 'SERVERLESS ECS // SECURE IAM BOUNDARIES' },
};

const SkillsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [active, setActive] = useState(0);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const current: SkillCategory = skillsData[active] || skillsData[0];

  // Dynamic telemetry metrics
  const [telemetry, setTelemetry] = useState({
    freq: '1420.405',
    throughput: '14.8',
    packets: '52,840',
    cycle: 840,
    voltage: '3.31V',
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry({
        freq: (1420.4 + Math.random() * 0.02).toFixed(3),
        throughput: (14.2 + Math.random() * 0.8).toFixed(1),
        packets: `${Math.floor(52800 + Math.random() * 150).toLocaleString()}`,
        cycle: Math.floor(820 + Math.random() * 40),
        voltage: (3.30 + Math.random() * 0.03).toFixed(2) + 'V',
      });
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const handleCategorySelect = (index: number) => {
    setActive(index);
    playTactileClick('toggle');
  };

  const handleSkillHover = (skillName: string) => {
    setHoveredSkill(skillName);
    playTactileClick('subtle');
  };

  const activeBenchmark = hoveredSkill
    ? skillBenchmarks[hoveredSkill] || { spec: 'SYS.GENERIC', benchmark: 'REGISTER: SYNCHRONIZED // 100% PARITY' }
    : { spec: `${current.code} // READY`, benchmark: 'STANDBY: HOVER CHIPS TO ENGAGE TELEMETRY' };

  return (
    <section id="skills" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="pointer-events-none absolute inset-0 opacity-40 grid-lines-bg" />
      <div className="mx-auto max-w-7xl relative">
        <SectionHeader label="CAPABILITIES // CONTROL_DECK" title="SKILLS" number="03" />

        <div className="grid lg:grid-cols-[310px_1fr] gap-6 items-start">
          
          {/* LEFT: Modular Patch-Bay Command Switchboard */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            className="hud-frame glass-panel p-3.5 space-y-2 h-fit border border-border/80 rounded-sm"
          >
            <HudCorners />
            <div className="font-ndot text-[8px] tracking-[0.35em] text-muted-foreground px-3 py-2 flex items-center justify-between border-b border-border/40 mb-1">
              <span>PATCH-BAY CHANNELS</span>
              <span className="text-[7.5px] text-foreground font-mono">06 ACTIVE</span>
            </div>

            {skillsData.map((cat, i) => {
              const isSelected = active === i;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(i)}
                  className={`w-full text-left px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xs transition-all duration-200 focus:outline-none relative group ${
                    isSelected
                      ? 'bg-foreground text-background font-medium shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                      : 'hover:bg-foreground/5 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/60'
                  }`}
                  data-cursor-hover
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Hardware Channel Phosphor LED */}
                      <span
                        className={`h-2 w-2 rounded-full transition-all ${
                          isSelected
                            ? 'bg-background shadow-[0_0_8px_rgba(0,0,0,0.8)]'
                            : 'bg-muted-foreground/40 group-hover:bg-foreground'
                        }`}
                      />
                      <span className="font-ndot text-[9px] sm:text-[10px] tracking-[0.18em]">
                        {cat.title}
                      </span>
                    </div>

                    <span
                      className={`font-ndot text-[8px] tracking-[0.2em] font-mono ${
                        isSelected ? 'opacity-90' : 'opacity-40'
                      }`}
                    >
                      {cat.code}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Quick Diagnostic Footer inside selector */}
            <div className="pt-3 px-3 border-t border-border/30 flex items-center justify-between font-ndot text-[7.5px] tracking-[0.2em] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground phosphor-led" />
                SYS_BUS: DUAL-CHANNEL
              </span>
              <span className="font-mono text-foreground">{telemetry.voltage}</span>
            </div>
          </motion.div>

          {/* RIGHT: High-Craft Avionics Flight Console */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="hud-frame glass-panel p-5 sm:p-8 min-h-[480px] relative overflow-hidden flex flex-col justify-between border border-border/80 rounded-sm shadow-2xl"
          >
            <HudCorners />
            {/* Animated Laser Scanning Beam */}
            <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
              <div className="h-px w-1/3 bg-foreground/60 animate-[beam_3s_linear_infinite]" />
            </div>

            <div>
              {/* Tactical Top Bar & Dynamic Audio/RF Waveform */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3 mb-5 font-ndot text-[8px] tracking-[0.25em] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-foreground phosphor-led" />
                  <span className="text-foreground">{current.code} // FLIGHT_CONSOLE_ONLINE</span>
                </div>

                {/* Live Real-Time SVG Waveform Header */}
                <div className="flex items-center gap-2">
                  <span className="font-ndot text-[7px] text-muted-foreground hidden sm:inline">OSCILLOSCOPE:</span>
                  <div className="w-24 sm:w-32 h-4 flex items-center overflow-hidden border border-border/40 rounded-xs bg-foreground/[0.02] px-1">
                    <svg className="w-full h-full text-foreground/80" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path
                        d={`M 0,10 Q 15,${hoveredSkill ? 2 : 5} 30,10 T 60,${hoveredSkill ? 18 : 14} T 90,10 T 100,10`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        className="transition-all duration-300"
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-foreground/75 font-mono text-[8.5px]">
                  <span>RF: {telemetry.freq} MHz</span>
                  <span className="hidden sm:inline">•</span>
                  <span>THROUGHPUT: {telemetry.throughput} GB/s</span>
                </div>
              </div>

              {/* Header Title & Description */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-ndot text-2xl sm:text-3xl lg:text-4xl text-foreground text-glow tracking-wider">
                    {current.title}
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed text-pretty font-normal">
                    {current.description}
                  </p>
                </div>
                <div className="flex items-baseline gap-2 self-start sm:self-auto shrink-0">
                  <span className="font-ndot text-[9px] tracking-[0.25em] text-muted-foreground">REGISTERS:</span>
                  <span className="font-ndot text-3xl sm:text-5xl text-foreground/25 leading-none font-mono">
                    {String(current.skills.length).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Tactical Avionics Skill Modules with Live Benchmarks */}
              <div className="py-2">
                <div className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground mb-3 flex items-center justify-between">
                  <span>ENGAGED REGISTERS & HARDWARE INTERFACES</span>
                  <span className="font-mono text-foreground/70">PARITY: 100% OK</span>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {current.skills.map((skill, i) => {
                    const isHovered = hoveredSkill === skill;
                    return (
                      <motion.div
                        key={skill}
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        onMouseEnter={() => handleSkillHover(skill)}
                        onMouseLeave={() => setHoveredSkill(null)}
                        className={`group/chip px-3 sm:px-3.5 py-2 rounded-xs border transition-all flex items-center gap-2.5 cursor-pointer ${
                          isHovered
                            ? 'border-foreground bg-foreground text-background shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                            : 'border-border/80 bg-background/60 hover:border-foreground/80 hover:bg-foreground/5 text-foreground'
                        }`}
                        data-cursor-hover
                      >
                        <span
                          className={`font-mono text-[8px] ${
                            isHovered ? 'text-background/80 font-bold' : 'text-foreground/40 group-hover/chip:text-foreground'
                          }`}
                        >
                          [{String(i + 1).padStart(2, '0')}]
                        </span>
                        
                        {/* Phosphor Status LED */}
                        <span
                          className={`h-1.5 w-1.5 rounded-full transition-all ${
                            isHovered
                              ? 'bg-background scale-125'
                              : 'bg-foreground/75 group-hover/chip:scale-125'
                          }`}
                        />
                        
                        <span
                          className={`font-ndot text-[10px] sm:text-[11px] tracking-[0.16em] ${
                            isHovered ? 'text-background font-semibold' : 'text-foreground'
                          }`}
                        >
                          {skill}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Live Micro-Benchmark & Telemetry Drawer */}
              <div className="mt-5 p-3 rounded-xs border border-border/70 bg-foreground/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground phosphor-led shrink-0" />
                  <span className="font-mono text-[9px] text-muted-foreground uppercase">
                    {activeBenchmark.spec}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-foreground font-medium tracking-wide">
                  {activeBenchmark.benchmark}
                </div>
              </div>

              {/* Dynamic Signal Spectrum / Oscilloscope Readout */}
              <div className="mt-5 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between font-ndot text-[7.5px] sm:text-[8px] tracking-[0.25em] text-muted-foreground mb-2">
                  <span>REAL-TIME SPECTRAL DENSITY // SIGNAL ARRAY</span>
                  <span className="font-mono">{telemetry.packets} PKTS PROCESSED</span>
                </div>
                <div className="flex items-end gap-1 h-6 sm:h-8 overflow-hidden bg-foreground/[0.02] p-1 border border-border/40 rounded-xs">
                  {Array.from({ length: 36 }).map((_, barIdx) => {
                    const isSpike = hoveredSkill && (barIdx % 3 === 0);
                    return (
                      <span
                        key={barIdx}
                        className="signal-bar flex-1 bg-foreground/60 transition-all duration-300"
                        style={{
                          height: `${isSpike ? 85 : 20 + ((barIdx * 11 + active * 7) % 75)}%`,
                          animationDelay: `${(barIdx % 6) * 0.12}s`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* High-Density Terminal Telemetry Footer */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 border-t border-border/60 pt-4 sm:pt-5 font-ndot">
              <div>
                <div className="text-[7px] sm:text-[8px] tracking-[0.25em] text-muted-foreground mb-0.5">
                  UPLINK_STATUS
                </div>
                <div className="text-[9px] sm:text-[10px] tracking-wider text-foreground font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground phosphor-led" />
                  SYNCHRONIZED
                </div>
              </div>

              <div>
                <div className="text-[7px] sm:text-[8px] tracking-[0.25em] text-muted-foreground mb-0.5">
                  FREQUENCY_CYCLE
                </div>
                <div className="text-[9px] sm:text-[10px] tracking-wider text-foreground font-semibold font-mono">
                  {telemetry.cycle} Hz // L2_CLOCK
                </div>
              </div>

              <div>
                <div className="text-[7px] sm:text-[8px] tracking-[0.25em] text-muted-foreground mb-0.5">
                  MEMORY_PARITY
                </div>
                <div className="text-[9px] sm:text-[10px] tracking-wider text-foreground font-semibold font-mono">
                  0x00_VERIFIED
                </div>
              </div>

              <div>
                <div className="text-[7px] sm:text-[8px] tracking-[0.25em] text-muted-foreground mb-0.5">
                  SECURITY_GATE
                </div>
                <div className="text-[9px] sm:text-[10px] tracking-wider text-foreground font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                  AIR_GAPPED
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
