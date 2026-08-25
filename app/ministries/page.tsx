'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Users, Baby, Music, BookOpen, Heart, Clock, MapPin, Search } from 'lucide-react';
import { getPageContent, getMinistries, getSiteSettings, Ministry, SiteSettings } from '@/lib/content';
import StatBar from '@/components/StatBar';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Input } from '@/components/ui/input';
import { Button, LinkButton } from '@/components/ui/button';
import { LoadingState, EmptyState } from '@/components/ui/states';
import { cn } from '@/lib/utils';

interface MinistriesPage {
  title: string;
  subtitle: string;
  categories: Array<{ id: string; label: string }>;
}

const iconMap = {
  children: Baby,
  youth: Users,
  adults: Users,
  worship: Music,
  outreach: Heart,
  default: BookOpen,
};

// Colored dot + matching active-chip color, mirroring the category filter
// idiom used on /events — both pages filter a small, fixed set of
// categories, so the two controls should read as the same kind of thing.
const CATEGORIES = [
  { id: 'all', label: 'All Ministries', dotClass: 'bg-stone-600', chipActiveClass: 'bg-stone-600 text-white' },
  { id: 'children', label: 'Children', dotClass: 'bg-amber-600', chipActiveClass: 'bg-amber-600 text-white' },
  { id: 'youth', label: 'Youth', dotClass: 'bg-pink-600', chipActiveClass: 'bg-pink-600 text-white' },
  { id: 'adults', label: 'Adults', dotClass: 'bg-blue-600', chipActiveClass: 'bg-blue-600 text-white' },
  { id: 'worship', label: 'Worship', dotClass: 'bg-indigo-600', chipActiveClass: 'bg-indigo-600 text-white' },
  { id: 'outreach', label: 'Outreach', dotClass: 'bg-green-700', chipActiveClass: 'bg-green-700 text-white' },
];

const GET_INVOLVED = [
  { icon: Users, title: 'Serve Others', description: 'Use your gifts and talents to serve our church and community through various ministry opportunities.' },
  { icon: BookOpen, title: 'Grow in Faith', description: 'Join small groups, Bible studies, and discipleship programs to deepen your relationship with God.', href: '/contact', cta: 'Join a Group' },
  { icon: Heart, title: 'Build Community', description: 'Connect with others through fellowship events, ministry teams, and community service projects.', href: '/contact', cta: 'Get Connected' },
];

export default function MinistriesPage() {
  const [ministriesPage, setMinistriesPage] = useState<MinistriesPage | null>(null);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const ministriesGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ministriesPageData, ministriesData, siteSettingsData] = await Promise.all([getPageContent<MinistriesPage>('ministries'), getMinistries(), getSiteSettings()]);
        if (ministriesPageData) setMinistriesPage(ministriesPageData);
        setMinistries(ministriesData);
        setSiteSettings(siteSettingsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleFindMinistryClick = () => ministriesGridRef.current?.scrollIntoView({ behavior: 'smooth' });

  const filteredMinistries = ministries
    .filter((m) => activeCategory === 'all' || (Array.isArray(m.category) ? m.category.includes(activeCategory) : m.category === activeCategory))
    .filter((m) => {
      if (!searchTerm) return true;
      const haystack = `${m.title} ${m.description} ${m.ageGroup ?? ''}`.toLowerCase();
      return haystack.includes(searchTerm.toLowerCase());
    });

  if (loading) return <LoadingState label="Loading ministries..." />;

  return (
    <div>
      <PageHero icon={<Heart />} eyebrow="Get Involved" title={ministriesPage?.title || 'Our Ministries'} description={ministriesPage?.subtitle || 'Find your place to serve, grow, and make a difference in our community'} />

      <StatBar statistics={siteSettings?.statistics} />

      <div ref={ministriesGridRef} className="border-b border-border bg-background py-6">
        <div className="mx-auto mb-4 flex max-w-md justify-center px-4">
          <Input placeholder="Search ministries..." aria-label="Search ministries" leftIcon={<Search />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="mx-auto flex max-w-[1680px] flex-wrap justify-center gap-3 px-4">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'flex items-center gap-2 rounded-full px-5 py-2 text-body-sm font-medium transition-colors',
                activeCategory === category.id ? category.chipActiveClass : 'bg-surface-active text-foreground-muted hover:bg-surface-hover'
              )}
            >
              <span className={cn('h-2 w-2 rounded-full', category.dotClass)} />
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <Section spacing="lg">
        {filteredMinistries.length === 0 ? (
          <EmptyState icon={BookOpen} title="No ministries found" description="Check back soon for new ministry opportunities!" />
        ) : (
          <Grid cols={3} gap={6}>
            {filteredMinistries.map((ministry, index) => {
              const categoryKey = Array.isArray(ministry.category) ? ministry.category[0] : ministry.category;
              const Icon = iconMap[categoryKey as keyof typeof iconMap] || iconMap.default;
              return (
                <motion.div key={ministry.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }}>
                  <Card variant="raised" padding="lg" className="h-full text-center">
                    <Icon className="mx-auto mb-4 h-10 w-10 text-accent" aria-hidden="true" />
                    <h3 className="text-title-lg text-foreground">{ministry.title}</h3>
                    {ministry.ageGroup && <p className="mt-1 text-body-sm font-medium text-accent">{ministry.ageGroup}</p>}
                    <p className="mt-3 text-body-sm text-foreground-muted">{ministry.description}</p>
                    <div className="mt-4 space-y-1.5 text-body-sm text-foreground-subtle">
                      {ministry.meetingTime && <p className="flex items-center justify-center gap-2"><Clock className="h-4 w-4" /> {ministry.meetingTime}</p>}
                      {ministry.location && <p className="flex items-center justify-center gap-2"><MapPin className="h-4 w-4" /> {ministry.location}</p>}
                    </div>
                    <div className="mt-5 flex gap-3">
                      <LinkButton href={`/ministries/volunteer?ministry=${ministry.id}`} size="sm" fullWidth>Join Ministry</LinkButton>
                      <LinkButton href={`/ministries/${ministry.id}`} variant="outline" size="sm" fullWidth>Learn More</LinkButton>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </Grid>
        )}
      </Section>

      <Section spacing="lg" className="bg-surface">
        <div className="mb-10 text-center">
          <h2 className="text-headline-md text-foreground">Get Involved</h2>
          <p className="mt-2 text-body-md text-foreground-muted">There are many ways to serve and grow in our church community</p>
        </div>
        <Grid cols={3} gap={6}>
          {GET_INVOLVED.map((item, index) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ delay: index * 0.1, duration: 0.4 }}>
              <Card padding="lg" className="h-full text-center">
                <item.icon className="mx-auto mb-4 h-10 w-10 text-accent" aria-hidden="true" />
                <h3 className="text-title-lg text-foreground">{item.title}</h3>
                <p className="mt-3 text-body-sm text-foreground-muted">{item.description}</p>
                {item.href ? (
                  <LinkButton href={item.href} className="mt-5">{item.cta}</LinkButton>
                ) : (
                  <Button className="mt-5" onClick={handleFindMinistryClick}>Find Your Ministry</Button>
                )}
              </Card>
            </motion.div>
          ))}
        </Grid>
      </Section>

      <Section spacing="lg" className="bg-accent text-center text-accent-foreground">
        <h2 className="text-headline-md">Ready to Get Involved?</h2>
        <p className="mx-auto mt-3 max-w-xl text-body-lg opacity-90">Take the next step and join a ministry that matches your passion and calling.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <LinkButton href="/ministries/contact" variant="secondary" size="lg">Contact Ministry Leader</LinkButton>
          <LinkButton href="/ministries/volunteer" variant="outline" size="lg" className="border-white/40 bg-transparent text-accent-foreground hover:bg-white/10">Volunteer Application</LinkButton>
        </div>
      </Section>
    </div>
  );
}
