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
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LoadingState } from '@/components/ui/States';
import CommandPalette from '@/components/CommandPalette';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  minRole: UserRole;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, minRole: UserRole.ADMIN },
  { href: '/admin/users', label: 'Members', icon: Users, minRole: UserRole.ADMIN },
  { href: '/admin/content', label: 'Content', icon: FileText, minRole: UserRole.ADMIN },
  { href: '/admin/messages', label: 'Messages', icon: Inbox, minRole: UserRole.ADMIN },
  { href: '/admin/media', label: 'Media Library', icon: ImageIcon, minRole: UserRole.ADMIN },
  { href: '/admin/forms', label: 'Forms', icon: ClipboardList, minRole: UserRole.ADMIN },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail, minRole: UserRole.ADMIN },
  { href: '/admin/moderation', label: 'Moderation Queue', icon: ShieldCheck, minRole: UserRole.MODERATOR },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText, minRole: UserRole.ADMIN },
  { href: '/admin/settings', label: 'Settings', icon: SettingsIcon, minRole: UserRole.ADMIN },
];

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

  return (
    <div className="flex min-h-screen bg-surface">
      <aside
        className={cn(
          'sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-background transition-all duration-base ease-standard',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className={cn('flex h-16 items-center border-b border-border', collapsed ? 'justify-center px-2' : 'justify-between px-5')}>
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2 text-title-sm text-foreground">
              <Shield className="h-5 w-5 text-accent" /> Admin
            </Link>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="rounded-md p-1.5 text-foreground-subtle hover:bg-surface-hover hover:text-foreground"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleItems.map((item) => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-body-sm font-medium transition-colors',
                  collapsed && 'justify-center px-0',
                  active ? 'bg-accent-subtle text-accent' : 'text-foreground-muted hover:bg-surface-hover hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div className={cn('border-t border-border p-3', collapsed && 'flex justify-center')}>
          <button
            onClick={() => logout()}
            title="Log out"
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-body-sm font-medium text-foreground-muted transition-colors hover:bg-danger-subtle hover:text-danger',
              collapsed && 'justify-center px-0'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && 'Log out'}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-background px-6">
          <Breadcrumbs items={activeItem ? [{ label: 'Admin', href: '/admin' }, { label: activeItem.label }] : [{ label: 'Admin' }]} />

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-body-sm text-foreground-subtle hover:border-border-strong hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-caption sm:inline">⌘K</kbd>
            </button>
            <Badge variant={ROLE_BADGE_VARIANT[role]}>{ROLE_LABEL[role]}</Badge>
            <div className="flex items-center gap-2">
              <Avatar name={user.displayName || user.firstName || user.email} size="sm" />
              <span className="hidden text-body-sm text-foreground md:inline">{user.displayName || user.firstName || user.email}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />
    </div>
  );
}
