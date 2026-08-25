import Link from 'next/link';
import Image from 'next/image';
import {
  Heart, Mail, MapPin, Phone, Clock, ArrowUpRight, Sparkles, Play, BookOpen, Calendar, Quote,
} from 'lucide-react';
import {
  getAnnouncements, getSiteSettings, getServiceTimes, getSermons, getEvents,
  getBlogPosts, getEventGalleries, getTestimonials,
} from '@/lib/content';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  const galleryPreview = galleriesData.flatMap((g) => g.photos).slice(0, 4);
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

      {/* ── Identity strip: compact, not a full-bleed hero. Name/tagline sit
          inline with the two primary actions rather than centered over a
          tall decorative field the visitor has to scroll past. ── */}
      <div className="border-b border-border bg-surface">
        <Container size="xl" className="flex flex-col gap-6 py-8 sm:flex-row sm:items-end sm:justify-between sm:py-10">
          <div>
            <p className="font-serif text-body-lg italic text-foreground-muted">{tagline}</p>
            <h1 className="mt-1 font-serif text-headline-lg text-foreground sm:text-display-sm">{churchName}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <LinkButton href="/services" size="lg"><Trans k="home.joinSundayCta" /></LinkButton>
            <LinkButton href="/give" variant="outline" size="lg">Give</LinkButton>
          </div>
        </Container>
      </div>

      {/* ── Spotlight: asymmetric 2:1 split — one large "what's next" feature
          paired with a dense information rail, instead of two matched cards
          in a symmetric grid. ── */}
      <Section spacing="lg">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card variant="raised" padding="none" className="relative overflow-hidden lg:col-span-2">
            <div className="relative h-56 w-full sm:h-72">
              <Image src="/images/hero-bg.jpg" alt="" fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 text-white sm:p-8">
                <Badge variant="accent" className="w-fit">
                  {nextMajorEvent ? 'Featured event' : 'Next service'}
                </Badge>
                <h2 className="font-serif text-headline-md sm:text-headline-lg">
                  {nextMajorEvent ? nextMajorEvent.title : (nextService?.title || churchName)}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-body-sm opacity-90">
                  {nextMajorEvent ? (
                    <>
                      <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(nextMajorEvent.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                      {nextMajorEvent.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {nextMajorEvent.location}</span>}
                    </>
                  ) : nextService ? (
                    <>
                      <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {nextService.time}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {nextService.location}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-5 sm:p-6">
              <p className="max-w-md text-body-sm text-foreground-muted">
                {nextMajorEvent ? nextMajorEvent.description : nextService?.description || 'Join us this week — everyone is welcome.'}
              </p>
              <LinkButton href={nextMajorEvent ? `/events/${nextMajorEvent.id}` : '/services'} variant="outline" className="shrink-0">
                Details <ArrowUpRight className="h-4 w-4" />
              </LinkButton>
            </div>
          </Card>

          {/* Dense rail: verse + announcement + live, stacked tight rather
              than each in its own full-width Section. */}
          <div className="flex flex-col gap-4">
            <BibleVerse />
            {latestAnnouncement && (
              <Card padding="md" className="flex items-start gap-3">
                <div className="rounded-full bg-accent-subtle p-2"><Mail className="h-4 w-4 text-accent" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-caption font-medium uppercase tracking-wide text-foreground-subtle">Announcement</p>
                  <h3 className="mt-0.5 text-title-sm text-foreground">{latestAnnouncement.title}</h3>
                  <p className="mt-1 line-clamp-2 text-body-sm text-foreground-muted">{latestAnnouncement.content}</p>
                </div>
              </Card>
            )}
            <Card padding="md" className="flex items-start gap-3 bg-warm text-warm-foreground">
              <Sparkles className="h-5 w-5 shrink-0 opacity-90" />
              <div className="min-w-0 flex-1">
                <h3 className="text-title-sm"><Trans k="home.needPrayerHeading" /></h3>
                <p className="mt-1 text-body-sm opacity-90"><Trans k="home.needPrayerBody" /></p>
                <Link href="/prayer" className="mt-2 inline-flex items-center gap-1 text-body-sm font-medium underline">
                  <Trans k="home.submitPrayerRequest" /> <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* ── Bento: sermons, events, and gallery interleaved in one grid
          instead of three separate stacked full-width sections. ── */}
      <Section spacing="lg" className="bg-surface">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-serif text-headline-md text-foreground">Life at {churchName.split(' ')[0]}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(0,1fr)]">
          {/* Sermons — wide feature */}
          {recentSermons.length > 0 && (
            <div className="sm:col-span-2 lg:col-span-2 lg:row-span-2">
              <Card padding="lg" className="flex h-full flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-title-sm text-foreground"><BookOpen className="h-4 w-4 text-accent" /> Sermons</span>
                  <Link href="/sermons" className="text-body-sm font-medium text-accent hover:text-accent-hover">All <Trans k="events.viewAll" /> →</Link>
                </div>
                <div className="flex-1 space-y-1">
                  {recentSermons.slice(0, 4).map((s) => (
                    <Link key={s.id} href={`/sermons/${s.id}`} className="flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-surface-hover">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-subtle"><Play className="h-3.5 w-3.5 text-accent" /></div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body-sm font-medium text-foreground">{s.title}</p>
                        <p className="truncate text-caption text-foreground-subtle">{s.speakerName}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Events — narrow list */}
          {upcomingEvents.length > 0 && (
            <div className="lg:row-span-2">
              <Card padding="lg" className="flex h-full flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-title-sm text-foreground"><Calendar className="h-4 w-4 text-accent" /> Events</span>
                  <Link href="/events" className="text-body-sm font-medium text-accent hover:text-accent-hover">→</Link>
                </div>
                <div className="flex-1 space-y-3">
                  {upcomingEvents.slice(0, 3).map((e) => (
                    <Link key={e.id} href={`/events/${e.id}`} className="block rounded-md px-2 py-2 hover:bg-surface-hover">
                      <p className="text-caption font-medium uppercase tracking-wide text-accent">
                        {new Date(e.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="truncate text-body-sm font-medium text-foreground">{e.title}</p>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Gallery photos fill the remaining bento cells */}
          {galleryPreview.map((photo) => (
            <Link key={photo.id} href="/gallery" className="relative aspect-square overflow-hidden rounded-xl bg-surface-active">
              <Image src={photo.imageUrl} alt={photo.title || 'Gallery photo'} fill sizes="220px" className="object-cover transition-transform duration-slow hover:scale-105" />
            </Link>
          ))}
        </div>
      </Section>

      {/* ── Editorial strip: blog + testimonials interleaved in one
          horizontal-scroll rail instead of two stacked full-width
          sections. ── */}
      {(latestPosts.length > 0 || testimonials.length > 0) && (
        <Section spacing="lg">
          <h2 className="mb-6 font-serif text-headline-md text-foreground">From the community</h2>
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {latestPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="w-72 shrink-0 snap-start">
                <Card padding="lg" variant="interactive" className="h-full">
                  <Badge variant="neutral" className="mb-3 w-fit">Blog</Badge>
                  <h3 className="text-title-md text-foreground">{post.title}</h3>
                  <p className="mt-2 line-clamp-3 text-body-sm text-foreground-muted">{post.excerpt}</p>
                </Card>
              </Link>
            ))}
            {testimonials.map((tItem) => (
              <div key={tItem.id} className="w-72 shrink-0 snap-start">
                <Card padding="lg" className="h-full bg-accent-subtle">
                  <Quote className="h-6 w-6 text-accent" />
                  <p className="mt-3 line-clamp-4 font-serif text-body-md italic text-foreground">&ldquo;{tItem.content}&rdquo;</p>
                  <p className="mt-3 text-caption font-medium text-foreground-subtle">— {tItem.authorName}</p>
                </Card>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Grounding band: stats, contact, map and newsletter combined
          into one dense section instead of an isolated stat banner
          followed by a separate two-column contact section. ── */}
      <Section spacing="lg" className="bg-warm text-warm-foreground">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <div className="grid grid-cols-4 gap-4 border-b border-white/15 pb-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-display-sm">{stat.value}</div>
                  <div className="mt-1 text-caption opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-3 text-body-md">
              <p className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 opacity-80" />{siteSettings?.address || '223/838, Near north post office, Kannangurichi main road, Chinnathirupathi, Salem TN, PIN- 636008'}</p>
              <p className="flex items-center gap-3"><Phone className="h-5 w-5 shrink-0 opacity-80" /> {siteSettings?.phoneNumber || '+91 94871 62485'}</p>
              <p className="flex items-center gap-3"><Mail className="h-5 w-5 shrink-0 opacity-80" /> {siteSettings?.email || 'contact@salempbc.in'}</p>
            </div>
            <div className="mt-6 rounded-xl bg-white/10 p-5">
              <h3 className="mb-1 text-title-sm"><Trans k="home.stayInLoop" /></h3>
              <p className="mb-4 text-body-sm opacity-85"><Trans k="home.newsletterBlurb" /></p>
              <NewsletterSignup />
            </div>
          </div>
          <div className="h-72 overflow-hidden rounded-xl lg:h-full">
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
