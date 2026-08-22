import { Book, Heart, Target, Eye, CheckCircle, HelpCircle } from 'lucide-react';
import { getPageContent, getSiteSettings } from '@/lib/content';
import ScriptureReference from '@/components/ScriptureReference';
import StatBar from '@/components/StatBar';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { SectionNav } from '@/components/ui/section-nav';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Accordion, AccordionItem } from '@/components/ui/accordion';

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

const DEFAULT_FAQS = [
  { question: 'What should I expect when visiting for the first time?', answer: 'A warm welcome, congregational singing, prayer, and expository preaching from Scripture. Services typically run about 90 minutes, and there\'s no dress code — come as you are.' },
  { question: 'Do you baptize infants or only believers?', answer: 'We practice believer\'s baptism by immersion, following a personal profession of faith, in keeping with our Primitive Baptist convictions.' },
  { question: 'Is there a place for my children during the service?', answer: 'Children are welcome to worship alongside their families. Reach out to a greeter when you arrive and they\'ll point you to any age-appropriate provisions we have that day.' },
  { question: 'How can I become a member?', answer: 'Membership follows a profession of faith and believer\'s baptism, along with meeting our pastors. Speak with one of our pastors after a service or use the Contact page to start the conversation.' },
];

export default async function BeliefsPage() {
  const [aboutPage, siteSettings] = await Promise.all([
    getPageContent<AboutPage>('about'),
    getSiteSettings(),
  ]);

  return (
    <div>
      <PageHero
        icon={<Book />}
        eyebrow="About Us"
        title={aboutPage?.title || 'Our Beliefs & About Us'}
        description={aboutPage?.subtitle || 'Learn about our church family and what we believe'}
        breadcrumbs={[{ label: 'About', href: '/about' }, { label: 'Beliefs' }]}
      />

      <StatBar statistics={siteSettings?.statistics} />

      <SectionNav
        items={[
          { id: 'mission-vision', label: 'Mission & Vision' },
          ...(aboutPage?.values && aboutPage.values.length > 0 ? [{ id: 'core-values', label: 'Core Values' }] : []),
          { id: 'what-we-believe', label: 'What We Believe' },
          { id: 'faq', label: 'FAQ' },
        ]}
      />

      {/* Mission & Vision */}
      <Section id="mission-vision" spacing="lg">
        <Grid cols={2} gap={8}>
          <div>
            <Card variant="raised" padding="lg" className="h-full text-center">
              <Target className="mx-auto mb-5 h-10 w-10 text-accent" aria-hidden="true" />
              <h2 className="text-headline-sm text-foreground">Our Mission</h2>
              <p className="mt-4 text-body-md leading-relaxed text-foreground-muted">
                {aboutPage?.mission || 'To proclaim the Gospel of Jesus Christ, nurture believers through sound teaching, and build a community grounded in grace, faith, and love.'}
              </p>
            </Card>
          </div>
          <div>
            <Card variant="raised" padding="lg" className="h-full text-center">
              <Eye className="mx-auto mb-5 h-10 w-10 text-accent" aria-hidden="true" />
              <h2 className="text-headline-sm text-foreground">Our Vision</h2>
              <p className="mt-4 text-body-md leading-relaxed text-foreground-muted">
                {aboutPage?.vision || 'To be a Christ-centered church that transforms lives and communities through faith, love, and service — equipping every believer to live with purpose.'}
              </p>
            </Card>
          </div>
        </Grid>
      </Section>

      {/* Core Values */}
      {aboutPage?.values && aboutPage.values.length > 0 && (
        <Section id="core-values" spacing="lg" className="bg-surface">
          <h2 className="mb-10 text-center text-headline-md text-foreground">
            {aboutPage.valuesSectionTitle || 'Core Values'}
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
          <h2 className="text-headline-md text-foreground">{aboutPage?.beliefsSectionTitle || 'What We Believe'}</h2>
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
              <h3 className="text-title-lg text-foreground">Guiding Scripture</h3>
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
          <h2 className="text-headline-md text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="mx-auto max-w-3xl">
          <Card padding="lg">
            <Accordion>
              {(aboutPage?.faqs && aboutPage.faqs.length > 0 ? aboutPage.faqs : DEFAULT_FAQS).map((faq, i) => (
                <AccordionItem key={i} id={`faq-${i}`} title={faq.question}>
                  {faq.answer}
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </Section>
    </div>
  );
}
