'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Building, Users, Globe, BookOpen, Mail, Landmark, Download, ScrollText, Check } from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/lib/content';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { LinkButton } from '@/components/ui/button';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

const givingFunds = [
  { id: 'tithe', titleKey: 'give.fund.tithe.title', descKey: 'give.fund.tithe.description' },
  { id: 'missions', titleKey: 'give.fund.missions.title', descKey: 'give.fund.missions.description' },
  { id: 'building', titleKey: 'give.fund.building.title', descKey: 'give.fund.building.description' },
  { id: 'special', titleKey: 'give.fund.special.title', descKey: 'give.fund.special.description' },
];

const GIVING_FAQ = [
  { id: 'receipt', qKey: 'give.faq.receipt.q', aKey: 'give.faq.receipt.a' },
  { id: 'recurring', qKey: 'give.faq.recurring.q', aKey: 'give.faq.recurring.a' },
  { id: 'designate', qKey: 'give.faq.designate.q', aKey: 'give.faq.designate.a' },
  { id: 'method', qKey: 'give.faq.method.q', aKey: 'give.faq.method.a' },
  { id: 'legacy', qKey: 'give.faq.legacy.q', aKey: null },
];

const DEFAULT_IMPACT = [
  { icon: Users, titleKey: 'give.impact.community.title', descKey: 'give.impact.community.description', amount: '₹2,50,000' },
  { icon: Globe, titleKey: 'give.impact.missions.title', descKey: 'give.impact.missions.description', amount: '₹5,00,000' },
  { icon: BookOpen, titleKey: 'give.impact.education.title', descKey: 'give.impact.education.description', amount: '₹3,00,000' },
  { icon: Heart, titleKey: 'give.impact.youth.title', descKey: 'give.impact.youth.description', amount: '₹1,50,000' },
];

const WHY_GIVE = [
  { icon: Heart, titleKey: 'give.why.worship.title', descKey: 'give.why.worship.description' },
  { icon: Users, titleKey: 'give.why.support.title', descKey: 'give.why.support.description' },
  { icon: Globe, titleKey: 'give.why.difference.title', descKey: 'give.why.difference.description' },
];

export default function GivePage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [impactData, setImpactData] = useState(DEFAULT_IMPACT);
  const [selectedFund, setSelectedFund] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const tamilFont = language === 'ta' ? 'font-tamil' : '';

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
      <PageHero icon={<Heart />} eyebrow={t('give.eyebrow')} title={t('give.title')} description={t('give.description')} />

      <Section spacing="lg">
        <Container size="md">
          <div className="mb-10 text-center">
            <h2 className={cn('text-headline-md text-foreground', tamilFont)}>{t('give.waysToGive')}</h2>
            <p className={cn('mt-2 text-body-md text-foreground-muted', tamilFont)}>{t('give.waysToGiveSubtitle')}</p>
          </div>

          <div className="relative mb-12">
            <div className="absolute left-6 top-6 bottom-6 hidden w-px bg-border sm:block" aria-hidden="true" />
            <div className="space-y-8">
              <div className="relative flex gap-5 sm:pl-0">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-subtle">
                  <Landmark className="h-5 w-5 text-accent" />
                </div>
                <div className="pt-1.5">
                  <h3 className={cn('text-title-md text-foreground', tamilFont)}>{t('give.bankTransferTitle')}</h3>
                  <p className={cn('mt-1.5 text-body-sm text-foreground-muted', tamilFont)}>
                    {/* TODO (church staff): replace this with the church's real bank account
                        details (account name, number, IFSC/routing, bank branch) once provided.
                        Do not publish placeholder account numbers in the meantime. */}
                    {t('give.bankTransferBodyPrefix')}{' '}
                    {siteSettings?.phoneNumber ? (
                      <>{t('give.call')} <a href={`tel:${siteSettings.phoneNumber}`} className="text-accent underline">{siteSettings.phoneNumber}</a> {t('give.or')} </>
                    ) : null}
                    <Link href="/contact" className="text-accent underline">{t('give.contactUs')}</Link> {t('give.bankTransferBodySuffix')}
                  </p>
                </div>
              </div>

              <div className="relative flex gap-5">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-subtle">
                  <Building className="h-5 w-5 text-accent" />
                </div>
                <div className="pt-1.5">
                  <h3 className={cn('text-title-md text-foreground', tamilFont)}>{t('give.inPersonTitle')}</h3>
                  <p className={cn('mt-1.5 text-body-sm text-foreground-muted', tamilFont)}>{t('give.inPersonBody')}</p>
                  <Link href="/services" className={cn('mt-1.5 inline-block text-body-sm font-semibold text-accent hover:underline dark:text-accent-hover', tamilFont)}>{t('give.viewServiceTimes')} →</Link>
                </div>
              </div>

              <div className="relative flex gap-5">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-subtle">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <div className="pt-1.5">
                  <h3 className={cn('text-title-md text-foreground', tamilFont)}>{t('give.questionsTitle')}</h3>
                  <p className={cn('mt-1.5 text-body-sm text-foreground-muted', tamilFont)}>{t('give.questionsBody')}</p>
                  <Link href="/contact" className={cn('mt-1.5 inline-block text-body-sm font-semibold text-accent hover:underline dark:text-accent-hover', tamilFont)}>{t('give.contactUsArrow')} →</Link>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className={cn('mb-2 text-center text-title-lg text-foreground', tamilFont)}>{t('give.designateHeading')}</h3>
            <p className={cn('mb-6 text-center text-body-sm text-foreground-muted', tamilFont)}>{t('give.designateSubtitle')}</p>
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
                        <h4 className={cn('text-title-sm text-foreground', tamilFont)}>{t(fund.titleKey)}</h4>
                        <p className={cn('mt-1 text-body-sm text-foreground-muted', tamilFont)}>{t(fund.descKey)}</p>
                      </div>
                      {isSelected && <Check className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />}
                    </div>
                  </Card>
                );
              })}
            </Grid>
            {selectedFund ? (
              <div className="mt-6 rounded-lg border border-accent/30 bg-accent-subtle p-4 text-center">
                <p className={cn('text-body-sm text-foreground', tamilFont)}>
                  {t('give.designateSelected')} <strong>&ldquo;{t(givingFunds.find((f) => f.id === selectedFund)!.titleKey)}&rdquo;</strong> {t('give.designateSelectedSuffix')}
                </p>
              </div>
            ) : (
              <p className={cn('mt-6 text-center text-body-sm text-foreground-subtle', tamilFont)}>
                {t('give.designateHint')}
              </p>
            )}
          </div>
        </Container>
      </Section>

      <Section spacing="lg" className="bg-surface">
        <div className="mb-10 text-center">
          <h2 className={cn('text-headline-md text-foreground', tamilFont)}>{t('give.yourImpact')}</h2>
          <p className={cn('mt-2 text-body-md text-foreground-muted', tamilFont)}>{t('give.yourImpactSubtitle')}</p>
        </div>
        <Container size="lg">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {impactData.map((area) => (
              <div key={area.titleKey} className="flex items-start gap-4 bg-background p-6">
                <area.icon className="mt-1 h-6 w-6 shrink-0 text-accent" />
                <div>
                  <div className="text-headline-sm text-accent">{area.amount}</div>
                  <h3 className={cn('mt-1 text-title-sm text-foreground', tamilFont)}>{t(area.titleKey)}</h3>
                  <p className={cn('mt-1 text-body-sm text-foreground-muted', tamilFont)}>{t(area.descKey)}</p>
                  <div className={cn('mt-1.5 text-caption text-foreground-subtle', tamilFont)}>{area.amount !== '∞' ? t('give.raisedThisYear') : t('give.godsProvision')}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {(() => {
        const breakdown = [
          { labelKey: 'give.transparency.ministry', value: siteSettings?.givingTransparencyMinistryPercent },
          { labelKey: 'give.transparency.operations', value: siteSettings?.givingTransparencyOperationsPercent },
          { labelKey: 'give.transparency.missions', value: siteSettings?.givingTransparencyMissionsPercent },
          { labelKey: 'give.transparency.building', value: siteSettings?.givingTransparencyBuildingPercent },
        ].filter((item) => item.value);
        if (breakdown.length === 0 && !siteSettings?.givingTransparencyReportUrl && !siteSettings?.givingTransparencyNote) return null;
        return (
          <Section spacing="lg">
            <Container size="md">
              <div className="mb-8 text-center">
                <h2 className={cn('text-headline-md text-foreground', tamilFont)}>{t('give.transparencyHeading')}</h2>
                <p className={cn('mt-2 text-body-md text-foreground-muted', tamilFont)}>{t('give.transparencySubtitle')}</p>
              </div>
              <Card variant="raised" padding="lg">
                {breakdown.length > 0 && (
                  <div className="space-y-4">
                    {breakdown.map((item) => (
                      <div key={item.labelKey}>
                        <div className="mb-1 flex items-center justify-between text-body-sm">
                          <span className={cn('font-medium text-foreground', tamilFont)}>{t(item.labelKey)}</span>
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
                    className={cn('mt-6', tamilFont)}
                  >
                    {t('give.downloadAnnualReport')}
                  </LinkButton>
                )}
              </Card>
            </Container>
          </Section>
        );
      })()}

      <Section spacing="lg">
        <Container size="md" className="text-center">
          <h2 className={cn('text-headline-md text-foreground', tamilFont)}>{t('give.whyWeGive')}</h2>
          <Grid cols={3} gap={6} className="my-10">
            {WHY_GIVE.map((item) => (
              <div key={item.titleKey}>
                <item.icon className="mx-auto mb-4 h-9 w-9 text-accent" />
                <h3 className={cn('text-title-md text-foreground', tamilFont)}>{t(item.titleKey)}</h3>
                <p className={cn('mt-2 text-body-sm text-foreground-muted', tamilFont)}>{t(item.descKey)}</p>
              </div>
            ))}
          </Grid>
          <blockquote className={cn('text-body-lg italic text-foreground', tamilFont)}>
            {t('give.verseQuote')}
          </blockquote>
          <cite className={cn('mt-3 block text-body-sm font-semibold text-accent', tamilFont)}>{t('give.verseCitation')}</cite>
        </Container>
      </Section>

      <Section spacing="lg" className="bg-surface">
        <Container size="sm">
          <div className="mb-8 text-center">
            <h2 className={cn('text-headline-md text-foreground', tamilFont)}>{t('give.faqHeading')}</h2>
          </div>
          <Card variant="raised" padding="lg">
            <Accordion type="single">
              {GIVING_FAQ.map((item) => (
                <AccordionItem key={item.id} id={item.id} title={t(item.qKey)}>
                  {item.id === 'legacy' ? (
                    <>
                      {t('give.faq.legacy.aPrefix')}{' '}
                      <Link href="/give/legacy" className="text-accent underline">{t('give.faq.legacy.aLink')}</Link> {t('give.faq.legacy.aSuffix')}
                    </>
                  ) : (
                    t(item.aKey!)
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
            <h2 className={cn('text-title-lg text-foreground', tamilFont)}>{t('give.legacyTitle')}</h2>
            <p className={cn('mt-2 text-body-sm text-foreground-muted', tamilFont)}>{t('give.legacyBody')}</p>
            <LinkButton href="/give/legacy" variant="outline" className={cn('mt-5', tamilFont)}>{t('give.learnAboutLegacy')}</LinkButton>
          </Card>
        </Container>
      </Section>

      <Section spacing="md" className="bg-accent text-center text-accent-foreground">
        <h2 className={cn('text-headline-md', tamilFont)}>{t('give.questionsAboutGiving')}</h2>
        <p className={cn('mt-3 text-body-lg opacity-90', tamilFont)}>{t('give.questionsAboutGivingBody')}</p>
        <LinkButton href="/contact" variant="secondary" size="lg" className={cn('mt-8', tamilFont)}>{t('give.contactUsBtn')}</LinkButton>
      </Section>
    </div>
  );
}
