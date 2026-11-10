import { FormEvent, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { playTactileClick } from '@/utils/audioFeedback';

const channels = [
  {
    label: 'PRIMARY_LINK',
    name: 'EMAIL_DISPATCH',
    value: 'muralijay360@gmail.com',
    href: 'mailto:muralijay360@gmail.com',
    protocol: 'SMTP / TLS 1.3',
  },
  {
    label: 'SOURCE_REPO',
    name: 'GITHUB_ORGANIZATION',
    value: 'github.com/murali127',
    href: 'https://github.com/murali127',
    protocol: 'HTTPS / GIT_SSH',
  },
  {
    label: 'NETWORK_IDENTITY',
    name: 'LINKEDIN_PROFILE',
    value: 'linkedin.com/in/muralipaila',
    href: 'https://www.linkedin.com/in/muralipaila/',
    protocol: 'OIDC / VERIFIED',
  },
];

type TransmissionStage = 'IDLE' | 'ENCRYPTING' | 'LOCKING_UPLINK' | 'TRANSMITTED';

const ContactSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [stage, setStage] = useState<TransmissionStage>('IDLE');
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  // Compute live byte count formatted as Hex
  const totalBytes = (form.name.length + form.email.length + form.message.length);
  const hexBytes = `0x${totalBytes.toString(16).padStart(4, '0').toUpperCase()}`;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (stage !== 'IDLE') return;

    playTactileClick('shutter');
    setStage('ENCRYPTING');

    // Step 1: Encrypting SHA-256
    setTimeout(() => {
      setStage('LOCKING_UPLINK');
      playTactileClick('subtle');

      // Step 2: Locking satellite uplink
      setTimeout(() => {
        setStage('TRANSMITTED');
        playTactileClick('toggle');

        // Step 3: Trigger Mailto dispatch
        const subject = encodeURIComponent(`[TACTICAL_DISPATCH] Inquiry from ${form.name || 'Operative'}`);
        const body = encodeURIComponent(
          `TRANSMISSION_PAYLOAD:\n-----------------------------\n${form.message}\n-----------------------------\nCALLSIGN: ${form.name}\nRETURN_FREQUENCY: ${form.email}\nTIMESTAMP: ${new Date().toISOString()}`
        );

        setTimeout(() => {
          window.location.href = `mailto:muralijay360@gmail.com?subject=${subject}&body=${body}`;
        }, 600);
      }, 700);
    }, 600);
  };

  const handleInputChange = (field: 'name' | 'email' | 'message', val: string) => {
    setForm((f) => ({ ...f, [field]: val }));
  };

  return (
    <section id="contact" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="pointer-events-none absolute inset-0 opacity-30 grid-lines-bg" />
      <div className="mx-auto max-w-7xl relative">
        <SectionHeader label="ESTABLISH_CONNECTION // UPLINK" title="CONTACT" number="07" />

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-stretch">
          
          {/* LEFT: Military-Spec Encrypted Transmission Console */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 25 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="hud-frame glass-panel p-6 sm:p-10 border border-border/80 rounded-sm space-y-6 sm:space-y-7 relative flex flex-col justify-between"
          >
            <span className="hud-corner hud-tl" />
            <span className="hud-corner hud-tr" />
            <span className="hud-corner hud-bl" />
            <span className="hud-corner hud-br" />

            <div>
              {/* Header Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 mb-6 font-ndot text-[8px] tracking-[0.25em] text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <span className="h-2 w-2 rounded-full bg-foreground phosphor-led" />
                  <span>SECURE_ENCLAVE // UPLINK_TERMINAL</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-foreground/80">CARRIER: LOCKED</span>
                  <span>•</span>
                  <span className="font-mono text-foreground">SIG: 99.4%</span>
                </div>
              </div>

              {/* Console Headline */}
              <div className="mb-6">
                <h3 className="font-ndot text-2xl sm:text-3xl text-foreground text-glow tracking-wide">
                  TRANSMIT ENCRYPTED PAYLOAD
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground mt-1 font-normal">
                  Direct encrypted gateway to Murali Paila. Messages are encoded and transmitted through secure SMTP channels.
                </p>
              </div>

              {/* CHANNEL 01: CALLSIGN */}
              <div className="space-y-1.5 mb-5">
                <div className="flex items-center justify-between font-ndot text-[8.5px] tracking-[0.25em] text-muted-foreground">
                  <span>CHANNEL_01 // CALLSIGN [IDENTITY]</span>
                  <span className="font-mono text-[8px]">{form.name.length} CHR</span>
                </div>
                <input
                  required
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="contact-field font-mono text-xs sm:text-sm"
                  placeholder="Enter full name or organizational callsign"
                  data-cursor-hover
                />
              </div>

              {/* CHANNEL 02: FREQUENCY */}
              <div className="space-y-1.5 mb-5">
                <div className="flex items-center justify-between font-ndot text-[8.5px] tracking-[0.25em] text-muted-foreground">
                  <span>CHANNEL_02 // RETURN_FREQUENCY [EMAIL]</span>
                  <span className="font-mono text-[8px]">VALIDATED_INPUT</span>
                </div>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="contact-field font-mono text-xs sm:text-sm"
                  placeholder="name@organization.domain"
                  data-cursor-hover
                />
              </div>

              {/* PAYLOAD: ENCRYPTED MESSAGE */}
              <div className="space-y-1.5 mb-6">
                <div className="flex items-center justify-between font-ndot text-[8.5px] tracking-[0.25em] text-muted-foreground">
                  <span>PAYLOAD // ENCRYPTED_MESSAGE</span>
                  <span className="font-mono text-[8px] text-foreground font-semibold">
                    {hexBytes} BYTES
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="contact-field resize-none font-mono text-xs sm:text-sm"
                  placeholder="Specify system objectives, project proposals, or engineering collaboration brief..."
                  data-cursor-hover
                />
              </div>

              {/* 3-Step Transmission Telemetry Bar */}
              <div className="p-3 rounded-xs border border-border/70 bg-foreground/[0.02] space-y-2 mb-6">
                <div className="flex items-center justify-between font-ndot text-[7.5px] sm:text-[8px] tracking-[0.2em] text-muted-foreground">
                  <span>TRANSMISSION_SEQUENCE:</span>
                  <span className="font-mono text-foreground font-semibold">
                    {stage === 'IDLE' && 'READY // AWAITING_EXEC'}
                    {stage === 'ENCRYPTING' && 'STEP 1/3: SHA-256 ENCRYPTION'}
                    {stage === 'LOCKING_UPLINK' && 'STEP 2/3: LOCKING SATELLITE UPLINK'}
                    {stage === 'TRANSMITTED' && 'STEP 3/3: TRANSMITTED [200 OK]'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground transition-all duration-500 ease-out"
                    style={{
                      width:
                        stage === 'IDLE'
                          ? '0%'
                          : stage === 'ENCRYPTING'
                          ? '35%'
                          : stage === 'LOCKING_UPLINK'
                          ? '75%'
                          : '100%',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Submit Execution Button */}
            <button
              type="submit"
              disabled={stage !== 'IDLE'}
              className="nav-cta w-full py-3.5 rounded-xs font-ndot text-[10px] sm:text-[11px] tracking-[0.28em] focus:outline-none flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
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
                  <span>ENCRYPTING_PAYLOAD (SHA-256)...</span>
                </>
              )}
              {stage === 'LOCKING_UPLINK' && (
                <>
                  <span className="h-2 w-2 rounded-full bg-background animate-ping" />
                  <span>LOCKING_SATELLITE_UPLINK...</span>
                </>
              )}
              {stage === 'TRANSMITTED' && (
                <>
                  <span>TRANSMITTED [200 OK] // DISPATCHED</span>
                </>
              )}
            </button>
          </motion.form>

          {/* RIGHT: High-Density Node Map & Communication Relays */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="hud-frame glass-panel p-6 sm:p-8 border border-border/80 rounded-sm flex flex-col justify-between"
          >
            <span className="hud-corner hud-tl" />
            <span className="hud-corner hud-tr" />
            <span className="hud-corner hud-bl" />
            <span className="hud-corner hud-br" />

            <div>
              <div className="font-ndot text-[8px] tracking-[0.35em] text-muted-foreground mb-3 flex items-center justify-between border-b border-border/60 pb-3">
                <span>COMMUNICATION RELAYS</span>
                <span className="font-mono text-foreground">3 CHANNELS</span>
              </div>

              <h3 className="font-ndot text-2xl sm:text-3xl text-foreground mb-3">
                LET'S CREATE
                <br />
                <span className="text-muted-foreground">SOMETHING NEW</span>
              </h3>

              <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty font-normal mb-8">
                Available for engineering collaborations, GenAI & Voice AI systems architecture, and full-time technical roles. Based in Visakhapatnam, India.
              </p>

              {/* Channels List */}
              <div className="space-y-4">
                {channels.map((channel) => (
                  <a
                    key={channel.label}
                    href={channel.href}
                    target={channel.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    onClick={() => playTactileClick('toggle')}
                    className="p-3.5 rounded-xs border border-border/70 bg-foreground/[0.02] hover:bg-foreground/[0.05] hover:border-foreground/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 group"
                    data-cursor-hover
                  >
                    <div>
                      <div className="font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground group-hover:text-foreground transition-colors">
                        {channel.label} // {channel.protocol}
                      </div>
                      <div className="font-ndot text-xs sm:text-sm text-foreground tracking-wide mt-0.5">
                        {channel.name}
                      </div>
                    </div>

                    <div className="font-mono text-[10px] text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1.5 sm:text-right">
                      <span>{channel.value}</span>
                      <span className="text-xs group-hover:translate-x-0.5 transition-transform">↗</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Geodetic Telemetry Coordinates */}
            <div className="mt-8 pt-5 border-t border-border/60 space-y-2">
              <div className="flex items-center justify-between font-ndot text-[8px] tracking-[0.25em] text-muted-foreground">
                <span>BASE_STATION_COORDINATES</span>
                <span className="font-mono text-foreground">17.6868° N, 83.2185° E</span>
              </div>
              <div className="flex items-center justify-between font-ndot text-[8px] tracking-[0.25em] text-muted-foreground">
                <span>ENCRYPTION_STANDARD</span>
                <span className="font-mono text-foreground">TLS 1.3 / AES-256-GCM</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;
