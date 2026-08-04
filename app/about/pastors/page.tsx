'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, BookOpen } from 'lucide-react';
import { getPastors, Pastor } from '@/lib/content';
import Image from 'next/image';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, EmptyState } from '@/components/ui/States';

const HIERARCHY_ORDER: Record<string, number> = {
  'Senior Pastor': 1,
  'Lead Pastor': 2,
  'Associate Pastor': 3,
  'Assistant Pastor': 4,
  'Youth Pastor': 5,
  'Children Pastor': 6,
  'Worship Pastor': 7,
  Pastor: 8,
};

function renderBio(bio: any): string {
  if (typeof bio === 'string') return bio;
  if (Array.isArray(bio)) {
    return bio
      .map((block: any) => (block._type === 'block' ? block.children?.map((c: any) => c.text).join('') || '' : ''))
      .join('\n');
  }
  return 'No biography available';
}

export default function PastorsPage() {
  const [pastors, setPastors] = useState<Pastor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPastor, setSelectedPastor] = useState<Pastor | null>(null);

  useEffect(() => {
    getPastors()
      .then((data) => {
        const unique = data.filter((p, i, self) => i === self.findIndex((x) => x.name === p.name && x.title === p.title));
        setPastors(
          unique.sort((a, b) => (HIERARCHY_ORDER[a.title] || 99) - (HIERARCHY_ORDER[b.title] || 99))
        );
      })
      .catch((error) => console.error('Error fetching pastors:', error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading pastoral team..." />;

  return (
    <div>
      <PageHero
        icon={<BookOpen />}
        eyebrow="Leadership"
        title="Our Pastoral Team"
        description="Meet the shepherds who guide our congregation with wisdom, love, and unwavering faith"
      />

      <Section spacing="lg">
        {pastors.length === 0 ? (
          <EmptyState icon={User} title="No pastoral information available" description="Please check back soon for updates about our pastoral team." />
        ) : (
          <Grid cols={3} gap={6}>
            {pastors.map((pastor, index) => (
              <motion.div
                key={pastor.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                <Card className="h-full">
                  <div className="mb-4 flex items-center gap-4">
                    <Avatar src={pastor.imageUrl} name={pastor.name} size="lg" />
                    <div>
                      <h3 className="text-title-md text-foreground">{pastor.name}</h3>
                      <p className="text-body-sm font-medium text-accent">{pastor.title}</p>
                    </div>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {pastor.yearsOfService && <Badge variant="accent">{pastor.yearsOfService}y service</Badge>}
                    {pastor.ordainedDate && <Badge variant="neutral">Est. {new Date(pastor.ordainedDate).getFullYear()}</Badge>}
                  </div>
                  <Button fullWidth onClick={() => setSelectedPastor(pastor)}>
                    Learn More
                  </Button>
                </Card>
              </motion.div>
            ))}
          </Grid>
        )}
      </Section>

      <Modal isOpen={!!selectedPastor} onClose={() => setSelectedPastor(null)} title={selectedPastor?.name} size="lg">
        {selectedPastor && (
          <>
            <div className="relative mb-6 aspect-video overflow-hidden rounded-lg bg-surface-active">
              {selectedPastor.imageUrl ? (
                <Image src={selectedPastor.imageUrl} alt={selectedPastor.name} fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <User className="h-16 w-16 text-foreground-subtle" />
                </div>
              )}
            </div>

            <p className="mb-3 text-title-sm text-accent">{selectedPastor.title}</p>
            <div className="mb-6 flex flex-wrap gap-2">
              {selectedPastor.yearsOfService && <Badge variant="accent">{selectedPastor.yearsOfService} years of service</Badge>}
              {selectedPastor.ordainedDate && <Badge variant="neutral">Ordained {new Date(selectedPastor.ordainedDate).getFullYear()}</Badge>}
            </div>

            <div className="mb-6">
              <h3 className="mb-2 text-title-sm text-foreground">About</h3>
              <p className="whitespace-pre-line text-body-sm leading-relaxed text-foreground-muted">{renderBio(selectedPastor.bio)}</p>
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              {selectedPastor.email && (
                <a href={`mailto:${selectedPastor.email}`} className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-surface-hover">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="break-all text-body-sm text-foreground-muted">{selectedPastor.email}</span>
                </a>
              )}
              {selectedPastor.phone && (
                <a href={`tel:${selectedPastor.phone}`} className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-surface-hover">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="break-all text-body-sm text-foreground-muted">{selectedPastor.phone}</span>
                </a>
              )}
            </div>

            {selectedPastor.specialties && selectedPastor.specialties.length > 0 && (
              <div>
                <h3 className="mb-3 text-title-sm text-foreground">Ministry Focus Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPastor.specialties.map((s, i) => (
                    <Badge key={i} variant="accent">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
