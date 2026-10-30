import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { achievementsData, AchievementCategory } from '@/data/achievements';

const HudCorners = () => (
  <>
    <span className="hud-corner hud-tl" />
    <span className="hud-corner hud-tr" />
    <span className="hud-corner hud-bl" />
    <span className="hud-corner hud-br" />
  </>
);

const AchievementsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [filter, setFilter] = useState<'ALL' | AchievementCategory>('ALL');

  const filteredItems = achievementsData.filter((item) => {
    if (filter === 'ALL') return true;
    return item.category === filter;
  });

  return (
    <section id="achievements" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="pointer-events-none absolute inset-0 opacity-20 dot-grid-bg" />
      <div className="mx-auto max-w-7xl relative">
        <SectionHeader label="RECOGNITION // VERIFIED" title="ACHIEVEMENTS" number="06" />

        {/* Filter controls */}
        <div className="mb-10 flex flex-wrap items-center gap-2" role="group" aria-label="Achievement category filters">
          {(['ALL', 'HONOR', 'CERTIFICATION', 'COURSEWORK'] as const).map((categoryKey) => {
            const isActive = filter === categoryKey;
            const label =
              categoryKey === 'ALL'
                ? 'ALL RECORDS'
                : categoryKey === 'HONOR'
                ? 'HONORS & AWARDS'
                : categoryKey === 'CERTIFICATION'
                ? 'INDUSTRY CERTIFICATIONS'
                : 'COURSEWORK & SPECIALIZATIONS';

            return (
              <button
                key={categoryKey}
                onClick={() => setFilter(categoryKey)}
                className={`px-3.5 sm:px-4 py-2 font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-foreground focus:outline-none ${
                  isActive
                    ? 'bg-foreground text-background font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'glass-panel text-muted-foreground hover:text-foreground border border-border/60 hover:border-foreground/40'
                }`}
                data-cursor-hover
                aria-pressed={isActive}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Achievements Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="hud-frame glass-panel-hover p-5 sm:p-6 group relative overflow-hidden flex flex-col justify-between"
              data-cursor-hover
            >
              <HudCorners />

              <div>
                {/* Meta Bar */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-ndot text-[8px] tracking-[0.2em] px-2 py-0.5 rounded ${
                        a.category === 'HONOR'
                          ? 'bg-foreground/15 text-foreground font-semibold border border-foreground/30'
                          : a.category === 'CERTIFICATION'
                          ? 'bg-foreground/10 text-foreground border border-border/80'
                          : 'bg-muted/40 text-muted-foreground border border-border/60'
                      }`}
                    >
                      {a.badge}
                    </span>
                  </div>
                  <span className="font-ndot text-[8px] tracking-[0.25em] text-muted-foreground">
                    {a.year}
                  </span>
                </div>

                {/* Title & Issuer */}
                <h3 className="font-ndot text-base sm:text-lg tracking-wide text-foreground mb-1 group-hover:text-glow transition-all duration-300">
                  {a.title}
                </h3>
                <div className="font-ndot text-[9px] tracking-[0.25em] text-muted-foreground mb-3 uppercase">
                  // {a.issuerOrOrganization}
                </div>

                {/* Description */}
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  {a.detail}
                </p>
              </div>

              {/* Bottom accent glow line */}
              <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between">
                <span className="font-ndot text-[8px] tracking-[0.25em] text-foreground/40 group-hover:text-foreground/80 transition-colors">
                  ID: {a.id.toUpperCase().slice(0, 16)}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/30 group-hover:bg-foreground group-hover:shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;
