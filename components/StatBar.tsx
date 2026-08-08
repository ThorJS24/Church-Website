'use client';

import { Heart, Church, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { SiteSettings } from '@/lib/content';
import { Section } from '@/components/ui/section';
import { Grid } from '@/components/ui/grid';

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] as const },
  };
}

export default function StatBar({ statistics }: { statistics?: SiteSettings['statistics'] }) {
  const stats = [
    { icon: Users, value: statistics?.members || '500+', label: 'Members' },
    { icon: Heart, value: statistics?.yearsServing || '25+', label: 'Years Serving' },
    { icon: Church, value: statistics?.weeklyServices || '3', label: 'Weekly Services' },
    { icon: Users, value: statistics?.ministries || '15+', label: 'Ministries' },
  ];

  return (
    <Section spacing="md" className="bg-accent text-accent-foreground">
      <Grid cols={4} gap={6} className="text-center">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} {...fadeUp(index * 0.05)}>
            <stat.icon className="mx-auto mb-3 h-8 w-8 opacity-90" aria-hidden="true" />
            <div className="text-display-sm">{stat.value}</div>
            <div className="mt-1 text-body-sm opacity-80">{stat.label}</div>
          </motion.div>
        ))}
      </Grid>
    </Section>
  );
}
