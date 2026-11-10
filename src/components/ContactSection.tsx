import { FormEvent, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';

const channels = [
  { label: 'EMAIL', value: 'muralijay360@gmail.com', href: 'mailto:muralijay360@gmail.com' },
  { label: 'GITHUB', value: 'github.com/murali127', href: 'https://github.com/murali127' },
  { label: 'LINKEDIN', value: 'linkedin.com/in/muralipaila', href: 'https://www.linkedin.com/in/muralipaila/' },
];

const ContactSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [status, setStatus] = useState<'IDLE' | 'TRANSMITTING' | 'QUEUED'>('IDLE');
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStatus('TRANSMITTING');
    const subject = encodeURIComponent(`Portfolio ping from ${form.name || 'visitor'}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name}\n${form.email}`);

    window.setTimeout(() => {
      setStatus('QUEUED');
      window.location.href = `mailto:muralijay360@gmail.com?subject=${subject}&body=${body}`;
    }, 700);
  };

  return (
    <section id="contact" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="pointer-events-none absolute inset-0 opacity-30 grid-lines-bg" />
      <div className="mx-auto max-w-7xl relative">
        <SectionHeader label="ESTABLISH_CONNECTION" title="CONTACT" number="07" />

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="hud-frame glass-panel p-6 sm:p-10 space-y-6 sm:space-y-8"
          >
            <span className="hud-corner hud-tl" />
            <span className="hud-corner hud-tr" />
            <span className="hud-corner hud-bl" />
            <span className="hud-corner hud-br" />

            <div className="flex items-center justify-between">
              <div>
                <div className="font-ndot text-[9px] tracking-[0.35em] text-muted-foreground mb-2">UPLINK // SECURE</div>
                <h3 className="font-ndot text-xl sm:text-2xl text-foreground text-glow">TRANSMIT MESSAGE</h3>
              </div>
              <span className="rounded-full border border-border px-3 py-1 font-ndot text-[8px] tracking-[0.2em] inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
                {status}
              </span>
            </div>

            <label className="block">
              <span className="font-ndot text-[9px] tracking-[0.3em] text-muted-foreground">IDENTITY</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="contact-field"
                placeholder="Your name"
                data-cursor-hover
              />
            </label>

            <label className="block">
              <span className="font-ndot text-[9px] tracking-[0.3em] text-muted-foreground">RETURN CHANNEL</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="contact-field"
                placeholder="you@domain.com"
                data-cursor-hover
              />
            </label>

            <label className="block">
              <span className="font-ndot text-[9px] tracking-[0.3em] text-muted-foreground">PAYLOAD</span>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="contact-field resize-none"
                placeholder="What should we build?"
                data-cursor-hover
              />
              <div className="mt-2 text-right font-ndot text-[8px] tracking-[0.2em] text-muted-foreground">
                {form.message.length} BYTES
              </div>
            </label>

            <button
              type="submit"
              className="nav-cta w-full rounded-full py-3.5 font-ndot text-[10px] sm:text-[11px] tracking-[0.28em] focus:outline-none"
              data-cursor-hover
            >
              {status === 'TRANSMITTING' ? 'ENCRYPTING…' : 'SEND TRANSMISSION'}
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15 }}
            className="hud-frame glass-panel p-6 sm:p-8 flex flex-col justify-between min-h-[380px] sm:min-h-[420px]"
          >
            <span className="hud-corner hud-tl" />
            <span className="hud-corner hud-tr" />
            <span className="hud-corner hud-bl" />
            <span className="hud-corner hud-br" />

            <div>
              <div className="font-ndot text-[9px] tracking-[0.35em] text-muted-foreground mb-3">NODE MAP</div>
              <h3 className="font-ndot text-2xl sm:text-3xl text-foreground mb-3 sm:mb-4">
                LET'S CREATE
                <br />
                <span className="text-muted-foreground">SOMETHING NEW</span>
              </h3>
              <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty font-normal">
                Available for engineering collaborations, AI systems architecture, and full-time roles. Visakhapatnam, India.
              </p>
            </div>

            <div className="space-y-3.5 my-6 sm:my-8">
              {channels.map((channel) => (
                <a
                  key={channel.label}
                  href={channel.href}
                  target={channel.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-2.5 gap-1 group"
                  data-cursor-hover
                >
                  <span className="font-ndot text-[8px] sm:text-[9px] tracking-[0.3em] text-muted-foreground">{channel.label}</span>
                  <span className="font-ndot text-[10px] sm:text-[11px] tracking-[0.08em] text-foreground group-hover:text-glow break-all">
                    {channel.value} →
                  </span>
                </a>
              ))}
            </div>

            <div>
              <div className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground mb-3">SIGNAL TELEMETRY</div>
              <div className="flex items-end gap-1.5 h-10 sm:h-12">
                {Array.from({ length: 18 }).map((_, i) => (
                  <span
                    key={i}
                    className="signal-bar flex-1 bg-foreground/75"
                    style={{ height: `${25 + ((i * 7) % 75)}%`, animationDelay: `${i * 0.08}s` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 sm:mt-24 border-t border-border pt-8 mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-ndot text-[8px] sm:text-[9px] tracking-[0.3em] text-muted-foreground">
          © 2026 MURALI PAILA // ALL RIGHTS RESERVED
        </span>
        <span className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground">
          GENAI FULL-STACK DEVELOPER
        </span>
      </footer>
    </section>
  );
};

export default ContactSection;
