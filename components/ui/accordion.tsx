'use client';

import { createContext, useContext, useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionContextValue {
  openItems: Set<string>;
  toggle: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export interface AccordionProps {
  children: ReactNode;
  type?: 'single' | 'multiple';
  defaultOpen?: string[];
  className?: string;
}

export function Accordion({ children, type = 'single', defaultOpen = [], className }: AccordionProps) {
  const [openItems, setOpenItems] = useState(new Set(defaultOpen));

  const toggle = (id: string) => {
    setOpenItems((prev) => {
      const next = type === 'single' ? new Set<string>() : new Set(prev);
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className={cn('divide-y divide-border', className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ id, title, children }: { id: string; title: ReactNode; children: ReactNode }) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionItem must be used within <Accordion>');
  const { openItems, toggle } = ctx;
  const isOpen = openItems.has(id);
  const panelId = useId();

  return (
    <div>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => toggle(id)}
        className="flex w-full items-center justify-between gap-4 border-0 bg-transparent py-4 text-left"
      >
        <span className="text-title-sm text-foreground">{title}</span>
        <ChevronDown
          className={cn('h-5 w-5 shrink-0 text-foreground-subtle transition-transform duration-base ease-standard', isOpen && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-body-sm text-foreground-muted">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
