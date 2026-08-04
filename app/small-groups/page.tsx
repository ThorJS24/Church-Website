'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Clock, MapPin } from 'lucide-react';
import { getSmallGroups, SmallGroup } from '@/lib/content';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/States';

export default function SmallGroupsPage() {
  const [groups, setGroups] = useState<SmallGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSmallGroups().then(setGroups).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading small groups..." />;

  return (
    <div>
      <PageHero icon={<Users />} eyebrow="Grow Together" title="Small Groups" description="Connect, grow, and study scripture together in a smaller setting" />

      <Section spacing="lg">
        {groups.length === 0 ? (
          <p className="text-center text-body-md text-foreground-muted">
            No small groups are listed yet — <Link href="/contact" className="text-accent underline">contact us</Link> to find one.
          </p>
        ) : (
          <Grid cols={3} gap={6}>
            {groups.map((group, index) => (
              <motion.div key={group.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }}>
                <Card className="h-full">
                  {group.category && <Badge variant="accent" className="mb-2">{group.category}</Badge>}
                  <h2 className="text-title-lg text-foreground">{group.name}</h2>
                  {group.description && <p className="mt-2 text-body-sm text-foreground-muted">{group.description}</p>}
                  <div className="mt-4 space-y-1.5 text-body-sm text-foreground-subtle">
                    {group.leaderName && <p className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0" /> Led by {group.leaderName}</p>}
                    {group.meetingSchedule && <p className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0" /> {group.meetingSchedule}</p>}
                    {group.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> {group.location}</p>}
                  </div>
                </Card>
              </motion.div>
            ))}
          </Grid>
        )}
      </Section>
    </div>
  );
}
