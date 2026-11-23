import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playTactileClick } from '@/utils/audioFeedback';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeUrl?: string;
}

export const ResumeModal = ({
  isOpen,
  onClose,
  resumeUrl = '/resume.pdf',
}: ResumeModalProps) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'summary'>('preview');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playTactileClick('subtle');
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    'https://murali-paila.vercel.app' + resumeUrl
  )}&embedded=true`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/90 backdrop-blur-md"
            onClick={() => {
              playTactileClick('subtle');
              onClose();
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl h-[92vh] flex flex-col hud-frame glass-panel border border-border bg-background/95 shadow-2xl z-10 overflow-hidden rounded-xs"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-resume-title"
          >
            {/* Tactical Corner Reticle Brackets */}
            <span className="hud-corner hud-tl" />
            <span className="hud-corner hud-tr" />
            <span className="hud-corner hud-bl" />
            <span className="hud-corner hud-br" />

            {/* Laser Scanning Top Accent */}
            <div className="absolute inset-x-0 top-0 h-px overflow-hidden pointer-events-none">
              <div className="h-px w-1/3 bg-foreground/70 animate-[beam_3s_linear_infinite]" />
            </div>

            {/* Header Telemetry Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-border/70 p-3 sm:p-4 gap-2 bg-foreground/[0.02]">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-foreground phosphor-led shrink-0" />
                <div className="min-w-0">
                  <div className="font-ndot text-[8px] sm:text-[9px] tracking-[0.25em] text-muted-foreground uppercase flex items-center gap-1.5 truncate">
                    <span>SYSTEM_SPEC</span>
                    <span>//</span>
                    <span className="text-foreground font-semibold">MURALI_PAILA_CV</span>
                  </div>
                  <div className="font-mono text-[7px] sm:text-[7.5px] text-muted-foreground/80 tracking-wider hidden sm:block">
                    PAYLOAD: 115 KB // PDF_STREAM // INTEGRITY_VERIFIED
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {/* View Mode Toggle for Small Screens */}
                <div className="flex items-center border border-border/80 rounded-xs p-0.5 bg-background text-[8px] font-ndot tracking-wider">
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick('subtle');
                      setActiveTab('preview');
                    }}
                    className={`px-2 py-1 rounded-xs transition-colors ${
                      activeTab === 'preview'
                        ? 'bg-foreground text-background font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    PDF_STREAM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick('subtle');
                      setActiveTab('summary');
                    }}
                    className={`px-2 py-1 rounded-xs transition-colors ${
                      activeTab === 'summary'
                        ? 'bg-foreground text-background font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    BRIEF
                  </button>
                </div>

                {/* Direct Download Latch */}
                <a
                  href={resumeUrl}
                  download="Murali_Paila_Resume.pdf"
                  onClick={() => playTactileClick('toggle')}
                  className="font-ndot text-[8.5px] sm:text-[9.5px] tracking-[0.18em] px-2.5 sm:px-3 py-1.5 border border-border text-foreground hover:bg-foreground hover:text-background transition-colors rounded-xs inline-flex items-center gap-1.5 focus:outline-none"
                  data-cursor-hover
                  title="Download Resume PDF directly"
                >
                  <span>DOWNLOAD</span>
                  <span className="font-mono text-xs">📥</span>
                </a>

                {/* Direct Tab Latch */}
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playTactileClick('toggle')}
                  className="hidden md:inline-flex font-ndot text-[8.5px] sm:text-[9.5px] tracking-[0.18em] px-2.5 sm:px-3 py-1.5 border border-border text-foreground hover:bg-foreground hover:text-background transition-colors rounded-xs items-center gap-1 focus:outline-none"
                  data-cursor-hover
                  title="Open PDF in new browser tab"
                >
                  <span>TAB</span>
                  <span className="font-mono text-xs">↗</span>
                </a>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick('subtle');
                    onClose();
                  }}
                  className="font-ndot text-[9px] sm:text-[10px] tracking-[0.2em] px-3 py-1.5 border border-border text-foreground hover:bg-foreground hover:text-background transition-colors rounded-xs inline-flex items-center gap-1 focus:outline-none"
                  data-cursor-hover
                  aria-label="Close resume viewer"
                >
                  <span>CLOSE</span>
                  <span className="font-mono text-xs">✕</span>
                </button>
              </div>
            </div>

            {/* Main Viewer Body */}
            <div className="flex-1 relative bg-black/40 overflow-hidden flex flex-col">
              {activeTab === 'preview' ? (
                <div className="relative w-full h-full flex flex-col">
                  {/* Embedded PDF Object / Iframe */}
                  <iframe
                    src={`${resumeUrl}#toolbar=1&navpanes=0`}
                    className="w-full flex-1 border-0 bg-neutral-900"
                    title="Murali Paila Resume Document"
                  />

                  {/* Anti-Interference Telemetry Footbar */}
                  <div className="p-2 sm:p-2.5 border-t border-border/60 bg-background/95 flex flex-wrap items-center justify-between gap-2 font-mono text-[7.5px] sm:text-[8px] text-muted-foreground">
                    <span className="text-foreground/80 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      SECURE_STREAM: LOCAL_ORIGIN
                    </span>

                    <div className="flex items-center gap-3">
                      <span>Extension blocking PDF?</span>
                      <a
                        href={googleViewerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground underline hover:text-glow transition-colors"
                      >
                        [ Open in Google Viewer ↗ ]
                      </a>
                      <a
                        href={resumeUrl}
                        download="Murali_Paila_Resume.pdf"
                        className="text-foreground underline hover:text-glow transition-colors font-bold"
                      >
                        [ Direct Download 📥 ]
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                /* Text Brief Fallback View */
                <div className="w-full h-full overflow-y-auto p-4 sm:p-8 space-y-6 text-foreground font-mono">
                  <div className="border-b border-border/60 pb-4">
                    <h2 className="font-ndot text-2xl text-foreground font-bold tracking-wider">
                      MURALI PAILA
                    </h2>
                    <p className="font-ndot text-xs text-muted-foreground tracking-[0.2em] mt-1">
                      GENAI FULL-STACK DEVELOPER // PRODUCTION ENGINEER
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      muralijay360@gmail.com • Visakhapatnam, India • github.com/murali127 • linkedin.com/in/muralipaila
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <h3 className="font-ndot text-sm text-foreground tracking-widest border-b border-border/40 pb-1 mb-2">
                        PROFESSIONAL SUMMARY
                      </h3>
                      <p className="text-muted-foreground leading-relaxed font-body">
                        GenAI Full-Stack Developer specializing in conversational AI architectures, LightRAG knowledge graph retrieval systems, low-latency Voice AI streaming pipelines (Agora + Sarvam STT), and high-throughput FastAPI backends.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-ndot text-sm text-foreground tracking-widest border-b border-border/40 pb-1 mb-2">
                        CORE STACK & TOOLS
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Python, FastAPI, TypeScript, React.js, Next.js, Docker, AWS, MongoDB, PostgreSQL, LightRAG, OpenCV, YOLOX, ByteTrack, Pipecat, Agora AI.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-ndot text-sm text-foreground tracking-widest border-b border-border/40 pb-1 mb-2">
                        WORK EXPERIENCE
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between font-bold text-foreground">
                            <span>GEN AI ENGINEER INTERN // FARM VAIDYA AI TECH</span>
                            <span>OCT 2025 – JUN 2026</span>
                          </div>
                          <p className="text-muted-foreground text-[11px] leading-relaxed">
                            Built real-time conversational AI workflows with LightRAG and low-latency voice pipelines with Agora & Sarvam STT.
                          </p>
                        </div>
                        <div>
                          <div className="flex justify-between font-bold text-foreground">
                            <span>RESEARCH INTERN // CSIR-CRRI</span>
                            <span>APR 2025 – MAY 2025</span>
                          </div>
                          <p className="text-muted-foreground text-[11px] leading-relaxed">
                            Developed road safety scoring computer vision system using YOLOX and ByteTrack algorithms on video feeds.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/60 flex gap-3">
                      <a
                        href={resumeUrl}
                        download="Murali_Paila_Resume.pdf"
                        className="px-4 py-2 bg-foreground text-background font-ndot text-xs tracking-wider font-bold rounded-xs"
                      >
                        DOWNLOAD COMPLETE PDF 📥
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ResumeModal;
