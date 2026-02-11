import { useState } from 'react';
import CustomCursor from '@/components/CustomCursor';
import ParticleField from '@/components/ParticleField';
import Scene3D from '@/components/Scene3D';
import BootLoader from '@/components/BootLoader';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import SkillsSection from '@/components/SkillsSection';
import ExperienceSection from '@/components/ExperienceSection';
import ProjectsSection from '@/components/ProjectsSection';
import AchievementsSection from '@/components/AchievementsSection';
import ContactSection from '@/components/ContactSection';

const Index = () => {
  const [booted, setBooted] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <CustomCursor />
      <BootLoader onComplete={() => setBooted(true)} />

      {booted && (
        <>
          <ParticleField />
          <Scene3D />
          <div className="noise-overlay" />

          <div className="relative z-10">
            <Navbar />
            <HeroSection />
            <AboutSection />
            <SkillsSection />
            <ExperienceSection />
            <ProjectsSection />
            <AchievementsSection />
            <ContactSection />
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
