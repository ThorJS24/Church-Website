'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Church, Menu, X, ChevronDown, User, LogOut, Sun, Moon, Search,
  Home, Calendar, BookOpen, Users, Heart, Camera, Phone, Gift, Globe, LayoutGrid, ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/cn';
import { IconButton } from '@/components/ui/IconButton';
import { Button, LinkButton } from '@/components/ui/Button';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown';
import { Avatar } from '@/components/ui/Avatar';
import CommandPalette from '@/components/CommandPalette';
import EnhancedLoginModal from './EnhancedLoginModal';

interface NavItem {
  key: string;
  href: string;
  icon: typeof Home;
  labelKey: string;
  primary?: boolean;
  section?: { key: string; href: string; labelKey: string }[];
}

const navigationItems: NavItem[] = [
  { key: 'home', href: '/', icon: Home, labelKey: 'nav.home', primary: true },
  {
    key: 'about', href: '/about/beliefs', icon: Users, labelKey: 'nav.about',
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
    key: 'ministries', href: '/ministries', icon: Users, labelKey: 'nav.ministries',
    section: [
      { key: 'all', href: '/ministries', labelKey: 'nav.allMinistries' },
      { key: 'smallGroups', href: '/small-groups', labelKey: 'nav.smallGroups' },
      { key: 'testimonials', href: '/testimonials', labelKey: 'nav.testimonials' },
      { key: 'resources', href: '/resources', labelKey: 'nav.resources' },
    ],
  },
  { key: 'community', href: '/community', icon: Users, labelKey: 'nav.community' },
  { key: 'gallery', href: '/gallery', icon: Camera, labelKey: 'nav.gallery' },
  { key: 'blog', href: '/blog', icon: BookOpen, labelKey: 'nav.blog' },
  { key: 'give', href: '/give', icon: Gift, labelKey: 'nav.give' },
  { key: 'contact', href: '/contact', icon: Phone, labelKey: 'nav.contact' },
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
  }, [pathname]);

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
        className={cn(
          'fixed top-0 left-0 right-0 z-40 h-16 border-b transition-colors duration-base ease-standard',
          scrolled
            ? 'border-border bg-background/90 backdrop-blur-md shadow-sm'
            : 'border-transparent bg-background'
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
              <Church className="h-5 w-5 text-accent-foreground" aria-hidden="true" />
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-title-sm text-foreground">Salem PBC</p>
              <p className="text-caption text-foreground-subtle">{t('nav.tagline')}</p>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {primaryItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    'relative rounded-md px-3.5 py-2 text-body-sm font-medium transition-colors duration-fast',
                    active ? 'text-accent' : 'text-foreground-muted hover:text-foreground'
                  )}
                >
                  {t(item.labelKey)}
                  {active && (
                    <motion.span
                      layoutId="navActiveIndicator"
                      className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent"
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    />
                  )}
                </Link>
              );
            })}

            <Dropdown align="right">
              <DropdownTrigger className="flex items-center gap-1 rounded-md px-3.5 py-2 text-body-sm font-medium text-foreground-muted hover:text-foreground transition-colors duration-fast">
                <span>{t('nav.more')}</span>
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </DropdownTrigger>
              <DropdownMenu className="min-w-[16rem]">
                {secondaryItems.map((item, i) => (
                  <div key={item.key}>
                    {i > 0 && <DropdownSeparator />}
                    {item.section ? (
                      <>
                        <div className="px-3 pt-2 pb-1 text-caption font-medium uppercase tracking-wide text-foreground-subtle">
                          {t(item.labelKey)}
                        </div>
                        {item.section.map((sub) => (
                          <DropdownItem key={sub.key} onClick={() => (router.push(sub.href))}>
                            {t(sub.labelKey)}
                          </DropdownItem>
                        ))}
                      </>
                    ) : (
                      <DropdownItem onClick={() => (router.push(item.href))}>
                        <item.icon className="h-4 w-4 text-foreground-subtle" aria-hidden="true" />
                        {t(item.labelKey)}
                      </DropdownItem>
                    )}
                  </div>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowCommandPalette(true)}
              className="hidden md:flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-body-sm text-foreground-subtle hover:border-border-strong hover:text-foreground transition-colors duration-fast"
              aria-label={t('common.search') || 'Search'}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>{t('common.search') || 'Search'}</span>
              <kbd className="ml-2 rounded border border-border bg-background px-1.5 py-0.5 text-caption">
                ⌘K
              </kbd>
            </button>
            <IconButton
              label={t('common.search') || 'Search'}
              size="md"
              className="md:hidden"
              onClick={() => setShowCommandPalette(true)}
            >
              <Search />
            </IconButton>

            <IconButton label={t('nav.toggleTheme')} onClick={toggleTheme}>
              {theme === 'light' ? <Moon /> : <Sun />}
            </IconButton>

            <Dropdown align="right">
              <DropdownTrigger
                aria-label="Language"
                className="flex h-10 w-10 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors duration-fast"
              >
                <Globe className="h-5 w-5" aria-hidden="true" />
              </DropdownTrigger>
              <DropdownMenu>
                {LANGUAGES.map((lang) => (
                  <DropdownItem key={lang.code} onClick={() => handleLanguageChange(lang.code)}>
                    <span className="text-base">{lang.flag}</span>
                    <span className="flex-1">{lang.nameNative}</span>
                    {language === lang.code && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            {user ? (
              <Dropdown align="right">
                <DropdownTrigger className="flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1.5">
                  <Avatar name={user.displayName || user.firstName || user.email} size="xs" />
                  <span className="hidden sm:block max-w-24 truncate text-body-sm font-medium text-foreground">
                    {user.displayName || user.firstName || user.email}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-foreground-subtle" aria-hidden="true" />
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem onClick={() => (router.push('/profile'))}>
                    <User className="h-4 w-4 text-foreground-subtle" /> {t('nav.profile')}
                  </DropdownItem>
                  <DropdownItem onClick={() => (router.push('/dashboard'))}>
                    <LayoutGrid className="h-4 w-4 text-foreground-subtle" /> {t('nav.dashboard')}
                  </DropdownItem>
                  {canAccessAdminPanel() && (
                    <DropdownItem onClick={() => (router.push('/admin'))}>
                      <ShieldCheck className="h-4 w-4 text-foreground-subtle" /> Admin Dashboard
                    </DropdownItem>
                  )}
                  <DropdownSeparator />
                  <DropdownItem destructive onClick={logout}>
                    <LogOut className="h-4 w-4" /> {t('nav.logout')}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowLoginModal(true)}>
                  {t('nav.login')}
                </Button>
                <LinkButton href="/register" size="sm">
                  {t('nav.register')}
                </LinkButton>
              </div>
            )}

            <IconButton
              label={isMobileOpen ? 'Close menu' : 'Open menu'}
              className="lg:hidden"
              onClick={() => setIsMobileOpen((v) => !v)}
            >
              {isMobileOpen ? <X /> : <Menu />}
            </IconButton>
          </div>
        </div>

        {/* Mobile navigation */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="lg:hidden overflow-hidden border-t border-border bg-background"
            >
              <div className="max-h-[calc(100vh-4rem)] space-y-1 overflow-y-auto px-4 py-4">
                {!user && (
                  <div className="mb-3 flex gap-3 border-b border-border pb-4">
                    <Button variant="secondary" fullWidth onClick={() => setShowLoginModal(true)}>
                      {t('nav.login')}
                    </Button>
                    <LinkButton href="/register" fullWidth>
                      {t('nav.register')}
                    </LinkButton>
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
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-body-md font-medium text-danger"
                    >
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
                            'flex w-full items-center justify-between rounded-md px-3 py-3 text-body-md font-medium transition-colors',
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
                                <Link
                                  key={sub.key}
                                  href={sub.href}
                                  className="block rounded-md px-3 py-2 text-body-sm text-foreground-muted hover:text-foreground"
                                >
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
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <EnhancedLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => setShowLoginModal(false)}
      />

      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />
    </>
  );
}
