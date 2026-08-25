'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle, Heart, Calendar, MapPin, Users, PlusCircle } from 'lucide-react';
import { getVolunteerOpportunities, VolunteerOpportunity } from '@/lib/content';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/toast';

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

const SKILLS = [
  'Music/Singing',
  'Teaching',
  'Technical/AV',
  'Administration',
  'Cooking/Hospitality',
  'Driving',
  'Counseling',
  'Construction/Repair',
  'Language/Translation',
  'Graphic Design',
];

interface VolunteerHourEntry {
  id: string;
  hours: number;
  area?: string;
  date: string;
  notes?: string;
}

function VolunteerHourLog() {
  const [entries, setEntries] = useState<VolunteerHourEntry[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ hours: '', area: '', date: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const token = await getIdToken();
    if (!token) return;
    const res = await fetch('/api/volunteer/hours', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.success) {
      setEntries(data.entries);
      setTotalHours(data.totalHours);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/volunteer/hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ ...form, hours: Number(form.hours) }),
      });
      const data = await res.json();
      if (data.success) {
        setForm({ hours: '', area: '', date: '', notes: '' });
        toast({ title: 'Hours logged', description: 'Thank you for serving!', variant: 'success' });
        load();
      } else {
        toast({ title: 'Could not log hours', description: data.message, variant: 'danger' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card variant="raised" padding="lg">
      <div className="flex items-center justify-between">
        <h3 className="text-title-md text-foreground">Your Volunteer Hours</h3>
        <span className="text-headline-sm text-accent">{loading ? '—' : totalHours}</span>
      </div>
      <p className="text-body-sm text-foreground-muted">Total hours logged</p>

      <form onSubmit={handleLog} className="mt-5 grid gap-3 sm:grid-cols-4">
        <Input type="number" min="0.5" max="24" step="0.5" required placeholder="Hours" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
        <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Input placeholder="Area (optional)" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="sm:col-span-2" />
        <Textarea placeholder="Notes (optional)" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="sm:col-span-4" />
        <Button type="submit" size="sm" loading={submitting} leftIcon={<PlusCircle className="h-4 w-4" />} className="sm:col-span-4">
          {submitting ? 'Logging...' : 'Log Hours'}
        </Button>
      </form>

      {entries.length > 0 && (
        <ul className="mt-5 space-y-2 border-t border-border pt-4">
          {entries.slice(0, 5).map((entry) => (
            <li key={entry.id} className="flex items-center justify-between text-body-sm">
              <span className="text-foreground-muted">
                {new Date(entry.date).toLocaleDateString()} {entry.area && `— ${entry.area}`}
              </span>
              <span className="font-medium text-foreground">{entry.hours}h</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function VolunteerPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    interests: [] as string[],
    skills: [] as string[],
    availability: [] as string[],
    experience: '',
    motivation: '',
    emergencyContact: '',
    emergencyPhone: '',
    isFamily: false,
    familySize: '',
    signedUpOpportunity: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getVolunteerOpportunities().then(setOpportunities).catch((err) => console.error('Error fetching volunteer opportunities:', err));
  }, []);

  const handleInterestChange = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest) ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest],
    }));
  };

  const handleSkillChange = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }));
  };

  const signUpForShift = (opportunity: VolunteerOpportunity) => {
    setFormData((prev) => ({ ...prev, signedUpOpportunity: opportunity.title }));
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
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
          skills: formData.skills,
          availability: formData.availability,
          experience: formData.experience,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
          isFamily: formData.isFamily,
          familySize: formData.isFamily ? formData.familySize : null,
          signedUpOpportunity: formData.signedUpOpportunity || null,
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

      {opportunities.length > 0 && (
        <Section spacing="lg" className="bg-surface">
          <Container size="md">
            <div className="mb-8 text-center">
              <h2 className="text-headline-md text-foreground">Open Volunteer Opportunities</h2>
              <p className="mt-2 text-body-md text-foreground-muted">Sign up for a specific shift below, or fill out a general application</p>
            </div>
            {/* Shift board: a horizontal-scroll row of open slots reads as
                "pick one now" rather than a browsing grid of matched cards. */}
            <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
              {opportunities.map((opp) => (
                <Card key={opp.id} variant="raised" padding="lg" className="w-72 shrink-0 snap-start">
                  {opp.area && <span className="text-label uppercase tracking-wide text-accent">{opp.area}</span>}
                  <h3 className="mt-1 text-title-md text-foreground">{opp.title}</h3>
                  <p className="mt-2 text-body-sm text-foreground-muted">{opp.description}</p>
                  <div className="mt-3 space-y-1 text-body-sm text-foreground-subtle">
                    {opp.shiftDate && <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(opp.shiftDate).toLocaleDateString()} {opp.shiftTime && `— ${opp.shiftTime}`}</p>}
                    {opp.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {opp.location}</p>}
                    {typeof opp.spotsNeeded === 'number' && <p className="flex items-center gap-2"><Users className="h-4 w-4" /> {opp.spotsNeeded} spots needed</p>}
                  </div>
                  <Button size="sm" fullWidth className="mt-4" onClick={() => signUpForShift(opp)}>Sign Up for This</Button>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {user && (
        <Section spacing="lg">
          <Container size="md">
            <VolunteerHourLog />
          </Container>
        </Section>
      )}

      <Section spacing="lg">
        <Container size="md">
          <div ref={formRef}>
            <Card variant="raised" padding="lg">
              <h2 className="mb-8 text-center text-headline-sm text-foreground">Volunteer Application</h2>
              {formData.signedUpOpportunity && (
                <div className="mb-6 rounded-lg border border-accent/30 bg-accent-subtle p-3 text-center text-body-sm text-foreground">
                  Signing up for: <strong>{formData.signedUpOpportunity}</strong>
                </div>
              )}
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

                <div>
                  <p className="mb-4 text-label text-foreground">What skills can you offer?</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {SKILLS.map((skill) => (
                      <Checkbox key={skill} label={skill} checked={formData.skills.includes(skill)} onChange={() => handleSkillChange(skill)} />
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border border-border p-4">
                  <Checkbox
                    label="We'd like to volunteer as a family"
                    checked={formData.isFamily}
                    onChange={(e) => setFormData({ ...formData, isFamily: e.target.checked })}
                  />
                  {formData.isFamily && (
                    <Input
                      type="number"
                      min="2"
                      placeholder="Number of family members volunteering"
                      value={formData.familySize}
                      onChange={(e) => setFormData({ ...formData, familySize: e.target.value })}
                    />
                  )}
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
          </div>
        </Container>
      </Section>
    </div>
  );
}
