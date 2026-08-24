'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import { getLivestream } from '@/lib/content';
import { useAuth } from '@/contexts/AuthContext';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Button, LinkButton } from '@/components/ui/button';
import DynamicLiveStream from '@/components/DynamicLiveStream';

// Hero content is visible on first paint, not scrolled into view, so it
// animates via `animate` rather than `whileInView` — an IntersectionObserver
// that never fires (slow mount, blocked API, etc) would otherwise leave the
// page's most important content stuck invisible with no fallback.
function fadeUpImmediate(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] as const },
  };
}

interface HeroSectionProps {
  churchName: string;
  tagline: string;
}

export function HeroSection({ churchName, tagline }: HeroSectionProps) {
  const [isLive, setIsLive] = useState(false);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Fetched client-side (rather than server-fetched with the rest of the
    // homepage data) so live status doesn't go stale between ISR revalidations.
    getLivestream()
      .then((livestreamData) => setIsLive(!!livestreamData?.isLive))
      .catch((error) => console.error('Error fetching livestream:', error));
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-[#17130F] py-24 text-white sm:py-32">
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#17130F]/25 via-[#17130F]/35 to-[#17130F]" />

        <Container className="relative z-10 text-center">
          {isLive && (
            <motion.button
              {...fadeUpImmediate()}
              onClick={() => setShowLiveStream(true)}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-danger/40 bg-danger/15 px-3 py-1 text-caption font-medium text-danger-subtle"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
              Live now — tap to watch
            </motion.button>
          )}
          <motion.h1
            {...fadeUpImmediate(0.05)}
            className="mx-auto max-w-3xl font-serif text-display-sm text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] sm:text-display-md"
          >
            {churchName}
          </motion.h1>
          <motion.p
            {...fadeUpImmediate(0.1)}
            className="mx-auto mt-5 max-w-xl font-serif text-body-lg italic text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
          >
            {tagline}
          </motion.p>
          <motion.div {...fadeUpImmediate(0.15)} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/services" size="lg">
              Join Us Sunday 9:30 AM
            </LinkButton>
            <LinkButton href={user ? '/dashboard' : '/login'} variant="secondary" size="lg">
              {user ? 'My Dashboard' : 'Sign In'}
            </LinkButton>
            {isLive && (
              <Button size="lg" variant="danger" leftIcon={<Play className="h-4 w-4" />} onClick={() => setShowLiveStream(true)}>
                Watch Live
              </Button>
            )}
          </motion.div>
        </Container>
      </section>

      {showLiveStream && (
        <Section spacing="sm" className="bg-surface">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-headline-sm text-foreground">Live Stream</h2>
            <button onClick={() => setShowLiveStream(false)} className="text-body-sm text-foreground-muted hover:text-foreground">
              Close
            </button>
          </div>
          <DynamicLiveStream />
        </Section>
      )}
    </>
  );
}
