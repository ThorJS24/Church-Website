import Link from 'next/link';
import Image from 'next/image';
import {
  Heart, Mail, MapPin, Phone, Clock, ArrowUpRight, Play, BookOpen, Calendar, Quote,
} from 'lucide-react';
import {
  getAnnouncements, getSiteSettings, getServiceTimes, getSermons, getEvents,
  getBlogPosts, getEventGalleries, getTestimonials,
} from '@/lib/content';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';
import BibleVerse from '@/components/BibleVerse';
import NewsletterSignup from '@/components/NewsletterSignup';
import WelcomeBackBanner from '@/components/home/WelcomeBackBanner';
import { Trans } from '@/components/i18n/Trans';

export const revalidate = 300;

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

  const churchName = siteSettings?.churchName || 'Salem Primitive Baptist Church';
  const tagline = siteSettings?.tagline || 'A place where faith meets community, and hope comes alive.';

  const recentSermons = sermonsData.slice(0, 5);
  const upcomingEvents = eventsData
    .filter((e) => new Date(e.startDate).getTime() >= Date.now())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 4);
  const galleryPreview = galleriesData.flatMap((g) => g.photos).slice(0, 6);
  const testimonials = [...testimonialsData].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 2);

  const nextService = services[0];
  const nextMajorEvent = upcomingEvents.find((e) => e.featured) ?? upcomingEvents[0] ?? null;
  const latestAnnouncement = announcements[0];
  const stats = [
    { value: siteSettings?.statistics?.members || '500+', label: 'Members' },
    { value: siteSettings?.statistics?.yearsServing || '25+', label: 'Years serving' },
    { value: siteSettings?.statistics?.weeklyServices || '3', label: 'Weekly services' },
    { value: siteSettings?.statistics?.ministries || '15+', label: 'Ministries' },
  ];

  return (
    <div>
      <WelcomeBackBanner />

      {/* ── 01 Masthead: identity + statement. A structured strip, not a
          decorative hero — eyebrow, display name, tagline as the reading
          serif (the one deliberate serif moment on the page), and service
          times rendered as tabular data rather than prose. ── */}
      <div className="border-b border-border bg-background">
        <Container size="xl" className="grid gap-8 py-10 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:py-14">
          <div>
            <p className="font-mono text-caption font-semibold uppercase tracking-[0.14em] text-accent">
              Salem, Tamil Nadu &middot; {siteSettings?.statistics?.yearsServing || '25+'} years serving
            </p>
            <h1 className="mt-3 font-display text-display-md text-foreground sm:text-display-lg">{churchName}</h1>
            <p className="mt-4 max-w-xl font-serif text-body-lg italic text-foreground-muted">{tagline}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <LinkButton href="/services" size="lg"><Trans k="home.joinSundayCta" /></LinkButton>
              <LinkButton href="/give" variant="outline" size="lg">Give</LinkButton>
            </div>
          </div>

          {nextService && (
            <div className="border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
              <p className="font-mono text-caption font-semibold uppercase tracking-[0.1em] text-foreground-subtle">Next Service</p>
              <p className="mt-2 text-title-lg text-foreground">{nextService.title}</p>
              <div className="mt-3 space-y-1.5 text-body-sm text-foreground-muted">
                <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-foreground-subtle" /> {nextService.time}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-foreground-subtle" /> {nextService.location}</p>
              </div>
            </div>
          )}
        </Container>
      </div>

      {/* ── 02 Current church life: documentary photography with structured
          caption below rather than gradient-overlaid text — the image is
          content, the caption is data, they don't fight for the same
          space. ── */}
      <Section spacing="none" bleed className="border-b border-border">
        <div className="relative aspect-[21/9] w-full bg-surface-active sm:aspect-[3/1]">
          <Image src="/images/hero-bg.jpg" alt="" fill sizes="100vw" className="object-cover" priority />
        </div>
        <Container size="xl" className="grid gap-6 py-8 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="font-mono text-caption font-semibold uppercase tracking-[0.1em] text-accent">
              {nextMajorEvent ? 'Featured event' : 'This week'}
            </p>
            <h2 className="mt-1.5 font-display text-headline-sm text-foreground">
              {nextMajorEvent ? nextMajorEvent.title : (nextService?.title || churchName)}
            </h2>
            <p className="mt-2 max-w-xl text-body-sm text-foreground-muted">
              {nextMajorEvent ? nextMajorEvent.description : nextService?.description || 'Join us this week — everyone is welcome.'}
            </p>
          </div>
          <div className="flex items-center gap-6 sm:justify-end">
            {nextMajorEvent ? (
              <div className="font-mono text-caption text-foreground-subtle">
                <p className="text-title-sm text-foreground">{new Date(nextMajorEvent.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</p>
                {nextMajorEvent.location && <p>{nextMajorEvent.location}</p>}
              </div>
            ) : null}
            <LinkButton href={nextMajorEvent ? `/events/${nextMajorEvent.id}` : '/services'} variant="outline">
              Details <ArrowUpRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </Container>
      </Section>

      {/* ── 03 Sermons + prayer + verse rail: an information-dense strip —
          three distinct modules laid on one grid, each a list/data pattern
          rather than a "card". ── */}
      <Section spacing="lg" className="bg-surface">
        <div className="grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-3">
          {/* Sermons — numbered list, archive register */}
          <div className="bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 font-mono text-caption font-semibold uppercase tracking-[0.08em] text-foreground-subtle"><BookOpen className="h-3.5 w-3.5 text-accent" /> Sermons</span>
              <Link href="/sermons" className="text-caption font-medium text-accent hover:text-accent-hover">All →</Link>
            </div>
            <div className="space-y-0.5">
              {recentSermons.slice(0, 4).map((s, i) => (
                <Link key={s.id} href={`/sermons/${s.id}`} className="group flex items-baseline gap-3 py-2 hover:bg-surface-hover">
                  <span className="font-mono text-caption text-foreground-subtle">{String(i + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1">
                    <p className="truncate text-body-sm font-medium text-foreground group-hover:text-accent">{s.title}</p>
                    <p className="truncate text-caption text-foreground-subtle">{s.speakerName}</p>
                  </span>
                  <Play className="h-3.5 w-3.5 shrink-0 text-foreground-subtle" />
                </Link>
              ))}
            </div>
          </div>

          {/* Events — dense date-led list */}
          <div className="bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 font-mono text-caption font-semibold uppercase tracking-[0.08em] text-foreground-subtle"><Calendar className="h-3.5 w-3.5 text-accent" /> Events</span>
              <Link href="/events" className="text-caption font-medium text-accent hover:text-accent-hover">All →</Link>
            </div>
            <div className="space-y-0.5">
              {upcomingEvents.slice(0, 4).map((e) => (
                <Link key={e.id} href={`/events/${e.id}`} className="flex items-baseline gap-3 py-2 hover:bg-surface-hover">
                  <span className="font-mono text-caption font-semibold text-accent">
                    {new Date(e.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="truncate text-body-sm font-medium text-foreground">{e.title}</span>
                </Link>
              ))}
              {upcomingEvents.length === 0 && <p className="py-2 text-body-sm text-foreground-muted">No upcoming events posted yet.</p>}
            </div>
          </div>

          {/* Verse + prayer — the one deliberate documentary-warmth module
              on the page, using the --accent-warm token, not the default
              UI color. */}
          <div className="flex flex-col divide-y divide-border bg-background">
            <div className="p-6"><BibleVerse /></div>
            <div className="bg-warm p-6 text-warm-foreground">
              <Heart className="h-5 w-5 opacity-90" />
              <h3 className="mt-2 text-title-sm"><Trans k="home.needPrayerHeading" /></h3>
              <p className="mt-1 text-body-sm opacity-90"><Trans k="home.needPrayerBody" /></p>
              <Link href="/prayer" className="mt-3 inline-flex items-center gap-1 text-body-sm font-medium underline">
                <Trans k="home.submitPrayerRequest" /> <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {latestAnnouncement && (
          <div className="mt-px flex items-start gap-3 border border-t-0 border-border bg-accent-subtle p-5">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-caption font-semibold uppercase tracking-wide text-accent">Announcement — {latestAnnouncement.title}</p>
              <p className="mt-1 line-clamp-2 text-body-sm text-foreground">{latestAnnouncement.content}</p>
            </div>
          </div>
        )}
      </Section>

      {/* ── 04 Gallery: real photography, full-bleed, hard edges — the
          documentary layer given room to breathe on its own, not squeezed
          into a bento grid alongside data. ── */}
      {galleryPreview.length > 0 && (
        <Section spacing="none" bleed>
          <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-6">
            {galleryPreview.map((photo) => (
              <Link key={photo.id} href="/gallery" className="group relative aspect-square overflow-hidden bg-surface-active">
                <Image src={photo.imageUrl} alt={photo.title || 'Gallery photo'} fill sizes="220px" className="object-cover transition-transform duration-slow group-hover:scale-105" />
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* ── 05 From the community: blog + testimonials as one editorial
          rail. Testimonials are the second deliberate reading-serif
          moment — a real pull-quote, not decoration. ── */}
      {(latestPosts.length > 0 || testimonials.length > 0) && (
        <Section spacing="lg" className="border-b border-border">
          <h2 className="mb-6 font-display text-headline-md text-foreground">From the community</h2>
          <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {latestPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group bg-background p-6 hover:bg-surface-hover">
                <p className="font-mono text-caption font-semibold uppercase tracking-wide text-foreground-subtle">Blog</p>
                <h3 className="mt-2 text-title-md text-foreground group-hover:text-accent">{post.title}</h3>
                <p className="mt-2 line-clamp-3 text-body-sm text-foreground-muted">{post.excerpt}</p>
              </Link>
            ))}
            {testimonials.map((tItem) => (
              <div key={tItem.id} className="bg-accent-subtle p-6">
                <Quote className="h-5 w-5 text-accent" />
                <p className="mt-3 line-clamp-4 font-serif text-body-md italic text-foreground">&ldquo;{tItem.content}&rdquo;</p>
                <p className="mt-3 font-mono text-caption font-medium text-foreground-subtle">— {tItem.authorName}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── 06 Grounding: stats as tabular data, contact, map, and
          newsletter — the closing "clear next action" band. ── */}
      <Section spacing="lg" className="bg-[#14161A] text-white">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <div className="grid grid-cols-4 gap-4 border-b border-white/15 pb-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-display-sm">{stat.value}</div>
                  <div className="mt-1 font-mono text-caption uppercase tracking-wide opacity-70">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-3 text-body-md">
              <p className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 opacity-70" />{siteSettings?.address || '223/838, Near north post office, Kannangurichi main road, Chinnathirupathi, Salem TN, PIN- 636008'}</p>
              <p className="flex items-center gap-3"><Phone className="h-5 w-5 shrink-0 opacity-70" /> {siteSettings?.phoneNumber || '+91 94871 62485'}</p>
              <p className="flex items-center gap-3"><Mail className="h-5 w-5 shrink-0 opacity-70" /> {siteSettings?.email || 'contact@salempbc.in'}</p>
            </div>
            <div className="mt-6 border border-white/15 p-5">
              <h3 className="mb-1 text-title-sm"><Trans k="home.stayInLoop" /></h3>
              <p className="mb-4 text-body-sm opacity-80"><Trans k="home.newsletterBlurb" /></p>
              <NewsletterSignup />
            </div>
          </div>
          <div className="h-72 overflow-hidden border border-white/15 lg:h-full">
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
        </div>
      </Section>
    </div>
  );
}
