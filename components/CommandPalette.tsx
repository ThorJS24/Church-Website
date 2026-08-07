'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Home, Calendar, BookOpen, Users, Heart, Camera, Phone, Gift,
  FileText, ClipboardList, Image as ImageIcon, Megaphone, ShieldCheck, Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ResultItem {
  id: string;
  type: 'sermon' | 'event' | 'announcement' | 'gallery' | 'blog' | 'form' | 'link';
  title: string;
  excerpt?: string;
  url: string;
  icon: typeof Search;
}

const STATIC_LINKS: Omit<ResultItem, 'excerpt'>[] = [
  { id: 'home', type: 'link', title: 'Home', url: '/', icon: Home },
  { id: 'services', type: 'link', title: 'Services', url: '/services', icon: Heart },
  { id: 'events', type: 'link', title: 'Events', url: '/events', icon: Calendar },
  { id: 'sermons', type: 'link', title: 'Sermons', url: '/sermons', icon: BookOpen },
  { id: 'ministries', type: 'link', title: 'Ministries', url: '/ministries', icon: Users },
  { id: 'gallery', type: 'link', title: 'Gallery', url: '/gallery', icon: Camera },
  { id: 'blog', type: 'link', title: 'Blog', url: '/blog', icon: BookOpen },
  { id: 'give', type: 'link', title: 'Give', url: '/give', icon: Gift },
  { id: 'contact', type: 'link', title: 'Contact', url: '/contact', icon: Phone },
];

function normalizeResults(json: any): ResultItem[] {
  const r = json?.results ?? {};
  const sermons = (r.sermons ?? []).map((s: any) => ({ id: `sermon-${s.id}`, type: 'sermon' as const, title: s.title, excerpt: s.speakerName, url: `/sermons/${s.id}`, icon: BookOpen }));
  const events = (r.events ?? []).map((e: any) => ({ id: `event-${e.id}`, type: 'event' as const, title: e.title, excerpt: e.date, url: `/events/${e.id}`, icon: Calendar }));
  const announcements = (r.announcements ?? []).map((a: any) => ({ id: `announcement-${a.id}`, type: 'announcement' as const, title: a.title, excerpt: 'Announcement', url: '/', icon: Megaphone }));
  const gallery = (r.gallery ?? []).map((g: any) => ({ id: `gallery-${g.id}`, type: 'gallery' as const, title: g.title, excerpt: 'Gallery', url: '/gallery', icon: ImageIcon }));
  const blogPosts = (r.blogPosts ?? []).map((p: any) => ({ id: `blog-${p.id}`, type: 'blog' as const, title: p.title, excerpt: p.excerpt, url: `/blog/${p.slug ?? p.id}`, icon: FileText }));
  const forms = (r.forms ?? []).map((f: any) => ({ id: `form-${f.id}`, type: 'form' as const, title: f.title, excerpt: f.description ?? 'Form', url: `/forms/${f.id}`, icon: ClipboardList }));
  return [...sermons, ...events, ...blogPosts, ...announcements, ...gallery, ...forms];
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { canAccessAdminPanel } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`);
        const json = await res.json();
        setResults(normalizeResults(json));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  const links = useMemo(() => {
    const list: ResultItem[] = STATIC_LINKS.map((l) => ({ ...l }));
    if (canAccessAdminPanel()) list.push({ id: 'admin', type: 'link', title: 'Admin dashboard', url: '/admin', icon: ShieldCheck });
    return list;
  }, [canAccessAdminPanel]);

  const navigate = (item: ResultItem) => {
    router.push(item.url);
    onClose();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={(open) => !open && onClose()} title={t('common.search') || 'Search'} description="Search sermons, events, blog, forms, and pages">
      <CommandInput value={query} onValueChange={setQuery} placeholder="Search sermons, events, blog, forms…" />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-6 text-body-sm text-foreground-subtle">
            <Loader2 className="h-4 w-4 animate-spin" /> Searching…
          </div>
        )}
        {!loading && <CommandEmpty>{query.trim() ? 'No results found' : 'Type to search, or jump straight to a page'}</CommandEmpty>}
        {results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem key={item.id} value={item.id} onSelect={() => navigate(item)}>
                  <Icon className="text-foreground-subtle" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{item.title}</span>
                    {item.excerpt && <span className="block truncate text-caption text-foreground-subtle">{item.excerpt}</span>}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
        <CommandGroup heading="Pages">
          {links.filter((l) => !query.trim() || l.title.toLowerCase().includes(query.toLowerCase())).map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem key={item.id} value={item.id} onSelect={() => navigate(item)}>
                <Icon className="text-foreground-subtle" aria-hidden="true" />
                {item.title}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
