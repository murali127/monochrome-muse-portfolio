import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { playTactileClick } from '@/utils/audioFeedback';
import ResumeButton from './ResumeButton';

interface TechToken {
  id: string;
  name: string;
  category: string;
  spec: string;
  metric: string;
  status: string;
}

const techTokens: Record<string, TechToken> = {
  genai: {
    id: 'genai',
    name: 'GENAI ARCHITECTURES',
    category: 'NEURAL ORCHESTRATION',
    spec: 'TRANSFORMER FOUNDATIONS // FINE-TUNING // AGENTIC WORKFLOWS',
    metric: 'CONTEXT: 128K TOKENS | LATENCY: <600ms',
    status: 'OPTIMIZED',
  },
  rag: {
    id: 'rag',
    name: 'HYBRID RAG & GRAPH ENGINES',
    category: 'KNOWLEDGE EXTRACTION',
    spec: 'LIGHTRAG DUAL-LEVEL RETRIEVAL // GRAPH HOPS + VECTOR EMBEDDINGS',
    metric: 'PRECISION: 96.4% | RECALL@5: 92.1%',
    status: 'VERIFIED',
  },
  voice: {
    id: 'voice',
    name: 'REAL-TIME VOICE AI PIPELINES',
    category: 'CONVERSATIONAL AUDIO',
    spec: 'PIPECAT + AGORA RTC + SARVAM MULTILINGUAL STT/TTS',
    metric: 'END-TO-END LATENCY: <450ms | JITTER: 2.1ms',
    status: 'ACTIVE_PROD',
  },
  cv: {
    id: 'cv',
    name: 'COMPUTER VISION ANALYTICS',
    category: 'EDGE OBJECT RECOGNITION',
    spec: 'YOLOX + BYTETRACK OBJECT TRACKING // ROAD HAZARD SCORING',
    metric: 'THROUGHPUT: 32 FPS @ 1080P | IoU: 0.84',
    status: 'DEPLOYED',
  },
  fastapi: {
    id: 'fastapi',
    name: 'FASTAPI & ASYNC BACKENDS',
    category: 'SYSTEMS ARCHITECTURE',
    spec: 'ASYNCHRONOUS ASGI // UVLOOP // PYDANTIC V2 SCHEMAS',
    metric: 'RPS: 18.2K | P99 LATENCY: 14.8ms',
    status: 'PRODUCTION',
  },
};

const AboutSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [activeToken, setActiveToken] = useState<TechToken | null>(null);
  const [liveUptime, setLiveUptime] = useState('99.982%');
  const [clock, setClock] = useState('00:00:00 UTC');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(now.toTimeString().split(' ')[0] + ' UTC');
      // Subtle organic telemetry jitter
      const jitter = (99.98 + Math.sin(now.getTime() / 4000) * 0.006).toFixed(3);
      setLiveUptime(`${jitter}%`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTokenEnter = (key: string) => {
    setActiveToken(techTokens[key]);
    playTactileClick('subtle');
  };

  const handleTokenLeave = () => {
    setActiveToken(null);
  };

  return (
    <section id="about" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="SYSTEM_PROFILE // DIAGNOSTICS" title="ABOUT" number="01" />

        {/* Tactical Telemetry & Asymmetric Workstation */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* LEFT RAIL: Machined Chassis Hardware Spec Sheet */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-4 flex flex-col justify-between hud-frame glass-panel p-5 sm:p-6 border border-border/80 rounded-sm relative bg-background/95 backdrop-blur-2xl shadow-2xl"
          >
            <span className="hud-corner hud-tl" />
            <span className="hud-corner hud-tr" />
            <span className="hud-corner hud-bl" />
            <span className="hud-corner hud-br" />

            <div>
              {/* Chassis Header Bar */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-5 font-ndot text-[8px] tracking-[0.28em] text-muted-foreground">
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-ping" />
                  CHASSIS // SPEC_01
                </span>
                <span>REV. 2026.4</span>
              </div>

              {/* Hardware Spec Line Items */}
              <div className="space-y-4">
                <div className="border-b border-border/40 pb-3">
                  <div className="font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground uppercase mb-1">
                    SYSTEM_ARCHITECTURE
                  </div>
                  <div className="font-ndot text-xs tracking-wider text-foreground flex items-center justify-between">
                    <span>ARM64 / APPLE SILICON</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded border border-border/70 text-foreground/80 font-mono">
                      HOST
                    </span>
                  </div>
                </div>

                <div className="border-b border-border/40 pb-3">
                  <div className="font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground uppercase mb-1">
                    OPERATING_MODE
                  </div>
                  <div className="font-ndot text-xs tracking-wider text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-foreground" />
                      PRODUCTION_READY
                    </span>
                    <span className="text-[9px] text-muted-foreground font-mono">L1_ACTIVE</span>
                  </div>
                </div>

                <div className="border-b border-border/40 pb-3">
                  <div className="font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground uppercase mb-1">
                    AVAILABILITY / UPTIME
                  </div>
                  <div className="font-ndot text-xs tracking-wider text-foreground flex items-center justify-between font-mono">
                    <span className="tabular-nums font-semibold">{liveUptime}</span>
                    <span className="text-[9px] text-muted-foreground font-ndot tracking-widest">SLA: 99.9%</span>
                  </div>
                </div>

                <div className="border-b border-border/40 pb-3">
                  <div className="font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground uppercase mb-1">
                    GEODETIC_ORIGIN
                  </div>
                  <div className="font-ndot text-xs tracking-wider text-foreground flex items-center justify-between">
                    <span className="font-mono text-[11px]">17.6868° N, 83.2185° E</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded border border-border/70 text-foreground font-ndot">
                      VIZAG [IN]
                    </span>
                  </div>
                </div>

                <div className="border-b border-border/40 pb-3">
                  <div className="font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground uppercase mb-1">
                    INSTITUTE & ACADEMIC_RANK
                  </div>
                  <div className="font-ndot text-[11px] tracking-wide text-foreground leading-snug">
                    GVPCE (A) VISAKHAPATNAM
                    <div className="text-[9px] text-muted-foreground font-mono mt-0.5">
                      B.TECH IT // CGPA: 8.5 / 10.0
                    </div>
                  </div>
                </div>

                <div className="pb-1">
                  <div className="font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground uppercase mb-1">
                    TELEMETRY_CLOCK
                  </div>
                  <div className="font-mono text-xs text-foreground tracking-widest flex items-center justify-between">
                    <span className="tabular-nums">{clock}</span>
                    <span className="text-[8px] text-foreground/60 font-ndot">SYNC: NTP_0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rotating Cryptographic Verification Seal */}
            <div className="mt-8 pt-5 border-t border-border/60 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-ndot text-[7px] tracking-[0.3em] text-muted-foreground">
                  CRYPTOGRAPHIC STATUS
                </div>
                <div className="font-ndot text-[9px] tracking-[0.18em] text-foreground font-semibold">
                  ENCLAVE: VERIFIED
                </div>
                <div className="font-mono text-[8px] text-muted-foreground">
                  HASH: 0x8F94...CC21
                </div>
              </div>

              {/* Rotary SVG Seal */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg
                  className="w-full h-full animate-seal text-foreground/80 select-none pointer-events-none"
                  viewBox="0 0 100 100"
                >
                  <defs>
                    <path
                      id="sealCirclePath"
                      d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    />
                  </defs>
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    className="opacity-40"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="opacity-60"
                  />
                  <text className="font-mono text-[8.5px] fill-current tracking-[2.8px] uppercase">
                    <textPath href="#sealCirclePath" startOffset="0%">
                      * VERIFIED ENGINEER * 2026 * SYSTEM ARCHITECT *
                    </textPath>
                  </text>
                </svg>

                {/* Inner Crosshair Centerpiece */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border border-foreground/50 flex items-center justify-center bg-background/80">
                    <span className="font-mono text-[9px] text-foreground font-bold leading-none">
                      +
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Resume Decoupling Trigger */}
            <div className="mt-5 pt-4 border-t border-border/50 flex justify-center">
              <ResumeButton
                label="RESUME"
                className="w-full text-center py-3 text-[9px] sm:text-[10px]"
              />
            </div>
          </motion.div>

          {/* RIGHT PANEL: Tactical Command Briefing & Interactive Token Matrix */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-8 flex flex-col justify-between hud-frame glass-panel p-6 sm:p-8 lg:p-10 border border-border/80 rounded-sm relative bg-background/95 backdrop-blur-2xl shadow-2xl"
          >
            <span className="hud-corner hud-tl" />
            <span className="hud-corner hud-tr" />
            <span className="hud-corner hud-bl" />
            <span className="hud-corner hud-br" />

            <div>
              {/* Tactical Status Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 mb-6 font-ndot text-[8px] tracking-[0.28em] text-muted-foreground">
                <span className="text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                  TACTICAL_BRIEFING // CLASSIFIED_PUBLIC
                </span>
                <span className="font-mono text-muted-foreground">SEC_CLEARANCE: LEVEL_03</span>
              </div>

              {/* High-Contrast Editorial Typography with Hoverable Interactive Tokens */}
              <div className="space-y-5 text-sm sm:text-base leading-relaxed font-body text-muted-foreground font-normal text-pretty">
                <div className="font-ndot text-xs sm:text-sm tracking-[0.2em] text-foreground uppercase">
                  ENGINEERING INTELLIGENT SYSTEMS FROM CONCEPT TO PRODUCTION
                </div>

                <p>
                  I am a GenAI Full-Stack Developer with a B.Tech in Information Technology from Gayatri Vidya
                  Parishad College of Engineering (Autonomous), Visakhapatnam (GPA: 8.5/10). My work centers on
                  engineering intelligent, production-ready systems that fuse{' '}
                  <span
                    onMouseEnter={() => handleTokenEnter('genai')}
                    onMouseLeave={handleTokenLeave}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs border border-foreground/40 bg-foreground/[0.05] text-foreground font-ndot text-[11px] sm:text-xs tracking-wider cursor-help hover:bg-foreground hover:text-background transition-colors"
                  >
                    GENAI
                    <span className="text-[9px] opacity-60">↗</span>
                  </span>{' '}
                  architectures with scalable full-stack infrastructure.
                </p>

                <p>
                  My hands-on experience includes developing dual-level knowledge graph agricultural reasoning engines
                  using{' '}
                  <span
                    onMouseEnter={() => handleTokenEnter('rag')}
                    onMouseLeave={handleTokenLeave}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs border border-foreground/40 bg-foreground/[0.05] text-foreground font-ndot text-[11px] sm:text-xs tracking-wider cursor-help hover:bg-foreground hover:text-background transition-colors"
                  >
                    LIGHTRAG
                    <span className="text-[9px] opacity-60">↗</span>
                  </span>{' '}
                  and sub-450ms conversational audio streaming with{' '}
                  <span
                    onMouseEnter={() => handleTokenEnter('voice')}
                    onMouseLeave={handleTokenLeave}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs border border-foreground/40 bg-foreground/[0.05] text-foreground font-ndot text-[11px] sm:text-xs tracking-wider cursor-help hover:bg-foreground hover:text-background transition-colors"
                  >
                    VOICE AI
                    <span className="text-[9px] opacity-60">↗</span>
                  </span>{' '}
                  at Farm Vaidya AI Tech. I have also architected automated road safety scoring systems via{' '}
                  <span
                    onMouseEnter={() => handleTokenEnter('cv')}
                    onMouseLeave={handleTokenLeave}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs border border-foreground/40 bg-foreground/[0.05] text-foreground font-ndot text-[11px] sm:text-xs tracking-wider cursor-help hover:bg-foreground hover:text-background transition-colors"
                  >
                    COMPUTER VISION
                    <span className="text-[9px] opacity-60">↗</span>
                  </span>{' '}
                  at CSIR-CRRI, and delivered high-throughput asynchronous services using{' '}
                  <span
                    onMouseEnter={() => handleTokenEnter('fastapi')}
                    onMouseLeave={handleTokenLeave}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs border border-foreground/40 bg-foreground/[0.05] text-foreground font-ndot text-[11px] sm:text-xs tracking-wider cursor-help hover:bg-foreground hover:text-background transition-colors"
                  >
                    FASTAPI
                    <span className="text-[9px] opacity-60">↗</span>
                  </span>.
                </p>

                <p>
                  As Technical Lead at Open Forge and Cybersecurity Lead at GDSC GVPCE, I specialize in taking
                  technical research concepts end-to-end into robust user applications, high-concurrency APIs, and
                  tactile brutalist design systems.
                </p>
              </div>

              {/* Dynamic Telemetry Micro-Tooltip Drawer */}
              <div className="mt-6 min-h-[64px]">
                <AnimatePresence mode="wait">
                  {activeToken ? (
                    <motion.div
                      key={activeToken.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="p-3.5 rounded-xs border border-foreground/50 bg-foreground/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-ndot text-[9px] tracking-[0.25em] text-foreground font-semibold">
                            {activeToken.name}
                          </span>
                          <span className="font-mono text-[8px] text-muted-foreground">
                            [{activeToken.category}]
                          </span>
                        </div>
                        <div className="font-mono text-[10px] text-foreground/80">
                          {activeToken.spec}
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <div className="font-mono text-[10px] text-foreground font-medium">
                          {activeToken.metric}
                        </div>
                        <div className="font-ndot text-[8px] tracking-[0.2em] text-muted-foreground flex items-center sm:justify-end gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                          {activeToken.status}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="p-3 rounded-xs border border-border/50 bg-foreground/[0.01] flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-ndot text-[8px] tracking-[0.25em]">
                        TIP: HOVER HIGHLIGHTED TOKENS ABOVE TO INSPECT HARDWARE TELEMETRY & SPECS
                      </span>
                      <span className="font-mono text-[9px] hidden sm:inline">STANDBY // READY</span>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Tactical Grid Footnotes */}
            <div className="mt-8 pt-5 border-t border-border/50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div>
                <div className="font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground">FOCUS_01</div>
                <div className="font-ndot text-[10px] tracking-wider text-foreground">GENAI & RAG</div>
              </div>
              <div>
                <div className="font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground">FOCUS_02</div>
                <div className="font-ndot text-[10px] tracking-wider text-foreground">VOICE PIPELINES</div>
              </div>
              <div>
                <div className="font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground">FOCUS_03</div>
                <div className="font-ndot text-[10px] tracking-wider text-foreground">FASTAPI BACKENDS</div>
              </div>
              <div>
                <div className="font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground">FOCUS_04</div>
                <div className="font-ndot text-[10px] tracking-wider text-foreground">EDGE VISION</div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
