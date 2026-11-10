import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomCursor from '@/components/CustomCursor';
import ParticleField from '@/components/ParticleField';
import Scene3D from '@/components/Scene3D';
import BootLoader, { TelemetryData } from '@/components/BootLoader';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import EducationSection from '@/components/EducationSection';
import SkillsSection from '@/components/SkillsSection';
import ExperienceSection from '@/components/ExperienceSection';
import ProjectsSection from '@/components/ProjectsSection';
import AchievementsSection from '@/components/AchievementsSection';
import ContactSection from '@/components/ContactSection';
import ThemeToggle from '@/components/ThemeToggle';

const Index = () => {
  const [warpCompleted, setWarpCompleted] = useState(false);
  const [skipRequested, setSkipRequested] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    velocity: '0.0c',
    distance: '142,000 KM',
    isLocked: false,
    warpFactor: 0,
  });

  const handleWarpComplete = useCallback(() => {
    setWarpCompleted(true);
  }, []);

  const handleSkip = useCallback(() => {
    setSkipRequested(true);
    setWarpCompleted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <CustomCursor />

      {/* Cinematic 3D Scene: Spiral Galaxy -> Hyperspace Dive -> Dot-Matrix Earth */}
      <ParticleField />
      <Scene3D
        skipWarp={skipRequested}
        onWarpComplete={handleWarpComplete}
        onTelemetryUpdate={setTelemetry}
      />
      <div className="noise-overlay" />
      <ThemeToggle />

      {/* Minimal Tactical Warp Telemetry HUD (Active during hyperspace dive) */}
      <AnimatePresence>
        {!warpCompleted && (
          <BootLoader
            telemetry={telemetry}
            onSkip={handleSkip}
          />
        )}
      </AnimatePresence>

      {/* Main Portfolio Content: Fades in & slides up smoothly upon orbital lock */}
      <motion.main
        className="relative z-10"
        initial={{ opacity: 0, y: 32 }}
        animate={{
          opacity: warpCompleted ? 1 : 0,
          y: warpCompleted ? 0 : 32,
        }}
        transition={{
          duration: 0.95,
          ease: [0.16, 1, 0.3, 1], // Quintic smooth deceleration
        }}
        style={{
          pointerEvents: warpCompleted ? 'auto' : 'none',
        }}
      >
        <Navbar />
        <HeroSection />
        <AboutSection />
        <EducationSection />
        <SkillsSection />
        <ExperienceSection />
        <ProjectsSection />
        <AchievementsSection />
        <ContactSection />
      </motion.main>
    </div>
  );
};

export default Index;
