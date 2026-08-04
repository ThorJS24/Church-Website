'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Heart, Mail, Users, Calendar, MapPin, Phone, Clock, ArrowRight, Play,
  Church, BookOpen, Sparkles, ImageIcon,
} from 'lucide-react';
import {
  getAnnouncements, getSiteSettings, getServiceTimes, getSermons, getEvents,
  getBlogPosts, getEventGalleries, getLivestream,
  Announcement, SiteSettings, ServiceTime, Sermon, EventItem, BlogPost, GalleryPhoto, Livestream,
} from '@/lib/content';
import { useAuth } from '@/contexts/AuthContext';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Grid } from '@/components/ui/Grid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, LinkButton } from '@/components/ui/Button';
import DynamicLiveStream from '@/components/DynamicLiveStream';
import BibleVerse from '@/components/BibleVerse';
import NewsletterSignup from '@/components/NewsletterSignup';

const quickActions = [
  { href: '/services', icon: Church, title: 'Join Us Sunday', description: 'Worship with us every Sunday at 9:30 AM' },
  { href: '/give', icon: Heart, title: 'Give', description: 'See how to support our mission' },
  { href: '/prayer', icon: Sparkles, title: 'Prayer Request', description: 'Share your prayer needs with our community' },
  { href: '/contact', icon: Mail, title: 'Get In Touch', description: 'Contact us with questions or to learn more' },
];

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] as const },
  };
}

export default function Home() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [services, setServices] = useState<ServiceTime[]>([]);
  const [featuredSermon, setFeaturedSermon] = useState<Sermon | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [galleryPreview, setGalleryPreview] = useState<GalleryPhoto[]>([]);
  const [livestream, setLivestream] = useState<Livestream | null>(null);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          announcementsData, siteSettingsData, servicesData, sermonsData,
          eventsData, blogData, galleriesData, livestreamData,
        ] = await Promise.all([
          getAnnouncements(3),
          getSiteSettings(),
          getServiceTimes(),
          getSermons(10),
          getEvents(),
          getBlogPosts(3),
          getEventGalleries(),
          getLivestream(),
        ]);

        setAnnouncements(announcementsData);
        setSiteSettings(siteSettingsData);
        setServices(servicesData);
        setFeaturedSermon(sermonsData.find((s) => s.featured) ?? sermonsData[0] ?? null);
        setUpcomingEvents(
          eventsData
            .filter((e) => new Date(e.startDate).getTime() >= Date.now())
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(0, 3)
        );
        setLatestPosts(blogData);
        setGalleryPreview(galleriesData.flatMap((g) => g.photos).slice(0, 6));
        setLivestream(livestreamData);
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      }
    }

    fetchData();
  }, []);

  const nextService = services[0];
  const isLive = !!livestream?.isLive;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-950 py-24 text-white sm:py-32">
        <div
          className="absolute inset-0 opacity-40"
          style={{ backgroundImage: 'url(/images/hero-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/70 to-zinc-950" />

        <Container className="relative z-10 text-center">
          {isLive && (
            <motion.button
              {...fadeUp()}
              onClick={() => setShowLiveStream(true)}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-caption font-medium text-red-300"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
              Live now — tap to watch
            </motion.button>
          )}
          <motion.h1
            {...fadeUp(0.05)}
            className="mx-auto max-w-3xl text-display-sm text-white sm:text-display-md"
          >
            {siteSettings?.churchName || 'Salem Primitive Baptist Church'}
          </motion.h1>
          <motion.p
            {...fadeUp(0.1)}
            className="mx-auto mt-5 max-w-xl text-body-lg text-white/70"
          >
            {siteSettings?.tagline || 'A place where faith meets community, and hope comes alive.'}
          </motion.p>
          <motion.div {...fadeUp(0.15)} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
            <h2 className="text-headline-sm text-foreground">Live Stream</h2>
            <button onClick={() => setShowLiveStream(false)} className="text-body-sm text-foreground-muted hover:text-foreground">
              Close
            </button>
          </div>
          <DynamicLiveStream />
        </Section>
      )}

      {/* Today's verse + next service */}
      <Section spacing="lg">
        <Grid cols={2} gap={8}>
          <BibleVerse />
          <Card variant="raised" padding="lg" className="flex flex-col justify-center">
            <Badge variant="accent" className="mb-4 w-fit">Next Service</Badge>
            {nextService ? (
              <>
                <h3 className="text-headline-sm text-foreground">{nextService.title}</h3>
                <div className="mt-4 space-y-2 text-body-md text-foreground-muted">
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-foreground-subtle" /> {nextService.time}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-foreground-subtle" /> {nextService.location}</p>
                </div>
                {nextService.description && (
                  <p className="mt-4 text-body-sm text-foreground-muted">{nextService.description}</p>
                )}
              </>
            ) : (
              <p className="text-body-md text-foreground-muted">Sunday Worship — 9:30 AM</p>
            )}
            <LinkButton href="/services" variant="outline" className="mt-6 w-fit">
              View all service times
            </LinkButton>
          </Card>
        </Grid>
      </Section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <Section spacing="md" className="bg-surface">
          <h2 className="mb-8 text-center text-headline-md text-foreground">Latest Announcements</h2>
          <div className="mx-auto max-w-3xl space-y-4">
            {announcements.map((announcement, index) => (
              <motion.div key={announcement.id} {...fadeUp(index * 0.05)}>
                <Card className="flex items-start gap-4">
                  <div className="rounded-full bg-accent-subtle p-2.5">
                    <Mail className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-title-sm text-foreground">{announcement.title}</h3>
                    <p className="mt-1 text-body-sm text-foreground-muted">{announcement.content}</p>
                    {announcement.date && (
                      <p className="mt-2 text-caption text-foreground-subtle">
                        {new Date(announcement.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {/* Quick actions */}
      <Section spacing="lg">
        <h2 className="mb-10 text-center text-headline-md text-foreground">Connect With Us</h2>
        <Grid cols={4} gap={6}>
          {quickActions.map((action, index) => (
            <motion.div key={action.title} {...fadeUp(index * 0.05)}>
              <Link href={action.href} className="block h-full">
                <Card variant="interactive" padding="lg" className="h-full text-center">
                  <action.icon className="mx-auto mb-4 h-9 w-9 text-accent" aria-hidden="true" />
                  <h3 className="text-title-md text-foreground">{action.title}</h3>
                  <p className="mt-2 text-body-sm text-foreground-muted">{action.description}</p>
                  <ArrowRight className="mx-auto mt-4 h-4 w-4 text-accent" aria-hidden="true" />
                </Card>
              </Link>
            </motion.div>
          ))}
        </Grid>
      </Section>

      {/* Featured sermon */}
      {featuredSermon && (
        <Section spacing="lg" className="bg-surface">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-headline-md text-foreground">Featured Sermon</h2>
            <Link href="/sermons" className="text-body-sm font-medium text-accent hover:text-accent-hover">
              Browse all sermons →
            </Link>
          </div>
          <Card variant="raised" padding="none" className="overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-video bg-zinc-900 md:aspect-auto">
                {featuredSermon.imageUrl ? (
                  <Image src={featuredSermon.imageUrl} alt={featuredSermon.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <BookOpen className="h-12 w-12 text-white/30" />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center p-8">
                {featuredSermon.seriesTitle && <Badge variant="accent" className="mb-3 w-fit">{featuredSermon.seriesTitle}</Badge>}
                <h3 className="text-headline-sm text-foreground">{featuredSermon.title}</h3>
                <p className="mt-2 text-body-sm text-foreground-muted">
                  {featuredSermon.speakerName}
                  {featuredSermon.scripture ? ` · ${featuredSermon.scripture}` : ''}
                </p>
                {featuredSermon.description && (
                  <p className="mt-4 line-clamp-3 text-body-sm text-foreground-muted">{featuredSermon.description}</p>
                )}
                <LinkButton href={`/sermons/${featuredSermon.id}`} className="mt-6 w-fit" leftIcon={<Play className="h-4 w-4" />}>
                  Watch now
                </LinkButton>
              </div>
            </div>
          </Card>
        </Section>
      )}

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <Section spacing="lg">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-headline-md text-foreground">Upcoming Events</h2>
            <Link href="/events" className="text-body-sm font-medium text-accent hover:text-accent-hover">
              View all events →
            </Link>
          </div>
          <Grid cols={3} gap={6}>
            {upcomingEvents.map((event, index) => (
              <motion.div key={event.id} {...fadeUp(index * 0.05)}>
                <Link href={`/events/${event.id}`} className="block h-full">
                  <Card variant="interactive" padding="none" className="h-full overflow-hidden">
                    <div className="relative aspect-[16/10] bg-surface-active">
                      {event.imageUrl ? (
                        <Image src={event.imageUrl} alt={event.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Calendar className="h-8 w-8 text-foreground-subtle" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <Badge variant="neutral" className="mb-3">{event.category}</Badge>
                      <h3 className="text-title-md text-foreground">{event.title}</h3>
                      <p className="mt-2 flex items-center gap-1.5 text-body-sm text-foreground-muted">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-body-sm text-foreground-muted">
                        <MapPin className="h-3.5 w-3.5" /> {event.location}
                      </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </Grid>
        </Section>
      )}

      {/* Church overview stats */}
      <Section spacing="md" className="bg-accent text-accent-foreground">
        <Grid cols={4} gap={6} className="text-center">
          {[
            { icon: Users, value: siteSettings?.statistics?.members || '500+', label: 'Members' },
            { icon: Heart, value: siteSettings?.statistics?.yearsServing || '25+', label: 'Years Serving' },
            { icon: Church, value: siteSettings?.statistics?.weeklyServices || '3', label: 'Weekly Services' },
            { icon: Users, value: siteSettings?.statistics?.ministries || '15+', label: 'Ministries' },
          ].map((stat, index) => (
            <motion.div key={stat.label} {...fadeUp(index * 0.05)}>
              <stat.icon className="mx-auto mb-3 h-8 w-8 opacity-90" aria-hidden="true" />
              <div className="text-display-sm">{stat.value}</div>
              <div className="mt-1 text-body-sm opacity-80">{stat.label}</div>
            </motion.div>
          ))}
        </Grid>
      </Section>

      {/* Latest blog */}
      {latestPosts.length > 0 && (
        <Section spacing="lg">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-headline-md text-foreground">From the Blog</h2>
            <Link href="/blog" className="text-body-sm font-medium text-accent hover:text-accent-hover">
              Read more →
            </Link>
          </div>
          <Grid cols={3} gap={6}>
            {latestPosts.map((post, index) => (
              <motion.div key={post.id} {...fadeUp(index * 0.05)}>
                <Link href={`/blog/${post.slug}`} className="block h-full">
                  <Card variant="interactive" padding="none" className="h-full overflow-hidden">
                    <div className="relative aspect-[16/10] bg-surface-active">
                      {post.imageUrl ? (
                        <Image src={post.imageUrl} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-8 w-8 text-foreground-subtle" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      {post.category && <Badge variant="neutral" className="mb-3">{post.category}</Badge>}
                      <h3 className="text-title-md text-foreground line-clamp-2">{post.title}</h3>
                      {post.excerpt && <p className="mt-2 line-clamp-2 text-body-sm text-foreground-muted">{post.excerpt}</p>}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </Grid>
        </Section>
      )}

      {/* Gallery preview */}
      {galleryPreview.length > 0 && (
        <Section spacing="lg" className="bg-surface">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-headline-md text-foreground">Gallery</h2>
            <Link href="/gallery" className="text-body-sm font-medium text-accent hover:text-accent-hover">
              View gallery →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {galleryPreview.map((photo, index) => (
              <motion.div key={photo.id} {...fadeUp(index * 0.03)} className="relative aspect-square overflow-hidden rounded-lg bg-surface-active">
                <Image src={photo.imageUrl} alt={photo.title || 'Gallery photo'} fill sizes="200px" className="object-cover transition-transform duration-slow hover:scale-105" />
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {/* Prayer CTA */}
      <Section spacing="md" className="bg-warm text-warm-foreground">
        <div className="mx-auto max-w-2xl text-center">
          <Sparkles className="mx-auto mb-4 h-8 w-8 opacity-90" aria-hidden="true" />
          <h2 className="text-headline-md">Need Prayer?</h2>
          <p className="mt-3 text-body-md opacity-90">
            Our community would be honored to pray with and for you. Share your request — as public or private as you'd like.
          </p>
          <LinkButton href="/prayer" variant="secondary" size="lg" className="mt-6">
            Submit a Prayer Request
          </LinkButton>
        </div>
      </Section>

      {/* Find us + newsletter */}
      <Section spacing="lg">
        <Grid cols={2} gap={12}>
          <div>
            <h2 className="mb-6 text-headline-md text-foreground">{siteSettings?.churchName || 'Salem Primitive Baptist Church'}</h2>
            <div className="space-y-3 text-body-md text-foreground-muted">
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                {siteSettings?.address || '223/838, Near north post office, Kannangurichi main road, Chinnathirupathi, Salem TN, PIN- 636008'}
              </p>
              <p className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-accent" /> {siteSettings?.phoneNumber || '+91 94871 62485'}
              </p>
              <p className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-accent" /> {siteSettings?.email || 'contact@salempbc.in'}
              </p>
            </div>

            <div className="mt-8 rounded-xl border border-border bg-surface p-6">
              <h3 className="mb-1 text-title-sm text-foreground">Stay in the loop</h3>
              <p className="mb-4 text-body-sm text-foreground-muted">Announcements and updates, straight to your inbox.</p>
              <NewsletterSignupLight />
            </div>
          </div>

          <div className="h-80 overflow-hidden rounded-xl border border-border lg:h-full">
            <iframe
              title="Church location map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d289.6717292106369!2d78.16560039927737!3d11.678130577350974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3babf16da41b56e5%3A0x30049390bc14cac1!2sSALEM%20PRIMITIVE%20BAPTIST%20CHURCH!5e1!3m2!1sen!2sin!4v1760932034062!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Grid>
      </Section>
    </div>
  );
}

// NewsletterSignup is styled for the dark footer; this page needs it on a
// light card, so swap just the input/button tones rather than fork the form logic.
function NewsletterSignupLight() {
  return (
    <div className="[&_input]:border-border [&_input]:bg-background [&_input]:text-foreground [&_input]:placeholder-foreground-subtle [&_button]:bg-accent [&_button]:text-accent-foreground [&_button:hover]:bg-accent-hover">
      <NewsletterSignup />
    </div>
  );
}
