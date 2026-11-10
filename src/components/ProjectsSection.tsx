import { useRef, useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
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

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'all') return projectsData;
    return projectsData.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const handleFilterClick = (catId: ProjectCategory | 'all') => {
    setActiveCategory(catId);
    playTactileClick('toggle');
  };

  const handleOpenModal = (project: ProjectItem) => {
    setSelectedProject(project);
    playTactileClick('shutter');
  };

  return (
    <section id="projects" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="OUTPUT_MANIFEST // ARCHITECTURAL_ROWS" title="PROJECTS" number="05" />

        {/* Filter Navigation Bar */}
        <div className="mb-12 flex flex-wrap items-center gap-2">
          {projectFilterCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleFilterClick(cat.id)}
                className={`px-3.5 sm:px-4 py-2 font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] rounded-full transition-all duration-200 focus:outline-none ${
                  isActive
                    ? 'bg-foreground text-background font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'border border-border/80 text-muted-foreground hover:text-foreground hover:border-foreground/60'
                }`}
                data-cursor-hover
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FULL-WIDTH ARCHITECTURAL BLUEPRINT ROWS (Zero Box Cards) */}
        <div className="divide-y divide-border/60 border-t border-b border-border/60">
          {filteredProjects.map((project: ProjectItem, idx: number) => {
            const isHovered = hoveredProjectId === project.id;
            const indexFormatted = String(idx + 1).padStart(2, '0');

            return (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 25 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
                onMouseEnter={() => {
                  setHoveredProjectId(project.id);
                  playTactileClick('subtle');
                }}
                onMouseLeave={() => setHoveredProjectId(null)}
                className="py-10 sm:py-14 relative group hover:bg-foreground/[0.015] transition-colors"
              >
                {/* Massive Monospace Low-Opacity Watermark Number */}
                <span className="font-mono text-7xl sm:text-9xl font-bold opacity-[0.04] group-hover:opacity-[0.09] text-foreground select-none absolute right-2 sm:right-6 top-6 pointer-events-none transition-opacity duration-300">
                  {indexFormatted}
                </span>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                  
                  {/* Left Column: Title & Deep Architectural Breakdown */}
                  <div className="lg:col-span-7 space-y-4">
                    
                    {/* Meta Bar */}
                    <div className="flex flex-wrap items-center gap-2.5 font-ndot text-[8px] tracking-[0.25em]">
                      <span className="px-2 py-0.5 rounded-xs border border-border/80 bg-foreground/[0.02] text-foreground">
                        {project.categoryLabel}
                      </span>
                      <span className="text-muted-foreground font-mono">
                        BLUEPRINT_{indexFormatted}
                      </span>
                      {project.repositoryStatus === 'internal-production' && (
                        <span className="px-1.5 py-0.5 text-muted-foreground border border-border/60 font-mono">
                          INTERNAL PROD
                        </span>
                      )}
                    </div>

                    {/* Project Title & Tagline */}
                    <div>
                      <h3 className="font-ndot text-2xl sm:text-3xl text-foreground text-glow tracking-wider group-hover:text-foreground transition-colors">
                        {project.title}
                      </h3>
                      <div className="font-body text-xs sm:text-sm text-foreground/80 mt-1 font-medium">
                        {project.tagline}
                      </div>
                    </div>

                    {/* Problem Statement & Description */}
                    <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty font-normal">
                      {project.description}
                    </p>

                    {/* Key Highlights */}
                    {project.whatIBuilt && project.whatIBuilt.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="font-ndot text-[7.5px] tracking-[0.28em] text-muted-foreground uppercase">
                          ARCHITECTURAL IMPLEMENTATION
                        </div>
                        {project.whatIBuilt.slice(0, 3).map((item, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2.5 text-xs font-body text-muted-foreground">
                            <span className="font-mono text-[9px] text-foreground/70 shrink-0 mt-0.5">
                              0{bIdx + 1}.
                            </span>
                            <span className="leading-relaxed">{item}</span>
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
                          className="nav-cta px-3.5 py-1.5 rounded-xs font-ndot text-[8.5px] tracking-[0.22em] focus:outline-none flex items-center gap-1.5"
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
                          className="px-3.5 py-1.5 rounded-xs border border-border/80 hover:border-foreground/80 bg-foreground/[0.02] font-ndot text-[8.5px] tracking-[0.22em] text-foreground focus:outline-none flex items-center gap-1.5 transition-colors"
                          data-cursor-hover
                        >
                          <span>TRACE // REPO</span>
                          <span>↗</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleOpenModal(project)}
                        className="px-3 py-1.5 rounded-xs border border-border/60 hover:border-foreground/60 font-ndot text-[8px] tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
                        data-cursor-hover
                      >
                        SPECS // DETAILS [+]
                      </button>
                    </div>

                  </div>

                  {/* Right Column: Sleek Wireframe Schematic Preview & Architecture Flow */}
                  <div className="lg:col-span-5 space-y-4 pt-2 lg:pt-0">
                    
                    {/* Wireframe Flow Diagram */}
                    <div className="p-4 border border-border/70 rounded-xs bg-foreground/[0.015] relative overflow-hidden transition-all duration-300">
                      <div className="flex items-center justify-between font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground border-b border-border/50 pb-2 mb-3">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <span className={`h-1.5 w-1.5 rounded-full ${isHovered ? 'bg-foreground phosphor-led' : 'bg-foreground/50'}`} />
                          SCHEMATIC_FLOW // L2_PIPELINE
                        </span>
                        <span className="font-mono">VERIFIED</span>
                      </div>

                      {/* Schematic Stages */}
                      <div className="space-y-2 font-mono text-[10px] text-foreground/85">
                        {project.architectureWorkflow && project.architectureWorkflow.length > 0 ? (
                          project.architectureWorkflow.slice(0, 3).map((flowStep, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-2 leading-relaxed">
                              <span className="text-foreground/40 shrink-0">STEP_{fIdx + 1} &gt;</span>
                              <span className="text-muted-foreground">{flowStep}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-muted-foreground py-2 font-ndot text-[9px] tracking-wider">
                            ARCHITECTURAL SCHEMATIC: PRODUCTION-VERIFIED
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Technologies Hairline Array */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[8.5px] px-2 py-0.5 rounded-xs border border-border/60 text-foreground/80 hover:text-foreground hover:border-foreground/70 transition-colors"
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
        </div>

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
