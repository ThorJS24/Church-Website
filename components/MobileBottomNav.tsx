'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'motion/react';
import { Home, Calendar, MessageSquare, BookOpen, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { key: 'home', href: '/', icon: Home, labelKey: 'nav.home' },
  { key: 'prayer', href: '/prayer', icon: MessageSquare, labelKey: 'nav.prayer' },
  { key: 'events', href: '/events', icon: Calendar, labelKey: 'nav.events' },
  { key: 'sermons', href: '/sermons', icon: BookOpen, labelKey: 'nav.sermons' },
  { key: 'contact', href: '/contact', icon: Phone, labelKey: 'nav.contact' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <div className="h-16 md:hidden" />

      <nav
        className="fixed inset-x-0 bottom-0 z-40 md:hidden pb-[env(safe-area-inset-bottom)]"
        role="navigation"
        aria-label="Mobile Navigation"
      >
        <div className="mx-3 mb-3 flex items-center justify-around rounded-2xl border border-border bg-background/95 shadow-lg backdrop-blur-md">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.key}
                href={item.href}
                className="relative flex min-h-touch min-w-touch flex-1 flex-col items-center justify-center gap-1 py-2.5"
                aria-label={t(item.labelKey)}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="mobileNavActive"
                    className="absolute top-1 h-1 w-1 rounded-full bg-accent"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn('h-5 w-5', active ? 'text-accent' : 'text-foreground-subtle')}
                  aria-hidden="true"
                />
                <span className={cn('text-caption font-medium', active ? 'text-accent' : 'text-foreground-subtle')}>
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
