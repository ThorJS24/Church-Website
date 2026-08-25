import {
  Shield, ShieldCheck, Users, Heart, Laptop, DollarSign, Check, Eye, Pencil, Trash2,
  Download, BellOff, SlidersHorizontal, Lock, Mail,
} from 'lucide-react';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
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

const TOC = [
  { id: 'glance', label: 'Privacy at a Glance' },
  { id: 'collection', label: 'Information We Collect' },
  { id: 'uses', label: 'How We Use It' },
  { id: 'rights', label: 'Your Privacy Rights' },
  { id: 'history', label: 'Version History' },
  { id: 'faq', label: 'FAQ' },
  { id: 'security', label: 'Security & Contact' },
];

export default function PrivacyPolicy() {
  return (
    <div>
      <PageHero
        icon={<Shield />}
        eyebrow={`Effective Jan 1, 2024 · Last updated ${POLICY_VERSIONS[POLICY_VERSIONS.length - 1].date}`}
        title="Privacy Policy"
        description="Your privacy and data protection rights"
      />

      {/* Same reading-focused document layout as /terms — a sticky table of
          contents beside a flowing prose column, not a grid of colored
          info-cards. */}
      <Section spacing="lg">
        <Container size="lg">
          <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
            <aside className="no-print hidden lg:block">
              <nav className="sticky top-28 space-y-1">
                {TOC.map((item) => (
                  <a key={item.id} href={`#${item.id}`} className="block rounded-md px-3 py-1.5 text-body-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground">
                    {item.label}
                  </a>
                ))}
              </nav>
            </aside>

            <div className="max-w-2xl">
              <div className="mb-8 flex justify-end no-print">
                <PrintButton label="Print / Save as PDF" />
              </div>

              <section id="glance" className="mb-12 scroll-mt-28">
                <h2 className="flex items-center gap-2 font-serif text-headline-sm text-foreground"><ShieldCheck className="h-5 w-5 text-accent" /> Privacy at a Glance</h2>
                <ul className="mt-4 space-y-2">
                  {GLANCE.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-body-md text-foreground-muted">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-success" /> {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section id="collection" className="mb-12 scroll-mt-28">
                <h2 className="font-serif text-headline-sm text-foreground">Information We Collect</h2>
                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  {COLLECTION_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <div key={cat.title}>
                        <h3 className="mb-2 flex items-center gap-2 text-title-sm text-foreground">
                          <Icon className="h-4 w-4 text-accent" /> {cat.title}
                        </h3>
                        <ul className="space-y-1 text-body-sm text-foreground-muted">
                          {cat.items.map((item) => <li key={item}>• {item}</li>)}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section id="uses" className="mb-12 scroll-mt-28">
                <h2 className="font-serif text-headline-sm text-foreground">How We Use Your Information</h2>
                <div className="mt-4 divide-y divide-border border-y border-border">
                  {USES.map((use) => (
                    <div key={use.title} className="py-4">
                      <h3 className="text-title-sm text-foreground">{use.title}</h3>
                      <p className="mt-1 text-body-sm text-foreground-muted">{use.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="rights" className="mb-12 scroll-mt-28">
                <h2 className="font-serif text-headline-sm text-foreground">Your Privacy Rights</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {RIGHTS.map((right) => {
                    const Icon = right.icon;
                    return (
                      <div key={right.title} className="flex items-start gap-3">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        <div>
                          <h3 className="text-body-sm font-semibold text-foreground">{right.title}</h3>
                          <p className="text-caption text-foreground-subtle">{right.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section id="history" className="mb-12 scroll-mt-28">
                <h2 className="mb-4 font-serif text-headline-sm text-foreground">Version History</h2>
                <PolicyVersionDiff versions={POLICY_VERSIONS} clauseLabel="Information We Collect" />
              </section>

              <section id="faq" className="mb-12 scroll-mt-28">
                <h2 className="mb-4 font-serif text-headline-sm text-foreground">FAQ</h2>
                <Accordion type="single">
                  {PRIVACY_FAQ.map((item) => (
                    <AccordionItem key={item.id} id={item.id} title={item.q}>{item.a}</AccordionItem>
                  ))}
                </Accordion>
              </section>

              <section id="security" className="mb-12 scroll-mt-28">
                <h2 className="font-serif text-headline-sm text-foreground">Security &amp; Contact</h2>
                <div className="mt-4 grid gap-8 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-title-sm text-foreground"><Lock className="h-4 w-4 text-danger" /> Data Security</h3>
                    <ul className="space-y-1.5 text-body-sm text-foreground-muted">{SECURITY.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-title-sm text-foreground"><Mail className="h-4 w-4 text-success" /> Contact Our Privacy Team</h3>
                    <div className="space-y-1.5 text-body-sm text-foreground-muted">
                      <p><span className="font-medium text-foreground">Email:</span> <a href="mailto:privacy@salemprimitivebaptist.org" className="text-accent hover:underline dark:text-accent-hover">privacy@salemprimitivebaptist.org</a></p>
                      <p><span className="font-medium text-foreground">Phone:</span> +91 94871 62485</p>
                      <p><span className="font-medium text-foreground">Address:</span> 223/838, Near north post office, Kannangurichi main road, Chinnathirupathi, Salem TN, PIN- 636008</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <div>
                  <h4 className="text-title-sm text-foreground">Questions about this policy?</h4>
                  <p className="text-body-sm text-foreground-muted">We&apos;re here to help you understand your privacy rights.</p>
                </div>
                <LinkButton href="/terms" size="sm">Terms of Service</LinkButton>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
