import { FormEvent, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { playTactileClick } from '@/utils/audioFeedback';

interface QuickChannel {
  id: string;
  label: string;
  value: string;
  href: string;
  protocol: string;
}

const channels: QuickChannel[] = [
  {
    id: 'email',
    label: 'PRIMARY_DISPATCH',
    value: 'muralijay360@gmail.com',
    href: 'mailto:muralijay360@gmail.com',
    protocol: 'SMTP / TLS 1.3',
  },
  {
    id: 'github',
    label: 'SOURCE_REPOSITORY',
    value: 'github.com/murali127',
    href: 'https://github.com/murali127',
    protocol: 'HTTPS / GIT_SSH',
  },
  {
    id: 'linkedin',
    label: 'NETWORK_IDENTITY',
    value: 'linkedin.com/in/muralipaila',
    href: 'https://www.linkedin.com/in/muralipaila/',
    protocol: 'OIDC / VERIFIED',
  },
];

type TransmissionStage = 'IDLE' | 'ENCRYPTING' | 'LOCKING_UPLINK' | 'TRANSMITTED';

const ContactSection = () => {
  const [stage, setStage] = useState<TransmissionStage>('IDLE');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  // Compute live byte count formatted in Hex
  const totalBytes = form.name.length + form.email.length + form.message.length;
  const hexBytes = `0x${totalBytes.toString(16).padStart(4, '0').toUpperCase()}`;

  const handleInputChange = (field: 'name' | 'email' | 'message', val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    setIsTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setIsTyping(false), 400);
  };

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
    navigator.clipboard.writeText(ch.value);
    setCopiedId(ch.id);
    playTactileClick('toggle');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="contact" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="ESTABLISH_CONNECTION // DIRECT_UPLINK" title="CONTACT" number="07" />

        {/* HIGH-CONTRAST MATTE CONSOLE ENCLOSURE (Completely shields text from 3D background bleed) */}
        <div className="hud-frame glass-panel p-4 sm:p-8 lg:p-12 border border-border/90 rounded-sm relative shadow-2xl bg-background/95 backdrop-blur-2xl w-full max-w-full overflow-hidden box-border">
          
          {/* Tactical Corner Brackets */}
          <span className="hud-corner hud-tl" />
          <span className="hud-corner hud-tr" />
          <span className="hud-corner hud-bl" />
          <span className="hud-corner hud-br" />

          {/* Laser Scanning Beam Header Accent */}
          <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
            <div className="h-px w-1/3 bg-foreground/70 animate-[beam_3s_linear_infinite]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start w-full max-w-full overflow-hidden">
            
            {/* Left Column: Direct Encrypted Transmission Console */}
            <div className="lg:col-span-7 space-y-6 w-full max-w-full overflow-hidden">
              
              <div>
                <div className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-foreground phosphor-led" />
                  <span>SECURE_ENCLAVE // DIRECT_UPLINK_CONSOLE</span>
                </div>

                <h3 className="font-ndot text-2xl sm:text-4xl lg:text-5xl text-foreground text-glow tracking-tight sm:tracking-wider uppercase font-bold leading-tight break-words">
                  <span className="inline-block sm:inline">INITIATE_</span>
                  <span className="inline-block sm:inline">TRANSMISSION</span>
                </h3>

                <p className="font-body text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed text-pretty font-normal">
                  Direct encrypted transmission channel. Type your payload below to dispatch through secure SMTP relays.
                </p>
              </div>

              {/* Real-time Typing Kinetic Visualizer */}
              <div className="p-3 border border-border/70 rounded-xs bg-foreground/[0.02] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isTyping ? 'bg-foreground phosphor-led' : 'bg-muted-foreground'}`} />
                  <span className="font-ndot text-[8px] tracking-[0.2em] sm:tracking-[0.25em] text-foreground/80 truncate">
                    {isTyping ? 'KEYSTREAM: ENCODING_CHARS...' : 'KEYSTREAM: STANDBY'}
                  </span>
                </div>
                <span className="font-mono text-[8.5px] sm:text-[9px] text-foreground font-bold shrink-0">
                  PAYLOAD_SIZE: {hexBytes}
                </span>
              </div>

              {/* Transmission Input Fields */}
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* [01] CALLSIGN */}
                <div className="space-y-1.5">
                  <label className="font-ndot text-[8.5px] tracking-[0.25em] text-muted-foreground uppercase flex items-center justify-between">
                    <span>[01] CALLSIGN // YOUR_NAME</span>
                    <span className="font-mono text-[8px] text-foreground/70">{form.name.length} CHR</span>
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name or operational callsign..."
                    className="w-full bg-foreground/[0.02] border border-border/80 focus:border-foreground focus:ring-1 focus:ring-foreground/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all rounded-xs"
                    data-cursor-hover
                  />
                </div>

                {/* [02] RETURN_FREQUENCY */}
                <div className="space-y-1.5">
                  <label className="font-ndot text-[8.5px] tracking-[0.25em] text-muted-foreground uppercase flex items-center justify-between">
                    <span>[02] RETURN_FREQUENCY // YOUR_EMAIL</span>
                    <span className="font-mono text-[8px] text-foreground/70">SMTP_VALIDATED</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="name@organization.com"
                    className="w-full bg-foreground/[0.02] border border-border/80 focus:border-foreground focus:ring-1 focus:ring-foreground/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all rounded-xs"
                    data-cursor-hover
                  />
                </div>

                {/* [03] PAYLOAD */}
                <div className="space-y-1.5">
                  <label className="font-ndot text-[8.5px] tracking-[0.25em] text-muted-foreground uppercase flex items-center justify-between">
                    <span>[03] PAYLOAD // ENCRYPTED_MESSAGE</span>
                    <span className="font-mono text-[8px] text-foreground font-semibold">{totalBytes} BYTES</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Specify project objectives, engineering collaboration brief, or system specifications..."
                    className="w-full bg-foreground/[0.02] border border-border/80 focus:border-foreground focus:ring-1 focus:ring-foreground/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all rounded-xs resize-none"
                    data-cursor-hover
                  />
                </div>

                {/* 3-Step Transmission Telemetry Bar */}
                <div className="p-3.5 rounded-xs border border-border/80 bg-foreground/[0.02] space-y-2">
                  <div className="flex items-center justify-between font-ndot text-[8px] tracking-[0.2em] text-muted-foreground">
                    <span>TRANSMISSION_PROGRESS:</span>
                    <span className="font-mono text-foreground font-semibold">
                      {stage === 'IDLE' && 'READY_FOR_DISPATCH'}
                      {stage === 'ENCRYPTING' && 'STEP 1/3: SHA-256 DIGEST...'}
                      {stage === 'LOCKING_UPLINK' && 'STEP 2/3: LOCKING SATELLITE UPLINK...'}
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

                {/* Transmission Execution CTA */}
                <button
                  type="submit"
                  disabled={stage !== 'IDLE'}
                  className="nav-cta w-full py-3.5 sm:py-4 px-3 rounded-xs font-ndot text-[9.5px] sm:text-[11px] tracking-[0.18em] sm:tracking-[0.28em] focus:outline-none flex items-center justify-center gap-2 shadow-xl disabled:opacity-75 text-center"
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

            </div>

            {/* Right Column: Kinetic Radar Motion Graphic & 1-Click Direct Channels */}
            <div className="lg:col-span-5 space-y-6 pt-2 lg:pt-0 w-full max-w-full overflow-hidden">
              
              {/* KINETIC POLAR RADAR MOTION GRAPHIC */}
              <div className="p-4 sm:p-5 border border-border/80 rounded-xs bg-foreground/[0.02] relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 font-ndot text-[8px] tracking-[0.2em] sm:tracking-[0.25em] text-muted-foreground border-b border-border/50 pb-2.5 mb-4">
                  <span className="flex items-center gap-1.5 text-foreground font-semibold">
                    <span className="h-2 w-2 rounded-full bg-foreground phosphor-led" />
                    BASE_STATION // POLAR_RADAR
                  </span>
                  <span className="font-mono text-foreground text-[8px]">AZ: 184.2° | EL: 42°</span>
                </div>

                {/* Polar Radar Scope */}
                <div className="relative w-36 h-36 sm:w-48 sm:h-48 mx-auto flex items-center justify-center">
                  {/* Concentric Range Rings */}
                  <div className="absolute inset-0 rounded-full border border-border/60" />
                  <div className="absolute inset-4 sm:inset-6 rounded-full border border-border/40" />
                  <div className="absolute inset-8 sm:inset-12 rounded-full border border-border/30" />
                  
                  {/* Crosshairs */}
                  <div className="absolute inset-x-0 top-1/2 h-px bg-border/40 -translate-y-1/2" />
                  <div className="absolute inset-y-0 left-1/2 w-px bg-border/40 -translate-x-1/2" />

                  {/* Rotating Radar Sweep Arm */}
                  <div className="absolute inset-0 flex items-center justify-center animate-radar-sweep pointer-events-none">
                    <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-foreground/[0.12] to-foreground/30 origin-right rounded-full" />
                  </div>

                  {/* Target Blip Ping (Visakhapatnam station) */}
                  <div className="absolute top-[38%] left-[62%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-foreground animate-ping absolute" />
                    <span className="h-2 w-2 rounded-full bg-foreground" />
                  </div>

                  {/* Center Node */}
                  <div className="w-3 h-3 rounded-full border border-foreground bg-background z-10 flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-foreground" />
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-border/40 flex flex-wrap items-center justify-between gap-1 font-mono text-[7.5px] sm:text-[8px] text-muted-foreground">
                  <span>VIZAG_NODE: 17.68° N, 83.21° E</span>
                  <span className="text-foreground font-semibold">SIGNAL: LOCKED</span>
                </div>
              </div>

              {/* DIRECT QUICK-ACTION 1-CLICK COPY CHANNELS */}
              <div className="space-y-3">
                <div className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground uppercase">
                  DIRECT CHANNELS // 1-CLICK DISPATCH
                </div>

                {channels.map((ch) => {
                  const isCopied = copiedId === ch.id;

                  return (
                    <div
                      key={ch.id}
                      className="p-3.5 border border-border/70 rounded-xs bg-background/80 hover:border-foreground/80 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-ndot text-[7.5px] tracking-[0.25em] text-muted-foreground group-hover:text-foreground transition-colors">
                          {ch.label} // {ch.protocol}
                        </div>
                        <a
                          href={ch.href}
                          target={ch.href.startsWith('http') ? '_blank' : undefined}
                          rel="noreferrer"
                          className="font-mono text-xs sm:text-[13px] text-foreground hover:underline block truncate"
                          data-cursor-hover
                        >
                          {ch.value}
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(ch)}
                        className="px-3 py-1.5 rounded-xs border border-border/80 hover:border-foreground bg-foreground/[0.04] font-ndot text-[8px] tracking-[0.2em] text-foreground transition-colors shrink-0"
                        data-cursor-hover
                      >
                        {isCopied ? 'COPIED!' : 'COPY'}
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default ContactSection;
