'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Globe, Users, MessageCircle, Calendar, MapPin, Phone, Search, CheckCircle2, ClipboardList } from 'lucide-react';
import { getPageContent } from '@/lib/content';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';

const SURVEY_INTERESTS = [
  'Small Groups', 'Volunteer Opportunities', 'Youth Programs', 'Community Outreach', 'Counseling/Support', 'Special Events',
];

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
  const [resourceSearch, setResourceSearch] = useState('');

  const [surveyForm, setSurveyForm] = useState({ name: '', email: '', interests: [] as string[], feedback: '' });
  const [surveySubmitting, setSurveySubmitting] = useState(false);
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getPageContent<CommunityData>('community')
      .then((data) => data && setCommunityData(data))
      .catch((error) => console.error('Error fetching community data:', error))
      .finally(() => setLoading(false));
  }, []);

  const filteredResources = useMemo(() => {
    const resources = communityData?.communityResources ?? [];
    if (!resourceSearch) return resources;
    return resources.filter((r) => `${r.title} ${r.description}`.toLowerCase().includes(resourceSearch.toLowerCase()));
  }, [communityData, resourceSearch]);

  const toggleSurveyInterest = (interest: string) => {
    setSurveyForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest) ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest],
    }));
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSurveySubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: surveyForm.name,
          email: surveyForm.email,
          message: surveyForm.feedback || 'Community survey response (no additional feedback provided).',
          department: 'community-survey',
          interests: surveyForm.interests,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSurveySubmitted(true);
        setSurveyForm({ name: '', email: '', interests: [], feedback: '' });
      } else {
        toast({ title: 'Something went wrong', description: 'Please try again.', variant: 'danger' });
      }
    } catch {
      toast({ title: 'Something went wrong', description: 'Please try again.', variant: 'danger' });
    } finally {
      setSurveySubmitting(false);
    }
  };

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
          <div className="mb-8 text-center">
            <Users className="mx-auto mb-4 h-10 w-10 text-accent" aria-hidden="true" />
            <h2 className="text-headline-md text-foreground">Community Resource Directory</h2>
            <p className="mt-2 text-body-md text-foreground-muted">Local resources for our church family and neighbors</p>
          </div>
          <div className="mx-auto mb-8 flex max-w-md justify-center">
            <Input placeholder="Search resources..." aria-label="Search community resources" leftIcon={<Search />} value={resourceSearch} onChange={(e) => setResourceSearch(e.target.value)} />
          </div>
          {filteredResources.length === 0 ? (
            <p className="text-center text-body-md text-foreground-muted">No resources match your search.</p>
          ) : (
            <Grid cols={3} gap={6}>
              {filteredResources.map((resource, index) => (
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
          )}
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

      <Section spacing="lg" className="bg-surface">
        <Container size="sm">
          <div className="mb-8 text-center">
            <ClipboardList className="mx-auto mb-4 h-10 w-10 text-accent" aria-hidden="true" />
            <h2 className="text-headline-md text-foreground">Community Survey</h2>
            <p className="mt-2 text-body-md text-foreground-muted">Help us understand what our community needs most</p>
          </div>
          <Card variant="raised" padding="lg">
            {surveySubmitted ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success-subtle">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <p className="text-body-md font-medium text-foreground">Thank you for your feedback!</p>
                <Button variant="secondary" className="mt-4" onClick={() => setSurveySubmitted(false)}>Submit Another Response</Button>
              </div>
            ) : (
              <form onSubmit={handleSurveySubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Name" required value={surveyForm.name} onChange={(e) => setSurveyForm({ ...surveyForm, name: e.target.value })} />
                  <Input label="Email" type="email" required value={surveyForm.email} onChange={(e) => setSurveyForm({ ...surveyForm, email: e.target.value })} />
                </div>
                <div>
                  <p className="mb-3 text-label text-foreground">What are you most interested in?</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {SURVEY_INTERESTS.map((interest) => (
                      <Checkbox key={interest} label={interest} checked={surveyForm.interests.includes(interest)} onChange={() => toggleSurveyInterest(interest)} />
                    ))}
                  </div>
                </div>
                <Textarea label="Anything else you'd like us to know? (optional)" rows={3} value={surveyForm.feedback} onChange={(e) => setSurveyForm({ ...surveyForm, feedback: e.target.value })} />
                <Button type="submit" fullWidth loading={surveySubmitting}>{surveySubmitting ? 'Submitting...' : 'Submit Survey'}</Button>
              </form>
            )}
          </Card>
        </Container>
      </Section>
    </div>
  );
}
