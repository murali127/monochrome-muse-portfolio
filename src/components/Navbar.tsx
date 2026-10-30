import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import darkLogo from '@/assets/logo.png';
import lightLogo from '@/assets/light_logo.png';

const navItems = [
  'ABOUT',
  'EDUCATION',
  'SKILLS',
  'EXPERIENCE',
  'PROJECTS',
  'ACHIEVEMENTS',
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [logo, setLogo] = useState(darkLogo);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateLogo = () => {
      const isLight = document.documentElement.classList.contains('light');
      setLogo(isLight ? lightLogo : darkLogo);
    };

    updateLogo();
    const observer = new MutationObserver(updateLogo);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Scroll spy tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const ids = [...navItems, 'CONTACT'];
      const sections = ids.map((item) => document.getElementById(item.toLowerCase()));
      const scrollPos = window.scrollY + window.innerHeight / 3;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(ids[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-[100] pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center justify-between px-3 sm:px-8 py-4 sm:py-5">
        {/* Brand / Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          onMouseDown={(e) => e.preventDefault()}
          className="group flex items-center gap-2.5 sm:gap-3 focus:outline-none"
          data-cursor-hover
          tabIndex={0}
          aria-label="Murali Paila - Scroll to top"
        >
          <img
            src={logo}
            alt="Logo"
            className={`relative h-8 w-8 sm:h-9 sm:w-9 object-contain rounded-full transition-all duration-500 group-hover:scale-105 ${
              scrolled ? 'opacity-100' : 'opacity-95'
            }`}
          />
          <div className="flex flex-col text-left">
            <span className="font-ndot text-xs sm:text-sm tracking-[0.18em] text-foreground leading-tight">
              Murali Paila
            </span>
            <span className="font-ndot text-[7px] sm:text-[8px] tracking-[0.22em] text-muted-foreground">
              GENAI FULL-STACK
            </span>
          </div>
        </button>

        {/* Floating Nav Pill Container */}
        <div className="relative" ref={menuRef}>
          <div className="nav-pill flex items-center rounded-full py-1.5 pl-2 pr-1.5 sm:pl-4 sm:pr-1.5">
            {/* Desktop Navigation Links (>= 1280px) */}
            <div className="hidden items-center xl:flex">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item)}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`relative px-3.5 py-2 font-ndot text-[9px] tracking-[0.2em] transition-all duration-300 focus:outline-none ${
                    activeSection === item ? 'opacity-100 font-semibold' : 'opacity-55 hover:opacity-100'
                  }`}
                  data-cursor-hover
                >
                  {item}
                  {activeSection === item && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute bottom-0.5 left-1/2 h-0.5 w-0.5 -translate-x-1/2 rounded-full bg-current"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Direct GitHub Link */}
            <a
              href="https://github.com/murali127"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 mr-1 rounded-full text-muted-foreground hover:text-foreground font-ndot text-[9px] tracking-[0.2em] transition-colors focus:outline-none"
              data-cursor-hover
              title="GitHub Profile"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GITHUB</span>
            </a>

            {/* Mobile Menu Hamburger (< 1280px) */}
            <button
              onClick={() => setMenuOpen((open) => !open)}
              onMouseDown={(e) => e.preventDefault()}
              className="mr-1 flex h-9 w-9 items-center justify-center rounded-full xl:hidden focus:outline-none"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              data-cursor-hover
            >
              <span className="flex flex-col gap-1.5">
                <span
                  className={`block h-px w-4 bg-current transition-transform duration-300 ${
                    menuOpen ? 'translate-y-[3.5px] rotate-45' : ''
                  }`}
                />
                <span
                  className={`block h-px w-4 bg-current transition-transform duration-300 ${
                    menuOpen ? '-translate-y-[3.5px] -rotate-45' : ''
                  }`}
                />
              </span>
            </button>

            {/* Contact Action Button */}
            <button
              onClick={() => scrollTo('CONTACT')}
              onMouseDown={(e) => e.preventDefault()}
              className="nav-cta rounded-full px-3.5 sm:px-5 py-2 font-ndot text-[8px] sm:text-[9px] tracking-[0.2em] focus:outline-none"
              data-cursor-hover
            >
              CONTACT
            </button>
          </div>

          {/* Mobile / Tablet Dropdown Menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="nav-pill absolute right-0 mt-3 flex w-60 flex-col rounded-[1.5rem] p-3 xl:hidden shadow-2xl border border-border"
              >
                {navItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollTo(item)}
                    className={`min-h-[44px] rounded-full px-4 py-2.5 text-left font-ndot text-[10px] tracking-[0.22em] transition-colors flex items-center ${
                      activeSection === item
                        ? 'bg-foreground/10 text-foreground font-semibold'
                        : 'opacity-65 hover:opacity-100'
                    }`}
                    data-cursor-hover
                  >
                    {item}
                  </button>
                ))}
                <div className="h-px w-full bg-border/50 my-1.5" />
                <a
                  href="https://github.com/murali127"
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[44px] rounded-full px-4 py-2.5 text-left font-ndot text-[10px] tracking-[0.22em] opacity-65 hover:opacity-100 flex items-center justify-between"
                  data-cursor-hover
                >
                  <span>GITHUB PROFILE</span>
                  <span>↗</span>
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
