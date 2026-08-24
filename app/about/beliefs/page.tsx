import { Book, Heart, Target, Eye, CheckCircle, HelpCircle } from 'lucide-react';
import { getPageContent, getSiteSettings } from '@/lib/content';
import ScriptureReference from '@/components/ScriptureReference';
import StatBar from '@/components/StatBar';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Trans } from '@/components/i18n/Trans';
import { BeliefsSectionNav } from '@/components/about/BeliefsSectionNav';
import { BeliefsHero } from '@/components/about/BeliefsHero';

// Without this, Next.js would fully prerender this page at build time
// (it has no dynamic route params, unlike blog/[slug] etc.) and freeze
// its content until the next deploy — defeating the CMS's "edit content,
// no redeploy needed" design. Revalidate periodically instead.
export const revalidate = 300;

interface AboutPage {
  title: string;
  subtitle: string;
  mission: string;
  vision: string;
  beliefs: Array<{
    title: string;
    description: string;
    scriptureReferences?: Array<{ reference: string; verse: string; version: string }>;
  }>;
  beliefsSectionTitle: string;
  values: Array<{
    title: string;
    description: string;
    scriptureReferences?: Array<{ reference: string; verse: string; version: string }>;
  }>;
  valuesSectionTitle: string;
  guidingScripture?: { verse: string; reference: string };
  faqs?: Array<{ question: string; answer: string }>;
}

const DEFAULT_FAQ_KEYS = [
  { questionKey: 'about.faq.visit.q', answerKey: 'about.faq.visit.a' },
  { questionKey: 'about.faq.baptism.q', answerKey: 'about.faq.baptism.a' },
  { questionKey: 'about.faq.children.q', answerKey: 'about.faq.children.a' },
  { questionKey: 'about.faq.membership.q', answerKey: 'about.faq.membership.a' },
];

export default async function BeliefsPage() {
  const [aboutPage, siteSettings] = await Promise.all([
    getPageContent<AboutPage>('about'),
    getSiteSettings(),
  ]);

  return (
    <div>
      <BeliefsHero title={aboutPage?.title} subtitle={aboutPage?.subtitle} />

      <StatBar statistics={siteSettings?.statistics} />

      <BeliefsSectionNav hasCoreValues={!!(aboutPage?.values && aboutPage.values.length > 0)} />

      {/* Mission & Vision */}
      <Section id="mission-vision" spacing="lg">
        <Grid cols={2} gap={8}>
          <div>
            <Card variant="raised" padding="lg" className="h-full text-center">
              <Target className="mx-auto mb-5 h-10 w-10 text-accent" aria-hidden="true" />
              <Trans k="about.ourMission" as="h2" className="text-headline-sm text-foreground" />
              <p className="mt-4 text-body-md leading-relaxed text-foreground-muted">
                {aboutPage?.mission || <Trans k="about.defaultMission" />}
              </p>
            </Card>
          </div>
          <div>
            <Card variant="raised" padding="lg" className="h-full text-center">
              <Eye className="mx-auto mb-5 h-10 w-10 text-accent" aria-hidden="true" />
              <Trans k="about.ourVision" as="h2" className="text-headline-sm text-foreground" />
              <p className="mt-4 text-body-md leading-relaxed text-foreground-muted">
                {aboutPage?.vision || <Trans k="about.defaultVision" />}
              </p>
            </Card>
          </div>
        </Grid>
      </Section>

      {/* Core Values */}
      {aboutPage?.values && aboutPage.values.length > 0 && (
        <Section id="core-values" spacing="lg" className="bg-surface">
          <h2 className="mb-10 text-center text-headline-md text-foreground">
            {aboutPage.valuesSectionTitle || <Trans k="about.defaultCoreValues" />}
          </h2>
          <Grid cols={3} gap={6}>
            {aboutPage.values.map((value, index) => (
              <div key={value.title}>
                <Card padding="lg" className="h-full text-center">
                  <Heart className="mx-auto mb-4 h-8 w-8 text-accent" aria-hidden="true" />
                  <h3 className="text-title-md text-foreground">{value.title}</h3>
                  <p className="mt-2 text-body-sm text-foreground-muted">{value.description}</p>
                  {value.scriptureReferences && value.scriptureReferences.length > 0 && (
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      {value.scriptureReferences.map((s, i) => (
                        <ScriptureReference key={i} reference={s.reference} verse={s.verse} version={s.version} />
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </Grid>
        </Section>
      )}

      {/* What We Believe */}
      <Section id="what-we-believe" spacing="lg">
        <div className="mb-10 text-center">
          <Book className="mx-auto mb-4 h-10 w-10 text-accent" aria-hidden="true" />
          <h2 className="text-headline-md text-foreground">{aboutPage?.beliefsSectionTitle || <Trans k="about.defaultWhatWeBelieve" />}</h2>
        </div>

        {aboutPage?.beliefs && (
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
            {aboutPage.beliefs.map((belief, index) => (
              <div key={belief.title}>
                <Card className="flex h-full items-start gap-4">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                  <div>
                    <h3 className="text-title-sm text-foreground">{belief.title}</h3>
                    <p className="mt-1.5 text-body-sm leading-relaxed text-foreground-muted">{belief.description}</p>
                    {belief.scriptureReferences && belief.scriptureReferences.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {belief.scriptureReferences.map((s, i) => (
                          <ScriptureReference key={i} reference={s.reference} verse={s.verse} version={s.version} />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}

        {aboutPage?.guidingScripture && (
          <div className="mx-auto mt-10 max-w-3xl">
            <Card variant="raised" padding="lg" className="text-center">
              <Trans k="about.guidingScripture" as="h3" className="text-title-lg text-foreground" />
              <p className="mt-4 text-body-lg italic text-foreground">"{aboutPage.guidingScripture.verse}"</p>
              <p className="mt-3 text-body-sm font-semibold text-accent">— {aboutPage.guidingScripture.reference}</p>
            </Card>
          </div>
        )}
      </Section>

      {/* FAQ */}
      <Section id="faq" spacing="lg" className="bg-surface">
        <div className="mb-10 text-center">
          <HelpCircle className="mx-auto mb-4 h-10 w-10 text-accent" aria-hidden="true" />
          <Trans k="about.faqHeading" as="h2" className="text-headline-md text-foreground" />
        </div>
        <div className="mx-auto max-w-3xl">
          <Card padding="lg">
            <Accordion>
              {aboutPage?.faqs && aboutPage.faqs.length > 0 ? (
                aboutPage.faqs.map((faq, i) => (
                  <AccordionItem key={i} id={`faq-${i}`} title={faq.question}>
                    {faq.answer}
                  </AccordionItem>
                ))
              ) : (
                DEFAULT_FAQ_KEYS.map((faq, i) => (
                  <AccordionItem key={i} id={`faq-${i}`} title={<Trans k={faq.questionKey} />}>
                    <Trans k={faq.answerKey} />
                  </AccordionItem>
                ))
              )}
            </Accordion>
          </Card>
        </div>
      </Section>
    </div>
  );
}
