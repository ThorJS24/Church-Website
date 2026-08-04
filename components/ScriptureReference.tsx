'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book } from 'lucide-react';

interface ScriptureReferenceProps {
  reference: string;
  verse: string;
  version?: string;
}

export default function ScriptureReference({ reference, verse, version = 'NKJV' }: ScriptureReferenceProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        className="inline-flex items-center gap-1 text-caption font-medium text-accent underline decoration-dotted underline-offset-2 transition-colors hover:text-accent-hover"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Book className="h-3 w-3" />
        {reference}
      </button>

      <AnimatePresence>
        {isHovered && (
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
                <div className="whitespace-pre-line text-caption italic leading-relaxed text-foreground-muted">
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