'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Play, Clock } from 'lucide-react';
import { getLivestream, ServiceTime } from '@/lib/content';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Section } from '@/components/ui/section';
import { Button, LinkButton } from '@/components/ui/button';
import DynamicLiveStream from '@/components/DynamicLiveStream';
import { Trans } from '@/components/i18n/Trans';
import { cn } from '@/lib/utils';

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

// Two organic, hand-picked border-radius shapes (not a generated ellipse) —
// one for the decorative olive field behind the photo, a tighter one for
// the photo mask itself, so the photo doesn't just look like a circle
// cropped from the field behind it. Inline styles rather than a Tailwind
// arbitrary-value class: the slash in border-radius's two-value shorthand
// (`50% 50% / 60% 40%`) collides with Tailwind's own slash-as-opacity
// arbitrary-value syntax and the class silently fails to generate.
const FIELD_BLOB_STYLE = { borderRadius: '68% 32% 26% 74% / 58% 66% 34% 42%' };
const PHOTO_BLOB_STYLE = { borderRadius: '30% 70% 74% 26% / 40% 32% 68% 60%' };

interface HeroSectionProps {
  churchName: string;
  tagline: string;
  nextService: ServiceTime | null;
}

export function HeroSection({ churchName, tagline, nextService }: HeroSectionProps) {
  const [isLive, setIsLive] = useState(false);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const tamilFont = language === 'ta' ? 'font-tamil' : '';

  useEffect(() => {
    // Fetched client-side (rather than server-fetched with the rest of the
    // homepage data) so live status doesn't go stale between ISR revalidations.
    getLivestream()
      .then((livestreamData) => setIsLive(!!livestreamData?.isLive))
      .catch((error) => console.error('Error fetching livestream:', error));
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-background py-16 sm:py-20 lg:py-28">
        <div className="mx-auto flex max-w-[1680px] flex-col items-center gap-12 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-8 xl:px-12">
          {/* Text column */}
          <div className="flex flex-1 flex-col items-center gap-5 text-center lg:items-start lg:text-left">
            {isLive && (
              <motion.button
                {...fadeUpImmediate()}
                onClick={() => setShowLiveStream(true)}
                className={cn('inline-flex items-center gap-2 rounded-full border border-danger/40 bg-danger-subtle px-3 py-1 text-caption font-medium text-danger', tamilFont)}
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
                {t('home.liveNowTap')}
              </motion.button>
            )}
            <motion.h1
              {...fadeUpImmediate(0.05)}
              className="max-w-xl font-serif text-display-sm text-foreground sm:text-display-md"
            >
              {churchName}
            </motion.h1>
            <motion.p
              {...fadeUpImmediate(0.1)}
              className="max-w-md font-serif text-body-lg italic text-foreground-muted"
            >
              {tagline}
            </motion.p>
            <motion.div {...fadeUpImmediate(0.15)} className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
              <LinkButton href="/services" size="lg" className={tamilFont}>
                {t('home.joinSundayCta')}
              </LinkButton>
              {/* Inline border style rather than a border-{token} class: tailwind-merge
                  doesn't reliably resolve the conflict between this and the outline
                  variant's own `border-border` (both start with "border-border...",
                  which seems to confuse its class-group matching) — verified via
                  computed styles that the class-based override silently lost. */}
              <LinkButton
                href={user ? '/dashboard' : '/login'}
                variant="outline"
                size="lg"
                className={tamilFont}
                style={{ borderWidth: '2px', borderColor: 'rgb(var(--border-strong))' }}
              >
                {user ? t('home.myDashboard') : t('auth.signIn')}
              </LinkButton>
              {isLive && (
                <Button size="lg" variant="danger" leftIcon={<Play className="h-4 w-4" />} onClick={() => setShowLiveStream(true)} className={tamilFont}>
                  {t('home.watchLive')}
                </Button>
              )}
            </motion.div>
          </div>

          {/* Blob-masked photo column */}
          <motion.div
            {...fadeUpImmediate(0.1)}
            className="relative w-full max-w-[380px] shrink-0 lg:w-[380px]"
          >
            {/* bg-accent-warm-subtle (232 235 217) sits almost on top of
                --background (242 233 220) — a fine choice for text-on-badge
                contrast, the wrong one for a decorative field meant to
                visibly peek out from the page itself. A translucent wash of
                the full-strength olive reads clearly instead — as an inline
                style, since `bg-accent-warm/15`'s opacity modifier silently
                resolved to fully transparent (verified via computed style)
                against this app's RGB-triplet custom color tokens. Stacked
                below the photo via DOM order (rendered first), not z-index —
                the section's `overflow-hidden` establishes a stacking
                context that a negative z-index child doesn't escape. */}
            <div
              className="absolute -inset-12 sm:-inset-16"
              style={{ ...FIELD_BLOB_STYLE, backgroundColor: 'rgb(var(--accent-warm) / 0.15)' }}
              aria-hidden="true"
            />
            <div className="relative aspect-[4/5] overflow-hidden shadow-lg" style={PHOTO_BLOB_STYLE}>
              <Image src="/images/hero-bg.jpg" alt="" fill priority sizes="(max-width: 1024px) 380px, 380px" className="object-cover" />
            </div>
            {nextService && (
              <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl bg-accent-warm px-4 py-3 text-accent-warm-foreground shadow-lg sm:-left-8">
                <Clock className="h-5 w-5 shrink-0 opacity-90" aria-hidden="true" />
                <div>
                  <p className={cn('text-caption font-medium uppercase tracking-wide opacity-85', tamilFont)}><Trans k="home.nextService" /></p>
                  <p className="text-title-sm font-semibold">{nextService.time}</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {showLiveStream && (
        <Section spacing="sm" className="bg-surface">
          <div className="mb-4 flex items-center justify-between">
            <h2 className={cn('font-serif text-headline-sm text-foreground', tamilFont)}>{t('home.liveStream')}</h2>
            <button onClick={() => setShowLiveStream(false)} className={cn('text-body-sm text-foreground-muted hover:text-foreground', tamilFont)}>
              {t('common.close')}
            </button>
          </div>
          <DynamicLiveStream />
        </Section>
      )}
    </>
  );
}
