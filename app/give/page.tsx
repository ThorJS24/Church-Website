'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Building, Users, Globe, BookOpen, Mail, Landmark, Download, ScrollText, Check } from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/lib/content';
import { PageHero } from '@/components/ui-legacy/PageHero';
import { Section } from '@/components/ui-legacy/Section';
import { Container } from '@/components/ui-legacy/Container';
import { Card } from '@/components/ui-legacy/Card';
import { Grid } from '@/components/ui-legacy/Grid';
import { LinkButton } from '@/components/ui-legacy/Button';
import { Accordion, AccordionItem } from '@/components/ui-legacy/Accordion';
import { cn } from '@/lib/cn';

const givingFunds = [
  { id: 'tithe', title: 'Tithe & Offerings', description: 'Regular giving to support our church ministries and operations' },
  { id: 'missions', title: 'Missions Fund', description: 'Support our global mission work and local outreach programs' },
  { id: 'building', title: 'Building Fund', description: 'Help us maintain and improve our church facilities' },
  { id: 'special', title: 'Special Projects', description: 'Support specific ministry projects and community initiatives' },
];

const GIVING_FAQ = [
  { id: 'receipt', q: 'Will I receive a giving receipt?', a: 'Yes — contact the church office with your gift details and we\'ll provide a receipt for your records, including for tax purposes.' },
  { id: 'recurring', q: 'Can I set up recurring giving?', a: 'Yes, through a standing bank transfer instruction with your bank, or by arranging a recurring in-person gift with the church office. Ask us for guidance when you reach out.' },
  { id: 'designate', q: 'How do I make sure my gift goes to a specific fund?', a: 'Select a fund below to see the name to reference, then mention it when you give in person or note it on your bank transfer.' },
  { id: 'method', q: 'What\'s the difference between bank transfer and giving in person?', a: 'Both are fully counted the same way — bank transfer is convenient between services, while giving in person lets you use envelopes the office already tracks. Choose whichever is easiest for you.' },
  { id: 'legacy', q: 'What is planned or legacy giving?', a: '' },
];

const DEFAULT_IMPACT = [
  { icon: Users, title: 'Community Outreach', description: 'Supporting families in need through food drives, counseling, and assistance programs.', amount: '₹2,50,000' },
  { icon: Globe, title: 'Global Missions', description: 'Spreading the Gospel worldwide through missionary support and evangelism.', amount: '₹5,00,000' },
  { icon: BookOpen, title: 'Education Ministry', description: 'Providing quality Christian education and scholarship programs.', amount: '₹3,00,000' },
  { icon: Heart, title: 'Youth Programs', description: 'Investing in the next generation through camps, mentorship, and activities.', amount: '₹1,50,000' },
];

const WHY_GIVE = [
  { icon: Heart, title: 'Worship Through Giving', description: 'Giving is an act of worship that acknowledges God as the source of all blessings.' },
  { icon: Users, title: 'Support Our Mission', description: 'Your gifts enable us to serve our community and spread the Gospel effectively.' },
  { icon: Globe, title: 'Make a Difference', description: "Together, we can transform lives and communities through God's love and grace." },
];

export default function GivePage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [impactData, setImpactData] = useState(DEFAULT_IMPACT);
  const [selectedFund, setSelectedFund] = useState<string | null>(null);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (!data) return;
        setSiteSettings(data);
        if (data.givingImpact) {
          setImpactData([
            { ...DEFAULT_IMPACT[0], amount: data.givingImpact.communityOutreach || '∞' },
            { ...DEFAULT_IMPACT[1], amount: data.givingImpact.globalMissions || '∞' },
            { ...DEFAULT_IMPACT[2], amount: data.givingImpact.educationMinistry || '∞' },
            { ...DEFAULT_IMPACT[3], amount: data.givingImpact.youthPrograms || '∞' },
          ]);
        }
      })
      .catch((error) => console.error('Error fetching site settings:', error));
  }, []);

  return (
    <div>
      <PageHero icon={<Heart />} eyebrow="Generosity" title="Give with Joy" description="Your generosity helps us serve our community and spread God's love" />

      <Section spacing="lg">
        <Container size="md">
          <div className="mb-10 text-center">
            <h2 className="text-headline-md text-foreground">Ways to Give</h2>
            <p className="mt-2 text-body-md text-foreground-muted">Online giving isn&apos;t available on the website yet. Here&apos;s how to give today:</p>
          </div>

          <Grid cols={3} gap={6} className="mb-12">
            <Card variant="raised" padding="lg">
              <Landmark className="mb-4 h-9 w-9 text-accent" />
              <h3 className="text-title-md text-foreground">Bank Transfer</h3>
              <p className="mt-2 text-body-sm text-foreground-muted">
                {/* TODO (church staff): replace this with the church's real bank account
                    details (account name, number, IFSC/routing, bank branch) once provided.
                    Do not publish placeholder account numbers in the meantime. */}
                Account details are available directly from the church office — please{' '}
                {siteSettings?.phoneNumber ? (
                  <>call <a href={`tel:${siteSettings.phoneNumber}`} className="text-accent underline">{siteSettings.phoneNumber}</a> or </>
                ) : null}
                <Link href="/contact" className="text-accent underline">contact us</Link> and we&apos;ll share transfer instructions.
              </p>
            </Card>

            <Card variant="raised" padding="lg">
              <Building className="mb-4 h-9 w-9 text-accent" />
              <h3 className="text-title-md text-foreground">In Person</h3>
              <p className="mt-2 text-body-sm text-foreground-muted">Give during any of our worship services — see our current service times for when to join us.</p>
              <Link href="/services" className="mt-3 inline-block text-body-sm font-semibold text-accent hover:underline">View Service Times →</Link>
            </Card>

            <Card variant="raised" padding="lg">
              <Mail className="mb-4 h-9 w-9 text-accent" />
              <h3 className="text-title-md text-foreground">Questions?</h3>
              <p className="mt-2 text-body-sm text-foreground-muted">Reach out about recurring gifts, planned/legacy giving, or designating a gift to a specific fund below.</p>
              <Link href="/contact" className="mt-3 inline-block text-body-sm font-semibold text-accent hover:underline">Contact Us →</Link>
            </Card>
          </Grid>

          <div>
            <h3 className="mb-2 text-center text-title-lg text-foreground">You Can Designate Your Gift To</h3>
            <p className="mb-6 text-center text-body-sm text-foreground-muted">Select a fund to see what to mention when you give.</p>
            <Grid cols={2} gap={4}>
              {givingFunds.map((fund) => {
                const isSelected = selectedFund === fund.id;
                return (
                  <Card
                    key={fund.id}
                    variant={isSelected ? 'raised' : 'flat'}
                    className={cn('cursor-pointer transition-colors', isSelected && 'border-2 border-accent')}
                    onClick={() => setSelectedFund(isSelected ? null : fund.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-title-sm text-foreground">{fund.title}</h4>
                        <p className="mt-1 text-body-sm text-foreground-muted">{fund.description}</p>
                      </div>
                      {isSelected && <Check className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />}
                    </div>
                  </Card>
                );
              })}
            </Grid>
            {selectedFund ? (
              <div className="mt-6 rounded-lg border border-accent/30 bg-accent-subtle p-4 text-center">
                <p className="text-body-sm text-foreground">
                  When you give, mention <strong>&ldquo;{givingFunds.find((f) => f.id === selectedFund)?.title}&rdquo;</strong> so your gift is designated correctly.
                </p>
              </div>
            ) : (
              <p className="mt-6 text-center text-body-sm text-foreground-subtle">
                Just let us know which fund you&apos;d like to support when you give in person or transfer a gift.
              </p>
            )}
          </div>
        </Container>
      </Section>

      <Section spacing="lg" className="bg-surface">
        <div className="mb-10 text-center">
          <h2 className="text-headline-md text-foreground">Your Impact</h2>
          <p className="mt-2 text-body-md text-foreground-muted">See how your generosity is making a difference in our community</p>
        </div>
        <Grid cols={4} gap={6}>
          {impactData.map((area) => (
            <Card key={area.title} className="text-center">
              <area.icon className="mx-auto mb-4 h-10 w-10 text-accent" />
              <h3 className="text-title-md text-foreground">{area.title}</h3>
              <p className="mt-2 text-body-sm text-foreground-muted">{area.description}</p>
              <div className="mt-4 text-headline-sm text-accent">{area.amount}</div>
              <div className="text-caption text-foreground-subtle">{area.amount !== '∞' ? 'raised this year' : "God's provision"}</div>
            </Card>
          ))}
        </Grid>
      </Section>

      {(() => {
        const breakdown = [
          { label: 'Ministry', value: siteSettings?.givingTransparencyMinistryPercent },
          { label: 'Operations', value: siteSettings?.givingTransparencyOperationsPercent },
          { label: 'Missions', value: siteSettings?.givingTransparencyMissionsPercent },
          { label: 'Building', value: siteSettings?.givingTransparencyBuildingPercent },
        ].filter((item) => item.value);
        if (breakdown.length === 0 && !siteSettings?.givingTransparencyReportUrl && !siteSettings?.givingTransparencyNote) return null;
        return (
          <Section spacing="lg">
            <Container size="md">
              <div className="mb-8 text-center">
                <h2 className="text-headline-md text-foreground">Transparency Report</h2>
                <p className="mt-2 text-body-md text-foreground-muted">A look at how gifts are stewarded</p>
              </div>
              <Card variant="raised" padding="lg">
                {breakdown.length > 0 && (
                  <div className="space-y-4">
                    {breakdown.map((item) => (
                      <div key={item.label}>
                        <div className="mb-1 flex items-center justify-between text-body-sm">
                          <span className="font-medium text-foreground">{item.label}</span>
                          <span className="text-foreground-muted">{item.value}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-active">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, Number(item.value) || 0)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {siteSettings?.givingTransparencyNote && (
                  <p className={cn('text-body-sm text-foreground-muted', breakdown.length > 0 && 'mt-6')}>{siteSettings.givingTransparencyNote}</p>
                )}
                {siteSettings?.givingTransparencyReportUrl && (
                  <LinkButton
                    href={siteSettings.givingTransparencyReportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    leftIcon={<Download className="h-4 w-4" />}
                    className="mt-6"
                  >
                    Download Annual Report
                  </LinkButton>
                )}
              </Card>
            </Container>
          </Section>
        );
      })()}

      <Section spacing="lg">
        <Container size="md" className="text-center">
          <h2 className="text-headline-md text-foreground">Why We Give</h2>
          <Grid cols={3} gap={6} className="my-10">
            {WHY_GIVE.map((item) => (
              <div key={item.title}>
                <item.icon className="mx-auto mb-4 h-9 w-9 text-accent" />
                <h3 className="text-title-md text-foreground">{item.title}</h3>
                <p className="mt-2 text-body-sm text-foreground-muted">{item.description}</p>
              </div>
            ))}
          </Grid>
          <blockquote className="text-body-lg italic text-foreground">
            &quot;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&quot;
          </blockquote>
          <cite className="mt-3 block text-body-sm font-semibold text-accent">2 Corinthians 9:7</cite>
        </Container>
      </Section>

      <Section spacing="lg" className="bg-surface">
        <Container size="sm">
          <div className="mb-8 text-center">
            <h2 className="text-headline-md text-foreground">Giving FAQ</h2>
          </div>
          <Card variant="raised" padding="lg">
            <Accordion type="single">
              {GIVING_FAQ.map((item) => (
                <AccordionItem key={item.id} id={item.id} title={item.q}>
                  {item.id === 'legacy' ? (
                    <>
                      A way to include the church in your will, trust, or beneficiary designations. See our{' '}
                      <Link href="/give/legacy" className="text-accent underline">Legacy Giving page</Link> for details.
                    </>
                  ) : (
                    item.a
                  )}
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container size="sm">
          <Card variant="outline" padding="lg" className="text-center">
            <ScrollText className="mx-auto mb-4 h-9 w-9 text-accent" />
            <h2 className="text-title-lg text-foreground">Planned &amp; Legacy Giving</h2>
            <p className="mt-2 text-body-sm text-foreground-muted">Include the church in your will, trust, or estate plans to leave a lasting legacy of generosity.</p>
            <LinkButton href="/give/legacy" variant="outline" className="mt-5">Learn About Legacy Giving</LinkButton>
          </Card>
        </Container>
      </Section>

      <Section spacing="md" className="bg-accent text-center text-accent-foreground">
        <h2 className="text-headline-md">Questions About Giving?</h2>
        <p className="mt-3 text-body-lg opacity-90">We&apos;re here to help you with your generosity journey</p>
        <LinkButton href="/contact" variant="secondary" size="lg" className="mt-8">Contact Us</LinkButton>
      </Section>
    </div>
  );
}
