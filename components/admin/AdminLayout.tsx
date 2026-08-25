'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText, ShieldCheck, ScrollText, Settings as SettingsIcon,
  Shield, LogOut, Image as ImageIcon, ClipboardList, Mail, Inbox, Search, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, roleAtLeast } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { LoadingState } from '@/components/ui/states';
import CommandPalette from '@/components/CommandPalette';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  minRole: UserRole;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

// Grouped by function instead of one flat list — the sidebar reads as a
// small information architecture (Overview / Content / Community / System),
// not an alphabetized or arbitrarily-ordered menu.
const NAV_SECTIONS: NavSection[] = [
  { label: 'Overview', items: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, minRole: UserRole.MODERATOR },
  ] },
  { label: 'Content', items: [
    { href: '/admin/content', label: 'Content', icon: FileText, minRole: UserRole.ADMIN },
    { href: '/admin/media', label: 'Media Library', icon: ImageIcon, minRole: UserRole.ADMIN },
    { href: '/admin/forms', label: 'Forms', icon: ClipboardList, minRole: UserRole.ADMIN },
    { href: '/admin/newsletter', label: 'Newsletter', icon: Mail, minRole: UserRole.ADMIN },
  ] },
  { label: 'Community', items: [
    { href: '/admin/users', label: 'Members', icon: Users, minRole: UserRole.ADMIN },
    { href: '/admin/messages', label: 'Messages', icon: Inbox, minRole: UserRole.ADMIN },
    { href: '/admin/moderation', label: 'Moderation Queue', icon: ShieldCheck, minRole: UserRole.MODERATOR },
  ] },
  { label: 'System', items: [
    { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText, minRole: UserRole.ADMIN },
    { href: '/admin/settings', label: 'Settings', icon: SettingsIcon, minRole: UserRole.ADMIN },
  ] },
];

const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.MEMBER]: 'Member',
  [UserRole.MODERATOR]: 'Moderator',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.SUPER_ADMIN]: 'Super Admin',
};

const ROLE_BADGE_VARIANT: Record<UserRole, BadgeVariant> = {
  [UserRole.MEMBER]: 'neutral',
  [UserRole.MODERATOR]: 'info',
  [UserRole.ADMIN]: 'accent',
  [UserRole.SUPER_ADMIN]: 'warning',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout, canAccessAdminPanel } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!canAccessAdminPanel()) {
      router.replace('/');
    }
  }, [isLoading, user, canAccessAdminPanel, router]);

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

  if (isLoading) return <LoadingState />;

  if (!user || !canAccessAdminPanel()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="mx-auto mb-4 h-16 w-16 text-foreground-subtle" />
          <h1 className="text-headline-sm text-foreground">Access Denied</h1>
          <p className="mt-2 text-body-md text-foreground-muted">Admin access required.</p>
        </div>
      </div>
    );
  }

  const role = user.role as UserRole;
  const visibleItems = NAV_ITEMS.filter((item) => roleAtLeast(role, item.minRole));
  const activeItem = visibleItems.find((item) => (item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)));

  const visibleSections = NAV_SECTIONS
    .map((section) => ({ ...section, items: section.items.filter((item) => roleAtLeast(role, item.minRole)) }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Dark sidebar with an accent top strip and grouped sections —
          distinct from a flat, undifferentiated nav list, and the search
          trigger lives here (not in the header) so the header can stay a
          slim contextual bar. */}
      <aside
        className={cn(
          'sticky top-0 flex h-screen shrink-0 flex-col bg-[#14161A] text-white/90 transition-all duration-base ease-standard',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="h-1 w-full bg-accent" aria-hidden="true" />
        <div className={cn('flex h-14 items-center', collapsed ? 'justify-center px-2' : 'justify-between px-5')}>
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2 font-display text-title-sm text-white">
              <Shield className="h-5 w-5 text-accent" /> Admin
            </Link>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <div className="px-3 pb-2">
          <button
            onClick={() => setShowCommandPalette(true)}
            title="Search"
            className={cn(
              'flex w-full items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-body-sm text-white/50 hover:border-white/20 hover:text-white',
              collapsed && 'justify-center px-0'
            )}
          >
            <Search className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Search</span>
                <kbd className="border border-white/10 px-1.5 py-0.5 font-mono text-caption">⌘K</kbd>
              </>
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
          {visibleSections.map((section) => (
            <div key={section.label}>
              {!collapsed && <p className="mb-1.5 px-3 font-mono text-caption font-semibold uppercase tracking-wide text-white/35">{section.label}</p>}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 border-l-2 px-3 py-2 text-body-sm font-medium transition-colors',
                        collapsed && 'justify-center px-0',
                        active ? 'border-accent bg-white/10 text-white' : 'border-transparent text-white/65 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={cn('border-t border-white/10 p-3', collapsed && 'flex justify-center')}>
          <div className={cn('mb-2 flex items-center gap-2 px-3', collapsed && 'px-0')}>
            <Avatar name={user.displayName || user.firstName || user.email} size="sm" />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm text-white">{user.displayName || user.firstName || user.email}</p>
                <Badge variant={ROLE_BADGE_VARIANT[role]} className="mt-0.5">{ROLE_LABEL[role]}</Badge>
              </div>
            )}
          </div>
          <button
            onClick={() => logout()}
            title="Log out"
            className={cn(
              'flex items-center gap-3 border-l-2 border-transparent px-3 py-2 text-body-sm font-medium text-white/60 transition-colors hover:border-danger hover:bg-danger-subtle hover:text-danger',
              collapsed && 'justify-center px-0'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && 'Log out'}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center border-b border-border bg-background px-6">
          <Breadcrumbs items={activeItem ? [{ label: 'Admin', href: '/admin' }, { label: activeItem.label }] : [{ label: 'Admin' }]} />
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />
    </div>
  );
}
