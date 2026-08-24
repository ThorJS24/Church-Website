'use client';

import { Book } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHero } from '@/components/ui/page-hero';

interface BeliefsHeroProps {
  title?: string;
  subtitle?: string;
}

// PageHero's eyebrow/title/description are plain strings, not JSX, so the
// default fallback copy (used only when the CMS 'about' page content
// doesn't exist yet) needs a client wrapper to translate rather than the
// <Trans> island pattern used for the rest of this Server Component page.
export function BeliefsHero({ title, subtitle }: BeliefsHeroProps) {
  const { t } = useLanguage();

  return (
    <PageHero
      icon={<Book />}
      eyebrow={t('about.eyebrow')}
      title={title || t('about.defaultTitle')}
      description={subtitle || t('about.defaultSubtitle')}
      breadcrumbs={[{ label: t('about.breadcrumbAbout'), href: '/about' }, { label: t('about.breadcrumbBeliefs') }]}
    />
  );
}
