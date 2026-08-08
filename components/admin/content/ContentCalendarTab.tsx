'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { toast } from '@/lib/toast';
import { LoadingState, ErrorState } from '@/components/admin/States';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

interface CalendarItem {
  id: string;
  type: 'sermons' | 'events' | 'announcements' | 'blog';
  tab: string;
  title: string;
  date: Date;
}

const SOURCES: { type: CalendarItem['type']; tab: string; endpoint: string; dateField: string; titleField: string; dotClass: string; label: string }[] = [
  { type: 'sermons', tab: 'sermons', endpoint: '/api/admin/content/sermons', dateField: 'date', titleField: 'title', dotClass: 'bg-accent', label: 'Sermons' },
  { type: 'events', tab: 'events', endpoint: '/api/admin/content/events', dateField: 'startDate', titleField: 'title', dotClass: 'bg-warning', label: 'Events' },
  { type: 'announcements', tab: 'announcements', endpoint: '/api/admin/content/announcements', dateField: 'date', titleField: 'title', dotClass: 'bg-info', label: 'Announcements' },
  { type: 'blog', tab: 'blog', endpoint: '/api/admin/blog', dateField: 'date', titleField: 'title', dotClass: 'bg-success', label: 'Blog' },
];

export default function ContentCalendarTab({ onOpenItem }: { onOpenItem: (tab: string, id: string) => void }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [draggedItem, setDraggedItem] = useState<CalendarItem | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all(SOURCES.map((s) => adminFetch(s.endpoint).then((data) => ({ source: s, items: data.items as Record<string, any>[] }))))
      .then((results) => {
        const flat: CalendarItem[] = [];
        results.forEach(({ source, items: raw }) => {
          raw.forEach((item) => {
            const rawDate = item[source.dateField];
            if (!rawDate) return;
            const date = typeof rawDate === 'string' ? parseISO(rawDate) : new Date(rawDate);
            if (Number.isNaN(date.getTime())) return;
            flat.push({ id: item.id, type: source.type, tab: source.tab, title: item[source.titleField] ?? '(untitled)', date });
          });
        });
        setItems(flat);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const itemsForDay = (day: Date) => items.filter((i) => isSameDay(i.date, day));

  const handleDrop = async (targetDay: Date) => {
    const item = draggedItem;
    setDraggedItem(null);
    setDragOverDay(null);
    if (!item || isSameDay(item.date, targetDay)) return;

    const source = SOURCES.find((s) => s.type === item.type)!;
    // Keep the item's original time-of-day, just move it to the dropped date.
    const newDate = new Date(item.date);
    newDate.setFullYear(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate());

    const previousDate = item.date;
    setItems((prev) => prev.map((i) => (i === item ? { ...i, date: newDate } : i)));
    setReschedulingId(item.id);

    try {
      const url = item.type === 'blog' ? `/api/admin/blog/${item.id}` : `/api/admin/content/${item.tab}/${item.id}`;
      await adminFetch(url, { method: 'PUT', body: JSON.stringify({ [source.dateField]: newDate.toISOString() }) });
      toast({ title: `Moved to ${format(targetDay, 'MMM d')}`, variant: 'success' });
    } catch (err: any) {
      setItems((prev) => prev.map((i) => (i === item ? { ...i, date: previousDate } : i)));
      toast({ title: 'Failed to reschedule', description: err.message, variant: 'danger' });
    } finally {
      setReschedulingId(null);
    }
  };

  if (loading) return <LoadingState label="Loading calendar..." />;
  if (error) return <ErrorState message={error} />;

  const selectedItems = selectedDay ? itemsForDay(selectedDay) : [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-title-lg text-foreground">Content Calendar</h2>
          <p className="text-body-sm text-foreground-subtle">Sermons, events, announcements, and blog posts in one view.</p>
        </div>
        <div className="flex items-center gap-2">
          <IconNav onClick={() => setMonth((m) => subMonths(m, 1))}><ChevronLeft className="h-4 w-4" /></IconNav>
          <span className="w-32 text-center text-body-sm font-medium text-foreground">{format(month, 'MMMM yyyy')}</span>
          <IconNav onClick={() => setMonth((m) => addMonths(m, 1))}><ChevronRight className="h-4 w-4" /></IconNav>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-4 text-caption text-foreground-subtle">
        <div className="flex flex-wrap gap-4">
          {SOURCES.map((s) => (
            <span key={s.type} className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', s.dotClass)} /> {s.label}
            </span>
          ))}
        </div>
        <span>Drag an item onto another day to reschedule it</span>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="bg-surface p-2 text-center text-caption font-medium text-foreground-subtle">{d}</div>
        ))}
        {days.map((day) => {
          const dayItems = itemsForDay(day);
          const inMonth = isSameMonth(day, month);
          const isToday = isSameDay(day, new Date());
          const dayKey = day.toISOString();
          return (
            <button
              key={dayKey}
              onClick={() => dayItems.length > 0 && setSelectedDay(day)}
              onDragOver={(e) => { e.preventDefault(); if (dragOverDay !== dayKey) setDragOverDay(dayKey); }}
              onDragLeave={() => setDragOverDay((d) => (d === dayKey ? null : d))}
              onDrop={(e) => { e.preventDefault(); handleDrop(day); }}
              className={cn(
                'min-h-20 bg-background p-1.5 text-left align-top transition-colors',
                !inMonth && 'opacity-40',
                dayItems.length > 0 && 'cursor-pointer hover:bg-surface-hover',
                dragOverDay === dayKey && draggedItem && !isSameDay(draggedItem.date, day) && 'bg-accent-subtle ring-2 ring-inset ring-accent'
              )}
            >
              <span className={cn('inline-flex h-5 w-5 items-center justify-center rounded-full text-caption', isToday ? 'bg-accent text-white' : 'text-foreground-subtle')}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {dayItems.slice(0, 4).map((item) => {
                  const source = SOURCES.find((s) => s.type === item.type)!;
                  return (
                    <span
                      key={item.id}
                      draggable
                      onDragStart={(e) => { e.stopPropagation(); setDraggedItem(item); }}
                      onDragEnd={() => { setDraggedItem(null); setDragOverDay(null); }}
                      className={cn(
                        'h-2 w-2 cursor-grab rounded-full active:cursor-grabbing',
                        source.dotClass,
                        reschedulingId === item.id && 'animate-pulse'
                      )}
                      title={`${item.title} — drag to reschedule`}
                    />
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      <Modal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        size="sm"
        title={
          selectedDay && (
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-foreground-subtle" /> {format(selectedDay, 'MMMM d, yyyy')}
            </span>
          )
        }
      >
        <ul className="space-y-2">
          {selectedItems.map((item) => {
            const source = SOURCES.find((s) => s.type === item.type)!;
            return (
              <li key={item.id}>
                <button
                  onClick={() => { onOpenItem(item.tab, item.id); setSelectedDay(null); }}
                  className="flex w-full items-center gap-2 rounded-md p-2 text-left text-body-sm hover:bg-surface-hover"
                >
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', source.dotClass)} />
                  <span className="flex-1 truncate text-foreground">{item.title}</span>
                  <span className="text-caption text-foreground-subtle">{source.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Modal>
    </div>
  );
}

function IconNav({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground-muted hover:bg-surface-hover hover:text-foreground"
    >
      {children}
    </button>
  );
}
