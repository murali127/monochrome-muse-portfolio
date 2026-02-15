import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
    localStorage.setItem('theme', newTheme);
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      onClick={toggleTheme}
      className="fixed bottom-8 right-8 z-[200] glass-panel-hover p-4 rounded-full group"
      data-cursor-hover
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        {/* Sun icon for light mode */}
        <motion.svg
          className="absolute inset-0 w-6 h-6 text-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={{ 
            opacity: theme === 'light' ? 1 : 0,
            rotate: theme === 'light' ? 0 : 180,
            scale: theme === 'light' ? 1 : 0.5
          }}
          transition={{ duration: 0.3 }}
        >
          <circle cx="12" cy="12" r="4" strokeWidth="2" />
          <path strokeWidth="2" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </motion.svg>

        {/* Moon icon for dark mode */}
        <motion.svg
          className="absolute inset-0 w-6 h-6 text-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={{ 
            opacity: theme === 'dark' ? 1 : 0,
            rotate: theme === 'dark' ? 0 : -180,
            scale: theme === 'dark' ? 1 : 0.5
          }}
          transition={{ duration: 0.3 }}
        >
          <path strokeWidth="2" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </motion.svg>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 glass-panel rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span className="font-ndot text-[8px] tracking-[0.2em] text-foreground">
          {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
        </span>
      </div>
    </motion.button>
  );
};

export default ThemeToggle;
