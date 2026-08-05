'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sermon } from '@/lib/content';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LinkButton } from '@/components/ui/Button';

const AUTO_ADVANCE_MS = 7000;

export default function SermonCarousel({ sermons }: { sermons: Sermon[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused || sermons.length <= 1) return;
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % sermons.length), AUTO_ADVANCE_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, sermons.length]);

  if (sermons.length === 0) return null;
  const sermon = sermons[index];

  const go = (delta: number) => setIndex((i) => (i + delta + sermons.length) % sermons.length);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <Card variant="raised" padding="none" className="overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-video bg-zinc-900 md:aspect-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={sermon.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                {sermon.imageUrl ? (
                  <Image src={sermon.imageUrl} alt={sermon.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <BookOpen className="h-12 w-12 text-white/30" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            {sermons.length > 1 && (
              <>
                <button
                  aria-label="Previous sermon"
                  onClick={() => go(-1)}
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  aria-label="Next sermon"
                  onClick={() => go(1)}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          <div className="flex flex-col justify-center p-8">
            <AnimatePresence mode="wait">
              <motion.div key={sermon.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                {sermon.seriesTitle && <Badge variant="accent" className="mb-3 w-fit">{sermon.seriesTitle}</Badge>}
                <h3 className="text-headline-sm text-foreground">{sermon.title}</h3>
                <p className="mt-2 text-body-sm text-foreground-muted">
                  {sermon.speakerName}
                  {sermon.scripture ? ` · ${sermon.scripture}` : ''}
                </p>
                {sermon.description && (
                  <p className="mt-4 line-clamp-3 text-body-sm text-foreground-muted">{sermon.description}</p>
                )}
                <LinkButton href={`/sermons/${sermon.id}`} className="mt-6 w-fit" leftIcon={<Play className="h-4 w-4" />}>
                  Watch now
                </LinkButton>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Card>
      {sermons.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {sermons.map((s, i) => (
            <button
              key={s.id}
              aria-label={`Show sermon ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-accent' : 'w-1.5 bg-border'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
