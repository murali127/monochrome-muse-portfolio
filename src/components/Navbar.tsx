import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import darkLogo from '@/assets/logo.png';
import lightLogo from '@/assets/light_logo.png';

const navItems = ['ABOUT', 'SKILLS', 'EXPERIENCE', 'PROJECTS', 'CONTACT'];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [logo, setLogo] = useState(darkLogo);

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

      const sections = navItems.map(item => document.getElementById(item.toLowerCase()));
      const scrollPos = window.scrollY + window.innerHeight / 3;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(navItems[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? 'glass-panel border-b border-border' : ''
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo + Name - Left Corner */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex items-center gap-3"
          data-cursor-hover
        >
          <div className="relative">
            {/* Glow ring behind logo */}
            <div className="absolute -inset-1 rounded-full bg-foreground/10 blur-md group-hover:bg-foreground/20 transition-all duration-500" />
            <div className="absolute -inset-0.5 rounded-full border border-foreground/20 group-hover:border-foreground/40 transition-all duration-500 animate-pulse" />
            <img
              src={logo}
              alt="Logo"
              className="relative h-10 w-10 object-contain rounded-full transition-all duration-500 group-hover:scale-110"
              style={{
                filter: 'drop-shadow(0 0 12px hsla(var(--foreground) / 0.4))'
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-ndot text-sm tracking-[0.2em] text-foreground group-hover:text-glow transition-all duration-300">
              MURALI
            </span>
            <span className="font-ndot text-[8px] tracking-[0.3em] text-muted-foreground">
              PAILA
            </span>
          </div>
        </button>

        {/* Nav Links - Center */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => scrollTo(item)}
              className={`font-ndot text-[10px] tracking-[0.2em] transition-all duration-300 ${
                activeSection === item
                  ? 'text-foreground text-glow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              data-cursor-hover
            >
              {item}
              {activeSection === item && (
                <motion.div layoutId="nav-indicator" className="mt-1 h-[1px] w-full bg-foreground" />
              )}
            </button>
          ))}
        </div>

        {/* CTA - Right */}
        <button
          onClick={() => scrollTo('CONTACT')}
          className="glass-panel-hover rounded-none px-4 py-2 font-ndot text-[10px] tracking-[0.2em] text-foreground"
          data-cursor-hover
        >
          GET IN TOUCH
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
