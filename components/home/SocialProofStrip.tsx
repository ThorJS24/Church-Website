'use client';

import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { Testimonial } from '@/lib/content';
import { Grid } from '@/components/ui-legacy/Grid';
import { Card } from '@/components/ui-legacy/Card';

export default function SocialProofStrip({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <Grid cols={Math.min(3, testimonials.length) as 1 | 2 | 3} gap={6}>
      {testimonials.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
        >
          <Card padding="lg" className="h-full">
            <Quote className="mb-3 h-6 w-6 text-accent/60" aria-hidden="true" />
            <p className="line-clamp-4 text-body-md italic text-foreground-muted">&ldquo;{t.content}&rdquo;</p>
            <p className="mt-4 text-body-sm font-medium text-foreground">— {t.authorName}</p>
          </Card>
        </motion.div>
      ))}
    </Grid>
  );
}
