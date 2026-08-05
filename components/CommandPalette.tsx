'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, Home, Calendar, BookOpen, Users, Heart, Camera, Phone, Gift,
  FileText, ClipboardList, Image as ImageIcon, Megaphone, ShieldCheck, CornerDownLeft, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useMounted } from '@/hooks/useMounted';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const sermons = (r.sermons ?? []).map((s: any) => ({
    id: `sermon-${s.id}`,
    type: 'sermon' as const,
    title: s.title,
    excerpt: s.speakerName,
    url: `/sermons/${s.id}`,
    icon: BookOpen,
  }));
  const events = (r.events ?? []).map((e: any) => ({
    id: `event-${e.id}`,
    type: 'event' as const,
    title: e.title,
    excerpt: e.date,
    url: `/events/${e.id}`,
    icon: Calendar,
  }));
  const announcements = (r.announcements ?? []).map((a: any) => ({
    id: `announcement-${a.id}`,
    type: 'announcement' as const,
    title: a.title,
    excerpt: 'Announcement',
    url: '/',
    icon: Megaphone,
  }));
  const gallery = (r.gallery ?? []).map((g: any) => ({
    id: `gallery-${g.id}`,
    type: 'gallery' as const,
    title: g.title,
    excerpt: 'Gallery',
    url: '/gallery',
    icon: ImageIcon,
  }));
  const blogPosts = (r.blogPosts ?? []).map((p: any) => ({
    id: `blog-${p.id}`,
    type: 'blog' as const,
    title: p.title,
    excerpt: p.excerpt,
    url: `/blog/${p.slug ?? p.id}`,
    icon: FileText,
  }));
  const forms = (r.forms ?? []).map((f: any) => ({
    id: `form-${f.id}`,
    type: 'form' as const,
    title: f.title,
    excerpt: f.description ?? 'Form',
    url: `/forms/${f.id}`,
    icon: ClipboardList,
  }));
  return [...sermons, ...events, ...blogPosts, ...announcements, ...gallery, ...forms];
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const mounted = useMounted();
  const { canAccessAdminPanel } = useAuth();
  const { t } = useLanguage();

  useFocusTrap(isOpen, onClose, containerRef);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
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

  const staticMatches = useMemo(() => {
    const links: ResultItem[] = STATIC_LINKS.map((l) => ({ ...l }));
    if (canAccessAdminPanel()) {
      links.push({ id: 'admin', type: 'link', title: 'Admin dashboard', url: '/admin', icon: ShieldCheck });
    }
    if (!query.trim()) return links.slice(0, 6);
    const needle = query.toLowerCase();
    return links.filter((l) => l.title.toLowerCase().includes(needle));
  }, [query, canAccessAdminPanel]);

  const items = useMemo(() => [...staticMatches, ...results], [staticMatches, results]);

  useEffect(() => setActiveIndex(0), [items.length, query]);

  const navigate = (item: ResultItem) => {
    router.push(item.url);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[activeIndex]) navigate(items[activeIndex]);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-start justify-center px-4 pt-[12vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-zinc-950/50 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('common.search') || 'Search'}
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-background shadow-xl"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              {loading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-foreground-subtle" aria-hidden="true" />
              ) : (
                <Search className="h-4 w-4 shrink-0 text-foreground-subtle" aria-hidden="true" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search sermons, events, blog, forms…"
                className="h-14 w-full bg-transparent text-body-md text-foreground placeholder:text-foreground-subtle focus:outline-hidden"
                role="combobox"
                aria-expanded={items.length > 0}
                aria-controls="command-palette-list"
                aria-activedescendant={items[activeIndex] ? `cmd-${items[activeIndex].id}` : undefined}
              />
              <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-caption text-foreground-subtle sm:block">
                Esc
              </kbd>
            </div>

            <ul id="command-palette-list" role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
              {items.length === 0 && !loading && (
                <li className="px-3 py-8 text-center text-body-sm text-foreground-subtle">
                  {query.trim() ? 'No results found' : 'Type to search, or jump straight to a page'}
                </li>
              )}
              {items.map((item, i) => {
                const Icon = item.icon;
                const isActive = i === activeIndex;
                return (
                  <li key={item.id} id={`cmd-${item.id}`} role="option" aria-selected={isActive}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => navigate(item)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-fast',
                        isActive ? 'bg-accent-subtle' : 'hover:bg-surface-hover'
                      )}
                    >
                      <Icon
                        className={cn('h-4 w-4 shrink-0', isActive ? 'text-accent' : 'text-foreground-subtle')}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body-sm text-foreground">{item.title}</span>
                        {item.excerpt && (
                          <span className="block truncate text-caption text-foreground-subtle">{item.excerpt}</span>
                        )}
                      </span>
                      {isActive && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
