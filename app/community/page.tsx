'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Globe, Users, MessageCircle, Calendar, MapPin, Phone } from 'lucide-react';
import { getPageContent } from '@/lib/content';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';
import { LoadingState } from '@/components/ui/States';

interface CommunityData {
  title: string;
  subtitle: string;
  missions: Array<{ title: string; description: string; location: string }>;
  outreachStories: Array<{ title: string; story: string; date: string }>;
  communityResources: Array<{ title: string; description: string; contactInfo: string; schedule?: string }>;
  testimonies: Array<{ name: string; testimony: string; date: string }>;
}

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] as const },
  };
}

export default function CommunityPage() {
  const [communityData, setCommunityData] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPageContent<CommunityData>('community')
      .then((data) => data && setCommunityData(data))
      .catch((error) => console.error('Error fetching community data:', error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading..." />;

  return (
    <div>
      <PageHero
        icon={<Users />}
        eyebrow="Community"
        title={communityData?.title || 'Community & Outreach'}
        description={communityData?.subtitle || 'Serving our community with love and compassion'}
      />

      {communityData?.missions && communityData.missions.length > 0 && (
        <Section spacing="lg">
          <div className="mb-10 text-center">
            <Globe className="mx-auto mb-4 h-10 w-10 text-accent" aria-hidden="true" />
            <h2 className="text-headline-md text-foreground">Missions &amp; Local Outreach</h2>
          </div>
          <Grid cols={3} gap={6}>
            {communityData.missions.map((mission, index) => (
              <motion.div key={mission.title} {...fadeUp(index * 0.05)}>
                <Card className="h-full">
                  <h3 className="text-title-md text-foreground">{mission.title}</h3>
                  <p className="mt-2 text-body-sm text-foreground-muted">{mission.description}</p>
                  <p className="mt-3 flex items-center gap-2 text-body-sm text-accent">
                    <MapPin className="h-4 w-4" /> {mission.location}
                  </p>
                </Card>
              </motion.div>
            ))}
          </Grid>
        </Section>
      )}

      {communityData?.outreachStories && communityData.outreachStories.length > 0 && (
        <Section spacing="lg" className="bg-surface">
          <div className="mb-10 text-center">
            <Heart className="mx-auto mb-4 h-10 w-10 text-accent" aria-hidden="true" />
            <h2 className="text-headline-md text-foreground">Outreach Stories</h2>
          </div>
          <Grid cols={2} gap={6}>
            {communityData.outreachStories.map((story, index) => (
              <motion.div key={story.title} {...fadeUp(index * 0.05)}>
                <Card className="h-full">
                  <h3 className="text-title-md text-foreground">{story.title}</h3>
                  <p className="mt-2 text-body-sm text-foreground-muted">{story.story}</p>
                  <p className="mt-3 flex items-center gap-2 text-body-sm text-foreground-subtle">
                    <Calendar className="h-4 w-4" /> {new Date(story.date).toLocaleDateString()}
                  </p>
                </Card>
              </motion.div>
            ))}
          </Grid>
        </Section>
      )}

      {communityData?.communityResources && communityData.communityResources.length > 0 && (
        <Section spacing="lg">
          <div className="mb-10 text-center">
            <Users className="mx-auto mb-4 h-10 w-10 text-accent" aria-hidden="true" />
            <h2 className="text-headline-md text-foreground">Community Resources</h2>
          </div>
          <Grid cols={3} gap={6}>
            {communityData.communityResources.map((resource, index) => (
              <motion.div key={resource.title} {...fadeUp(index * 0.05)}>
                <Card className="h-full">
                  <h3 className="text-title-md text-foreground">{resource.title}</h3>
                  <p className="mt-2 text-body-sm text-foreground-muted">{resource.description}</p>
                  {resource.schedule && (
                    <p className="mt-3 flex items-center gap-2 text-body-sm text-foreground-subtle">
                      <Calendar className="h-4 w-4" /> {resource.schedule}
                    </p>
                  )}
                  <p className="mt-1.5 flex items-center gap-2 text-body-sm text-accent">
                    <Phone className="h-4 w-4" /> {resource.contactInfo}
                  </p>
                </Card>
              </motion.div>
            ))}
          </Grid>
        </Section>
      )}

      {communityData?.testimonies && communityData.testimonies.length > 0 && (
        <Section spacing="lg" className="bg-surface">
          <div className="mb-10 text-center">
            <MessageCircle className="mx-auto mb-4 h-10 w-10 text-accent" aria-hidden="true" />
            <h2 className="text-headline-md text-foreground">Stories of Life Change</h2>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {communityData.testimonies.map((testimony, index) => (
              <motion.div key={testimony.name} {...fadeUp(index * 0.05)}>
                <Card className="h-full text-center">
                  <blockquote className="text-body-lg italic text-foreground">"{testimony.testimony}"</blockquote>
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-title-sm text-foreground">{testimony.name}</p>
                    <p className="text-caption text-foreground-subtle">{new Date(testimony.date).toLocaleDateString()}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
