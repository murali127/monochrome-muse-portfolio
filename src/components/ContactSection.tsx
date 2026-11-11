import { FormEvent, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { playTactileClick } from '@/utils/audioFeedback';

interface SwitchboardChannel {
  id: string;
  channelIndex: string;
  label: string;
  protocol: string;
  value: string;
  href: string;
  isExternal: boolean;
}

const channels: SwitchboardChannel[] = [
  {
    id: 'email',
    channelIndex: 'CH_01',
    label: 'PRIMARY_DISPATCH',
    protocol: 'SMTP // TLS 1.3',
    value: 'muralijay360@gmail.com',
    href: 'mailto:muralijay360@gmail.com',
    isExternal: false,
  },
  {
    id: 'github',
    channelIndex: 'CH_02',
    label: 'SOURCE_REPOSITORY',
    protocol: 'GIT_SSH // HTTPS',
    value: 'github.com/murali127',
    href: 'https://github.com/murali127',
    isExternal: true,
  },
  {
    id: 'linkedin',
    channelIndex: 'CH_03',
    label: 'NETWORK_IDENTITY',
    protocol: 'OIDC // VERIFIED',
    value: 'linkedin.com/in/muralipaila',
    href: 'https://www.linkedin.com/in/muralipaila/',
    isExternal: true,
  },
];

const GLYPHS = '0123456789ABCDEFx_#<>';

const useScrambleText = (targetText: string, isHovered: boolean) => {
  const [text, setText] = useState(targetText);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      setText(targetText);
      return;
    }

    let iteration = 0;
    const maxIterations = 8;
    const interval = 16;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      iteration++;
      if (iteration >= maxIterations) {
        setText(targetText);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setText(
          targetText
            .split('')
            .map((char) => {
              if (char === '.' || char === '@' || char === '/') return char;
              if (Math.random() > 0.45) {
                return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
              }
              return char;
            })
            .join('')
        );
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, targetText]);

  return text;
};

const EqualizerBars = ({ isHovered }: { isHovered: boolean }) => {
  return (
    <div className="flex items-end gap-[2px] h-3 w-4 shrink-0" aria-hidden="true">
      {[0.35, 0.75, 0.45, 1.0, 0.6].map((peak, i) => (
        <motion.span
          key={i}
          className="w-[2px] rounded-full bg-foreground"
          animate={{
            height: isHovered ? [`${peak * 30}%`, `${peak * 100}%`, `${peak * 45}%`] : '30%',
            opacity: isHovered ? 1 : 0.35,
          }}
          transition={
            isHovered
              ? {
                  duration: 0.45 + i * 0.08,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }
              : { duration: 0.2 }
          }
          style={{ minHeight: '3px' }}
        />
      ))}
    </div>
  );
};

const SwitchboardRow = ({
  channel,
  onCopy,
  isCopied,
}: {
  channel: SwitchboardChannel;
  onCopy: (channel: SwitchboardChannel) => void;
  isCopied: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const scrambledAddress = useScrambleText(channel.value, isHovered);

  const handleRowClick = () => {
    playTactileClick('subtle');
    if (channel.isExternal) {
      window.open(channel.href, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = channel.href;
    }
  };

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(channel);
  };

  return (
    <div
      onClick={handleRowClick}
      onMouseEnter={() => {
        setIsHovered(true);
        playTactileClick('subtle');
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative p-3.5 sm:p-4 hover:bg-foreground/[0.035] transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden"
      data-cursor-hover
    >
      {/* Laser line wipe pulse on row hover */}
      {isHovered && (
        <span className="absolute inset-x-0 bottom-0 h-px bg-foreground/60 shadow-[0_0_8px_rgba(255,255,255,0.7)] pointer-events-none" />
      )}

      {/* Left: Metadata, Channel ID & Address */}
      <div className="space-y-1 min-w-0 flex-1">
        {/* Channel Header Ribbon */}
        <div className="flex flex-wrap items-center gap-2 font-ndot text-[7.5px] sm:text-[8px] tracking-[0.22em] text-muted-foreground">
          <span className="font-mono text-foreground/80 font-bold">{channel.channelIndex}</span>
          <span className="text-border/80">/</span>
          <span className="group-hover:text-foreground transition-colors font-medium">{channel.label}</span>
          <span className="text-border/80 hidden sm:inline">•</span>
          <span className="font-mono text-[7px] sm:text-[7.5px] text-muted-foreground/75 hidden sm:inline">
            {channel.protocol}
          </span>
          <div className="ml-auto sm:ml-0 flex items-center gap-2.5">
            <EqualizerBars isHovered={isHovered} />
            <div className="flex items-center gap-1.5">
              <div className="relative flex items-center justify-center">
                {isHovered && (
                  <span className="absolute -inset-1 rounded-full border border-foreground/60 animate-ping pointer-events-none" />
                )}
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                    isHovered
                      ? 'bg-foreground shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                      : 'bg-muted-foreground/50'
                  }`}
                />
              </div>
              <span
                className={`font-mono text-[7px] sm:text-[7.5px] tracking-wider transition-colors duration-200 ${
                  isHovered ? 'text-foreground font-semibold' : 'text-muted-foreground/70'
                }`}
              >
                {isHovered ? '● UPLINK_LOCKED' : '○ STANDBY'}
              </span>
            </div>
          </div>
        </div>

        {/* Address with Kinetic Scramble & Dispatch Glyph */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs sm:text-[13px] text-foreground font-medium truncate group-hover:text-glow transition-all">
            {scrambledAddress}
          </span>
          <span className="font-mono text-xs text-muted-foreground/70 transition-transform duration-200 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0">
            ↗
          </span>
        </div>
      </div>

      {/* Right: Brutalist Hardware Latch Copy Button */}
      <div className="self-end sm:self-center shrink-0">
        <button
          type="button"
          onClick={handleCopyClick}
          className={`relative px-3 py-1.5 rounded-xs font-mono text-[8px] sm:text-[8.5px] tracking-[0.2em] transition-all duration-200 border ${
            isCopied
              ? 'bg-foreground text-background border-foreground font-bold shadow-[0_0_12px_rgba(255,255,255,0.8)]'
              : 'border-border/70 bg-foreground/[0.04] text-foreground hover:border-foreground hover:bg-foreground/[0.08]'
          }`}
          data-cursor-hover
          title={`Copy ${channel.value}`}
        >
          {isCopied ? (
            <span className="inline-flex items-center gap-1">
              <span>[ ✓ HASH_BUFFERED ]</span>
            </span>
          ) : (
            <span>[ 0xCOPY ]</span>
          )}
        </button>
      </div>
    </div>
  );
};

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

  const handleCopy = (ch: SwitchboardChannel) => {
    navigator.clipboard.writeText(ch.value);
    setCopiedId(ch.id);
    playTactileClick('toggle');
    setTimeout(() => setCopiedId(null), 1500);
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

              {/* DIRECT CHANNELS HARDWARE TELEMETRY SWITCHBOARD */}
              <div className="space-y-2.5">
                {/* Header Ribbon */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                  <div className="font-ndot text-[8px] tracking-[0.28em] text-muted-foreground uppercase flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground phosphor-led" />
                    <span>HARDWARE_BUS_SWITCHBOARD // DIRECT_DISPATCH</span>
                  </div>
                  <div className="font-mono text-[7.5px] text-foreground/80 tracking-wider">
                    BUS_STATUS: 3/3 ONLINE
                  </div>
                </div>

                {/* Terminal Bus Strip Container */}
                <div className="border border-border/70 rounded-xs bg-background/80 divide-y divide-border/40 overflow-hidden shadow-lg">
                  {channels.map((ch) => (
                    <SwitchboardRow
                      key={ch.id}
                      channel={ch}
                      onCopy={handleCopy}
                      isCopied={copiedId === ch.id}
                    />
                  ))}
                </div>

                {/* Live System Diagnostics Footer Sub-bar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[7px] sm:text-[7.5px] text-muted-foreground/80 tracking-wider border-t border-border/30">
                  <span>LATENCY: 24ms // ENCRYPTION: TLS_1.3_CHACHA20</span>
                  <span className="text-foreground/70">INTEGRITY: 100% // NO_PACKET_LOSS</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default ContactSection;
