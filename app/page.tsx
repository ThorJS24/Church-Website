'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  Heart, Mail, Calendar, MapPin, Phone, Clock, ArrowRight, Play,
  Church, BookOpen, Sparkles, ImageIcon,
} from 'lucide-react';
import {
  getAnnouncements, getSiteSettings, getServiceTimes, getSermons, getEvents,
  getBlogPosts, getEventGalleries, getLivestream, getTestimonials,
  Announcement, SiteSettings, ServiceTime, Sermon, EventItem, BlogPost, GalleryPhoto, Livestream, Testimonial,
} from '@/lib/content';
import { useAuth } from '@/contexts/AuthContext';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Grid } from '@/components/ui/grid';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button, LinkButton } from '@/components/ui/button';
import DynamicLiveStream from '@/components/DynamicLiveStream';
import BibleVerse from '@/components/BibleVerse';
import NewsletterSignup from '@/components/NewsletterSignup';
import WelcomeBackBanner from '@/components/home/WelcomeBackBanner';
import WeekAtAGlance from '@/components/home/WeekAtAGlance';
import EventCountdown from '@/components/home/EventCountdown';
import SermonCarousel from '@/components/home/SermonCarousel';
import SocialProofStrip from '@/components/home/SocialProofStrip';
import StatBar from '@/components/StatBar';

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

export default function Home() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [services, setServices] = useState<ServiceTime[]>([]);
  const [recentSermons, setRecentSermons] = useState<Sermon[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [galleryPreview, setGalleryPreview] = useState<GalleryPhoto[]>([]);
  const [livestream, setLivestream] = useState<Livestream | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          announcementsData, siteSettingsData, servicesData, sermonsData,
          eventsData, blogData, galleriesData, livestreamData, testimonialsData,
        ] = await Promise.all([
          getAnnouncements(3),
          getSiteSettings(),
          getServiceTimes(),
          getSermons(10),
          getEvents(),
          getBlogPosts(3),
          getEventGalleries(),
          getLivestream(),
          getTestimonials(),
        ]);

        setAnnouncements(announcementsData);
        setSiteSettings(siteSettingsData);
        setServices(servicesData);
        setRecentSermons(sermonsData.slice(0, 6));
        setUpcomingEvents(
          eventsData
            .filter((e) => new Date(e.startDate).getTime() >= Date.now())
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(0, 3)
        );
        setLatestPosts(blogData);
        setGalleryPreview(galleriesData.flatMap((g) => g.photos).slice(0, 6));
        setLivestream(livestreamData);
        setTestimonials(
          [...testimonialsData].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 3)
        );
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const nextService = services[0];
  const isLive = !!livestream?.isLive;
  const weekEvents = upcomingEvents.filter((e) => new Date(e.startDate).getTime() - Date.now() < 7 * 86_400_000);
  const nextMajorEvent = upcomingEvents.find((e) => e.featured) ?? upcomingEvents[0] ?? null;

  return (
    <div>
      <WelcomeBackBanner />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#17130F] py-24 text-white sm:py-32">
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#17130F]/60 via-[#17130F]/75 to-[#17130F]" />

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
            className="mx-auto max-w-3xl font-serif text-display-sm text-white sm:text-display-md"
          >
            {siteSettings?.churchName || 'Salem Primitive Baptist Church'}
          </motion.h1>
          <motion.p
            {...fadeUpImmediate(0.1)}
            className="mx-auto mt-5 max-w-xl font-serif text-body-lg italic text-white/70"
          >
            {siteSettings?.tagline || 'A place where faith meets community, and hope comes alive.'}
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

      {/* Today's verse + next service */}
      <Section spacing="lg">
        <Grid cols={2} gap={8}>
          <BibleVerse />
          <Card variant="raised" padding="lg" className="flex flex-col justify-center">
            <Badge variant="accent" className="mb-4 w-fit">Next Service</Badge>
            {nextService ? (
              <>
                <h3 className="font-serif text-headline-sm text-foreground">{nextService.title}</h3>
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

      {/* This week at a glance */}
      <Section spacing="md">
        <h2 className="mb-6 font-serif text-headline-sm text-foreground">This Week at a Glance</h2>
        <WeekAtAGlance nextService={nextService ?? null} weekEvents={weekEvents} latestAnnouncement={announcements[0] ?? null} />
      </Section>

      {/* Announcements */}
      {isLoading ? (
        <Section spacing="md" className="bg-surface" id="announcements">
          <h2 className="mb-8 text-center font-serif text-headline-md text-foreground">Latest Announcements</h2>
          <div className="mx-auto max-w-3xl space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-background p-6">
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : announcements.length > 0 && (
        <Section spacing="md" className="bg-surface" id="announcements">
          <h2 className="mb-8 text-center font-serif text-headline-md text-foreground">Latest Announcements</h2>
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
        <h2 className="mb-10 text-center font-serif text-headline-md text-foreground">Connect With Us</h2>
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

      {/* Recent sermons */}
      {recentSermons.length > 0 && (
        <Section spacing="lg" className="bg-surface">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-serif text-headline-md text-foreground">Recent Sermons</h2>
            <Link href="/sermons" className="text-body-sm font-medium text-accent hover:text-accent-hover">
              Browse all sermons →
            </Link>
          </div>
          <SermonCarousel sermons={recentSermons} />
        </Section>
      )}

      <EventCountdown event={nextMajorEvent} />

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <Section spacing="lg">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-serif text-headline-md text-foreground">Upcoming Events</h2>
            <Link href="/events" className="text-body-sm font-medium text-accent hover:text-accent-hover">
              View all events →
            </Link>
          </div>
          <Grid cols={3} gap={6}>
            {upcomingEvents.map((event, index) => (
              <motion.div key={event.id} {...fadeUp(index * 0.05)}>
                <Link href={`/events/${event.id}`} className="block h-full">
                  <Card variant="interactive" padding="none" className="h-full overflow-hidden">
                    <div className="relative aspect-16/10 bg-surface-active">
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
      <StatBar statistics={siteSettings?.statistics} />

      {/* Social proof */}
      {testimonials.length > 0 && (
        <Section spacing="lg">
          <h2 className="mb-8 text-center font-serif text-headline-md text-foreground">What Our Church Family Says</h2>
          <SocialProofStrip testimonials={testimonials} />
        </Section>
      )}

      {/* Latest blog */}
      {latestPosts.length > 0 && (
        <Section spacing="lg">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-serif text-headline-md text-foreground">From the Blog</h2>
            <Link href="/blog" className="text-body-sm font-medium text-accent hover:text-accent-hover">
              Read more →
            </Link>
          </div>
          <Grid cols={3} gap={6}>
            {latestPosts.map((post, index) => (
              <motion.div key={post.id} {...fadeUp(index * 0.05)}>
                <Link href={`/blog/${post.slug}`} className="block h-full">
                  <Card variant="interactive" padding="none" className="h-full overflow-hidden">
                    <div className="relative aspect-16/10 bg-surface-active">
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
            <h2 className="font-serif text-headline-md text-foreground">Gallery</h2>
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
          <h2 className="font-serif text-headline-md">Need Prayer?</h2>
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
            <h2 className="mb-6 font-serif text-headline-md text-foreground">{siteSettings?.churchName || 'Salem Primitive Baptist Church'}</h2>
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
