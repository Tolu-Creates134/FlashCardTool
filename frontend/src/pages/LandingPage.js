import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CTASection from '../components/landing/CTASection';
import FeaturesSection from '../components/landing/FeaturesSection';
import FooterSection from '../components/landing/FooterSection';
import HeroSection from '../components/landing/HeroSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import LearningScienceSection from '../components/landing/LearningScienceSection';

/**
 * Public landing page shown before authentication
 * @returns
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const howItWorksRef = useRef(null);

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <HeroSection
        onLogin={() => navigate('/login')}
        onSignup={() => navigate('/signup')}
        onScrollToHowItWorks={scrollToHowItWorks}
      />
      <HowItWorksSection ref={howItWorksRef} />
      <FeaturesSection />
      <LearningScienceSection />
      <CTASection onSignup={() => navigate('/signup')} />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
