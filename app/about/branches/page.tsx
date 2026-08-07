'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, Users, Phone, Mail, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPageContent } from '@/lib/content';
import Image from 'next/image';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Modal } from '@/components/ui/modal';
import { LoadingState } from '@/components/ui/states';

interface Branch {
  id: string;
  name: string;
  description: string;
  established: string;
  location: { address: string; coordinates: { lat: number; lng: number }; googleMapsUrl?: string };
  pastors?: Array<{ name: string; title?: string; imageUrl?: string }>;
  contact: { phone?: string; email?: string };
  images: Array<{ url: string; alt?: string }>;
  services: Array<{ day: string; time: string; type: string }>;
  memberCount?: number;
}

interface BranchesData {
  title: string;
  subtitle: string;
  branches: Branch[];
}

export default function BranchesPage() {
  const [branchesData, setBranchesData] = useState<BranchesData | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPageContent<BranchesData>('branches')
      .then((data) => data && setBranchesData(data))
      .catch((error) => console.error('Error fetching branches data:', error))
      .finally(() => setLoading(false));
  }, []);

  const images = selectedBranch?.images ?? [];
  const nextImage = () => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  if (loading) return <LoadingState label="Loading branches..." />;

  return (
    <div>
      <PageHero
        icon={<MapPin />}
        eyebrow="Locations"
        title={branchesData?.title || 'Our Branches'}
        description={branchesData?.subtitle || "Spreading God's love across communities"}
        breadcrumbs={[{ label: 'About', href: '/about' }, { label: 'Branches' }]}
      />

      <Section spacing="lg">
        <Grid cols={3} gap={6}>
          {branchesData?.branches?.map((branch, index) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <Card padding="none" className="h-full overflow-hidden">
                <div className="relative aspect-4/3 bg-surface-active">
                  {branch.images?.[0]?.url ? (
                    <Image
                      src={branch.images[0].url}
                      alt={branch.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      priority={index === 0}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <MapPin className="h-12 w-12 text-foreground-subtle" />
                    </div>
                  )}
                  <Badge variant="neutral" className="absolute top-3 right-3 bg-background/90">
                    Est. {branch.established}
                  </Badge>
                </div>

                <div className="p-6">
                  <h3 className="text-title-lg text-foreground">{branch.name}</h3>
                  <p className="mt-2 line-clamp-3 text-body-sm text-foreground-muted">{branch.description}</p>

                  <div className="mt-4 space-y-2 text-body-sm text-foreground-muted">
                    <p className="flex items-center gap-2 truncate">
                      <MapPin className="h-4 w-4 shrink-0 text-accent" /> <span className="truncate">{branch.location.address}</span>
                    </p>
                    {branch.memberCount && (
                      <p className="flex items-center gap-2">
                        <Users className="h-4 w-4 shrink-0 text-accent" /> {branch.memberCount} Members
                      </p>
                    )}
                    {branch.contact.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0 text-accent" /> {branch.contact.phone}
                      </p>
                    )}
                  </div>

                  <Button
                    fullWidth
                    className="mt-5"
                    rightIcon={<ExternalLink className="h-4 w-4" />}
                    onClick={() => {
                      setSelectedBranch(branch);
                      setCurrentImageIndex(0);
                    }}
                  >
                    Learn More
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </Grid>
      </Section>

      <Modal isOpen={!!selectedBranch} onClose={() => setSelectedBranch(null)} title={selectedBranch?.name} size="lg">
        {selectedBranch && (
          <>
            {images.length > 0 && (
              <div className="relative mb-6 aspect-video overflow-hidden rounded-lg bg-surface-active">
                {images[currentImageIndex]?.url && (
                  <Image
                    src={images[currentImageIndex].url}
                    alt={images[currentImageIndex].alt || selectedBranch.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 800px"
                    className="object-cover"
                    priority
                  />
                )}
                {images.length > 1 && (
                  <>
                    <IconButton
                      label="Previous image"
                      size="sm"
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    >
                      <ChevronLeft />
                    </IconButton>
                    <IconButton
                      label="Next image"
                      size="sm"
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    >
                      <ChevronRight />
                    </IconButton>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {images.map((_, i) => (
                        <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-title-sm text-foreground">About</h3>
                <p className="mb-4 text-body-sm text-foreground-muted">{selectedBranch.description}</p>
                <div className="space-y-2.5 text-body-sm text-foreground-muted">
                  <p className="flex items-center gap-2.5"><Calendar className="h-4 w-4 text-accent" /> Established: {selectedBranch.established}</p>
                  <p className="flex items-center gap-2.5"><MapPin className="h-4 w-4 text-accent" /> {selectedBranch.location.address}</p>
                  {selectedBranch.memberCount && (
                    <p className="flex items-center gap-2.5"><Users className="h-4 w-4 text-accent" /> {selectedBranch.memberCount} Members</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-title-sm text-foreground">Contact &amp; Services</h3>
                <div className="mb-4 space-y-2">
                  <p className="text-label text-foreground-subtle">Pastors</p>
                  {selectedBranch.pastors && selectedBranch.pastors.length > 0 ? (
                    selectedBranch.pastors.map((pastor, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {pastor.imageUrl && (
                          <Image src={pastor.imageUrl} alt={pastor.name} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                        )}
                        <span className="text-body-sm font-medium text-foreground">
                          {pastor.name} {pastor.title && `(${pastor.title})`}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-body-sm text-foreground-subtle">No pastors assigned</p>
                  )}
                  {selectedBranch.contact.phone && (
                    <p className="flex items-center gap-2 text-body-sm text-foreground-muted"><Phone className="h-4 w-4 text-accent" /> {selectedBranch.contact.phone}</p>
                  )}
                  {selectedBranch.contact.email && (
                    <p className="flex items-center gap-2 text-body-sm text-foreground-muted"><Mail className="h-4 w-4 text-accent" /> {selectedBranch.contact.email}</p>
                  )}
                </div>

                {selectedBranch.services && selectedBranch.services.length > 0 && (
                  <div>
                    <p className="mb-2 text-label text-foreground-subtle">Service Times</p>
                    <div className="space-y-1">
                      {selectedBranch.services.map((s, i) => (
                        <p key={i} className="text-body-sm text-foreground-muted"><span className="font-medium text-foreground">{s.day}</span> — {s.time} ({s.type})</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-title-sm text-foreground">Location</h3>
              <div className="h-64 overflow-hidden rounded-lg border border-border">
                <iframe
                  title={`Map of ${selectedBranch.name}`}
                  src={`https://maps.google.com/maps?q=${selectedBranch.location.coordinates.lat},${selectedBranch.location.coordinates.lng}&hl=en&z=16&t=k&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-body-sm text-foreground-muted">{selectedBranch.location.address}</p>
                <Button
                  size="sm"
                  onClick={() =>
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedBranch.location.address)}`, '_blank')
                  }
                >
                  Get Directions
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
