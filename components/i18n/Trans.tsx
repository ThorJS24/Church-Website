'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

type Tag = 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4';

interface TransProps {
  /** Translation key, looked up in contexts/LanguageContext.tsx's `translations` object. */
  k: string;
  as?: Tag;
  className?: string;
  /** Use `font-tamil-serif` instead of `font-tamil` for the Tamil font swap (headings/quotes set in the serif face). */
  serif?: boolean;
}

// Small client island so static UI chrome can be translated from inside
// Server Component pages (app/page.tsx etc.) without pulling the whole page
// back into the client boundary. Applies the font-tamil/font-tamil-serif
// swap automatically — every translated string needs it, so callers can't
// forget it the way plain useLanguage() call sites have been doing.
export function Trans({ k, as: Tag = 'span', className, serif }: TransProps) {
  const { t, language } = useLanguage();
  return (
    <Tag className={cn(className, language === 'ta' && (serif ? 'font-tamil-serif' : 'font-tamil'))}>
      {t(k)}
    </Tag>
  );
}
