'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Users, Clock, MapPin, Search } from 'lucide-react';
import { getSmallGroups, SmallGroup } from '@/lib/content';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { LinkButton } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/states';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SmallGroupsPage() {
  const [groups, setGroups] = useState<SmallGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationSearch, setLocationSearch] = useState('');
  const [dayFilter, setDayFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');

  useEffect(() => {
    getSmallGroups().then(setGroups).finally(() => setLoading(false));
  }, []);

  const lifeStages = useMemo(
    () => Array.from(new Set(groups.map((g) => g.lifeStage).filter((s): s is string => Boolean(s)))),
    [groups]
  );

  const filteredGroups = groups
    .filter((g) => dayFilter === 'all' || g.dayOfWeek === dayFilter)
    .filter((g) => stageFilter === 'all' || g.lifeStage === stageFilter)
    .filter((g) => !locationSearch || (g.location ?? '').toLowerCase().includes(locationSearch.toLowerCase()));

  if (loading) return <LoadingState label="Loading small groups..." />;

  return (
    <div>
      <PageHero icon={<Users />} eyebrow="Grow Together" title="Small Groups" description="Connect, grow, and study scripture together in a smaller setting" />

      {groups.length > 0 && (
        <Section spacing="sm" className="bg-surface">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Input placeholder="Search by location..." aria-label="Search by location" leftIcon={<Search />} value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} className="max-w-xs" />
            <Select
              aria-label="Filter by day"
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              options={[{ value: 'all', label: 'Any Day' }, ...DAYS.map((d) => ({ value: d, label: d }))]}
              className="w-auto"
            />
            {lifeStages.length > 0 && (
              <Select
                aria-label="Filter by life stage"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                options={[{ value: 'all', label: 'Any Life Stage' }, ...lifeStages.map((s) => ({ value: s, label: s }))]}
                className="w-auto"
              />
            )}
          </div>
        </Section>
      )}

      <Section spacing="lg">
        {filteredGroups.length === 0 ? (
          <p className="text-center text-body-md text-foreground-muted">
            {groups.length === 0 ? (
              <>No small groups are listed yet — <Link href="/contact" className="text-accent underline">contact us</Link> to find one.</>
            ) : (
              'No small groups match your search — try a different day, life stage, or location.'
            )}
          </p>
        ) : (
          <Grid cols={3} gap={6}>
            {filteredGroups.map((group, index) => {
              const isFull = typeof group.capacity === 'number' && typeof group.currentMembers === 'number' && group.currentMembers >= group.capacity;
              const spotsLeft = typeof group.capacity === 'number' && typeof group.currentMembers === 'number' ? Math.max(group.capacity - group.currentMembers, 0) : null;
              return (
                <motion.div key={group.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }}>
                  <Card className="flex h-full flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      {group.category && <Badge variant="accent">{group.category}</Badge>}
                      {group.lifeStage && <Badge variant="neutral">{group.lifeStage}</Badge>}
                      {spotsLeft !== null && (
                        <Badge variant={isFull ? 'danger' : 'success'}>{isFull ? 'Full — Waitlist Open' : `${spotsLeft} ${spotsLeft === 1 ? 'spot' : 'spots'} left`}</Badge>
                      )}
                    </div>
                    <h2 className="mt-2 text-title-lg text-foreground">{group.name}</h2>
                    {group.description && <p className="mt-2 text-body-sm text-foreground-muted">{group.description}</p>}
                    <div className="mt-4 space-y-1.5 text-body-sm text-foreground-subtle">
                      {group.leaderName && <p className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0" /> Led by {group.leaderName}</p>}
                      {group.meetingSchedule && <p className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0" /> {group.meetingSchedule}</p>}
                      {group.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> {group.location}</p>}
                    </div>
                    <LinkButton href={`/small-groups/${group.id}`} size="sm" fullWidth className="mt-5">
                      {isFull ? 'Join Waitlist' : 'Learn More & Join'}
                    </LinkButton>
                  </Card>
                </motion.div>
              );
            })}
          </Grid>
        )}
      </Section>
    </div>
  );
}
