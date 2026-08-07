'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book } from 'lucide-react';

interface ScriptureReferenceProps {
  reference: string;
  verse: string;
  version?: string;
}

export default function ScriptureReference({ reference, verse, version = 'NKJV' }: ScriptureReferenceProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const expanded = isHovered || isPinned;

  // Hover alone doesn't work on touch devices — tapping toggles a "pinned"
  // open state instead, closed by tapping the reference again or tapping
  // anywhere else on the page.
  useEffect(() => {
    if (!isPinned) return;
    const onOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsPinned(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [isPinned]);

  return (
    <span ref={rootRef} className="relative inline-block">
      <button
        type="button"
        aria-expanded={expanded}
        className="inline-flex items-center gap-1 text-caption font-medium text-accent underline decoration-dotted underline-offset-2 transition-colors hover:text-accent-hover"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsPinned((prev) => !prev)}
      >
        <Book className="h-3 w-3" />
        {reference}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 z-50 mb-2 max-h-96 -translate-x-1/2 overflow-y-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="min-w-80 w-max max-w-2xl rounded-xl border border-border bg-background px-4 py-3 shadow-lg">
              <div className="space-y-1">
                <div className="text-caption font-medium text-foreground">
                  {reference} ({version})
                </div>
                <div className="whitespace-pre-line font-serif text-caption italic leading-relaxed text-foreground-muted">
                  "{verse}"
                </div>
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-t-4 border-transparent border-t-border" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}