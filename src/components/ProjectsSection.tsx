import { useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from './SectionHeader';
import {
  projectsData,
  projectFilterCategories,
  ProjectItem,
  ProjectCategory,
} from '@/data/projects';
import ProjectDetailModal from './ProjectDetailModal';
import { playTactileClick } from '@/utils/audioFeedback';

const ProjectsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'all'>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [showAllArchive, setShowAllArchive] = useState(false);

  // Filter projects by category
  const categoryProjects = useMemo(() => {
    if (activeCategory === 'all') return projectsData;
    return projectsData.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  // When in 'all' view, curate top 4 flagship systems unless user toggles expanded view
  const visibleProjects = useMemo(() => {
    if (activeCategory === 'all' && !showAllArchive) {
      return categoryProjects.filter((p) => p.featured).slice(0, 4);
    }
    return categoryProjects;
  }, [activeCategory, showAllArchive, categoryProjects]);

  const hiddenCount = categoryProjects.length - visibleProjects.length;

  const handleFilterClick = (catId: ProjectCategory | 'all') => {
    setActiveCategory(catId);
    setShowAllArchive(false);
    playTactileClick('toggle');
  };

  const handleOpenModal = (project: ProjectItem) => {
    setSelectedProject(project);
    playTactileClick('shutter');
  };

  const toggleArchive = () => {
    setShowAllArchive((prev) => !prev);
    playTactileClick('toggle');
  };

  return (
    <section id="projects" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="FLAGSHIP_SYSTEMS // ARCHITECTURAL_ROWS" title="PROJECTS" number="05" />

        {/* Filter Navigation Bar & Archive Counter */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {projectFilterCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleFilterClick(cat.id)}
                  className={`px-3.5 sm:px-4 py-2 font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] rounded-full transition-all duration-200 focus:outline-none ${
                    isActive
                      ? 'bg-foreground text-background font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                      : 'border border-border/80 bg-background/80 text-muted-foreground hover:text-foreground hover:border-foreground/60'
                  }`}
                  data-cursor-hover
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Quick Registry Indicator */}
          <div className="font-mono text-[9px] text-muted-foreground flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground phosphor-led" />
            <span>DISPLAYING: {visibleProjects.length} OF {categoryProjects.length} BLUEPRINTS</span>
          </div>
        </div>

        {/* HIGH-CONTRAST CURATED ARCHITECTURAL ROWS */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {visibleProjects.map((project: ProjectItem, idx: number) => {
              const isHovered = hoveredProjectId === project.id;
              const indexFormatted = String(idx + 1).padStart(2, '0');

              return (
                <motion.article
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  onMouseEnter={() => {
                    setHoveredProjectId(project.id);
                    playTactileClick('subtle');
                  }}
                  onMouseLeave={() => setHoveredProjectId(null)}
                  className="hud-frame glass-panel p-6 sm:p-8 lg:p-10 border border-border/80 rounded-sm relative shadow-2xl overflow-hidden bg-background/94 backdrop-blur-2xl group transition-all duration-300 hover:border-foreground/60"
                >
                  {/* Tactical Corner Brackets */}
                  <span className="hud-corner hud-tl" />
                  <span className="hud-corner hud-tr" />
                  <span className="hud-corner hud-bl" />
                  <span className="hud-corner hud-br" />

                  {/* Laser Scanning Accent on Active Hover */}
                  {isHovered && (
                    <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
                      <div className="h-px w-1/3 bg-foreground/80 animate-[beam_2s_linear_infinite]" />
                    </div>
                  )}

                  {/* Massive Monospace Low-Opacity Watermark Number */}
                  <span className="font-mono text-7xl sm:text-9xl font-bold opacity-[0.035] group-hover:opacity-[0.08] text-foreground select-none absolute right-4 sm:right-8 top-4 pointer-events-none transition-opacity duration-300">
                    {indexFormatted}
                  </span>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                    
                    {/* Left Column: Title & Deep Architectural Breakdown */}
                    <div className="lg:col-span-7 space-y-4">
                      
                      {/* Meta Ribbon */}
                      <div className="flex flex-wrap items-center gap-2.5 font-ndot text-[8px] tracking-[0.25em]">
                        <span className="px-2.5 py-0.5 rounded-xs border border-foreground/30 bg-foreground/[0.04] text-foreground font-semibold">
                          {project.categoryLabel}
                        </span>
                        <span className="text-muted-foreground font-mono">
                          BLUEPRINT_{indexFormatted}
                        </span>
                        {project.repositoryStatus === 'internal-production' && (
                          <span className="px-2 py-0.5 rounded-xs border border-border/80 bg-background/80 text-foreground font-mono">
                            INTERNAL PROD
                          </span>
                        )}
                        <span className="text-muted-foreground/70 font-mono hidden sm:inline">
                          VERIFIED_BUILD
                        </span>
                      </div>

                      {/* Project Title & Tagline */}
                      <div>
                        <h3 className="font-ndot text-2xl sm:text-3xl text-foreground text-glow tracking-wider">
                          {project.title}
                        </h3>
                        <div className="font-body text-xs sm:text-sm text-foreground/85 mt-1 font-medium">
                          {project.tagline}
                        </div>
                      </div>

                      {/* Problem Statement & Description */}
                      <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty font-normal">
                        {project.description}
                      </p>

                      {/* Key Architectural Highlights */}
                      {project.whatIBuilt && project.whatIBuilt.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-border/40">
                          <div className="font-ndot text-[7.5px] tracking-[0.28em] text-muted-foreground uppercase">
                            CORE PRODUCTION IMPLEMENTATIONS
                          </div>
                          {project.whatIBuilt.slice(0, 3).map((item, bIdx) => (
                            <div key={bIdx} className="flex items-start gap-2.5 text-xs font-body text-muted-foreground">
                              <span className="font-mono text-[9px] text-foreground/80 shrink-0 mt-0.5">
                                0{bIdx + 1}.
                              </span>
                              <span className="leading-relaxed text-pretty">{item}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Direct Inline Action Buttons */}
                      <div className="pt-3 flex flex-wrap items-center gap-3">
                        {project.liveDemoUrl && (
                          <a
                            href={project.liveDemoUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => playTactileClick('toggle')}
                            className="nav-cta px-4 py-2 rounded-xs font-ndot text-[8.5px] tracking-[0.22em] focus:outline-none flex items-center gap-1.5"
                            data-cursor-hover
                          >
                            <span>EXECUTE // DEMO</span>
                            <span>↗</span>
                          </a>
                        )}

                        {project.repositoryUrl && (
                          <a
                            href={project.repositoryUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => playTactileClick('toggle')}
                            className="px-4 py-2 rounded-xs border border-border/80 hover:border-foreground/80 bg-foreground/[0.02] font-ndot text-[8.5px] tracking-[0.22em] text-foreground focus:outline-none flex items-center gap-1.5 transition-colors"
                            data-cursor-hover
                          >
                            <span>TRACE // REPO</span>
                            <span>↗</span>
                          </a>
                        )}

                        <button
                          onClick={() => handleOpenModal(project)}
                          className="px-4 py-2 rounded-xs border border-border/60 hover:border-foreground/60 font-ndot text-[8px] tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
                          data-cursor-hover
                        >
                          SYSTEM ARCHITECTURE [+]
                        </button>
                      </div>

                    </div>

                    {/* Right Column: Dynamic Schematic Flow Pipeline & Technologies */}
                    <div className="lg:col-span-5 space-y-4 pt-2 lg:pt-0">
                      
                      {/* Wireframe Schematic Flow Console */}
                      <div className="p-4 border border-border/70 rounded-xs bg-foreground/[0.02] relative overflow-hidden">
                        <div className="flex items-center justify-between font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground border-b border-border/50 pb-2 mb-3">
                          <span className="flex items-center gap-1.5 text-foreground font-semibold">
                            <span className={`h-1.5 w-1.5 rounded-full ${isHovered ? 'bg-foreground phosphor-led' : 'bg-foreground/50'}`} />
                            ARCHITECTURE_PIPELINE // DATA_FLOW
                          </span>
                          <span className="font-mono text-foreground/80">L2_VERIFIED</span>
                        </div>

                        {/* Schematic Stages */}
                        <div className="space-y-2.5 font-mono text-[9.5px] sm:text-[10px]">
                          {project.architectureWorkflow && project.architectureWorkflow.length > 0 ? (
                            project.architectureWorkflow.slice(0, 4).map((flowStep, fIdx) => (
                              <div key={fIdx} className="flex items-start gap-2.5 leading-relaxed">
                                <span className="font-ndot text-[8px] text-foreground/50 shrink-0 mt-0.5">
                                  PHASE_0{fIdx + 1} &gt;
                                </span>
                                <span className="text-foreground/85 font-body text-xs">{flowStep}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-muted-foreground py-2 font-ndot text-[9px] tracking-wider">
                              ARCHITECTURAL SCHEMATIC: PRODUCTION-VERIFIED
                            </div>
                          )}
                        </div>

                        {/* Interactive Data Pulse Bar on Hover */}
                        <div className="mt-4 pt-2 border-t border-border/40 flex items-center justify-between font-mono text-[8px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-foreground" />
                            PIPE_IO: SYNCHRONIZED
                          </span>
                          <span className="text-foreground">LATENCY: OPTIMAL</span>
                        </div>
                      </div>

                      {/* Technologies Hairline Array */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.technologies.map((t) => (
                          <span
                            key={t}
                            className="font-mono text-[8.5px] px-2 py-0.5 rounded-xs border border-border/60 bg-foreground/[0.02] text-foreground/90 hover:text-foreground hover:border-foreground/80 transition-colors"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                    </div>

                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>

        {/* TACTILE EXPAND / COLLAPSE REEL FOR ARCHIVED BLUEPRINTS */}
        {activeCategory === 'all' && hiddenCount > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={toggleArchive}
              className="px-6 py-3.5 rounded-xs border border-border/90 hover:border-foreground/90 bg-background/90 backdrop-blur-lg font-ndot text-[9px] sm:text-[10px] tracking-[0.28em] text-foreground shadow-xl transition-all flex items-center gap-2.5 group"
              data-cursor-hover
            >
              <span className="h-2 w-2 rounded-full bg-foreground phosphor-led" />
              <span>
                {showAllArchive
                  ? 'COLLAPSE_ARCHIVED_BLUEPRINTS [−]'
                  : `REVEAL_${hiddenCount}_ADDITIONAL_SYSTEM_BLUEPRINTS [+]`}
              </span>
            </button>
          </div>
        )}

        {/* Global Architecture Modal */}
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </div>
    </section>
  );
};

export default ProjectsSection;
