import { FileText, Info, Check, X, ShieldCheck, HandHeart, Gavel, Scale, Mail } from 'lucide-react';
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

const TOC = [
  { id: 'summary', label: 'Summary' },
  { id: 'standards', label: 'Community Standards' },
  { id: 'responsibilities', label: 'Your Responsibilities' },
  { id: 'service-terms', label: 'Service Terms' },
  { id: 'history', label: 'Version History' },
  { id: 'faq', label: 'FAQ' },
  { id: 'legal', label: 'Legal & Contact' },
];

export default function TermsOfService() {
  return (
    <div>
      <PageHero
        icon={<Gavel />}
        eyebrow={`Effective Jan 1, 2024 · Last updated ${POLICY_VERSIONS[POLICY_VERSIONS.length - 1].date}`}
        title="Terms of Service"
        description="Community guidelines and usage terms"
      />

      {/* Reading-focused document layout: a sticky table of contents beside
          a single flowing prose column — headings and lists, not a stack of
          colored info-cards — the way a legal document is actually read. */}
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

              <section id="summary" className="mb-12 scroll-mt-28">
                <h2 className="flex items-center gap-2 font-serif text-headline-sm text-foreground"><Info className="h-5 w-5 text-accent" /> Summary (Plain-Language)</h2>
                <ul className="mt-4 space-y-2">
                  {SUMMARY.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-body-md text-foreground-muted">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-success" /> {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section id="standards" className="mb-12 scroll-mt-28">
                <h2 className="font-serif text-headline-sm text-foreground">Community Standards</h2>
                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-title-sm text-foreground"><Check className="h-4 w-4 text-success" /> Encouraged</h3>
                    <ul className="space-y-1.5 text-body-sm text-foreground-muted">{ENCOURAGED.map((item) => <li key={item}>• {item}</li>)}</ul>
                  </div>
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-title-sm text-foreground"><X className="h-4 w-4 text-danger" /> Prohibited</h3>
                    <ul className="space-y-1.5 text-body-sm text-foreground-muted">{PROHIBITED.map((item) => <li key={item}>• {item}</li>)}</ul>
                  </div>
                </div>
              </section>

              <section id="responsibilities" className="mb-12 scroll-mt-28">
                <h2 className="font-serif text-headline-sm text-foreground">Your Responsibilities</h2>
                <div className="mt-4 divide-y divide-border border-y border-border">
                  {RESPONSIBILITIES.map((item) => (
                    <div key={item.title} className="py-4">
                      <h3 className="text-title-sm text-foreground">{item.title}</h3>
                      <p className="mt-1 text-body-sm text-foreground-muted">{item.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="service-terms" className="mb-12 scroll-mt-28">
                <h2 className="font-serif text-headline-sm text-foreground">Service Terms</h2>
                <div className="mt-4 space-y-5">
                  {SERVICE_TERMS.map((term) => {
                    const Icon = term.icon;
                    return (
                      <div key={term.title} className="flex items-start gap-3">
                        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                        <div>
                          <h3 className="text-title-sm text-foreground">{term.title}</h3>
                          <p className="mt-0.5 text-body-sm text-foreground-muted">{term.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section id="history" className="mb-12 scroll-mt-28">
                <h2 className="mb-4 font-serif text-headline-sm text-foreground">Version History</h2>
                <PolicyVersionDiff versions={POLICY_VERSIONS} clauseLabel="Donations" />
              </section>

              <section id="faq" className="mb-12 scroll-mt-28">
                <h2 className="mb-4 font-serif text-headline-sm text-foreground">FAQ</h2>
                <Accordion type="single">
                  {TERMS_FAQ.map((item) => (
                    <AccordionItem key={item.id} id={item.id} title={item.q}>{item.a}</AccordionItem>
                  ))}
                </Accordion>
              </section>

              <section id="legal" className="mb-12 scroll-mt-28">
                <h2 className="font-serif text-headline-sm text-foreground">Legal & Contact</h2>
                <div className="mt-4 grid gap-8 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-title-sm text-foreground"><Scale className="h-4 w-4 text-foreground-muted" /> Legal Information</h3>
                    <ul className="space-y-1.5 text-body-sm text-foreground-muted">{LEGAL_NOTES.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-title-sm text-foreground"><Mail className="h-4 w-4 text-accent" /> Questions or Concerns?</h3>
                    <div className="space-y-1.5 text-body-sm text-foreground-muted">
                      <p><span className="font-medium text-foreground">Email:</span> <a href="mailto:legal@salemprimitivebaptist.org" className="text-accent hover:underline dark:text-accent-hover">legal@salemprimitivebaptist.org</a></p>
                      <p><span className="font-medium text-foreground">Phone:</span> +91 94871 62485</p>
                      <p><span className="font-medium text-foreground">Address:</span> 223/838, Near north post office, Kannangurichi main road, Chinnathirupathi, Salem TN, PIN- 636008</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <div>
                  <h4 className="text-title-sm text-foreground">Agreement Acceptance</h4>
                  <p className="text-body-sm text-foreground-muted">By using our website, you agree to these terms and our Privacy Policy.</p>
                </div>
                <LinkButton href="/privacy" size="sm">Privacy Policy</LinkButton>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
