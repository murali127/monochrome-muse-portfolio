import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import darkLogo from '@/assets/logo.png';
import lightLogo from '@/assets/light_logo.png';

const navItems = ['ABOUT', 'SKILLS', 'EXPERIENCE', 'PROJECTS'];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [logo, setLogo] = useState(darkLogo);
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="fixed top-0 left-0 right-0 z-[100] pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center justify-between px-4 sm:px-8 py-5">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          onMouseDown={(e) => e.preventDefault()}
          className="group flex items-center gap-3 focus:outline-none"
          data-cursor-hover
          tabIndex={-1}
        >
          <img
            src={logo}
            alt="Logo"
            className={`relative h-9 w-9 object-contain rounded-full transition-all duration-500 group-hover:scale-105 ${
              scrolled ? 'opacity-100' : 'opacity-95'
            }`}
          />
          <span className="font-ndot text-sm tracking-[0.18em] text-foreground">
            Murali Paila
          </span>
        </button>

        <div className="relative">
          <div className="nav-pill flex items-center rounded-full py-1.5 pl-2 pr-1.5 sm:pl-5 sm:pr-1.5">
            <div className="hidden items-center lg:flex">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item)}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`relative px-4 py-2 font-ndot text-[10px] tracking-[0.22em] transition-all duration-300 focus:outline-none ${
                    activeSection === item ? 'opacity-100' : 'opacity-55 hover:opacity-100'
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

            <button
              onClick={() => setMenuOpen((open) => !open)}
              onMouseDown={(e) => e.preventDefault()}
              className="mr-1 flex h-9 w-9 items-center justify-center rounded-full lg:hidden focus:outline-none"
              aria-label="Toggle menu"
              data-cursor-hover
            >
              <span className="flex flex-col gap-1.5">
                <span className={`block h-px w-4 bg-current transition-transform ${menuOpen ? 'translate-y-[3.5px] rotate-45' : ''}`} />
                <span className={`block h-px w-4 bg-current transition-transform ${menuOpen ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
              </span>
            </button>

            <button
              onClick={() => scrollTo('CONTACT')}
              onMouseDown={(e) => e.preventDefault()}
              className="nav-cta rounded-full px-4 py-2.5 font-ndot text-[10px] tracking-[0.2em] focus:outline-none sm:px-5"
              data-cursor-hover
            >
              WORK WITH US
            </button>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className="nav-pill absolute right-0 mt-3 flex w-52 flex-col rounded-[1.5rem] p-3 lg:hidden"
              >
                {navItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollTo(item)}
                    className={`rounded-full px-4 py-2.5 text-left font-ndot text-[10px] tracking-[0.22em] ${
                      activeSection === item ? 'opacity-100' : 'opacity-60'
                    }`}
                    data-cursor-hover
                  >
                    {item}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
