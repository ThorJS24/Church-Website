'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Church, Menu, X, ChevronDown, User, LogOut, Sun, Moon, Search,
  Home, Calendar, BookOpen, Users, Heart, Camera, Phone, Gift, Globe, LayoutGrid, ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLivestream } from '@/lib/content';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/icon-button';
import { Button, LinkButton } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import CommandPalette from '@/components/CommandPalette';
import { AccessibilityMenu } from '@/components/AccessibilityMenu';
import { NotificationBell } from '@/components/NotificationBell';
import EnhancedLoginModal from './EnhancedLoginModal';

interface NavItem {
  key: string;
  href: string;
  icon: typeof Home;
  labelKey: string;
  primary?: boolean;
  section?: { key: string; href: string; labelKey: string }[];
  /** Column this item's card belongs to in the desktop "More" mega-menu.
   * Ignored on mobile, where the Sheet just lists every non-primary item
   * in a single flat/expandable column regardless of group. */
  menuGroup?: 'about' | 'getInvolved' | 'connect';
}

const navigationItems: NavItem[] = [
  { key: 'home', href: '/', icon: Home, labelKey: 'nav.home', primary: true },
  {
    key: 'about', href: '/about/beliefs', icon: Users, labelKey: 'nav.about', menuGroup: 'about',
    section: [
      { key: 'beliefs', href: '/about/beliefs', labelKey: 'nav.beliefs' },
      { key: 'branches', href: '/about/branches', labelKey: 'nav.branches' },
      { key: 'pastors', href: '/about/pastors', labelKey: 'nav.pastors' },
      { key: 'history', href: '/about/history', labelKey: 'nav.history' },
    ],
  },
  { key: 'services', href: '/services', icon: Heart, labelKey: 'nav.services', primary: true },
  { key: 'events', href: '/events', icon: Calendar, labelKey: 'nav.events', primary: true },
  { key: 'sermons', href: '/sermons', icon: BookOpen, labelKey: 'nav.sermons', primary: true },
  {
    key: 'ministries', href: '/ministries', icon: Users, labelKey: 'nav.ministries', menuGroup: 'getInvolved',
    section: [
      { key: 'all', href: '/ministries', labelKey: 'nav.allMinistries' },
      { key: 'smallGroups', href: '/small-groups', labelKey: 'nav.smallGroups' },
      { key: 'testimonials', href: '/testimonials', labelKey: 'nav.testimonials' },
      { key: 'resources', href: '/resources', labelKey: 'nav.resources' },
    ],
  },
  { key: 'community', href: '/community', icon: Users, labelKey: 'nav.community', menuGroup: 'getInvolved' },
  { key: 'gallery', href: '/gallery', icon: Camera, labelKey: 'nav.gallery', menuGroup: 'connect' },
  { key: 'blog', href: '/blog', icon: BookOpen, labelKey: 'nav.blog', menuGroup: 'connect' },
  // Give promoted to the primary desktop row — there was open space between
  // "More" and the right-hand action icons at desktop widths, and it's the
  // single highest-value CTA sitting inside the "More" mega-menu. Contact
  // stays in "More": promoting both pushed Login/Register off the visible
  // viewport right at the lg breakpoint's 1024px floor (verified with a
  // screenshot at 1024px — Login/Register still fit comfortably with just
  // Give promoted, at every width from 1024px up).
  { key: 'give', href: '/give', icon: Gift, labelKey: 'nav.give', primary: true },
  { key: 'contact', href: '/contact', icon: Phone, labelKey: 'nav.contact', menuGroup: 'connect' },
];

const MENU_GROUPS: { key: NonNullable<NavItem['menuGroup']>; labelKey: string }[] = [
  { key: 'about', labelKey: 'nav.about' },
  { key: 'getInvolved', labelKey: 'nav.getInvolved' },
  { key: 'connect', labelKey: 'nav.connect' },
];

const LANGUAGES = [
  { code: 'en' as const, nameNative: 'English', flag: '🇺🇸' },
  { code: 'ta' as const, nameNative: 'தமிழ்', flag: '🇮🇳' },
];

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);

  const { user, logout, canAccessAdminPanel } = useAuth();
  const { theme, toggleTheme } = useTheme() || { theme: 'light', toggleTheme: () => {} };
  const { t, language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Persistent "live now" indicator — the homepage already shows a live
  // banner, but that's invisible from every other page. Light polling is
  // enough here; this isn't a real-time chat feed.
  useEffect(() => {
    const checkLive = () => getLivestream().then((ls) => setIsLive(!!ls?.isLive)).catch(() => {});
    checkLive();
    const interval = setInterval(checkLive, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Ctrl/Cmd+K opens the command palette from anywhere on the site.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setMobileSection(null);
    setExploreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!exploreOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setExploreOpen(false);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exploreOpen]);

  const isActive = useCallback(
    (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href)),
    [pathname]
  );

  const handleLanguageChange = (code: 'en' | 'ta') => {
    setLanguage(code);
    setTimeout(() => window.location.reload(), 100);
  };

  const primaryItems = navigationItems.filter((item) => item.primary);
  const secondaryItems = navigationItems.filter((item) => !item.primary);

  return (
    <>
      <nav
        ref={navRef}
        className="fixed left-0 right-0 top-0 z-40 flex flex-col transition-colors duration-base ease-standard"
      >
        {/* Tier 1 — slim utility band: live status left, everything else
            (search, theme, language, notifications, account) right. Keeps
            the primary band below free of anything but navigation. */}
        <div className="hidden h-9 w-full border-b border-border/70 bg-surface sm:flex">
          <div className="mx-auto flex h-full w-full max-w-[1680px] items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-3">
              {isLive ? (
                <Link href="/" className="flex items-center gap-1.5 text-caption font-medium text-danger">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
                  Live now — tap to watch
                </Link>
              ) : (
                <span className="text-caption text-foreground-subtle">{t('nav.tagline')}</span>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setShowCommandPalette(true)}
                className="hidden items-center gap-1.5 whitespace-nowrap rounded-md border-0 bg-transparent px-2 py-1 text-caption font-medium text-foreground-muted transition-colors duration-fast hover:text-foreground lg:flex"
              >
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('common.search') || 'Search'}</span>
                <kbd aria-hidden="true" className="ml-1 text-foreground-subtle">⌘K</kbd>
              </button>
              <IconButton label={t('common.search') || 'Search'} size="sm" className="lg:hidden" onClick={() => setShowCommandPalette(true)}>
                <Search />
              </IconButton>
              <IconButton label={t('nav.toggleTheme')} size="sm" onClick={toggleTheme}>
                {theme === 'light' ? <Moon /> : <Sun />}
              </IconButton>
              <AccessibilityMenu size="sm" />
              <NotificationBell size="sm" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Language"
                    className="flex h-7 w-7 items-center justify-center rounded-md border-0 bg-transparent text-foreground-muted transition-colors duration-fast hover:bg-surface-hover hover:text-foreground"
                  >
                    <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {LANGUAGES.map((lang) => (
                    <DropdownMenuItem key={lang.code} onClick={() => handleLanguageChange(lang.code)}>
                      <span className="text-base">{lang.flag}</span>
                      <span className="flex-1">{lang.nameNative}</span>
                      {language === lang.code && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="mx-1 h-4 w-px bg-border" />
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="flex items-center gap-2 rounded-md border-0 bg-transparent px-1 py-1">
                      <Avatar name={user.displayName || user.firstName || user.email} size="xs" />
                      <span className="hidden max-w-24 truncate text-caption font-medium text-foreground sm:block">
                        {user.displayName || user.firstName || user.email}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <User className="h-4 w-4 text-foreground-subtle" /> {t('nav.profile')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <LayoutGrid className="h-4 w-4 text-foreground-subtle" /> {t('nav.dashboard')}
                    </DropdownMenuItem>
                    {canAccessAdminPanel() && (
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <ShieldCheck className="h-4 w-4 text-foreground-subtle" /> Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={logout}>
                      <LogOut className="h-4 w-4" /> {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setShowLoginModal(true)} className="rounded-md border-0 bg-transparent px-2 py-1 text-caption font-medium text-foreground-muted hover:text-foreground">
                    {t('nav.login')}
                  </button>
                  <Link href="/register" className="rounded-md border-0 bg-transparent px-2 py-1 text-caption font-medium text-accent hover:text-accent-hover">
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tier 2 — primary band: brand mark, bold nav labels, one "Explore"
            trigger that opens a full-width mega-panel (below) instead of
            three separate small popovers. */}
        <div className={cn('h-16 w-full transition-colors duration-base ease-standard sm:h-[4.5rem]', scrolled ? 'border-b border-border bg-background/95 backdrop-blur-md' : 'border-b-0 bg-background')}>
          <div className="mx-auto flex h-full w-full max-w-[1680px] items-center gap-4 px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-accent">
                <Church className="h-5 w-5 text-accent-foreground" aria-hidden="true" />
              </div>
              <p className="font-display text-title-lg text-foreground">Salem PBC</p>
            </Link>

            <div className="hidden flex-1 items-center gap-1 xl:flex">
              {primaryItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      'relative rounded-md px-3 py-2 text-body-md font-medium whitespace-nowrap transition-colors duration-fast',
                      active ? 'text-accent' : 'text-foreground-muted hover:text-foreground'
                    )}
                  >
                    {t(item.labelKey)}
                    {active && (
                      <motion.span
                        layoutId="navActiveIndicator"
                        className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-accent"
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      />
                    )}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => setExploreOpen((v) => !v)}
                aria-expanded={exploreOpen}
                className={cn(
                  'flex items-center gap-1 whitespace-nowrap rounded-md border-0 bg-transparent px-3 py-2 text-body-md font-medium transition-colors duration-fast',
                  exploreOpen || secondaryItems.some((i) => isActive(i.href) || i.section?.some((s) => isActive(s.href)))
                    ? 'text-accent'
                    : 'text-foreground-muted hover:text-foreground'
                )}
              >
                Explore
                <ChevronDown className={cn('h-3.5 w-3.5 opacity-60 transition-transform', exploreOpen && 'rotate-180')} aria-hidden="true" />
              </button>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-3">
              <LinkButton href="/give" size="sm" className="hidden xl:inline-flex">{t('nav.give')}</LinkButton>
              {!user && (
                <LinkButton href="/register" size="sm" variant="outline" className="hidden sm:inline-flex xl:hidden">
                  {t('nav.register')}
                </LinkButton>
              )}
            </div>

            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <IconButton label={isMobileOpen ? 'Close menu' : 'Open menu'} className="xl:hidden">
                  {isMobileOpen ? <X /> : <Menu />}
                </IconButton>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm p-0">
                <div className="flex h-16 items-center gap-3 border-b border-border px-4">
                  <div className="flex h-9 w-9 items-center justify-center bg-accent">
                    <Church className="h-5 w-5 text-accent-foreground" aria-hidden="true" />
                  </div>
                  <SheetTitle className="font-display text-title-sm text-foreground">Salem PBC</SheetTitle>
                </div>
                <div className="max-h-[calc(100vh-4rem)] space-y-1 overflow-y-auto px-4 py-4">
                  {!user && (
                    <div className="mb-3 flex gap-3 border-b border-border pb-4">
                      <Button variant="secondary" fullWidth onClick={() => setShowLoginModal(true)}>{t('nav.login')}</Button>
                      <LinkButton href="/register" fullWidth>{t('nav.register')}</LinkButton>
                    </div>
                  )}
                  {user && (
                    <div className="mb-3 space-y-1 border-b border-border pb-3">
                      <Link href="/profile" className="flex items-center gap-3 rounded-md px-3 py-3 text-body-md font-medium text-foreground hover:text-accent">
                        <User className="h-5 w-5 text-foreground-subtle" aria-hidden="true" /> {t('nav.profile')}
                      </Link>
                      <Link href="/dashboard" className="flex items-center gap-3 rounded-md px-3 py-3 text-body-md font-medium text-foreground hover:text-accent">
                        <LayoutGrid className="h-5 w-5 text-foreground-subtle" aria-hidden="true" /> {t('nav.dashboard')}
                      </Link>
                      {canAccessAdminPanel() && (
                        <Link href="/admin" className="flex items-center gap-3 rounded-md px-3 py-3 text-body-md font-medium text-foreground hover:text-accent">
                          <ShieldCheck className="h-5 w-5 text-foreground-subtle" aria-hidden="true" /> Admin Dashboard
                        </Link>
                      )}
                      <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-md border-0 bg-transparent px-3 py-3 text-body-md font-medium text-danger">
                        <LogOut className="h-5 w-5" aria-hidden="true" /> {t('nav.logout')}
                      </button>
                    </div>
                  )}
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    if (item.section) {
                      const open = mobileSection === item.key;
                      return (
                        <div key={item.key}>
                          <button
                            type="button"
                            onClick={() => setMobileSection(open ? null : item.key)}
                            className={cn(
                              'flex w-full items-center justify-between rounded-md border-0 bg-transparent px-3 py-3 text-body-md font-medium transition-colors',
                              active ? 'text-accent' : 'text-foreground'
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-foreground-subtle" aria-hidden="true" />
                              {t(item.labelKey)}
                            </span>
                            <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
                          </button>
                          <AnimatePresence>
                            {open && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.16 }}
                                className="ml-8 overflow-hidden"
                              >
                                {item.section.map((sub) => (
                                  <Link key={sub.key} href={sub.href} className="block rounded-md px-3 py-2 text-body-sm text-foreground-muted hover:text-foreground">
                                    {t(sub.labelKey)}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-3 text-body-md font-medium transition-colors',
                          active ? 'text-accent' : 'text-foreground hover:text-accent'
                        )}
                      >
                        <Icon className="h-5 w-5 text-foreground-subtle" aria-hidden="true" />
                        {t(item.labelKey)}
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Explore mega-panel — one full-width surface listing every
            secondary group in columns, replacing three separate small
            dropdown popovers. */}
        <AnimatePresence>
          {exploreOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close explore menu"
                onClick={() => setExploreOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 top-[calc(2.25rem+4.5rem)] z-30 hidden bg-black/20 xl:block"
              />
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16 }}
                className="absolute inset-x-0 top-full z-40 hidden border-b border-border-strong bg-background xl:block"
              >
                <div className="mx-auto grid w-full max-w-[1680px] grid-cols-3 gap-8 px-8 py-8">
                  {MENU_GROUPS.map((group) => {
                    const groupItems = secondaryItems.filter((item) => item.menuGroup === group.key);
                    return (
                      <div key={group.key}>
                        <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-foreground-subtle">{t(group.labelKey)}</p>
                        <div className="space-y-1">
                          {groupItems.map((item) =>
                            item.section ? (
                              item.section.map((sub) => (
                                <Link key={sub.key} href={sub.href} className="block rounded-md px-2 py-1.5 text-body-md text-foreground-muted hover:bg-surface-hover hover:text-foreground">
                                  {t(sub.labelKey)}
                                </Link>
                              ))
                            ) : (
                              <Link key={item.key} href={item.href} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-body-md text-foreground-muted hover:bg-surface-hover hover:text-foreground">
                                <item.icon className="h-4 w-4 text-foreground-subtle" aria-hidden="true" />
                                {t(item.labelKey)}
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      <EnhancedLoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={() => setShowLoginModal(false)} />

      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />
    </>
  );
}
