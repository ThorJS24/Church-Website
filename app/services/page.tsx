'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, BookOpen, Clock, MapPin, Calendar, Video, Coffee, Baby, Users, Bell, Heart, Radio, Accessibility } from 'lucide-react';
import { getPageContent, getServiceTimes, getSiteSettings, getLivestream } from '@/lib/content';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Section } from '@/components/ui/section';
import { SectionNav } from '@/components/ui/section-nav';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Button, LinkButton } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { LoadingState, EmptyState } from '@/components/ui/states';

const DynamicLiveStream = lazy(() => import('@/components/DynamicLiveStream'));

interface Service {
  id: string;
  title: string;
  time: string;
  location: string;
  description?: string;
  accessibilityInfo?: string;
}

interface ServicesPage {
  title: string;
  subtitle: string;
  whatToExpectSectionTitle: string;
  whatToExpect: Array<{ title: string; description: string }>;
  specialEventsSectionTitle: string;
  specialEvents: Array<{ title: string; date: string; description: string }>;
  onlineServicesTitle: string;
  onlineServicesDescription: string;
  planYourVisitTitle: string;
  planYourVisitDescription: string;
  planYourVisit: Array<{ title: string; description: string }>;
}

const iconMap: { [key: string]: any } = {
  'Sunday Morning Worship': Sun,
  'Sunday Evening Service': Moon,
  'Wednesday Bible Study': BookOpen,
  'Warm Welcome': Coffee,
  'Come as You Are': Sun,
  'Uplifting Music': Video,
  'Practical Messages': BookOpen,
  'Kids Programs': Baby,
  'Fellowship Time': Coffee,
  Address: MapPin,
  Parking: MapPin,
  Accessibility: Users,
  Nursery: Baby,
};

function addServiceToCalendar(service: Service) {
  const now = new Date();
  const [hours, minutes] = service.time.split(':');
  const serviceDate = new Date(now);
  serviceDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  if (serviceDate < now) serviceDate.setDate(serviceDate.getDate() + 7);

  const startDate = serviceDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endDate = new Date(serviceDate.getTime() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(service.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(service.description || '')}&location=${encodeURIComponent(service.location)}&recur=RRULE:FREQ=WEEKLY`;
  window.open(url, '_blank');
}

export default function ServicesPage() {
  const [servicesPage, setServicesPage] = useState<ServicesPage | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [hasLiveStream, setHasLiveStream] = useState(false);
  const { t, language } = useLanguage();
  const tamilFont = language === 'ta' ? 'font-tamil' : '';

  useEffect(() => {
    async function fetchData() {
      try {
        const [servicesPageData, servicesData, settingsData, livestreamData] = await Promise.all([
          getPageContent<ServicesPage>('services'),
          getServiceTimes(),
          getSiteSettings(),
          getLivestream(),
        ]);
        if (servicesPageData) setServicesPage(servicesPageData);
        setServices(servicesData);
        if (settingsData) setSiteSettings(settingsData);
        if (livestreamData) setHasLiveStream(livestreamData.isLive);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingState label={t('services.loading')} />;

  if (!servicesPage) {
    return (
      <EmptyState
        icon={Clock}
        title={t('services.notFoundTitle')}
        description={t('services.notFoundDescription')}
      />
    );
  }

  return (
    <div>
      {/* Bulletin header: this page's job is "when/where is the next
          service", so it leads with that answer directly — a compact
          service-times strip inline with the title — instead of a generic
          icon+title block that makes the visitor scroll to find times. */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[1680px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className={cn('flex items-center gap-2 text-caption font-semibold uppercase tracking-widest text-foreground-subtle', tamilFont)}>
                <Clock className="h-3.5 w-3.5" /> {t('services.eyebrow')}
              </p>
              <h1 className="mt-2 font-serif text-headline-lg text-foreground sm:text-display-sm">{servicesPage.title}</h1>
              <p className={cn('mt-2 max-w-xl text-body-md text-foreground-muted', tamilFont)}>{servicesPage.subtitle}</p>
            </div>
            {hasLiveStream ? (
              <Button variant="danger" leftIcon={<Radio className="h-4 w-4 animate-pulse" />} onClick={() => setShowLiveStream(true)} className={tamilFont}>
                {t('liveStream.watchButton')}
              </Button>
            ) : (
              <Badge variant="neutral" className={tamilFont}><Radio className="h-4 w-4" /> {t('liveStream.noneCurrently')}</Badge>
            )}
          </div>

          {services.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-5">
              {services.map((service) => (
                <a key={service.id} href="#service-times" className="group">
                  <p className="text-title-sm font-medium text-foreground group-hover:text-accent">{service.title}</p>
                  <p className="text-body-sm text-foreground-muted">{service.time} · {service.location}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <SectionNav
        items={[
          ...(services.length > 0 ? [{ id: 'service-times', label: t('services.nav.serviceTimes') }] : []),
          ...(servicesPage.whatToExpect?.length > 0 ? [{ id: 'what-to-expect', label: t('services.nav.whatToExpect') }] : []),
          ...(servicesPage.specialEvents?.length > 0 ? [{ id: 'special-events', label: t('services.nav.specialEvents') }] : []),
          { id: 'online-services', label: t('services.nav.onlineServices') },
          { id: 'plan-your-visit', label: t('services.nav.planYourVisit') },
        ]}
      />

      {services.length > 0 && (
        <Section id="service-times" spacing="lg">
          <Grid cols={3} gap={6}>
            {services.map((service, index) => {
              const Icon = iconMap[service.title] || BookOpen;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <Card variant="raised" padding="lg" className="h-full text-center">
                    <Icon className="mx-auto mb-4 h-10 w-10 text-accent" aria-hidden="true" />
                    <h2 className="text-headline-sm text-foreground">{service.title}</h2>
                    <p className="mt-3 flex items-center justify-center gap-2 text-body-sm text-foreground-muted">
                      <Clock className="h-4 w-4" /> {service.time}
                    </p>
                    <p className="mt-1 flex items-center justify-center gap-2 text-body-sm text-foreground-muted">
                      <MapPin className="h-4 w-4" /> {service.location}
                    </p>
                    {service.description && <p className="mt-4 text-body-sm text-foreground-muted">{service.description}</p>}
                    {service.accessibilityInfo && (
                      <p className="mt-4 flex items-start gap-2 rounded-lg bg-info-subtle p-3 text-left text-caption text-info">
                        <Accessibility className="mt-0.5 h-4 w-4 shrink-0" />
                        {service.accessibilityInfo}
                      </p>
                    )}
                    <Button variant="secondary" className={cn('mt-5', tamilFont)} leftIcon={<Calendar className="h-4 w-4" />} onClick={() => addServiceToCalendar(service)}>
                      {t('services.addToCalendar')}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </Grid>
        </Section>
      )}

      {servicesPage.whatToExpect?.length > 0 && (
        <Section id="what-to-expect" spacing="lg" className="bg-surface">
          <div className="mb-10 text-center">
            <h2 className="text-headline-md text-foreground">{servicesPage.whatToExpectSectionTitle}</h2>
            <p className={cn('mt-2 text-body-md text-foreground-muted', tamilFont)}>{t('services.whatToExpectSubtitle')}</p>
          </div>
          <Grid cols={3} gap={6}>
            {servicesPage.whatToExpect.map((item, index) => {
              const Icon = iconMap[item.title] || Heart;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="text-center"
                >
                  <Icon className="mx-auto mb-4 h-9 w-9 text-accent" aria-hidden="true" />
                  <h3 className="text-title-md text-foreground">{item.title}</h3>
                  <p className="mt-2 text-body-sm text-foreground-muted">{item.description}</p>
                </motion.div>
              );
            })}
          </Grid>
        </Section>
      )}

      {servicesPage.specialEvents?.length > 0 && (
        <Section id="special-events" spacing="lg">
          <div className="mb-10 text-center">
            <h2 className="text-headline-md text-foreground">{servicesPage.specialEventsSectionTitle}</h2>
            <p className={cn('mt-2 text-body-md text-foreground-muted', tamilFont)}>{t('services.specialEventsSubtitle')}</p>
          </div>
          <Grid cols={4} gap={6}>
            {servicesPage.specialEvents.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                <Card className="relative h-full">
                  <Badge variant="accent" className="absolute top-4 right-4">{event.date}</Badge>
                  <h3 className="pr-16 text-title-md text-foreground">{event.title}</h3>
                  <p className="mt-2 text-body-sm text-foreground-muted">{event.description}</p>
                </Card>
              </motion.div>
            ))}
          </Grid>
        </Section>
      )}

      <Section id="online-services" spacing="lg" className="bg-surface">
        <Grid cols={2} gap={12} className="items-center">
          <div>
            <h2 className="text-headline-md text-foreground">{servicesPage.onlineServicesTitle}</h2>
            <p className="mt-4 text-body-md text-foreground-muted">{servicesPage.onlineServicesDescription}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className={tamilFont} leftIcon={<Video className="h-4 w-4" />} onClick={() => siteSettings?.youtubeChannelUrl && window.open(siteSettings.youtubeChannelUrl, '_blank')}>
                {t('services.watchOnYouTube')}
              </Button>
              {siteSettings?.zoomMeetingUrl && (
                <Button variant="secondary" className={tamilFont} leftIcon={<Video className="h-4 w-4" />} onClick={() => window.open(siteSettings.zoomMeetingUrl, '_blank')}>
                  {t('services.joinViaZoom')}
                </Button>
              )}
              <Button
                variant="outline"
                className={tamilFont}
                leftIcon={<Bell className="h-4 w-4" />}
                onClick={() => siteSettings?.youtubeChannelUrl && window.open(`${siteSettings.youtubeChannelUrl}?sub_confirmation=1`, '_blank')}
              >
                {t('services.getNotifications')}
              </Button>
            </div>
          </div>
          <Card variant="raised" padding="lg" className="text-center">
            <Video className="mx-auto mb-4 h-12 w-12 text-accent" aria-hidden="true" />
            <p className={cn('text-title-lg text-foreground', tamilFont)}>{t('services.liveStreamAvailable')}</p>
            <p className={cn('mt-1 text-body-sm text-foreground-muted', tamilFont)}>
              {services.length > 0 ? `${t('services.nextService')} ${services[0]?.time}` : t('services.checkScheduleForTimes')}
            </p>
          </Card>
        </Grid>
      </Section>

      <Section id="plan-your-visit" spacing="lg" className="bg-accent text-accent-foreground">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-headline-md">{servicesPage.planYourVisitTitle}</h2>
          <p className="mt-3 text-body-lg opacity-90">{servicesPage.planYourVisitDescription}</p>
          {servicesPage.planYourVisit?.length > 0 && (
            <Grid cols={4} gap={6} className="mt-10 text-left">
              {servicesPage.planYourVisit.map((item) => {
                const Icon = iconMap[item.title] || MapPin;
                return (
                  <div className="flex items-start gap-3" key={item.title}>
                    <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                    <div>
                      <strong className="block">{item.title}</strong>
                      <span className="text-body-sm opacity-80">{item.description}</span>
                    </div>
                  </div>
                );
              })}
            </Grid>
          )}
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton href="/contact" variant="secondary" size="lg" className={tamilFont}>
              {t('services.contactUs')}
            </LinkButton>
            <Button
              variant="outline"
              size="lg"
              className={cn('border-white/40 bg-transparent text-accent-foreground hover:bg-white/10', tamilFont)}
              leftIcon={<MapPin className="h-4 w-4" />}
              onClick={() => {
                if (siteSettings?.googleMapsUrl) {
                  window.open(siteSettings.googleMapsUrl, '_blank');
                } else {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const { latitude, longitude } = position.coords;
                      const destination = '223/838, Near north post office, Kannangurichi main road, Chinnathirupathi, Salem TN, PIN- 636008';
                      window.open(`https://www.google.com/maps/dir/${latitude},${longitude}/${encodeURIComponent(destination)}`, '_blank');
                    },
                    () => window.open('https://maps.app.goo.gl/Qhr3P8sXxebH6skNA', '_blank')
                  );
                }
              }}
            >
              {t('services.getDirections')}
            </Button>
          </div>
        </div>
      </Section>

      <Modal isOpen={showLiveStream} onClose={() => setShowLiveStream(false)} title={t('home.liveStream')} size="xl">
        <Suspense fallback={<LoadingState label="Loading stream..." />}>
          <DynamicLiveStream />
        </Suspense>
      </Modal>
    </div>
  );
}
