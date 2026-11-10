import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { skillsData, SkillCategory } from '@/data/skills';
import { playTactileClick } from '@/utils/audioFeedback';

interface SkillTelemetry {
  spec: string;
  latency: string;
  throughput: string;
  reliability: string;
  waveMode: 'sine' | 'neural' | 'square' | 'bezier' | 'step' | 'audio';
}

const skillTelemetryData: Record<string, SkillTelemetry> = {
  // Programming Languages -> Sine / Harmonic
  'Python': { spec: 'SYS.PY312 // CPYTHON', latency: '1.2ms', throughput: 'OPTIMIZED', reliability: '99.99%', waveMode: 'sine' },
  'Java': { spec: 'SYS.JVM21 // LTS', latency: '<1.0ms GC', throughput: 'TIER-4 JIT', reliability: '99.98%', waveMode: 'sine' },
  'JavaScript': { spec: 'SYS.V8_TURBO', latency: '0.8ms', throughput: 'ASYNC IO', reliability: '99.95%', waveMode: 'sine' },
  'TypeScript': { spec: 'SYS.TS_STRICT', latency: '0.0ms RUNTIME', throughput: 'AST VERIFIED', reliability: '100%', waveMode: 'sine' },
  'C': { spec: 'SYS.POSIX_C11', latency: '<0.2ms', throughput: 'DIRECT MEMORY', reliability: '99.99%', waveMode: 'sine' },
  'C++': { spec: 'SYS.CPP20_SIMD', latency: '<0.3ms', throughput: 'SIMD VECTOR', reliability: '99.99%', waveMode: 'sine' },

  // GenAI & Machine Learning -> Neural Carrier Waves
  'Generative AI': { spec: 'SYS.NEURAL_GEN', latency: '<550ms TTFT', throughput: 'AGENTIC LOOPS', reliability: '99.92%', waveMode: 'neural' },
  'Retrieval-Augmented Generation (RAG)': { spec: 'SYS.RAG_HYBRID', latency: '18ms VECTOR', throughput: 'RECALL@5: 94.2%', reliability: '99.94%', waveMode: 'neural' },
  'LightRAG': { spec: 'SYS.LIGHTRAG_2', latency: '24ms GRAPH', throughput: 'DUAL GRAPH HOPS', reliability: '99.95%', waveMode: 'neural' },
  'LLM Integration': { spec: 'SYS.LLM_STREAM', latency: '<280ms STREAM', throughput: '128K CTX', reliability: '99.90%', waveMode: 'neural' },
  'Computer Vision': { spec: 'SYS.CV_CORE', latency: '31.2ms (32 FPS)', throughput: '1080P REALTIME', reliability: '99.88%', waveMode: 'neural' },
  'YOLOX': { spec: 'SYS.YOLOX_DET', latency: '14.2ms INFER', throughput: '42.4 mAP', reliability: '99.91%', waveMode: 'neural' },
  'ByteTrack': { spec: 'SYS.BYTE_TRACK', latency: '3.1ms ASSOC', throughput: '0 MISSED HITS', reliability: '99.97%', waveMode: 'neural' },
  'TensorFlow': { spec: 'SYS.TF_GRAPH', latency: 'GPU TENSOR', throughput: 'XLA COMPILED', reliability: '99.95%', waveMode: 'neural' },
  'OpenCV': { spec: 'SYS.CV_MATRIX', latency: '4.8ms FRAME', throughput: 'GPU ACCEL', reliability: '99.96%', waveMode: 'neural' },

  // Backend & APIs -> Square / High-Frequency Pulses
  'FastAPI': { spec: 'SYS.ASGI_FAST', latency: '14.8ms P99', throughput: '18.4K REQ/SEC', reliability: '99.99%', waveMode: 'square' },
  'Node.js': { spec: 'SYS.NODE_LTS', latency: '1.4ms', throughput: 'UV EVENT POOL', reliability: '99.97%', waveMode: 'square' },
  'Express.js': { spec: 'SYS.EXPRESS_ROUT', latency: '2.1ms', throughput: 'FAST ROUTING', reliability: '99.96%', waveMode: 'square' },
  'Django': { spec: 'SYS.DJANGO_ORM', latency: '18ms P95', throughput: 'ORM CACHED', reliability: '99.98%', waveMode: 'square' },
  'NestJS': { spec: 'SYS.NEST_ARCH', latency: '3.4ms', throughput: 'MODULAR DI', reliability: '99.97%', waveMode: 'square' },

  // Frontend -> Smooth Bezier Curve
  'React': { spec: 'SYS.REACT_FIBER', latency: '16.6ms (60 FPS)', throughput: 'CONCURRENT UI', reliability: '100%', waveMode: 'bezier' },
  'Next.js': { spec: 'SYS.NEXT_EDGE', latency: '42ms TTFB', throughput: 'EDGE SSR', reliability: '99.99%', waveMode: 'bezier' },
  'HTML': { spec: 'SYS.SEMANTIC_DOM', latency: '0ms REFLOW', throughput: 'W3C COMPLIANT', reliability: '100%', waveMode: 'bezier' },
  'CSS': { spec: 'SYS.GPU_RENDER', latency: '0ms COMPOSIT', throughput: 'GPU HARDWARE', reliability: '100%', waveMode: 'bezier' },
  'Tailwind CSS': { spec: 'SYS.JIT_CSS', latency: 'SUB-10KB CSS', throughput: 'JIT PURGED', reliability: '100%', waveMode: 'bezier' },

  // Databases -> Step Transactions
  'MongoDB': { spec: 'SYS.MONGO_WIRE', latency: '2.4ms QUERY', throughput: 'WIREDTIGER', reliability: '99.99%', waveMode: 'step' },
  'PostgreSQL': { spec: 'SYS.PG_RELATIONAL', latency: '1.8ms ACID', throughput: 'WAL PIPELINE', reliability: '99.99%', waveMode: 'step' },
  'MySQL': { spec: 'SYS.MYSQL_INNODB', latency: '2.2ms', throughput: 'INNODB BUFFER', reliability: '99.98%', waveMode: 'step' },
  'SQLite': { spec: 'SYS.SQLITE_MEM', latency: '0.2ms IN-MEM', throughput: 'ZERO-OVERHEAD', reliability: '100%', waveMode: 'step' },

  // Voice AI & Infrastructure -> Multi-band Audio Spectrum
  'Pipecat': { spec: 'SYS.PIPECAT_RTC', latency: '<400ms E2E', throughput: 'WEBRTC AUDIO', reliability: '99.94%', waveMode: 'audio' },
  'Agora AI': { spec: 'SYS.AGORA_SDRTN', latency: '180ms RTN', throughput: '2.1ms JITTER', reliability: '99.99%', waveMode: 'audio' },
  'Sarvam STT': { spec: 'SYS.SARVAM_INDIC', latency: '<220ms TRANS', throughput: '8.2% WER', reliability: '99.92%', waveMode: 'audio' },
  'Docker': { spec: 'SYS.OCI_CONTAINER', latency: 'ALPINE BASE', throughput: 'MULTI-STAGE', reliability: '99.99%', waveMode: 'audio' },
  'AWS': { spec: 'SYS.CLOUD_INFRA', latency: 'MULTI-AZ', throughput: 'ECS CLUSTER', reliability: '99.99%', waveMode: 'audio' },
};

const defaultTelem: SkillTelemetry = {
  spec: 'PATCH_BAY // ALL_SECTORS_ACTIVE',
  latency: '1.2ms AVG',
  throughput: '14.8 GB/s',
  reliability: '99.98%',
  waveMode: 'sine',
};

const SkillsSection = () => {
  const [activeSectorIdx, setActiveSectorIdx] = useState(0);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [wavePhase, setWavePhase] = useState(0);
  const [vuDb, setVuDb] = useState('-3.8 dB');

  const currentSector: SkillCategory = skillsData[activeSectorIdx] || skillsData[0];
  const activeTelem = hoveredSkill
    ? skillTelemetryData[hoveredSkill] || defaultTelem
    : defaultTelem;

  // Real-time kinetic waveform oscillation loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      setWavePhase((p) => (p + 0.08) % (Math.PI * 2));
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // VU Meter Jitter
  useEffect(() => {
    const timer = setInterval(() => {
      const val = (-3.0 - Math.random() * 2.2).toFixed(1);
      setVuDb(`${val} dB`);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  const handleSectorSelect = (idx: number) => {
    setActiveSectorIdx(idx);
    playTactileClick('toggle');
  };

  const handleSkillHover = (skill: string) => {
    setHoveredSkill(skill);
    playTactileClick('subtle');
  };

  // Generate dynamic motion graphic SVG path based on active waveMode
  const generateWavePath = () => {
    const width = 280;
    const height = 40;
    const midY = height / 2;
    const points: string[] = [];

    const mode = activeTelem.waveMode;

    if (mode === 'square') {
      for (let x = 0; x <= width; x += 10) {
        const cycle = Math.floor((x / 25) + wavePhase);
        const y = cycle % 2 === 0 ? midY - 14 : midY + 14;
        points.push(`${x},${y}`);
      }
      return `M 0,${midY} L ` + points.join(' L ');
    }

    if (mode === 'neural') {
      for (let x = 0; x <= width; x += 4) {
        const y =
          midY +
          Math.sin(x * 0.08 + wavePhase) * 12 +
          Math.sin(x * 0.22 + wavePhase * 1.5) * 5;
        points.push(`${x},${y.toFixed(1)}`);
      }
      return `M ` + points.join(' L ');
    }

    if (mode === 'audio') {
      for (let x = 0; x <= width; x += 6) {
        const noise = Math.sin(x * 0.35 + wavePhase * 3) * Math.cos(x * 0.12);
        const y = midY + noise * 16;
        points.push(`${x},${y.toFixed(1)}`);
      }
      return `M ` + points.join(' L ');
    }

    // Default smooth harmonic sine wave
    for (let x = 0; x <= width; x += 4) {
      const y = midY + Math.sin(x * 0.05 + wavePhase) * 13;
      points.push(`${x},${y.toFixed(1)}`);
    }
    return `M ` + points.join(' L ');
  };

  return (
    <section id="skills" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="CAPABILITIES // COMMAND_MATRIX" title="SKILLS" number="03" />

        {/* HIGH-CONTRAST MATTE CONSOLE ENCLOSURE (Guarantees zero background bleeding) */}
        <div className="hud-frame glass-panel p-6 sm:p-10 border border-border/90 rounded-sm relative shadow-2xl bg-background/95 backdrop-blur-2xl">
          
          {/* Tactical Corner Brackets */}
          <span className="hud-corner hud-tl" />
          <span className="hud-corner hud-tr" />
          <span className="hud-corner hud-bl" />
          <span className="hud-corner hud-br" />

          {/* TOP CONSOLE: Oscilloscope Motion Graphic, VU Meter & Live Benchmarks */}
          <div className="border-b border-border/80 pb-6 mb-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Status & Active Channel */}
            <div className="lg:col-span-4 space-y-1">
              <div className="flex items-center gap-2 font-ndot text-[8px] tracking-[0.28em] text-muted-foreground uppercase">
                <span className="h-2 w-2 rounded-full bg-foreground phosphor-led" />
                <span className="text-foreground font-semibold">SIGNAL_GENERATOR // ACTIVE</span>
              </div>
              <div className="font-mono text-xs text-foreground font-semibold tracking-wide">
                {activeTelem.spec}
              </div>
              <div className="font-mono text-[9px] text-muted-foreground">
                SIGNAL_BAND: {activeTelem.waveMode.toUpperCase()}_CARRIER
              </div>
            </div>

            {/* Kinetic Oscilloscope Waveform Graphic */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="flex items-center justify-between font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground mb-1">
                <span>MULTI-CHANNEL OSCILLOSCOPE // 280MHz</span>
                <span className="font-mono text-foreground font-bold">{vuDb}</span>
              </div>

              {/* Dynamic Animated Waveform Screen */}
              <div className="w-full h-12 bg-foreground/[0.03] border border-border/80 rounded-xs px-2 flex items-center overflow-hidden relative">
                <div className="absolute inset-0 dot-grid-bg opacity-30 pointer-events-none" />
                <svg className="w-full h-full text-foreground" viewBox="0 0 280 40" preserveAspectRatio="none">
                  <path
                    d={generateWavePath()}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    className="transition-all duration-75"
                  />
                </svg>
              </div>
            </div>

            {/* Live Benchmarks & VU Phosphor Meter */}
            <div className="lg:col-span-3 space-y-2 lg:text-right">
              <div className="font-mono text-[10px] text-foreground font-medium flex lg:justify-end gap-3">
                <span>LATENCY: <strong className="font-bold text-foreground">{activeTelem.latency}</strong></span>
                <span>•</span>
                <span>THROUGHPUT: <strong className="font-bold text-foreground">{activeTelem.throughput}</strong></span>
              </div>

              {/* Dynamic VU Meter Bar Array */}
              <div className="flex items-center lg:justify-end gap-1 h-3 pt-1">
                {Array.from({ length: 18 }).map((_, barIdx) => {
                  const isActive = barIdx < 13;
                  return (
                    <span
                      key={barIdx}
                      className={`h-full w-1 rounded-xs transition-colors duration-200 ${
                        isActive
                          ? 'bg-foreground/85'
                          : barIdx === 13 || barIdx === 14
                          ? 'bg-foreground/40'
                          : 'bg-border/60'
                      }`}
                    />
                  );
                })}
              </div>

              <div className="font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground uppercase">
                VU_STATUS: {activeTelem.reliability} ACCREDITED
              </div>
            </div>

          </div>

          {/* MAIN HARDWARE PATCH-BAY: Sector Selector Strip & Register Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Rail: Sector Switchboard Selectors */}
            <div className="lg:col-span-4 space-y-2">
              <div className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground uppercase pb-2 border-b border-border/50 flex justify-between">
                <span>AVIONICS SECTORS</span>
                <span>06 CHANNELS</span>
              </div>

              {skillsData.map((cat, i) => {
                const isSelected = activeSectorIdx === i;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSectorSelect(i)}
                    className={`w-full text-left p-3 rounded-xs border transition-all duration-200 focus:outline-none flex items-center justify-between group ${
                      isSelected
                        ? 'border-foreground bg-foreground text-background font-semibold shadow-[0_0_15px_rgba(255,255,255,0.18)]'
                        : 'border-border/60 bg-foreground/[0.015] hover:border-foreground/60 text-muted-foreground hover:text-foreground'
                    }`}
                    data-cursor-hover
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`h-2 w-2 rounded-full transition-all ${
                          isSelected
                            ? 'bg-background scale-110'
                            : 'bg-muted-foreground/50 group-hover:bg-foreground'
                        }`}
                      />
                      <span className="font-ndot text-[10px] tracking-wider uppercase">
                        {cat.title}
                      </span>
                    </div>

                    <span className="font-mono text-[8.5px] tracking-widest opacity-80">
                      {cat.code}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Pane: Active Sector Typographic Register Array */}
            <div className="lg:col-span-8 p-6 sm:p-8 border border-border/70 rounded-xs bg-foreground/[0.015] relative">
              
              {/* Sector Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4 mb-6">
                <div>
                  <div className="font-mono text-[8.5px] text-muted-foreground tracking-widest uppercase">
                    REGISTER_BANK // {currentSector.code}
                  </div>
                  <h4 className="font-ndot text-xl sm:text-2xl text-foreground text-glow tracking-wide mt-0.5">
                    {currentSector.title}
                  </h4>
                </div>
                <div className="font-ndot text-[9px] tracking-[0.25em] px-2.5 py-1 rounded-xs border border-border text-foreground">
                  {currentSector.skills.length} ACTIVE_REGISTERS
                </div>
              </div>

              <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty font-normal mb-6">
                {currentSector.description}
              </p>

              {/* Kinetic Register Chips */}
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {currentSector.skills.map((skill, kIdx) => {
                  const isHovered = hoveredSkill === skill;
                  return (
                    <div
                      key={skill}
                      onMouseEnter={() => handleSkillHover(skill)}
                      onMouseLeave={() => setHoveredSkill(null)}
                      className={`px-3.5 py-2.5 rounded-xs border font-ndot transition-all duration-200 cursor-pointer flex items-center gap-2.5 select-none ${
                        isHovered
                          ? 'border-foreground bg-foreground text-background shadow-[0_0_20px_rgba(255,255,255,0.25)] scale-[1.02]'
                          : 'border-border/80 bg-background/90 text-foreground hover:border-foreground/80 hover:bg-foreground/5'
                      }`}
                      data-cursor-hover
                    >
                      <span
                        className={`font-mono text-[8.5px] ${
                          isHovered ? 'text-background/80 font-bold' : 'text-foreground/40'
                        }`}
                      >
                        [0{kIdx + 1}]
                      </span>

                      <span
                        className={`h-1.5 w-1.5 rounded-full transition-all ${
                          isHovered ? 'bg-background scale-125' : 'bg-foreground/80'
                        }`}
                      />

                      <span className="text-xs sm:text-[13px] tracking-[0.14em] font-semibold">
                        {skill}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Hardware Footer */}
              <div className="mt-8 pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-3 font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                  BUS_PARITY: 100% OK // DIRECT_CIRCUIT
                </span>
                <span className="font-mono text-foreground/80">
                  CLOCK: 840 MHz SYNCHRONIZED
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default SkillsSection;
