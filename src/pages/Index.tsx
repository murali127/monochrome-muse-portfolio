import { useState } from 'react';
import CustomCursor from '@/components/CustomCursor';
import ParticleField from '@/components/ParticleField';
import Scene3D from '@/components/Scene3D';
import BootLoader from '@/components/BootLoader';
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
  const [bootCompleted, setBootCompleted] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <CustomCursor />

      {/* Background 3D Earth Globe & Ambient Field pre-mount for instant zero-lag reveal */}
      <ParticleField />
      <Scene3D />
      <div className="noise-overlay" />
      <ThemeToggle />

      <main className="relative z-10">
        <Navbar />
        <HeroSection />
        <AboutSection />
        <EducationSection />
        <SkillsSection />
        <ExperienceSection />
        <ProjectsSection />
        <AchievementsSection />
        <ContactSection />
      </main>

      {/* Terminal BIOS Boot Sequence Overlay */}
      {!bootCompleted && (
        <BootLoader onComplete={() => setBootCompleted(true)} />
      )}
    </div>
  );
};

export default Index;
