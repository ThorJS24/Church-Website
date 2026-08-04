'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Building, Users, Globe, BookOpen, Mail, Landmark } from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/lib/content';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';
import { LinkButton } from '@/components/ui/Button';

const givingFunds = [
  { id: 'tithe', title: 'Tithe & Offerings', description: 'Regular giving to support our church ministries and operations' },
  { id: 'missions', title: 'Missions Fund', description: 'Support our global mission work and local outreach programs' },
  { id: 'building', title: 'Building Fund', description: 'Help us maintain and improve our church facilities' },
  { id: 'special', title: 'Special Projects', description: 'Support specific ministry projects and community initiatives' },
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
            <h3 className="mb-6 text-center text-title-lg text-foreground">You Can Designate Your Gift To</h3>
            <Grid cols={2} gap={4}>
              {givingFunds.map((fund) => (
                <Card key={fund.id}>
                  <h4 className="text-title-sm text-foreground">{fund.title}</h4>
                  <p className="mt-1 text-body-sm text-foreground-muted">{fund.description}</p>
                </Card>
              ))}
            </Grid>
            <p className="mt-6 text-center text-body-sm text-foreground-subtle">
              Just let us know which fund you&apos;d like to support when you give in person or transfer a gift.
            </p>
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

      <Section spacing="md" className="bg-accent text-center text-accent-foreground">
        <h2 className="text-headline-md">Questions About Giving?</h2>
        <p className="mt-3 text-body-lg opacity-90">We&apos;re here to help you with your generosity journey</p>
        <LinkButton href="/contact" variant="secondary" size="lg" className="mt-8">Contact Us</LinkButton>
      </Section>
    </div>
  );
}
