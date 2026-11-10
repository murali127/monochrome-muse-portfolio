import { FormEvent, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { playTactileClick } from '@/utils/audioFeedback';

interface QuickChannel {
  id: string;
  label: string;
  value: string;
  href: string;
  copyableText: string;
}

const channels: QuickChannel[] = [
  {
    id: 'email',
    label: 'PRIMARY_LINK',
    value: 'muralijay360@gmail.com',
    href: 'mailto:muralijay360@gmail.com',
    copyableText: 'muralijay360@gmail.com',
  },
  {
    id: 'github',
    label: 'SOURCE_TRACE',
    value: 'github.com/murali127',
    href: 'https://github.com/murali127',
    copyableText: 'https://github.com/murali127',
  },
  {
    id: 'linkedin',
    label: 'NETWORK_IDENTITY',
    value: 'linkedin.com/in/muralipaila',
    href: 'https://www.linkedin.com/in/muralipaila/',
    copyableText: 'https://www.linkedin.com/in/muralipaila/',
  },
];

type TransmissionStage = 'IDLE' | 'ENCRYPTING' | 'LOCKING_UPLINK' | 'TRANSMITTED';

const ContactSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [stage, setStage] = useState<TransmissionStage>('IDLE');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  // Compute live byte count formatted in Hex
  const totalBytes = form.name.length + form.email.length + form.message.length;
  const hexBytes = `0x${totalBytes.toString(16).padStart(4, '0').toUpperCase()}`;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (stage !== 'IDLE') return;

    playTactileClick('shutter');
    setStage('ENCRYPTING');

    setTimeout(() => {
      setStage('LOCKING_UPLINK');
      playTactileClick('subtle');

      setTimeout(() => {
        setStage('TRANSMITTED');
        playTactileClick('toggle');

        const subject = encodeURIComponent(`[TACTICAL_DISPATCH] Inquiry from ${form.name || 'Operative'}`);
        const body = encodeURIComponent(
          `TRANSMISSION_PAYLOAD:\n-----------------------------\n${form.message}\n-----------------------------\nCALLSIGN: ${form.name}\nRETURN_FREQUENCY: ${form.email}\nTIMESTAMP: ${new Date().toISOString()}`
        );

        setTimeout(() => {
          window.location.href = `mailto:muralijay360@gmail.com?subject=${subject}&body=${body}`;
        }, 500);
      }, 700);
    }, 600);
  };

  const handleCopy = (ch: QuickChannel) => {
    navigator.clipboard.writeText(ch.copyableText);
    setCopiedId(ch.id);
    playTactileClick('toggle');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="contact" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="ESTABLISH_CONNECTION // DIRECT_UPLINK" title="CONTACT" number="07" />

        {/* OPEN BRUTALIST DIRECT UPLINK CONSOLE (Zero Box Envelopes) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mt-4">
          
          {/* Left Column: Direct Underline-Only Transmission Form */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-8"
          >
            <div>
              <div className="font-ndot text-[8.5px] tracking-[0.3em] text-muted-foreground mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground phosphor-led" />
                <span>TERMINAL_CARRIER // DIRECT_COMM_LINK</span>
              </div>
              <h3 className="font-ndot text-3xl sm:text-5xl lg:text-6xl text-foreground text-glow tracking-wider uppercase font-bold leading-none">
                INITIATE_TRANSMISSION
              </h3>
              <p className="font-body text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed text-pretty font-normal">
                Direct encrypted transmission channel. Type your payload below to dispatch through secure SMTP relays.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pt-2">
              
              {/* [01] CALLSIGN - Minimal Underline Only */}
              <div className="space-y-1">
                <label className="font-ndot text-[8px] tracking-[0.25em] text-muted-foreground uppercase flex items-center justify-between">
                  <span>[01] CALLSIGN // YOUR_NAME</span>
                  <span className="font-mono text-[8px]">{form.name.length} CHR</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your name or organization callsign..."
                  className="w-full bg-transparent border-b border-border/80 focus:border-foreground py-2.5 font-mono text-sm sm:text-base text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors rounded-none"
                  data-cursor-hover
                />
              </div>

              {/* [02] FREQUENCY - Minimal Underline Only */}
              <div className="space-y-1">
                <label className="font-ndot text-[8px] tracking-[0.25em] text-muted-foreground uppercase flex items-center justify-between">
                  <span>[02] RETURN_FREQUENCY // YOUR_EMAIL</span>
                  <span className="font-mono text-[8px]">VALIDATED_STATION</span>
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@organization.com"
                  className="w-full bg-transparent border-b border-border/80 focus:border-foreground py-2.5 font-mono text-sm sm:text-base text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors rounded-none"
                  data-cursor-hover
                />
              </div>

              {/* [03] PAYLOAD - Minimal Underline Only */}
              <div className="space-y-1">
                <label className="font-ndot text-[8px] tracking-[0.25em] text-muted-foreground uppercase flex items-center justify-between">
                  <span>[03] PAYLOAD // ENCRYPTED_MESSAGE</span>
                  <span className="font-mono text-[8.5px] text-foreground font-semibold">
                    {hexBytes} BYTES
                  </span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Detail your inquiry, project scope, or engineering collaboration brief..."
                  className="w-full bg-transparent border-b border-border/80 focus:border-foreground py-2.5 font-mono text-sm sm:text-base text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors rounded-none resize-none"
                  data-cursor-hover
                />
              </div>

              {/* Transmission Progress State */}
              <div className="pt-2 flex items-center justify-between font-ndot text-[8px] tracking-[0.22em] text-muted-foreground">
                <span>STATUS:</span>
                <span className="font-mono text-foreground font-semibold">
                  {stage === 'IDLE' && 'STANDBY // READY_FOR_DISPATCH'}
                  {stage === 'ENCRYPTING' && 'STEP 1/3: ENCRYPTING (SHA-256)...'}
                  {stage === 'LOCKING_UPLINK' && 'STEP 2/3: LOCKING SATELLITE UPLINK...'}
                  {stage === 'TRANSMITTED' && 'STEP 3/3: TRANSMITTED [200 OK]'}
                </span>
              </div>

              {/* Minimal Execute Button */}
              <button
                type="submit"
                disabled={stage !== 'IDLE'}
                className="nav-cta w-full py-4 rounded-xs font-ndot text-[10px] sm:text-[11px] tracking-[0.28em] focus:outline-none flex items-center justify-center gap-3 transition-transform"
                data-cursor-hover
              >
                {stage === 'IDLE' && (
                  <>
                    <span>EXECUTE_TRANSMISSION</span>
                    <span className="font-mono">[200 OK]</span>
                  </>
                )}
                {stage === 'ENCRYPTING' && (
                  <>
                    <span className="h-2 w-2 rounded-full bg-background animate-ping" />
                    <span>ENCRYPTING (SHA-256)...</span>
                  </>
                )}
                {stage === 'LOCKING_UPLINK' && (
                  <>
                    <span className="h-2 w-2 rounded-full bg-background animate-ping" />
                    <span>LOCKING SATELLITE UPLINK...</span>
                  </>
                )}
                {stage === 'TRANSMITTED' && (
                  <>
                    <span>TRANSMISSION_DISPATCHED [200 OK]</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Right Column: Direct Quick-Action Channels with 1-Click Copy */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-5 space-y-6 pt-4 lg:pt-8"
          >
            <div className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground uppercase border-b border-border/60 pb-3">
              DIRECT CHANNELS // 1-CLICK DISPATCH
            </div>

            <div className="space-y-4">
              {channels.map((ch) => {
                const isCopied = copiedId === ch.id;

                return (
                  <div
                    key={ch.id}
                    className="p-4 border border-border/70 rounded-xs hover:border-foreground/60 transition-colors flex items-center justify-between gap-4 group"
                  >
                    <div className="space-y-0.5">
                      <div className="font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground group-hover:text-foreground transition-colors">
                        {ch.label}
                      </div>
                      <a
                        href={ch.href}
                        target={ch.href.startsWith('http') ? '_blank' : undefined}
                        rel="noreferrer"
                        className="font-mono text-xs sm:text-sm text-foreground hover:underline block"
                        data-cursor-hover
                      >
                        {ch.value}
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(ch)}
                      className="px-2.5 py-1 rounded-xs border border-border/80 hover:border-foreground bg-foreground/[0.03] font-ndot text-[8px] tracking-[0.2em] text-foreground transition-colors shrink-0"
                      data-cursor-hover
                    >
                      {isCopied ? 'COPIED!' : 'COPY'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Geodetic Telemetry Block */}
            <div className="pt-4 border-t border-border/60 space-y-2 font-mono text-[9px] text-muted-foreground">
              <div className="flex justify-between items-center">
                <span className="font-ndot text-[7.5px] tracking-wider">GEO_COORDINATES:</span>
                <span className="text-foreground">17.6868° N, 83.2185° E [VIZAG]</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-ndot text-[7.5px] tracking-wider">PRIMARY_ROLE:</span>
                <span className="text-foreground">GENAI FULL-STACK DEVELOPER</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-ndot text-[7.5px] tracking-wider">ENCRYPTION:</span>
                <span className="text-foreground">TLS 1.3 / SHA-256</span>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;
