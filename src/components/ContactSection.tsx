import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';

const ContactSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [terminalLines] = useState([
    '$ whoami',
    'murali_paila // developer',
    '$ cat contact.txt',
    'email: muralipaila@example.com',
    'github: github.com/muralipaila',
    'linkedin: linkedin.com/in/muralipaila',
    'location: Hyderabad, India',
    '$ echo "Let\'s build something amazing_"',
  ]);

  return (
    <section id="contact" className="relative py-32 px-6 dot-grid-bg" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="ESTABLISH_CONNECTION" title="CONTACT" number="06" />

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-8"
          >
            <h3 className="font-ndot text-3xl text-foreground text-glow">
              LET'S CREATE
              <br />
              SOMETHING
              <br />
              <span className="text-muted-foreground">EXTRAORDINARY</span>
            </h3>
            <p className="font-mono text-sm text-muted-foreground max-w-md leading-relaxed">
              Available for freelance projects, collaborations, and full-time opportunities.
              Let's turn ideas into reality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:muralipaila@example.com"
                className="glass-panel-hover border-glow px-6 py-3 font-ndot text-[10px] tracking-[0.3em] text-foreground inline-flex items-center gap-2"
                data-cursor-hover
              >
                <span className="h-1.5 w-1.5 bg-foreground animate-pulse" />
                SEND EMAIL
              </a>
              <a
                href="https://github.com/muralipaila"
                target="_blank"
                className="glass-panel-hover px-6 py-3 font-ndot text-[10px] tracking-[0.3em] text-muted-foreground hover:text-foreground"
                data-cursor-hover
              >
                GITHUB →
              </a>
              <a
                href="https://linkedin.com/in/muralipaila"
                target="_blank"
                className="glass-panel-hover px-6 py-3 font-ndot text-[10px] tracking-[0.3em] text-muted-foreground hover:text-foreground"
                data-cursor-hover
              >
                LINKEDIN →
              </a>
            </div>
          </motion.div>

          {/* Right - Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="glass-panel border-glow p-6 font-mono text-xs"
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <span className="h-2 w-2 rounded-full bg-foreground/30" />
              <span className="h-2 w-2 rounded-full bg-foreground/20" />
              <span className="h-2 w-2 rounded-full bg-foreground/10" />
              <span className="ml-4 font-ndot text-[8px] tracking-[0.3em] text-muted-foreground">TERMINAL</span>
            </div>
            <div className="space-y-1">
              {terminalLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.6 + i * 0.15 }}
                  className={line.startsWith('$') ? 'text-foreground' : 'text-muted-foreground'}
                >
                  {line}
                </motion.div>
              ))}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block text-foreground"
              >
                █
              </motion.span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-24 border-t border-border pt-8 mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
        <span className="font-ndot text-[9px] tracking-[0.3em] text-muted-foreground">
          © 2025 MURALI PAILA
        </span>
        <span className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground">
          DESIGNED WITH NOTHING IN MIND
        </span>
      </div>
    </section>
  );
};

export default ContactSection;
