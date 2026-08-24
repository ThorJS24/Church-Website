'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { SectionNav } from '@/components/ui/section-nav';

interface BeliefsSectionNavProps {
  hasCoreValues: boolean;
}

// SectionNav's item labels are plain strings, not JSX, so they can't go
// through the <Trans> island pattern used elsewhere on this Server
// Component page — this small client wrapper builds the translated list instead.
export function BeliefsSectionNav({ hasCoreValues }: BeliefsSectionNavProps) {
  const { t } = useLanguage();

  return (
    <SectionNav
      items={[
        { id: 'mission-vision', label: t('about.nav.missionVision') },
        ...(hasCoreValues ? [{ id: 'core-values', label: t('about.nav.coreValues') }] : []),
        { id: 'what-we-believe', label: t('about.nav.whatWeBelieve') },
        { id: 'faq', label: t('about.nav.faq') },
      ]}
    />
  );
}
