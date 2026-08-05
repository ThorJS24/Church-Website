import { FileText, Info, Check, X, ShieldCheck, HandHeart, Gavel, Scale, Mail } from 'lucide-react';
import { PageHero } from '@/components/ui-legacy/PageHero';
import { Section } from '@/components/ui-legacy/Section';
import { Container } from '@/components/ui-legacy/Container';
import { Card } from '@/components/ui-legacy/Card';
import { Grid } from '@/components/ui-legacy/Grid';
import { LinkButton } from '@/components/ui-legacy/Button';
import { Accordion, AccordionItem } from '@/components/ui-legacy/Accordion';
import { PrintButton } from '@/components/PrintButton';
import { PolicyVersionDiff, type PolicyVersion } from '@/components/PolicyVersionDiff';

const POLICY_VERSIONS: PolicyVersion[] = [
  {
    id: 'v1.0',
    label: 'Version 1.0',
    date: 'Jan 1, 2023',
    text: 'Donations made through this site are voluntary and go toward supporting our ministry.',
  },
  {
    id: 'v1.1',
    label: 'Version 1.1',
    date: 'Jan 1, 2024',
    text: 'Donations made through this site are voluntary, non-refundable, and go toward supporting our ministry and community outreach. Tax-deductible receipts are provided upon request.',
  },
];

const TERMS_FAQ = [
  { id: 'refund', q: 'Are donations refundable?', a: 'Donations are voluntary and generally non-refundable. If you believe a donation was made in error, please contact us and we\'ll review it.' },
  { id: 'account', q: 'What happens if I violate these terms?', a: 'Violations may result in a warning, content removal, or in serious cases, account suspension, at the discretion of church staff.' },
  { id: 'content', q: 'Who owns content I post (prayer requests, testimonies)?', a: 'You retain ownership of what you post. By posting publicly, you grant us permission to display it on the site as part of the relevant feature (e.g. the public prayer wall).' },
  { id: 'changes', q: 'Will I be notified if these terms change?', a: 'The "Last updated" date at the top of this page reflects the most recent revision. Material changes will also be announced through our regular communication channels.' },
];

const SUMMARY = [
  'Respectful, Christian community standards',
  'Personal, non-commercial use permitted',
  'User-generated content must be appropriate',
  'Account security is your responsibility',
  'Donations are voluntary and non-refundable',
];

const ENCOURAGED = ['Respectful Christian fellowship', 'Constructive prayer requests', 'Encouraging testimonies', 'Appropriate event participation', 'Helpful community engagement', 'Biblical discussion and study'];
const PROHIBITED = ['Offensive or inappropriate content', 'Harassment or discrimination', 'Spam or commercial promotion', 'False or misleading information', 'Unauthorized system access', 'Copyright infringement'];

const RESPONSIBILITIES = [
  { title: 'Account Security', description: 'Maintain secure passwords, protect your login credentials, and notify us of any unauthorized access to your account.' },
  { title: 'Content Accuracy', description: 'Provide truthful, accurate information in your profile, prayer requests, and all communications with the church community.' },
  { title: 'Respectful Communication', description: 'Communicate with kindness, respect, and Christian love in all interactions with fellow members and church staff.' },
];

const SERVICE_TERMS = [
  { icon: HandHeart, title: 'Donations', description: 'Voluntary, secure, and tax-deductible. All donations support our ministry and community outreach.' },
  { icon: ShieldCheck, title: 'Privacy', description: 'Your personal information is protected according to our comprehensive Privacy Policy.' },
  { icon: FileText, title: 'Content', description: 'All content is provided for personal, non-commercial use under our usage license.' },
];

const LEGAL_NOTES = [
  'Governed by state and federal law',
  'Terms may be updated periodically',
  'Violations may result in account suspension',
  'Limited liability and disclaimers apply',
  'External links not under our control',
];

export default function TermsOfService() {
  return (
    <div>
      <PageHero
        icon={<Gavel />}
        eyebrow={`Effective Jan 1, 2024 · Last updated ${new Date().toLocaleDateString()}`}
        title="Terms of Service"
        description="Community guidelines and usage terms"
      />

      <Section spacing="lg">
        <Container size="md">
          <div className="mb-6 flex justify-end no-print">
            <PrintButton label="Print / Save as PDF" />
          </div>

          <Card className="mb-10 border-l-4 border-l-accent">
            <h2 className="mb-3 flex items-center gap-2 text-title-lg text-foreground">
              <Info className="h-5 w-5 text-accent" /> Terms Summary (Plain-Language)
            </h2>
            <ul className="space-y-2">
              {SUMMARY.map((item) => (
                <li key={item} className="flex items-start gap-2 text-body-sm text-foreground-muted">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {item}
                </li>
              ))}
            </ul>
          </Card>

          <div className="mb-10">
            <h2 className="mb-6 text-headline-sm text-foreground">Community Standards</h2>
            <Grid cols={2} gap={6}>
              <Card className="bg-success-subtle">
                <h3 className="mb-3 flex items-center gap-2 text-title-sm text-foreground"><Check className="h-4 w-4 text-success" /> Encouraged Behavior</h3>
                <ul className="space-y-1.5 text-body-sm text-foreground-muted">{ENCOURAGED.map((item) => <li key={item}>• {item}</li>)}</ul>
              </Card>
              <Card className="bg-danger-subtle">
                <h3 className="mb-3 flex items-center gap-2 text-title-sm text-foreground"><X className="h-4 w-4 text-danger" /> Prohibited Behavior</h3>
                <ul className="space-y-1.5 text-body-sm text-foreground-muted">{PROHIBITED.map((item) => <li key={item}>• {item}</li>)}</ul>
              </Card>
            </Grid>
          </div>

          <div className="mb-10">
            <h2 className="mb-6 text-headline-sm text-foreground">Your Responsibilities</h2>
            <div className="space-y-3">
              {RESPONSIBILITIES.map((item) => (
                <div key={item.title} className="flex items-start gap-4 rounded-lg border border-border bg-surface p-4">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Check className="h-3.5 w-3.5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-title-sm text-foreground">{item.title}</h3>
                    <p className="mt-0.5 text-body-sm text-foreground-muted">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="mb-6 text-headline-sm text-foreground">Service Terms</h2>
            <Card className="bg-surface">
              <Grid cols={3} gap={6}>
                {SERVICE_TERMS.map((term) => {
                  const Icon = term.icon;
                  return (
                    <div key={term.title} className="text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle">
                        <Icon className="h-6 w-6 text-accent" />
                      </div>
                      <h3 className="text-title-sm text-foreground">{term.title}</h3>
                      <p className="mt-1 text-body-sm text-foreground-muted">{term.description}</p>
                    </div>
                  );
                })}
              </Grid>
            </Card>
          </div>

          <PolicyVersionDiff versions={POLICY_VERSIONS} clauseLabel="Donations" />

          <div className="mb-10">
            <h2 className="mb-6 text-headline-sm text-foreground">Terms FAQ</h2>
            <Card className="bg-surface">
              <Accordion type="single">
                {TERMS_FAQ.map((item) => (
                  <AccordionItem key={item.id} id={item.id} title={item.q}>{item.a}</AccordionItem>
                ))}
              </Accordion>
            </Card>
          </div>

          <Grid cols={2} gap={6} className="mb-10">
            <Card className="bg-surface">
              <h3 className="mb-3 flex items-center gap-2 text-title-md text-foreground"><Scale className="h-5 w-5 text-foreground-muted" /> Legal Information</h3>
              <ul className="space-y-1.5 text-body-sm text-foreground-muted">{LEGAL_NOTES.map((item) => <li key={item}>⚖️ {item}</li>)}</ul>
            </Card>
            <Card className="bg-accent-subtle">
              <h3 className="mb-3 flex items-center gap-2 text-title-md text-foreground"><Mail className="h-5 w-5 text-accent" /> Questions or Concerns?</h3>
              <div className="space-y-2 text-body-sm text-foreground-muted">
                <p><span className="font-medium text-foreground">Email:</span> <a href="mailto:legal@salemprimitivebaptist.org" className="text-accent hover:underline">legal@salemprimitivebaptist.org</a></p>
                <p><span className="font-medium text-foreground">Phone:</span> +91 94871 62485</p>
                <p><span className="font-medium text-foreground">Address:</span> 223/838, Near north post office, Kannangurichi main road, Chinnathirupathi, Salem TN, PIN- 636008</p>
              </div>
            </Card>
          </Grid>

          <Card className="flex flex-wrap items-center justify-between gap-4 bg-surface">
            <div>
              <h4 className="text-title-sm text-foreground">Agreement Acceptance</h4>
              <p className="text-body-sm text-foreground-muted">By using our website, you agree to these terms and our Privacy Policy.</p>
            </div>
            <LinkButton href="/privacy" size="sm">Privacy Policy</LinkButton>
          </Card>
        </Container>
      </Section>
    </div>
  );
}
