import { useRef, useState, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import SectionHeader from './SectionHeader';
import {
  projectsData,
  projectFilterCategories,
  ProjectItem,
  ProjectCategory,
} from '@/data/projects';
import ProjectDetailModal from './ProjectDetailModal';

const ProjectsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'all'>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [showArchive, setShowArchive] = useState(false);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (activeCategory === 'all') return projectsData;
    return projectsData.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  // Featured vs Secondary for "all" view
  const featuredProjects = useMemo(() => {
    return filteredProjects.filter((p) => p.featured);
  }, [filteredProjects]);

  const secondaryProjects = useMemo(() => {
    return filteredProjects.filter((p) => !p.featured);
  }, [filteredProjects]);

  // Tactile border illumination mouse proximity tracker
  const handleCardMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <section id="projects" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="pointer-events-none absolute inset-0 opacity-20 dot-grid-bg" />
      <div className="mx-auto max-w-7xl relative">
        <SectionHeader label="OUTPUT_LOG // VERIFIED" title="PROJECTS" number="05" />

        {/* Filter Navigation Bar */}
        <div className="mb-10 sm:mb-12 flex flex-wrap items-center gap-2">
          {projectFilterCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative px-3.5 sm:px-4 py-2 font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] rounded-full transition-all duration-300 focus:outline-none ${
                  isActive
                    ? 'bg-foreground text-background font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'glass-panel text-muted-foreground hover:text-foreground hover:border-foreground/40'
                }`}
                data-cursor-hover
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Primary Project Grid with Tactile Border Illumination */}
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {(activeCategory === 'all' ? featuredProjects : filteredProjects).map((project, i) => (
              <motion.article
                key={project.id}
                layout
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                onMouseMove={handleCardMouseMove}
                className="hud-frame glass-panel tactile-border-card group relative overflow-hidden p-5 sm:p-8 flex flex-col justify-between border border-border/80 rounded-sm hover:-translate-y-1 hover:shadow-[0_0_30px_hsl(var(--foreground)/0.06)]"
                data-cursor-hover
              >
                {/* HUD Tactical Corners */}
                <span className="hud-corner hud-tl" />
                <span className="hud-corner hud-tr" />
                <span className="hud-corner hud-bl" />
                <span className="hud-corner hud-br" />

                {/* Upper Telemetry & Status */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-ndot text-[8px] tracking-[0.25em] px-2.5 py-1 rounded-xs border border-border/70 bg-foreground/[0.03] text-foreground">
                      {project.categoryLabel}
                    </span>

                    <div className="flex items-center gap-2">
                      {project.repositoryStatus === 'internal-production' && (
                        <span className="font-ndot text-[7px] tracking-[0.18em] px-2 py-0.5 border border-border/60 text-muted-foreground">
                          INTERNAL PROD
                        </span>
                      )}
                      <span className="font-ndot text-[9px] tracking-[0.2em] text-muted-foreground">
                        PRJ_{String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="font-ndot text-xl sm:text-2xl text-foreground text-glow mb-1 tracking-wide">
                    {project.title}
                  </h3>
                  <div className="font-body text-xs text-muted-foreground/80 mb-3 tracking-normal font-normal">
                    {project.tagline}
                  </div>

                  {/* Description - Modern Sans Space Grotesk */}
                  <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5 text-pretty font-normal">
                    {project.description}
                  </p>

                  {/* Highlight Contributions */}
                  {project.whatIBuilt && project.whatIBuilt.length > 0 && (
                    <div className="mb-5 space-y-1.5 border-t border-border/40 pt-3">
                      <div className="font-ndot text-[8px] tracking-[0.25em] text-muted-foreground mb-1">
                        KEY HIGHLIGHTS
                      </div>
                      {project.whatIBuilt.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs sm:text-[13px] font-body text-muted-foreground">
                          <span className="text-[10px] text-foreground shrink-0 mt-0.5">•</span>
                          <span className="line-clamp-2 leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Section: Tech Tags & Action Buttons */}
                <div className="border-t border-border/50 pt-5 mt-4 space-y-4">
                  {/* Technology Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((t) => (
                      <span
                        key={t}
                        className="skill-chip px-2 py-0.5 font-ndot text-[8px] tracking-[0.14em] text-foreground/80 rounded-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Action Link Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="nav-cta rounded-full px-4 py-2 font-ndot text-[9px] tracking-[0.2em] inline-flex items-center gap-1.5 focus:outline-none"
                      data-cursor-hover
                    >
                      <span>INSPECT SPEC</span>
                      <span>[+]</span>
                    </button>

                    <div className="flex items-center gap-2 ml-auto">
                      {project.liveDemoUrl && (
                        <a
                          href={project.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="glass-panel-hover px-3 py-1.5 font-ndot text-[8px] tracking-[0.18em] text-foreground rounded-full inline-flex items-center gap-1"
                          data-cursor-hover
                        >
                          <span>DEMO</span>
                          <span className="font-mono text-[10px]">↗</span>
                        </a>
                      )}

                      {project.repositoryUrl && project.repositoryStatus === 'public' && (
                        <a
                          href={project.repositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="glass-panel px-3 py-1.5 font-ndot text-[8px] tracking-[0.18em] text-muted-foreground hover:text-foreground rounded-full inline-flex items-center gap-1 transition-colors"
                          data-cursor-hover
                        >
                          <span>GITHUB</span>
                          <span className="font-mono text-[10px]">↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {/* Secondary Projects / Archive Collapsible */}
        {activeCategory === 'all' && secondaryProjects.length > 0 && (
          <div className="mt-16 border-t border-border pt-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="font-ndot text-[9px] tracking-[0.3em] text-muted-foreground">
                  SECONDARY CATALOGUE
                </div>
                <h4 className="font-ndot text-lg sm:text-xl text-foreground">
                  ADDITIONAL SYSTEMS & OPEN SOURCE
                </h4>
              </div>

              <button
                onClick={() => setShowArchive(!showArchive)}
                className="glass-panel-hover border-glow px-4 py-2 font-ndot text-[9px] tracking-[0.2em] text-foreground rounded-full inline-flex items-center gap-2 self-start sm:self-auto"
                data-cursor-hover
              >
                <span>{showArchive ? 'HIDE ARCHIVE' : `EXPAND ARCHIVE (${secondaryProjects.length})`}</span>
                <span className="font-mono text-[10px]">{showArchive ? '▲' : '▼'}</span>
              </button>
            </div>

            <AnimatePresence>
              {showArchive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                    {secondaryProjects.map((p, idx) => (
                      <div
                        key={p.id}
                        onMouseMove={handleCardMouseMove}
                        className="hud-frame glass-panel tactile-border-card p-5 flex flex-col justify-between space-y-4 hover:border-foreground/30 transition-all rounded-sm"
                      >
                        <span className="hud-corner hud-tl" />
                        <span className="hud-corner hud-tr" />
                        <span className="hud-corner hud-bl" />
                        <span className="hud-corner hud-br" />

                        <div>
                          <div className="flex items-center justify-between text-[8px] font-ndot tracking-[0.2em] text-muted-foreground mb-2">
                            <span>{p.categoryLabel}</span>
                            <span>ARC_{String(idx + 1).padStart(2, '0')}</span>
                          </div>

                          <h5 className="font-ndot text-base text-foreground mb-1">
                            {p.title}
                          </h5>
                          <p className="font-body text-xs text-muted-foreground line-clamp-3 leading-relaxed font-normal">
                            {p.description}
                          </p>
                        </div>

                        <div className="border-t border-border/40 pt-3 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedProject(p)}
                            className="font-ndot text-[8px] tracking-[0.2em] text-foreground hover:underline"
                            data-cursor-hover
                          >
                            INSPECT SPEC [+]
                          </button>

                          <div className="flex items-center gap-2">
                            {p.liveDemoUrl && (
                              <a
                                href={p.liveDemoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-ndot text-[8px] tracking-[0.14em] text-muted-foreground hover:text-foreground"
                                data-cursor-hover
                              >
                                DEMO ↗
                              </a>
                            )}
                            {p.repositoryUrl && p.repositoryStatus === 'public' && (
                              <a
                                href={p.repositoryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-ndot text-[8px] tracking-[0.14em] text-muted-foreground hover:text-foreground"
                                data-cursor-hover
                              >
                                GITHUB ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Project Detail Modal */}
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </div>
    </section>
  );
};

export default ProjectsSection;
