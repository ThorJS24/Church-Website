'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Mail, Phone, Clock, MapPin, Users, Quote, ArrowLeft } from 'lucide-react';
import { getMinistryById, Ministry } from '@/lib/content';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { LinkButton } from '@/components/ui/button';
import { LoadingState, EmptyState } from '@/components/ui/states';
import Image from 'next/image';

function parseVolunteerNeeds(raw?: string): string[] {
  return (raw ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
}

function parseTeamPhotos(raw?: string): { name: string; imageUrl: string }[] {
  return (raw ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, imageUrl] = line.split('|').map((part) => part.trim());
      return { name: name || 'Team Member', imageUrl: imageUrl || '' };
    })
    .filter((member) => member.imageUrl);
}

export default function MinistryDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getMinistryById(id)
      .then(setMinistry)
      .catch((error) => console.error('Error fetching ministry:', error))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState label="Loading ministry..." />;

  if (!ministry) {
    return (
      <Section spacing="lg">
        <EmptyState icon={Users} title="Ministry not found" description="This ministry may have been removed or renamed." />
        <div className="mt-6 text-center">
          <LinkButton href="/ministries" variant="outline">Back to Ministries</LinkButton>
        </div>
      </Section>
    );
  }

  const volunteerNeeds = parseVolunteerNeeds(ministry.volunteerNeeds);
  const teamPhotos = parseTeamPhotos(ministry.teamPhotos);

  return (
    <div>
      <PageHero
        icon={<Users />}
        eyebrow={ministry.ageGroup || 'Ministry'}
        title={ministry.title}
        description={ministry.description}
        actions={<LinkButton href="/ministries" variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>Back to Ministries</LinkButton>}
      />

      <Section spacing="lg">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {ministry.imageUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface-active">
                <Image src={ministry.imageUrl} alt={ministry.title} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" priority />
              </div>
            )}

            <div className="flex flex-wrap gap-6 text-body-sm text-foreground-muted">
              {ministry.meetingTime && <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {ministry.meetingTime}</span>}
              {ministry.location && <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {ministry.location}</span>}
            </div>

            {ministry.testimonialQuote && (
              <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Card variant="outline" padding="lg" className="relative">
                  <Quote className="absolute right-6 top-6 h-8 w-8 text-accent/20" aria-hidden="true" />
                  <p className="text-title-md italic leading-relaxed text-foreground">&ldquo;{ministry.testimonialQuote}&rdquo;</p>
                  {ministry.testimonialAuthor && <p className="mt-4 text-body-sm font-medium text-foreground-muted">— {ministry.testimonialAuthor}</p>}
                </Card>
              </motion.div>
            )}

            {volunteerNeeds.length > 0 && (
              <div>
                <h2 className="text-title-lg text-foreground">Volunteer Opportunities</h2>
                <p className="mt-1 text-body-sm text-foreground-muted">Current openings on this ministry team.</p>
                <ul className="mt-4 space-y-3">
                  {volunteerNeeds.map((need) => (
                    <li key={need}>
                      <Card variant="flat" padding="sm" className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        <span className="text-body-sm text-foreground">{need}</span>
                        <LinkButton href={`/ministries/volunteer?ministry=${ministry.id}&role=${encodeURIComponent(need)}`} size="sm" variant="outline">
                          Volunteer for This
                        </LinkButton>
                      </Card>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {teamPhotos.length > 0 && (
              <div>
                <h2 className="text-title-lg text-foreground">Meet the Team</h2>
                <Grid cols={4} gap={4} className="mt-4">
                  {teamPhotos.map((member, index) => (
                    <div key={`${member.name}-${index}`} className="text-center">
                      <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full bg-surface-active">
                        <Image src={member.imageUrl} alt={member.name} fill sizes="80px" className="object-cover" />
                      </div>
                      <p className="mt-2 text-body-sm font-medium text-foreground">{member.name}</p>
                    </div>
                  ))}
                </Grid>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {ministry.leaderName && (
              <Card variant="raised" padding="lg">
                <h2 className="text-title-md text-foreground">Ministry Leader</h2>
                <div className="mt-4 flex items-center gap-4">
                  {ministry.leaderImageUrl ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface-active">
                      <Image src={ministry.leaderImageUrl} alt={ministry.leaderName} fill sizes="64px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-title-md font-semibold text-accent">
                      {ministry.leaderName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-body-md font-semibold text-foreground">{ministry.leaderName}</p>
                    {ministry.leaderTitle && <p className="text-body-sm text-foreground-muted">{ministry.leaderTitle}</p>}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {ministry.leaderEmail && (
                    <a href={`mailto:${ministry.leaderEmail}`} className="flex items-center gap-2 text-body-sm text-accent hover:text-accent-hover">
                      <Mail className="h-4 w-4" /> {ministry.leaderEmail}
                    </a>
                  )}
                  {ministry.leaderPhone && (
                    <a href={`tel:${ministry.leaderPhone}`} className="flex items-center gap-2 text-body-sm text-accent hover:text-accent-hover">
                      <Phone className="h-4 w-4" /> {ministry.leaderPhone}
                    </a>
                  )}
                </div>
                <LinkButton href={`/ministries/contact?ministry=${ministry.id}`} fullWidth className="mt-5">Contact Ministry Leader</LinkButton>
              </Card>
            )}

            <Card variant="outline" padding="lg">
              <h2 className="text-title-md text-foreground">Get Involved</h2>
              <p className="mt-2 text-body-sm text-foreground-muted">Ready to join this ministry?</p>
              <LinkButton href={`/ministries/volunteer?ministry=${ministry.id}`} fullWidth className="mt-4">Join Ministry</LinkButton>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
}
