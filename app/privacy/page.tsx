import {
  Shield, ShieldCheck, Users, Heart, Laptop, DollarSign, Check, Eye, Pencil, Trash2,
  Download, BellOff, SlidersHorizontal, Lock, Mail,
} from 'lucide-react';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { LinkButton } from '@/components/ui/button';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { PrintButton } from '@/components/PrintButton';
import { PolicyVersionDiff, type PolicyVersion } from '@/components/PolicyVersionDiff';

const POLICY_VERSIONS: PolicyVersion[] = [
  {
    id: 'v1.0',
    label: 'Version 1.0',
    date: 'Jan 1, 2023',
    text: 'We collect your name, contact details, and prayer requests to provide pastoral care. We do not share your information with third parties.',
  },
  {
    id: 'v1.1',
    label: 'Version 1.1',
    date: 'Jan 1, 2024',
    text: 'We collect your name, contact details, prayer requests, and technical data such as device and browser information to provide pastoral care and improve our website. We do not sell your information, and we only share it with third parties as required by law or with your consent, in compliance with GDPR and CCPA.',
  },
];

const PRIVACY_FAQ = [
  { id: 'sell', q: 'Do you sell my personal information?', a: 'No. We never sell your personal information to third parties, and we never will.' },
  { id: 'delete', q: 'How do I request my data be deleted?', a: 'Sign in and visit your account Settings page to request deletion, or email our privacy team directly — see the contact details below.' },
  { id: 'cookies', q: 'Does this site use cookies?', a: 'We use only the minimum technical cookies needed for the site to function (like keeping you signed in) — no third-party ad-tracking cookies.' },
  { id: 'children', q: 'Do you collect information from children?', a: 'Information about minors (e.g. for children\'s ministry registration) is collected only with parental consent and used solely for ministry purposes.' },
];

const GLANCE = [
  'We never sell your personal information',
  'You control your data — access, correct, or request deletion anytime',
  'Church communications only with your consent',
  'Strong security measures protect your information',
  'GDPR and CCPA compliant data handling',
];

const COLLECTION_CATEGORIES = [
  { icon: Users, title: 'Personal Information', items: ['Name and contact details', 'Email address and phone number', 'Mailing address (if provided)', 'Emergency contact information'] },
  { icon: Heart, title: 'Ministry Information', items: ['Prayer requests and testimonies', 'Event registration and attendance', 'Volunteer preferences and skills', 'Ministry participation records'] },
  { icon: Laptop, title: 'Technical Data', items: ['Website usage analytics', 'Device and browser information', 'IP address and location data', 'Cookies and tracking preferences'] },
  { icon: DollarSign, title: 'Financial Information', items: ['Donation records and receipts', 'Payment method details (encrypted)', 'Giving preferences and history', 'Tax-deductible contribution records'] },
];

const USES = [
  { title: 'Ministry Services', description: 'Provide pastoral care, prayer support, and spiritual guidance to our congregation members.' },
  { title: 'Communications', description: 'Send church announcements, event invitations, and spiritual encouragement (with your consent).' },
  { title: 'Administrative Purposes', description: 'Maintain membership records, process donations, and fulfill legal obligations as a religious organization.' },
];

const RIGHTS = [
  { icon: Eye, title: 'Access Your Data', description: 'Request a copy of all personal information we have about you' },
  { icon: Pencil, title: 'Correct Information', description: 'Update or correct any inaccurate personal information' },
  { icon: Trash2, title: 'Delete Your Data', description: 'Request permanent deletion of your personal information' },
  { icon: Download, title: 'Download Data', description: 'Export your data in a portable, machine-readable format' },
  { icon: BellOff, title: 'Opt-Out', description: 'Unsubscribe from communications and marketing materials' },
  { icon: SlidersHorizontal, title: 'Control Processing', description: 'Restrict how we process your personal information' },
];

const SECURITY = [
  'SSL/TLS encryption for all data transmission',
  'Regular security audits and updates',
  'Access controls and authentication',
  'Secure backup and recovery systems',
  'Incident response and breach notification',
];

export default function PrivacyPolicy() {
  return (
    <div>
      <PageHero
        icon={<Shield />}
        eyebrow={`Effective Jan 1, 2024 · Last updated ${new Date().toLocaleDateString()}`}
        title="Privacy Policy"
        description="Your privacy and data protection rights"
      />

      <Section spacing="lg">
        <Container size="md">
          <div className="mb-6 flex justify-end no-print">
            <PrintButton label="Print / Save as PDF" />
          </div>

          <Card className="mb-10 border-l-4 border-l-accent">
            <h2 className="mb-3 flex items-center gap-2 text-title-lg text-foreground">
              <ShieldCheck className="h-5 w-5 text-accent" /> Privacy at a Glance (Plain-Language Summary)
            </h2>
            <ul className="space-y-2">
              {GLANCE.map((item) => (
                <li key={item} className="flex items-start gap-2 text-body-sm text-foreground-muted">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {item}
                </li>
              ))}
            </ul>
          </Card>

          <div className="mb-10">
            <h2 className="mb-6 text-headline-sm text-foreground">Information We Collect</h2>
            <Grid cols={2} gap={4}>
              {COLLECTION_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Card key={cat.title} className="bg-surface">
                    <h3 className="mb-3 flex items-center gap-2 text-title-sm text-foreground">
                      <Icon className="h-4 w-4 text-accent" /> {cat.title}
                    </h3>
                    <ul className="space-y-1 text-body-sm text-foreground-muted">
                      {cat.items.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </Card>
                );
              })}
            </Grid>
          </div>

          <div className="mb-10">
            <h2 className="mb-6 text-headline-sm text-foreground">How We Use Your Information</h2>
            <div className="space-y-3">
              {USES.map((use) => (
                <div key={use.title} className="flex items-start gap-4 rounded-lg border border-border bg-surface p-4">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-title-sm text-foreground">{use.title}</h3>
                    <p className="mt-0.5 text-body-sm text-foreground-muted">{use.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="mb-6 text-headline-sm text-foreground">Your Privacy Rights</h2>
            <Card className="bg-surface">
              <Grid cols={2} gap={4}>
                {RIGHTS.map((right) => {
                  const Icon = right.icon;
                  return (
                    <div key={right.title} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-subtle">
                        <Icon className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-body-sm font-semibold text-foreground">{right.title}</h3>
                        <p className="text-caption text-foreground-subtle">{right.description}</p>
                      </div>
                    </div>
                  );
                })}
              </Grid>
            </Card>
          </div>

          <PolicyVersionDiff versions={POLICY_VERSIONS} clauseLabel="Information We Collect" />

          <div className="mb-10">
            <h2 className="mb-6 text-headline-sm text-foreground">Privacy FAQ</h2>
            <Card className="bg-surface">
              <Accordion type="single">
                {PRIVACY_FAQ.map((item) => (
                  <AccordionItem key={item.id} id={item.id} title={item.q}>{item.a}</AccordionItem>
                ))}
              </Accordion>
            </Card>
          </div>

          <Grid cols={2} gap={6} className="mb-10">
            <Card className="bg-danger-subtle">
              <h3 className="mb-3 flex items-center gap-2 text-title-md text-foreground">
                <Lock className="h-5 w-5 text-danger" /> Data Security
              </h3>
              <ul className="space-y-1.5 text-body-sm text-foreground-muted">
                {SECURITY.map((item) => <li key={item}>🔒 {item}</li>)}
              </ul>
            </Card>
            <Card className="bg-success-subtle">
              <h3 className="mb-3 flex items-center gap-2 text-title-md text-foreground">
                <Mail className="h-5 w-5 text-success" /> Contact Our Privacy Team
              </h3>
              <div className="space-y-2 text-body-sm text-foreground-muted">
                <p><span className="font-medium text-foreground">Email:</span> <a href="mailto:privacy@salemprimitivebaptist.org" className="text-accent hover:underline">privacy@salemprimitivebaptist.org</a></p>
                <p><span className="font-medium text-foreground">Phone:</span> +91 94871 62485</p>
                <p><span className="font-medium text-foreground">Address:</span> 223/838, Near north post office, Kannangurichi main road, Chinnathirupathi, Salem TN, PIN- 636008</p>
              </div>
            </Card>
          </Grid>

          <Card className="flex flex-wrap items-center justify-between gap-4 bg-surface">
            <div>
              <h4 className="text-title-sm text-foreground">Questions about this policy?</h4>
              <p className="text-body-sm text-foreground-muted">We&apos;re here to help you understand your privacy rights.</p>
            </div>
            <LinkButton href="/terms" size="sm">Terms of Service</LinkButton>
          </Card>
        </Container>
      </Section>
    </div>
  );
}
