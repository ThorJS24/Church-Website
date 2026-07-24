'use client';

import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText, ShieldCheck, ScrollText, Settings as SettingsIcon,
  Shield, LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, roleAtLeast } from '@/lib/permissions';

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

const ROLE_BADGE_COLOR: Record<UserRole, string> = {
  [UserRole.MEMBER]: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  [UserRole.MODERATOR]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  [UserRole.ADMIN]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  [UserRole.SUPER_ADMIN]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout, canAccessAdminPanel } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user || !canAccessAdminPanel()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">Admin access required.</p>
        </div>
      </div>
    );
  }

  const role = user.role as UserRole;
  const visibleItems = NAV_ITEMS.filter(item => roleAtLeast(role, item.minRole));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <Shield className="w-6 h-6 text-blue-600 mr-2" />
          <span className="font-bold text-gray-900 dark:text-white">Admin Panel</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {visibleItems.map((item) => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Salem Primitive Baptist Church
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_BADGE_COLOR[role]}`}>
                {ROLE_LABEL[role]}
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-200">
                {user.displayName || user.firstName || user.email}
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
