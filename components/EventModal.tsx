'use client';

import { Calendar, Clock, MapPin, User, Phone, Mail, Tag, DollarSign, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import { getEventCategory } from '@/lib/eventCategories';
import { AddToCalendarButton } from '@/components/AddToCalendarButton';

interface EventModalProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
}

function renderDescription(description: any): string {
  if (typeof description === 'string') return description;
  if (Array.isArray(description)) {
    return description
      .map((block: any) => (block._type === 'block' ? block.children?.map((c: any) => c.text).join('') || '' : ''))
      .join('\n');
  }
  return 'No description available';
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  if (!event) return null;
  const category = event.category ? getEventCategory(event.category) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event.title} size="xl">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {event.imageUrl && (
            <div className="relative h-64 overflow-hidden rounded-lg bg-surface-active">
              <Image src={event.imageUrl} alt={event.title} fill sizes="(max-width: 1024px) 100vw, 500px" className="object-cover" />
            </div>
          )}

          <div className="space-y-4 text-body-sm text-foreground-muted">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-medium text-foreground">{formatDate(event.startDate)}</p>
                {event.endDate && <p className="text-caption">Until {formatDate(event.endDate)}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 shrink-0 text-accent" />
              <p>
                {formatTime(event.startDate)}
                {event.endDate && <span> - {formatTime(event.endDate)}</span>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-medium text-foreground">{event.location}</p>
                {event.address && <p className="text-caption">{event.address}</p>}
              </div>
            </div>
            {category && (
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 shrink-0 text-accent" />
                <Badge variant={category.badgeVariant}>{category.label}</Badge>
              </div>
            )}
            {event.cost !== undefined && (
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 shrink-0 text-accent" />
                <span className="font-medium text-foreground">{event.cost === 0 ? 'Free' : `$${event.cost}`}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-title-sm text-foreground">Description</h3>
            <p className="whitespace-pre-line text-body-sm text-foreground-muted">
              {event.shortDescription || renderDescription(event.description)}
            </p>
          </div>

          <AddToCalendarButton
            title={event.title}
            description={event.shortDescription}
            location={event.location}
            startDate={event.startDate}
            endDate={event.endDate}
          />

          {(event.organizerName || event.contactEmail || event.contactPhone) && (
            <div>
              <h3 className="mb-2 text-title-sm text-foreground">Contact Information</h3>
              <div className="space-y-1.5 text-body-sm text-foreground-muted">
                {event.organizerName && <p className="flex items-center gap-2"><User className="h-4 w-4" /> {event.organizerName}</p>}
                {event.contactEmail && (
                  <a href={`mailto:${event.contactEmail}`} className="flex items-center gap-2 hover:text-accent">
                    <Mail className="h-4 w-4" /> {event.contactEmail}
                  </a>
                )}
                {event.contactPhone && (
                  <a href={`tel:${event.contactPhone}`} className="flex items-center gap-2 hover:text-accent">
                    <Phone className="h-4 w-4" /> {event.contactPhone}
                  </a>
                )}
              </div>
            </div>
          )}

          {event.tags && event.tags.length > 0 && (
            <div>
              <h3 className="mb-2 text-title-sm text-foreground">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="neutral">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {event.registrationRequired && (
            <div className="rounded-lg border border-accent/20 bg-accent-subtle p-4">
              <h3 className="mb-1.5 text-title-sm text-accent">Registration Required</h3>
              {event.maxAttendees && <p className="mb-2 text-body-sm text-accent">Limited to {event.maxAttendees} attendees</p>}
              {event.registrationUrl ? (
                <LinkButton href={event.registrationUrl} target="_blank" rel="noopener noreferrer" size="sm" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                  Register Now
                </LinkButton>
              ) : (
                <p className="text-body-sm text-accent">Contact us for registration details</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
