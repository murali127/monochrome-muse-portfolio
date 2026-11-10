import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectItem } from '@/data/projects';

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

const ProjectDetailModal = ({ project, onClose }: ProjectDetailModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Content Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto hud-frame glass-panel border border-border p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl z-10 my-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-project-title"
          >
            {/* Tactical Corner Brackets */}
            <span className="hud-corner hud-tl" />
            <span className="hud-corner hud-tr" />
            <span className="hud-corner hud-bl" />
            <span className="hud-corner hud-br" />

            {/* Top Bar with Category & Close Button */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3 sm:pb-4 gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground">
                  SYSTEM_SPEC //
                </span>
                <span className="font-ndot text-[8px] tracking-[0.2em] px-2 py-0.5 rounded-xs border border-border/80 bg-foreground/[0.04] text-foreground">
                  {project.categoryLabel}
                </span>
                {project.repositoryStatus === 'internal-production' && (
                  <span className="font-ndot text-[7px] sm:text-[8px] tracking-[0.18em] px-2 py-0.5 border border-border/60 text-muted-foreground">
                    INTERNAL PRODUCTION
                  </span>
                )}
              </div>

              <button
                onClick={onClose}
                className="font-ndot text-[9px] sm:text-[10px] tracking-[0.2em] px-3 py-1.5 min-h-[36px] sm:min-h-[40px] border border-border text-foreground hover:bg-foreground hover:text-background transition-colors rounded-xs focus:outline-none inline-flex items-center"
                data-cursor-hover
                aria-label="Close modal dialog"
              >
                CLOSE [ESC]
              </button>
            </div>

            {/* Title & Tagline */}
            <div>
              <h2 id="modal-project-title" className="font-ndot text-xl sm:text-3xl text-foreground text-glow tracking-wide break-words">
                {project.title}
              </h2>
              <p className="font-body text-xs sm:text-sm text-muted-foreground mt-1 font-normal">
                {project.tagline}
              </p>
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <div className="font-ndot text-[9px] tracking-[0.3em] text-foreground">
                OVERVIEW
              </div>
              <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty font-normal">
                {project.description}
              </p>
            </div>

            {/* Problem Statement */}
            {project.problemStatement && (
              <div className="space-y-2 border-t border-border/40 pt-4">
                <div className="font-ndot text-[9px] tracking-[0.3em] text-foreground">
                  PROBLEM ADDRESSED
                </div>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty font-normal">
                  {project.problemStatement}
                </p>
              </div>
            )}

            {/* What I Built / Key Technical Contributions */}
            {project.whatIBuilt && project.whatIBuilt.length > 0 && (
              <div className="space-y-2.5 border-t border-border/40 pt-4">
                <div className="font-ndot text-[9px] tracking-[0.3em] text-foreground">
                  ENGINEERING CONTRIBUTIONS
                </div>
                <ul className="space-y-2">
                  {project.whatIBuilt.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="mt-1 font-ndot text-[8px] text-muted-foreground shrink-0">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty font-normal">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technical Architecture / Workflow */}
            {project.architectureWorkflow && project.architectureWorkflow.length > 0 && (
              <div className="space-y-2.5 border-t border-border/40 pt-4">
                <div className="font-ndot text-[9px] tracking-[0.3em] text-foreground">
                  SYSTEM ARCHITECTURE & WORKFLOW
                </div>
                <div className="space-y-2">
                  {project.architectureWorkflow.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 border border-border/60 bg-foreground/[0.02] flex items-start gap-3 rounded-xs"
                    >
                      <span className="font-ndot text-[9px] text-foreground/80 shrink-0 mt-0.5">
                        STEP_{idx + 1}
                      </span>
                      <span className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty font-normal">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technologies */}
            <div className="space-y-2.5 border-t border-border/40 pt-4">
              <div className="font-ndot text-[9px] tracking-[0.3em] text-muted-foreground">
                TECHNOLOGY STACK
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((t) => (
                  <span
                    key={t}
                    className="skill-chip px-2.5 py-1 font-ndot text-[9px] tracking-[0.16em] text-foreground rounded-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions & Links Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/60">
              <div className="flex flex-wrap items-center gap-3">
                {project.liveDemoUrl && (
                  <a
                    href={project.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-cta rounded-full px-5 py-2.5 font-ndot text-[10px] tracking-[0.2em] inline-flex items-center gap-1.5"
                    data-cursor-hover
                  >
                    <span>LAUNCH DEMO</span>
                    <span>↗</span>
                  </a>
                )}

                {project.repositoryUrl && project.repositoryStatus === 'public' && (
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-panel-hover border-glow px-5 py-2.5 font-ndot text-[10px] tracking-[0.2em] text-foreground rounded-full inline-flex items-center gap-1.5"
                    data-cursor-hover
                  >
                    <span>VIEW REPOSITORY</span>
                    <span>↗</span>
                  </a>
                )}

                {project.repositoryStatus === 'internal-production' && (
                  <div className="font-mono text-xs text-muted-foreground inline-flex items-center gap-2 break-all">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                    <span>Proprietary Production System (Private)</span>
                  </div>
                )}

                {project.repositoryStatus === 'local-only' && (
                  <div className="font-mono text-xs text-muted-foreground inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                    <span>Local Android Studio Project</span>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="font-ndot text-[9px] tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors self-start sm:self-auto sm:ml-auto"
                data-cursor-hover
              >
                RETURN TO LIST [X]
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProjectDetailModal;
