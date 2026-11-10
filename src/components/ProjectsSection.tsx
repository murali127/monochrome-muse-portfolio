import { useRef, useState, useMemo, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import SectionHeader from './SectionHeader';
import {
  projectsData,
  projectFilterCategories,
  ProjectItem,
  ProjectCategory,
} from '@/data/projects';
import ProjectDetailModal from './ProjectDetailModal';
import { playTactileClick } from '@/utils/audioFeedback';

const CrosshairCorners = () => (
  <>
    <span className="hud-corner hud-tl" />
    <span className="hud-corner hud-tr" />
    <span className="hud-corner hud-bl" />
    <span className="hud-corner hud-br" />
  </>
);

const ProjectsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'all'>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Terminal streaming state for Sevak Workstation
  const [streamActive, setStreamActive] = useState(true);
  const [streamSpeed, setStreamSpeed] = useState('124 KB/s');
  const [terminalLogs, setTerminalLogs] = useState([
    '[INIT] 11:42:01.102Z :: PIPECAT_SESSION_DAEMON // PORT: 8080 [READY]',
    '[AUTH] 11:42:03.419Z :: RBAC_CHECK: MASTER_ADMIN -> GRANTED // CLUSTER_01',
    '[FLOW] 11:42:06.820Z :: INGEST_AGORA_RTC_FRAME // JITTER: 1.8ms // LOSS: 0.0%',
    '[RECO] 11:42:09.124Z :: SARVAM_STT_PACKET -> LANG: TE-IN // CONF: 0.984',
    '[DIAG] 11:42:12.600Z :: SESSION_ARCHIVE -> MONGODB_REPLICA // LATENCY: 8ms',
  ]);

  useEffect(() => {
    if (!streamActive) return;
    const interval = setInterval(() => {
      const now = new Date().toISOString().split('T')[1].replace('Z', '');
      const jitter = (120 + Math.random() * 12).toFixed(1);
      setStreamSpeed(`${jitter} KB/s`);

      const logPool = [
        `[FLOW] ${now}Z :: AUDIO_FRAME_DISPATCH -> PIPECAT_CORE // 24kHz PCM`,
        `[AUTH] ${now}Z :: RBAC_VALIDATE_TOKEN // ROLES: [ADMIN, USER] -> OK`,
        `[AUDT] ${now}Z :: SESSION_METRICS_AGGREGATED // DURATION: 242s`,
        `[RECO] ${now}Z :: SARVAM_STT_PACKET -> CONF: ${(0.96 + Math.random() * 0.03).toFixed(3)}`,
        `[SYNC] ${now}Z :: SEVAK_DASHBOARD_WEBSOCKET // BROADCAST: 12 CLIENTS`,
      ];
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];

      setTerminalLogs((prev) => [...prev.slice(1), randomLog]);
    }, 2400);

    return () => clearInterval(interval);
  }, [streamActive]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (activeCategory === 'all') return projectsData;
    return projectsData.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const sevakProject = useMemo(() => {
    return projectsData.find((p) => p.id === 'sevak-dashboard');
  }, []);

  const otherProjects = useMemo(() => {
    if (activeCategory === 'all') {
      return filteredProjects.filter((p) => p.id !== 'sevak-dashboard');
    }
    return filteredProjects;
  }, [activeCategory, filteredProjects]);

  const handleFilterClick = (catId: ProjectCategory | 'all') => {
    setActiveCategory(catId);
    playTactileClick('toggle');
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleOpenModal = (project: ProjectItem) => {
    setSelectedProject(project);
    playTactileClick('shutter');
  };

  const toggleStream = () => {
    setStreamActive((prev) => !prev);
    playTactileClick('toggle');
  };

  return (
    <section id="projects" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="pointer-events-none absolute inset-0 opacity-20 dot-grid-bg" />
      <div className="mx-auto max-w-7xl relative">
        <SectionHeader label="HARDWARE_RACK // BLUEPRINTS" title="PROJECTS" number="05" />

        {/* Filter Navigation Bar */}
        <div className="mb-10 sm:mb-12 flex flex-wrap items-center gap-2">
          {projectFilterCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleFilterClick(cat.id)}
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

        {/* FEATURED INDUSTRIAL WORKSTATION: SEVAK DASHBOARD */}
        {activeCategory === 'all' && sevakProject && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            onMouseMove={handleCardMouseMove}
            className="mb-10 hud-frame glass-panel tactile-border-card p-6 sm:p-8 lg:p-10 border border-border/90 rounded-sm relative shadow-2xl overflow-hidden"
          >
            <CrosshairCorners />

            {/* Industrial Chassis Top Rail */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 mb-6 font-ndot text-[8px] tracking-[0.28em] text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <span className="h-2 w-2 rounded-full bg-foreground phosphor-led" />
                <span>PRIMARY_FEATURED_RACK // INDUSTRIAL_WORKSTATION_01</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[8.5px]">
                <span className="text-foreground">STREAM_A: RX {streamSpeed}</span>
                <span>•</span>
                <span className="text-muted-foreground">4-TIER RBAC ACTIVE</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-xs border border-border bg-foreground/[0.04] text-foreground">
                  INTERNAL PRODUCTION
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Architectural Specs & Overview */}
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <div className="font-ndot text-[9px] tracking-[0.3em] text-muted-foreground mb-1">
                    PIPELINE OBSERVABILITY SUITE
                  </div>
                  <h3 className="font-ndot text-2xl sm:text-3xl lg:text-4xl text-foreground text-glow tracking-wider">
                    {sevakProject.title}
                  </h3>
                  <div className="font-body text-xs sm:text-sm text-foreground/80 mt-1 font-medium">
                    {sevakProject.tagline}
                  </div>
                </div>

                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty font-normal">
                  {sevakProject.description}
                </p>

                {/* Key Built Modules */}
                {sevakProject.whatIBuilt && (
                  <div className="space-y-2 border-t border-border/40 pt-4">
                    <div className="font-ndot text-[8px] tracking-[0.25em] text-muted-foreground uppercase">
                      DEPLOYED INTERNAL CAPABILITIES
                    </div>
                    {sevakProject.whatIBuilt.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs font-body text-muted-foreground">
                        <span className="font-mono text-[9px] text-foreground shrink-0 mt-0.5">
                          0{idx + 1}.
                        </span>
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hardware Tags & Actions */}
                <div className="pt-4 border-t border-border/40 flex flex-wrap items-center gap-2">
                  {sevakProject.technologies.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[9px] px-2 py-0.5 rounded-xs border border-border/60 bg-foreground/[0.02] text-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleOpenModal(sevakProject)}
                    className="nav-cta px-4 py-2 rounded-xs font-ndot text-[9px] tracking-[0.25em] focus:outline-none flex items-center gap-2"
                    data-cursor-hover
                  >
                    <span>INSPECT_SYSTEM_ARCHITECTURE</span>
                    <span>[+]</span>
                  </button>

                  <button
                    onClick={toggleStream}
                    className="px-3.5 py-2 rounded-xs border border-border/80 hover:border-foreground/80 font-ndot text-[8.5px] tracking-[0.2em] text-foreground/90 transition-colors"
                    data-cursor-hover
                  >
                    {streamActive ? 'PAUSE_STREAM [||]' : 'RESUME_STREAM [▶]'}
                  </button>
                </div>
              </div>

              {/* Right Column: Interactive Real-Time Mock Terminal Console */}
              <div className="lg:col-span-6 hud-frame glass-panel border border-border/80 rounded-xs p-4 bg-background/80 relative">
                <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-3 font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground">
                  <span className="flex items-center gap-2 text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground phosphor-led" />
                    SEVAK_DAEMON_CONSOLE // STDOUT
                  </span>
                  <span className="font-mono">{streamActive ? 'STREAMING [RX]' : 'PAUSED'}</span>
                </div>

                {/* Log Terminal Window */}
                <div className="font-mono text-[10px] sm:text-[11px] space-y-2 text-foreground/80 min-h-[180px] flex flex-col justify-end">
                  {terminalLogs.map((log, lIdx) => (
                    <div
                      key={lIdx}
                      className="p-1 rounded-xs hover:bg-foreground/[0.04] transition-colors leading-relaxed break-all"
                    >
                      <span className="text-foreground font-semibold">{log.slice(0, 6)}</span>
                      <span>{log.slice(6)}</span>
                    </div>
                  ))}
                </div>

                {/* Terminal Command Prompt Status */}
                <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between font-mono text-[8px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="text-foreground">$</span>
                    <span>sevak-monitor --tail --cluster 01</span>
                    <span className="inline-block w-1.5 h-3 bg-foreground animate-pulse ml-1" />
                  </div>
                  <span>BUFFER: 5/5 RECORDS</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* HIGH-DENSITY BLUEPRINTS GRID */}
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {otherProjects.map((project, i) => (
              <motion.article
                key={project.id}
                layout
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                onMouseMove={handleCardMouseMove}
                className="hud-frame glass-panel tactile-border-card group relative overflow-hidden p-5 sm:p-7 flex flex-col justify-between border border-border/80 rounded-sm hover:-translate-y-1 hover:shadow-[0_0_30px_hsl(var(--foreground)/0.06)]"
                data-cursor-hover
              >
                <CrosshairCorners />

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
                        BLUEPRINT_{String(i + 1).padStart(2, '0')}
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

                  {/* Description */}
                  <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5 text-pretty font-normal">
                    {project.description}
                  </p>

                  {/* Highlight Contributions */}
                  {project.whatIBuilt && project.whatIBuilt.length > 0 && (
                    <div className="mb-5 space-y-1.5 border-t border-border/40 pt-3">
                      <div className="font-ndot text-[8px] tracking-[0.25em] text-muted-foreground mb-1">
                        BLUEPRINT HIGHLIGHTS
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

                {/* Footer Section: Tech Tags & Mechanical Switch Buttons */}
                <div className="border-t border-border/50 pt-5 mt-4 space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[9px] px-2 py-0.5 rounded-xs border border-border/60 bg-foreground/[0.02] text-foreground/90"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 5 && (
                      <span className="font-mono text-[8px] px-1.5 py-0.5 text-muted-foreground">
                        +{project.technologies.length - 5}
                      </span>
                    )}
                  </div>

                  {/* Mechanical Toggle Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {project.liveDemoUrl && (
                      <a
                        href={project.liveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => playTactileClick('toggle')}
                        className="nav-cta px-3 py-1.5 rounded-xs font-ndot text-[8.5px] tracking-[0.2em] focus:outline-none flex items-center gap-1.5"
                        data-cursor-hover
                      >
                        <span>EXECUTE_DEPLOYMENT [DEMO]</span>
                        <span>↗</span>
                      </a>
                    )}

                    {project.repositoryUrl && (
                      <a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => playTactileClick('toggle')}
                        className="px-3 py-1.5 rounded-xs border border-border/80 hover:border-foreground/80 bg-foreground/[0.02] font-ndot text-[8.5px] tracking-[0.2em] text-foreground focus:outline-none flex items-center gap-1.5 transition-colors"
                        data-cursor-hover
                      >
                        <span>SOURCE_TRACE [GITHUB]</span>
                        <span>↗</span>
                      </a>
                    )}

                    <button
                      onClick={() => handleOpenModal(project)}
                      className="px-3 py-1.5 rounded-xs border border-border/60 hover:border-foreground/60 font-ndot text-[8px] tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors ml-auto"
                      data-cursor-hover
                    >
                      SPECS [+]
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
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
