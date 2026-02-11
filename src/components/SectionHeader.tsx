import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const SectionHeader = ({ label, title, number }: { label: string; title: string; number: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mb-16 flex items-end gap-4"
    >
      <span className="font-mono text-xs text-muted-foreground">{number}</span>
      <div>
        <div className="font-ndot text-[10px] tracking-[0.4em] text-muted-foreground mb-2">{label}</div>
        <h2 className="font-ndot text-3xl sm:text-4xl tracking-tight text-foreground text-glow">{title}</h2>
      </div>
      <div className="flex-1 h-[1px] bg-border mb-2" />
    </motion.div>
  );
};

export default SectionHeader;
