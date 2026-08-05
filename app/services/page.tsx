'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, BookOpen, Clock, MapPin, Calendar, Video, Coffee, Baby, Users, Bell, Heart, Radio, Accessibility } from 'lucide-react';
import { getPageContent, getServiceTimes, getSiteSettings, getLivestream } from '@/lib/content';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';
import { Button, LinkButton } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, EmptyState } from '@/components/ui/States';

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

  if (loading) return <LoadingState label="Loading services..." />;

  if (!servicesPage) {
    return (
      <EmptyState
        icon={Clock}
        title="Services page content not found"
        description="Please add content through the admin panel"
      />
    );
  }

  return (
    <div>
      <PageHero
        icon={<Clock />}
        eyebrow="Worship With Us"
        title={servicesPage.title}
        description={servicesPage.subtitle}
        actions={
          hasLiveStream ? (
            <Button variant="danger" leftIcon={<Radio className="h-4 w-4 animate-pulse" />} onClick={() => setShowLiveStream(true)}>
              Watch Live Stream
            </Button>
          ) : (
            <Badge variant="neutral"><Radio className="h-4 w-4" /> No Live Stream Currently</Badge>
          )
        }
      />

      {services.length > 0 && (
        <Section spacing="lg">
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
                    <Button variant="secondary" className="mt-5" leftIcon={<Calendar className="h-4 w-4" />} onClick={() => addServiceToCalendar(service)}>
                      Add to Calendar
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </Grid>
        </Section>
      )}

      {servicesPage.whatToExpect?.length > 0 && (
        <Section spacing="lg" className="bg-surface">
          <div className="mb-10 text-center">
            <h2 className="text-headline-md text-foreground">{servicesPage.whatToExpectSectionTitle}</h2>
            <p className="mt-2 text-body-md text-foreground-muted">Your first visit made easy — here&apos;s what you can expect when you join us</p>
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
        <Section spacing="lg">
          <div className="mb-10 text-center">
            <h2 className="text-headline-md text-foreground">{servicesPage.specialEventsSectionTitle}</h2>
            <p className="mt-2 text-body-md text-foreground-muted">Join us for these special worship experiences throughout the year</p>
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

      <Section spacing="lg" className="bg-surface">
        <Grid cols={2} gap={12} className="items-center">
          <div>
            <h2 className="text-headline-md text-foreground">{servicesPage.onlineServicesTitle}</h2>
            <p className="mt-4 text-body-md text-foreground-muted">{servicesPage.onlineServicesDescription}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button leftIcon={<Video className="h-4 w-4" />} onClick={() => siteSettings?.youtubeChannelUrl && window.open(siteSettings.youtubeChannelUrl, '_blank')}>
                Watch on YouTube
              </Button>
              {siteSettings?.zoomMeetingUrl && (
                <Button variant="secondary" leftIcon={<Video className="h-4 w-4" />} onClick={() => window.open(siteSettings.zoomMeetingUrl, '_blank')}>
                  Join via Zoom
                </Button>
              )}
              <Button
                variant="outline"
                leftIcon={<Bell className="h-4 w-4" />}
                onClick={() => siteSettings?.youtubeChannelUrl && window.open(`${siteSettings.youtubeChannelUrl}?sub_confirmation=1`, '_blank')}
              >
                Get Notifications
              </Button>
            </div>
          </div>
          <Card variant="raised" padding="lg" className="text-center">
            <Video className="mx-auto mb-4 h-12 w-12 text-accent" aria-hidden="true" />
            <p className="text-title-lg text-foreground">Live Stream Available</p>
            <p className="mt-1 text-body-sm text-foreground-muted">
              {services.length > 0 ? `Next service: ${services[0]?.time}` : 'Check schedule for times'}
            </p>
          </Card>
        </Grid>
      </Section>

      <Section spacing="lg" className="bg-accent text-accent-foreground">
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
            <LinkButton href="/contact" variant="secondary" size="lg">
              Contact Us
            </LinkButton>
            <Button
              variant="outline"
              size="lg"
              className="border-white/40 text-accent-foreground hover:bg-white/10"
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
              Get Directions
            </Button>
          </div>
        </div>
      </Section>

      <Modal isOpen={showLiveStream} onClose={() => setShowLiveStream(false)} title="Live Stream" size="xl">
        <Suspense fallback={<LoadingState label="Loading stream..." />}>
          <DynamicLiveStream />
        </Suspense>
      </Modal>
    </div>
  );
}
