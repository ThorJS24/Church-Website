'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase';
import { IconButton } from '@/components/ui/icon-button';
import type { ButtonSize } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/states';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string | null;
}

export function NotificationBell({ size }: { size?: ButtonSize }) {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    if (!user) return;
    const token = await getIdToken();
    if (!token) return;
    const res = await fetch('/api/member/notifications', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.success) {
      setItems(data.notifications);
      setUnreadCount(data.unreadCount);
    }
  }, [user]);

  useEffect(() => {
    load();
    // Light polling — good enough for a first pass without adding a
    // websocket/SSE channel just for notification counts.
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  const markRead = async (id: string) => {
    const token = await getIdToken();
    if (!token) return;
    await fetch(`/api/member/notifications/${id}/read`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  if (!user) return null;

  return (
    <DropdownMenu onOpenChange={(open) => open && load()}>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <IconButton label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`} size={size}>
            <Bell />
          </IconButton>
          {unreadCount > 0 && (
            <span className="pointer-events-none absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="px-3 py-2.5 text-body-sm">Notifications</DropdownMenuLabel>
        <div className="max-h-96 overflow-y-auto border-t border-border">
          {items.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications yet" description="We'll let you know when something needs your attention." />
          ) : (
            items.map((n) => {
              const content = (
                <div className="flex gap-2">
                  {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />}
                  <div className={n.read ? 'ml-3.5' : ''}>
                    <p className="text-body-sm font-medium text-foreground">{n.title}</p>
                    <p className="mt-0.5 text-caption text-foreground-muted">{n.message}</p>
                    {n.createdAt && (
                      <p className="mt-1 text-caption text-foreground-subtle">
                        {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              );
              return n.link ? (
                <Link
                  key={n.id}
                  href={n.link}
                  onClick={() => !n.read && markRead(n.id)}
                  className="block border-b border-border px-3 py-3 last:border-0 hover:bg-surface-hover"
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.read && markRead(n.id)}
                  className="block w-full border-b border-border px-3 py-3 text-left last:border-0 hover:bg-surface-hover"
                >
                  {content}
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
