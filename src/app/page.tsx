'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureSection } from '@/components/landing/FeatureSection';
import { GamificationSection } from '@/components/landing/GamificationSection';
import { AiSection } from '@/components/landing/AiSection';
import { SocialSection } from '@/components/landing/SocialSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FooterSection } from '@/components/landing/FooterSection';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [status, session, router]);
  return (
    <div className="min-h-screen bg-white transition-colors duration-300 dark:bg-slate-950">
      <LandingNav />
      <HeroSection />
      <FeatureSection />
      <GamificationSection />
      <AiSection />
      <SocialSection />
      <PricingSection />
      <TestimonialsSection />
      <FooterSection />
    </div>
  );
}
