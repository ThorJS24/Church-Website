import type { Metadata } from 'next';
import { ScrollText, FileText, Landmark, Gift, ArrowLeft } from 'lucide-react';
import { PageHero } from '@/components/ui-legacy/PageHero';
import { Section } from '@/components/ui-legacy/Section';
import { Container } from '@/components/ui-legacy/Container';
import { Card } from '@/components/ui-legacy/Card';
import { Grid } from '@/components/ui-legacy/Grid';
import { LinkButton } from '@/components/ui-legacy/Button';

export const metadata: Metadata = {
  title: 'Legacy Giving — Salem Primitive Baptist Church',
  description: 'Learn about including Salem Primitive Baptist Church in your will, trust, or estate plans through planned and legacy giving.',
};

const LEGACY_OPTIONS = [
  {
    icon: FileText,
    title: 'Bequests in Your Will or Trust',
    description: 'Name the church as a beneficiary of a specific amount, percentage, or the remainder of your estate. Your attorney can include this when drafting or updating your will or trust.',
  },
  {
    icon: Landmark,
    title: 'Retirement Account Beneficiary Designations',
    description: 'Name the church as a full or partial beneficiary of an IRA, 401(k), or other retirement account — often a tax-efficient way to give, since the church doesn\'t pay income tax on the distribution.',
  },
  {
    icon: Gift,
    title: 'Gifts of Stock or Securities',
    description: 'Donating appreciated stock directly can avoid capital gains tax while supporting the church\'s ministries at their full market value.',
  },
];

export default function LegacyGivingPage() {
  return (
    <div>
      <PageHero
        icon={<ScrollText />}
        eyebrow="Planned Giving"
        title="Legacy Giving"
        description="Leave a lasting legacy of generosity by including the church in your long-term financial and estate plans"
        actions={<LinkButton href="/give" variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>Back to Give</LinkButton>}
      />

      <Section spacing="lg">
        <Container size="md">
          <div className="mb-10 text-center">
            <h2 className="text-headline-md text-foreground">Ways to Leave a Legacy</h2>
            <p className="mt-2 text-body-md text-foreground-muted">
              This information is general in nature and not legal or tax advice — please consult your attorney or financial advisor when making estate planning decisions.
            </p>
          </div>

          <Grid cols={3} gap={6}>
            {LEGACY_OPTIONS.map((option) => (
              <Card key={option.title} variant="raised" padding="lg" className="h-full">
                <option.icon className="mb-4 h-9 w-9 text-accent" aria-hidden="true" />
                <h3 className="text-title-md text-foreground">{option.title}</h3>
                <p className="mt-2 text-body-sm text-foreground-muted">{option.description}</p>
              </Card>
            ))}
          </Grid>
        </Container>
      </Section>

      <Section spacing="lg" className="bg-surface">
        <Container size="sm" className="text-center">
          <h2 className="text-headline-md text-foreground">Getting Started</h2>
          <p className="mx-auto mt-3 max-w-xl text-body-md text-foreground-muted">
            If you're considering including the church in your estate plans, we'd be honored to talk with you about your goals and answer any questions.
            Reach out to the church office and we'll connect you with the right next steps.
          </p>
          <LinkButton href="/contact" size="lg" className="mt-8">Contact Us About Legacy Giving</LinkButton>
        </Container>
      </Section>
    </div>
  );
}
