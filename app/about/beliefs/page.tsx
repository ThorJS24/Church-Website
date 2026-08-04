'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Heart, Target, Eye, CheckCircle } from 'lucide-react';
import { getPageContent } from '@/lib/content';
import ScriptureReference from '@/components/ScriptureReference';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';
import { LoadingState } from '@/components/ui/States';

interface AboutPage {
  title: string;
  subtitle: string;
  mission: string;
  vision: string;
  beliefs: Array<{
    title: string;
    description: string;
    scriptureReferences?: Array<{ reference: string; verse: string; version: string }>;
  }>;
  beliefsSectionTitle: string;
  values: Array<{
    title: string;
    description: string;
    scriptureReferences?: Array<{ reference: string; verse: string; version: string }>;
  }>;
  valuesSectionTitle: string;
  guidingScripture?: { verse: string; reference: string };
}

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] as const },
  };
}

export default function BeliefsPage() {
  const [aboutPage, setAboutPage] = useState<AboutPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPageContent<AboutPage>('about')
      .then((data) => data && setAboutPage(data))
      .catch((error) => console.error('Error fetching about page content:', error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading..." />;

  return (
    <div>
      <PageHero
        icon={<Book />}
        eyebrow="About Us"
        title={aboutPage?.title || 'Our Beliefs & About Us'}
        description={aboutPage?.subtitle || 'Learn about our church family and what we believe'}
      />

      {/* Mission & Vision */}
      <Section spacing="lg">
        <Grid cols={2} gap={8}>
          <motion.div {...fadeUp()}>
            <Card variant="raised" padding="lg" className="h-full text-center">
              <Target className="mx-auto mb-5 h-10 w-10 text-accent" aria-hidden="true" />
              <h2 className="text-headline-sm text-foreground">Our Mission</h2>
              <p className="mt-4 text-body-md leading-relaxed text-foreground-muted">
                {aboutPage?.mission || 'To proclaim the Gospel of Jesus Christ, nurture believers through sound teaching, and build a community grounded in grace, faith, and love.'}
              </p>
            </Card>
          </motion.div>
          <motion.div {...fadeUp(0.1)}>
            <Card variant="raised" padding="lg" className="h-full text-center">
              <Eye className="mx-auto mb-5 h-10 w-10 text-accent" aria-hidden="true" />
              <h2 className="text-headline-sm text-foreground">Our Vision</h2>
              <p className="mt-4 text-body-md leading-relaxed text-foreground-muted">
                {aboutPage?.vision || 'To be a Christ-centered church that transforms lives and communities through faith, love, and service — equipping every believer to live with purpose.'}
              </p>
            </Card>
          </motion.div>
        </Grid>
      </Section>

      {/* Core Values */}
      {aboutPage?.values && aboutPage.values.length > 0 && (
        <Section spacing="lg" className="bg-surface">
          <h2 className="mb-10 text-center text-headline-md text-foreground">
            {aboutPage.valuesSectionTitle || 'Core Values'}
          </h2>
          <Grid cols={3} gap={6}>
            {aboutPage.values.map((value, index) => (
              <motion.div key={value.title} {...fadeUp(index * 0.05)}>
                <Card padding="lg" className="h-full text-center">
                  <Heart className="mx-auto mb-4 h-8 w-8 text-accent" aria-hidden="true" />
                  <h3 className="text-title-md text-foreground">{value.title}</h3>
                  <p className="mt-2 text-body-sm text-foreground-muted">{value.description}</p>
                  {value.scriptureReferences && value.scriptureReferences.length > 0 && (
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      {value.scriptureReferences.map((s, i) => (
                        <ScriptureReference key={i} reference={s.reference} verse={s.verse} version={s.version} />
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </Grid>
        </Section>
      )}

      {/* What We Believe */}
      <Section spacing="lg">
        <div className="mb-10 text-center">
          <Book className="mx-auto mb-4 h-10 w-10 text-accent" aria-hidden="true" />
          <h2 className="text-headline-md text-foreground">{aboutPage?.beliefsSectionTitle || 'What We Believe'}</h2>
        </div>

        {aboutPage?.beliefs && (
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
            {aboutPage.beliefs.map((belief, index) => (
              <motion.div key={belief.title} {...fadeUp(index * 0.04)}>
                <Card className="flex h-full items-start gap-4">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                  <div>
                    <h3 className="text-title-sm text-foreground">{belief.title}</h3>
                    <p className="mt-1.5 text-body-sm leading-relaxed text-foreground-muted">{belief.description}</p>
                    {belief.scriptureReferences && belief.scriptureReferences.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {belief.scriptureReferences.map((s, i) => (
                          <ScriptureReference key={i} reference={s.reference} verse={s.verse} version={s.version} />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {aboutPage?.guidingScripture && (
          <motion.div {...fadeUp(0.2)} className="mx-auto mt-10 max-w-3xl">
            <Card variant="raised" padding="lg" className="text-center">
              <h3 className="text-title-lg text-foreground">Guiding Scripture</h3>
              <p className="mt-4 text-body-lg italic text-foreground">"{aboutPage.guidingScripture.verse}"</p>
              <p className="mt-3 text-body-sm font-semibold text-accent">— {aboutPage.guidingScripture.reference}</p>
            </Card>
          </motion.div>
        )}
      </Section>
    </div>
  );
}
