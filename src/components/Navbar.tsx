import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const navItems = ['ABOUT', 'SKILLS', 'EXPERIENCE', 'PROJECTS', 'CONTACT'];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

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
      transition={{ duration: 0.6, delay: 2.5 }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? 'glass-panel border-b border-border' : ''
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-ndot text-sm tracking-[0.3em] text-foreground" data-cursor-hover>
          MP_
        </button>

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
