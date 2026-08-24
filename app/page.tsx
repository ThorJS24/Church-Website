import Link from 'next/link';
import Image from 'next/image';
import {
  Heart, Mail, MapPin, Phone, Clock, ArrowRight, Church, Sparkles,
} from 'lucide-react';
import {
  getAnnouncements, getSiteSettings, getServiceTimes, getSermons, getEvents,
  getBlogPosts, getEventGalleries, getTestimonials,
} from '@/lib/content';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Grid } from '@/components/ui/grid';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import BibleVerse from '@/components/BibleVerse';
import NewsletterSignup from '@/components/NewsletterSignup';
import WelcomeBackBanner from '@/components/home/WelcomeBackBanner';
import WeekAtAGlance from '@/components/home/WeekAtAGlance';
import EventCountdown from '@/components/home/EventCountdown';
import SermonCarousel from '@/components/home/SermonCarousel';
import SocialProofStrip from '@/components/home/SocialProofStrip';
import UpcomingEventsStrip from '@/components/home/UpcomingEventsStrip';
import BlogHighlights from '@/components/home/BlogHighlights';
import StatBar from '@/components/StatBar';
import { HeroSection } from '@/components/home/HeroSection';

export const revalidate = 300;

const quickActions = [
  { href: '/services', icon: Church, title: 'Join Us Sunday', description: 'Worship with us every Sunday at 9:30 AM' },
  { href: '/give', icon: Heart, title: 'Give', description: 'See how to support our mission' },
  { href: '/prayer', icon: Sparkles, title: 'Prayer Request', description: 'Share your prayer needs with our community' },
  { href: '/contact', icon: Mail, title: 'Get In Touch', description: 'Contact us with questions or to learn more' },
];

export default async function Home() {
  const [
    announcements, siteSettings, services, sermonsData,
    eventsData, latestPosts, galleriesData, testimonialsData,
  ] = await Promise.all([
    getAnnouncements(3),
    getSiteSettings(),
    getServiceTimes(),
    getSermons(10),
    getEvents(),
    getBlogPosts(3),
    getEventGalleries(),
    getTestimonials(),
  ]);

  const recentSermons = sermonsData.slice(0, 6);
  const upcomingEvents = eventsData
    .filter((e) => new Date(e.startDate).getTime() >= Date.now())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);
  const galleryPreview = galleriesData.flatMap((g) => g.photos).slice(0, 6);
  const testimonials = [...testimonialsData].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 3);

  const nextService = services[0];
  const weekEvents = upcomingEvents.filter((e) => new Date(e.startDate).getTime() - Date.now() < 7 * 86_400_000);
  const nextMajorEvent = upcomingEvents.find((e) => e.featured) ?? upcomingEvents[0] ?? null;

  return (
    <div>
      <WelcomeBackBanner />

      <HeroSection
        churchName={siteSettings?.churchName || 'Salem Primitive Baptist Church'}
        tagline={siteSettings?.tagline || 'A place where faith meets community, and hope comes alive.'}
      />

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
      {announcements.length > 0 && (
        <Section spacing="md" className="bg-surface" id="announcements">
          <h2 className="mb-8 text-center font-serif text-headline-md text-foreground">Latest Announcements</h2>
          <div className="mx-auto max-w-3xl space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="flex items-start gap-4">
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
            ))}
          </div>
        </Section>
      )}

      {/* Quick actions */}
      <Section spacing="lg">
        <h2 className="mb-10 text-center font-serif text-headline-md text-foreground">Connect With Us</h2>
        <Grid cols={4} gap={6}>
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href} className="block h-full">
              <Card variant="interactive" padding="lg" className="h-full text-center">
                <action.icon className="mx-auto mb-4 h-9 w-9 text-accent" aria-hidden="true" />
                <h3 className="text-title-md text-foreground">{action.title}</h3>
                <p className="mt-2 text-body-sm text-foreground-muted">{action.description}</p>
                <ArrowRight className="mx-auto mt-4 h-4 w-4 text-accent" aria-hidden="true" />
              </Card>
            </Link>
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
          <UpcomingEventsStrip events={upcomingEvents} />
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
          <BlogHighlights posts={latestPosts} />
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
            {galleryPreview.map((photo) => (
              <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg bg-surface-active">
                <Image src={photo.imageUrl} alt={photo.title || 'Gallery photo'} fill sizes="200px" className="object-cover transition-transform duration-slow hover:scale-105" />
              </div>
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
