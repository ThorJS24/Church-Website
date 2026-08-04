'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Heart } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';

const VOLUNTEER_AREAS = [
  "Children's Ministry",
  'Youth Ministry',
  'Worship Team',
  'Hospitality',
  'Ushering',
  'Audio/Visual',
  'Maintenance',
  'Outreach',
  'Prayer Ministry',
  'Administrative',
];

export default function VolunteerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    interests: [] as string[],
    availability: [] as string[],
    experience: '',
    motivation: '',
    emergencyContact: '',
    emergencyPhone: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInterestChange = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest) ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.motivation,
          department: 'volunteer',
          age: formData.age,
          interests: formData.interests,
          availability: formData.availability,
          experience: formData.experience,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError('Something went wrong submitting your application. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting volunteer application:', err);
      setError('Something went wrong submitting your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Container size="sm" className="py-24 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-subtle">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-headline-sm text-foreground">Thank You!</h2>
          <p className="mt-3 text-body-md text-foreground-muted">Your volunteer application has been submitted. We&apos;ll contact you soon!</p>
          <Button className="mt-6" onClick={() => setSubmitted(false)}>Submit Another Application</Button>
        </motion.div>
      </Container>
    );
  }

  return (
    <div>
      <PageHero icon={<Heart />} eyebrow="Serve With Us" title="Volunteer With Us" description="Join our mission to serve God and our community" />

      <Section spacing="lg">
        <Container size="md">
          <Card variant="raised" padding="lg">
            <h2 className="mb-8 text-center text-headline-sm text-foreground">Volunteer Application</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <Input label="Full Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <Input label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>

              <div>
                <p className="mb-4 text-label text-foreground">Areas of Interest *</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {VOLUNTEER_AREAS.map((area) => (
                    <Checkbox key={area} label={area} checked={formData.interests.includes(area)} onChange={() => handleInterestChange(area)} />
                  ))}
                </div>
              </div>

              <Textarea
                label="Why do you want to volunteer?"
                required
                rows={3}
                placeholder="Share your motivation for volunteering..."
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
              />

              {error && <p className="rounded-lg border border-danger/30 bg-danger-subtle p-3 text-body-sm text-danger">{error}</p>}

              <Button type="submit" fullWidth size="lg" loading={submitting} leftIcon={!submitting ? <Send className="h-4 w-4" /> : undefined}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </Card>
        </Container>
      </Section>
    </div>
  );
}
