'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, CalendarDays } from 'lucide-react';
import { getEvents, getServiceTimes, EventItem } from '@/lib/content';
import { getEventCategory, expandServicesToEvents } from '@/lib/eventCategories';
import { IconButton } from '@/components/ui/icon-button';
import { Modal } from '@/components/ui/modal';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EventModal from '@/components/EventModal';

type CalendarEvent = Pick<EventItem, 'id' | 'title' | 'startDate' | 'location' | 'category'> & Partial<EventItem>;

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function InteractiveCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{ date: Date; events: CalendarEvent[] } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const [eventsData, servicesData] = await Promise.all([getEvents(), getServiceTimes()]);
        const real = (eventsData || []).filter((e) => e.startDate);
        const recurring = expandServicesToEvents(servicesData || [], 12);
        setEvents([...real, ...recurring]);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const result: (number | null)[] = Array.from({ length: firstDay.getDay() }, () => null);
    for (let day = 1; day <= lastDay.getDate(); day++) result.push(day);
    return result;
  }, [currentDate]);

  const getEventsForDay = (day: number) => {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return !isNaN(eventDate.getTime()) && eventDate.toDateString() === dayDate.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + (direction === 'prev' ? -1 : 1));
      return next;
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-border bg-surface p-6">
        <div className="mb-4 h-8 rounded bg-surface-active" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-surface-active" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <div className="bg-accent p-6 text-accent-foreground">
        <div className="mb-5 flex items-center justify-between">
          <IconButton label="Previous month" onClick={() => navigateMonth('prev')} className="text-accent-foreground hover:bg-white/10">
            <ChevronLeft />
          </IconButton>
          <div className="flex items-center gap-3">
            <h2 className="text-title-lg" key={currentDate.getMonth()}>
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <DropdownMenu onOpenChange={(open) => open && setPickerYear(currentDate.getFullYear())}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Jump to month"
                  className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-caption text-accent-foreground transition-colors hover:bg-white/20"
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 bg-background p-3 text-foreground">
                <div className="mb-2 flex items-center justify-between">
                  <IconButton
                    label="Previous year"
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      setPickerYear((y) => y - 1);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </IconButton>
                  <span className="text-body-sm font-semibold text-foreground">{pickerYear}</span>
                  <IconButton
                    label="Next year"
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      setPickerYear((y) => y + 1);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </IconButton>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {MONTH_NAMES.map((m, i) => (
                    <DropdownMenuItem
                      key={m}
                      onSelect={() => setCurrentDate(new Date(pickerYear, i, 1))}
                      className="justify-center text-center"
                    >
                      {m.slice(0, 3)}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <IconButton label="Next month" onClick={() => navigateMonth('next')} className="text-accent-foreground hover:bg-white/10">
            <ChevronRight />
          </IconButton>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {DAY_NAMES.map((d) => (
            <div key={d} className="rounded-md bg-white/10 py-2 text-center text-caption font-semibold">{d}</div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto bg-surface p-4">
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day, index) => {
            if (!day) {
              // Leading/trailing blank grid cells (days outside this month)
              // — purely structural filler, never interactive, so this must
              // not be a <button> (an empty disabled button has no
              // accessible name and fails WCAG 4.1.2 / axe's button-name
              // check).
              // Inline style, not the border-transparent utility: globals.css
              // sets an unlayered `* { border-color }` default that always
              // beats layered utility classes, so only an inline style can
              // actually force this border invisible.
              return <div key={index} className="min-h-20 rounded-lg border" style={{ borderColor: 'transparent' }} aria-hidden="true" />;
            }

            const dayEvents = getEventsForDay(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
              <motion.button
                key={index}
                type="button"
                onClick={() => {
                  if (dayEvents.length === 0) return;
                  const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  if (dayEvents.length === 1) setSelectedEvent(dayEvents[0]);
                  else setSelectedDay({ date: dayDate, events: dayEvents });
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(index * 0.005, 0.2) }}
                className={cn(
                  'flex min-h-20 flex-col rounded-lg border p-1.5 text-left transition-shadow',
                  !isToday && 'border-border bg-background hover:shadow-sm',
                  isToday && 'border-accent bg-accent text-accent-foreground'
                )}
              >
                <span className={cn('mb-1 text-caption font-bold', isToday ? 'text-accent-foreground' : 'text-foreground-muted')}>{day}</span>
                <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((event) => {
                    const cat = getEventCategory(event.category || 'default');
                    return (
                      <span key={event.id} className={cn('truncate rounded px-1.5 py-0.5 text-left text-caption text-white', cat.dotClass)}>
                        {event.title}
                      </span>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <span className="text-caption text-foreground-subtle">+{dayEvents.length - 2} more</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <Modal isOpen={!!selectedDay} onClose={() => setSelectedDay(null)} title={selectedDay?.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}>
        <div className="space-y-3">
          {selectedDay?.events.map((event) => {
            const cat = getEventCategory(event.category || 'default');
            return (
              <button
                key={event.id}
                onClick={() => {
                  setSelectedDay(null);
                  setSelectedEvent(event);
                }}
                className="w-full rounded-lg border border-border p-4 text-left transition-colors hover:border-accent"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-title-sm text-foreground">{event.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-body-sm text-foreground-muted">
                      <Clock className="h-3.5 w-3.5" /> {new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                    {event.location && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-body-sm text-foreground-muted">
                        <MapPin className="h-3.5 w-3.5" /> {event.location}
                      </p>
                    )}
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2 py-1 text-caption text-white', cat.dotClass)}>{cat.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>

      <EventModal event={selectedEvent} isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
