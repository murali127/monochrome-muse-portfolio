import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { achievementsData, AchievementCategory, AchievementItem } from '@/data/achievements';
import { playTactileClick } from '@/utils/audioFeedback';

const AchievementsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [filter, setFilter] = useState<'ALL' | AchievementCategory>('ALL');
  const [hoveredItem, setHoveredItem] = useState<AchievementItem | null>(null);

  const handleFilter = (cat: 'ALL' | AchievementCategory) => {
    setFilter(cat);
    playTactileClick('toggle');
  };

  const filteredItems = achievementsData.filter((item) => {
    if (filter === 'ALL') return true;
    return item.category === filter;
  });

  return (
    <section id="achievements" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="CRYPTOGRAPHIC_LEDGER // VERIFIED" title="ACHIEVEMENTS" number="06" />

        {/* Filter Navigation Controls */}
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
                onClick={() => handleFilter(categoryKey)}
                className={`px-3.5 sm:px-4 py-2 font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] rounded-full transition-all duration-200 focus:outline-none ${
                  isActive
                    ? 'bg-foreground text-background font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'border border-border/80 text-muted-foreground hover:text-foreground hover:border-foreground/60'
                }`}
                data-cursor-hover
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* HIGH-DENSITY FLIGHT MANIFEST / VERIFICATION TABLE (No Boxed Cards) */}
        <div className="border-t border-b border-border/60">
          
          {/* Table Header Row */}
          <div className="hidden md:grid grid-cols-12 gap-4 py-3 border-b border-border/80 font-ndot text-[8px] tracking-[0.28em] text-muted-foreground uppercase">
            <span className="col-span-1">IDX</span>
            <span className="col-span-3">ISSUING_AUTHORITY</span>
            <span className="col-span-5">CREDENTIAL_SPECIFICATION</span>
            <span className="col-span-1 text-center">TIMESTAMP</span>
            <span className="col-span-2 text-right">INTEGRITY_STATUS</span>
          </div>

          {/* Ledger Row Items */}
          <div className="divide-y divide-border/50">
            {filteredItems.map((item, idx) => {
              const isHovered = hoveredItem?.id === item.id;
              const indexFormatted = String(idx + 1).padStart(2, '0');

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => {
                    setHoveredItem(item);
                    playTactileClick('subtle');
                  }}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`py-4 sm:py-5 transition-colors cursor-default ${
                    isHovered ? 'bg-foreground/[0.03]' : 'hover:bg-foreground/[0.015]'
                  }`}
                  data-cursor-hover
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center">
                    
                    {/* Index */}
                    <div className="md:col-span-1 font-mono text-[10px] text-muted-foreground flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${isHovered ? 'bg-foreground phosphor-led' : 'bg-border'}`} />
                      <span>[{indexFormatted}]</span>
                    </div>

                    {/* Issuer / Authority */}
                    <div className="md:col-span-3 font-ndot text-xs sm:text-sm text-foreground/90 uppercase tracking-wider">
                      {item.issuerOrOrganization}
                    </div>

                    {/* Credential Specification */}
                    <div className="md:col-span-5 space-y-1">
                      <div className="font-ndot text-sm sm:text-base text-foreground font-semibold tracking-wide">
                        {item.title}
                      </div>
                      <div className="font-body text-xs text-muted-foreground line-clamp-1">
                        {item.detail}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="md:col-span-1 md:text-center font-mono text-xs text-muted-foreground">
                      {item.year}
                    </div>

                    {/* Integrity Status Badge */}
                    <div className="md:col-span-2 md:text-right flex items-center md:justify-end gap-2">
                      <span className="font-ndot text-[8px] tracking-[0.2em] px-2 py-0.5 rounded-xs border border-border/80 text-foreground inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                        {item.badge}
                      </span>
                    </div>

                  </div>

                  {/* Expanded Detail Drawer on Row Hover */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 pt-3 border-t border-border/40 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs font-mono"
                    >
                      <div className="md:col-span-1 text-muted-foreground text-[9px]">PROOF:</div>
                      <div className="md:col-span-8 text-foreground/80 font-body text-xs">
                        {item.detail}
                      </div>
                      <div className="md:col-span-3 md:text-right text-[9px] text-muted-foreground">
                        HASH: 0x{item.id.slice(0, 10).toUpperCase()}...OK
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Ledger Footer */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 font-ndot text-[8px] tracking-[0.25em] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground phosphor-led" />
            <span>CRYPTOGRAPHIC_HASH: SHA-256 // LEDGER_VERIFIED</span>
          </div>

          <div className="font-mono text-[8.5px] text-foreground/80">
            TOTAL_VERIFIED_RECORDS: {filteredItems.length} ENTRIES
          </div>
        </div>

      </div>
    </section>
  );
};

export default AchievementsSection;
