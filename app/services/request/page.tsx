'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Calendar, Heart, Droplets, Send, Phone, Mail, User, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui-legacy/Container';
import { Card } from '@/components/ui-legacy/Card';
import { Grid } from '@/components/ui-legacy/Grid';
import { Input } from '@/components/ui-legacy/Input';
import { Textarea } from '@/components/ui-legacy/Textarea';
import { Button } from '@/components/ui-legacy/Button';
import { cn } from '@/lib/cn';

const DOCUMENT_CHECKLISTS: Record<'wedding' | 'baptism', string[]> = {
  wedding: [
    'Valid government-issued photo ID for both partners',
    'Marriage license application (from your local registrar)',
    'Completion of premarital counseling sessions with a pastor',
    'Birth certificates, if requested during counseling',
  ],
  baptism: [
    'A completed profession-of-faith conversation with a pastor',
    'Valid government-issued photo ID',
    'Emergency contact information (collected on this form)',
    'No special documents required beyond the above — just come ready to testify to your faith',
  ],
};

interface ServiceRequestForm {
  serviceType: 'wedding' | 'baptism';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDate: string;
  alternateDate: string;
  message: string;
  partnerName?: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export default function ServiceRequestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ServiceRequestForm>();

  const serviceType = watch('serviceType');

  const onSubmit = async (data: ServiceRequestForm) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch('/api/services/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setEmailConfirmed(result.notifications?.requesterConfirmed !== false);
        setSubmittedId(result.id);
        setSubmittedEmail(data.email);
        setSubmitted(true);
      } else {
        setSubmitError(result.error || 'Something went wrong submitting your request. Please try again or call the church office.');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setSubmitError('Something went wrong submitting your request. Please try again or call the church office.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Container size="sm" className="py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="raised" padding="lg" className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-subtle">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-headline-sm text-foreground">Request Submitted!</h2>
            <p className="mt-3 text-body-md text-foreground-muted">
              Thank you for your service request. Our pastoral team will contact you within 24-48 hours to discuss your request and schedule a consultation.
            </p>
            {!emailConfirmed && (
              <p className="mt-4 text-body-sm text-warning">
                Your request was saved, but we couldn&apos;t send a confirmation email right now — you&apos;ll still hear from our team directly.
              </p>
            )}
            {submittedId && (
              <Link
                href={`/services/request/status?id=${submittedId}&email=${encodeURIComponent(submittedEmail)}`}
                className="mt-6 inline-flex items-center gap-1.5 text-body-sm font-medium text-accent hover:underline"
              >
                Track your request status <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </Card>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container size="md" className="py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="raised" padding="none" className="overflow-hidden">
          <div className="bg-accent px-8 py-6 text-accent-foreground">
            <h1 className="text-headline-sm">Service Request</h1>
            <p className="mt-1 opacity-90">Request wedding or baptism services</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8">
            <div>
              <p className="mb-3 text-label text-foreground">Service Type *</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="relative cursor-pointer">
                  <input type="radio" value="wedding" {...register('serviceType', { required: 'Please select a service type' })} className="sr-only" />
                  <div className={cn('rounded-lg border-2 p-4 transition-colors', serviceType === 'wedding' ? 'border-accent bg-accent-subtle' : 'border-border hover:border-border-strong')}>
                    <Heart className="mb-2 h-7 w-7 text-danger" />
                    <h3 className="text-title-sm text-foreground">Wedding</h3>
                    <p className="text-body-sm text-foreground-muted">Marriage ceremony service</p>
                  </div>
                </label>
                <label className="relative cursor-pointer">
                  <input type="radio" value="baptism" {...register('serviceType', { required: 'Please select a service type' })} className="sr-only" />
                  <div className={cn('rounded-lg border-2 p-4 transition-colors', serviceType === 'baptism' ? 'border-accent bg-accent-subtle' : 'border-border hover:border-border-strong')}>
                    <Droplets className="mb-2 h-7 w-7 text-info" />
                    <h3 className="text-title-sm text-foreground">Baptism</h3>
                    <p className="text-body-sm text-foreground-muted">Baptism ceremony service</p>
                  </div>
                </label>
              </div>
              {errors.serviceType && <p className="mt-1.5 text-caption text-danger">{errors.serviceType.message}</p>}
            </div>

            {(serviceType === 'wedding' || serviceType === 'baptism') && (
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="mb-2 flex items-center gap-1.5 text-label text-foreground">
                  <FileText className="h-3.5 w-3.5" /> What to bring / prepare
                </p>
                <ul className="space-y-1.5">
                  {DOCUMENT_CHECKLISTS[serviceType].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-body-sm text-foreground-muted">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Grid cols={2} gap={6}>
              <Input label="First Name" required leftIcon={<User />} placeholder="Enter your first name" error={errors.firstName?.message} {...register('firstName', { required: 'First name is required' })} />
              <Input label="Last Name" required leftIcon={<User />} placeholder="Enter your last name" error={errors.lastName?.message} {...register('lastName', { required: 'Last name is required' })} />
            </Grid>

            <Grid cols={2} gap={6}>
              <Input
                label="Email"
                type="email"
                required
                leftIcon={<Mail />}
                placeholder="your.email@example.com"
                error={errors.email?.message}
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })}
              />
              <Input label="Phone Number" type="tel" required leftIcon={<Phone />} placeholder="+1 (555) 123-4567" error={errors.phone?.message} {...register('phone', { required: 'Phone number is required' })} />
            </Grid>

            {serviceType === 'wedding' && (
              <Input
                label="Partner's Full Name"
                required
                leftIcon={<Heart />}
                placeholder="Enter your partner's full name"
                error={errors.partnerName?.message}
                {...register('partnerName', { required: serviceType === 'wedding' ? 'Partner name is required for wedding' : false })}
              />
            )}

            <Grid cols={2} gap={6}>
              <Input label="Preferred Date" type="date" required leftIcon={<Calendar />} error={errors.preferredDate?.message} {...register('preferredDate', { required: 'Preferred date is required' })} />
              <Input label="Alternate Date" type="date" leftIcon={<Calendar />} {...register('alternateDate')} />
            </Grid>

            <Textarea label="Additional Information" rows={4} placeholder="Please share any additional details, special requests, or questions..." {...register('message')} />

            {submitError && <p className="text-right text-body-sm text-danger">{submitError}</p>}

            <div className="flex justify-end">
              <Button type="submit" size="lg" loading={isSubmitting} leftIcon={!isSubmitting ? <Send className="h-4 w-4" /> : undefined}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </Container>
  );
}
