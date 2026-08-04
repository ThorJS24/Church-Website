'use client';

import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useMounted } from '@/hooks/useMounted';
import { IconButton } from './IconButton';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  side?: 'left' | 'right' | 'bottom';
  className?: string;
}

const SIDE_STYLES = {
  left: {
    position: 'inset-y-0 left-0 h-full w-full max-w-sm border-r',
    initial: { x: '-100%' },
  },
  right: {
    position: 'inset-y-0 right-0 h-full w-full max-w-sm border-l',
    initial: { x: '100%' },
  },
  bottom: {
    position: 'inset-x-0 bottom-0 w-full max-h-[85vh] rounded-t-2xl border-t',
    initial: { y: '100%' },
  },
};

export function Drawer({ isOpen, onClose, title, children, side = 'right', className }: DrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  useFocusTrap(isOpen, onClose, containerRef);

  if (!mounted) return null;
  const { position, initial } = SIDE_STYLES[side];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'drawer-title' : undefined}
            initial={initial}
            animate={{ x: 0, y: 0 }}
            exit={initial}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              'absolute flex flex-col overflow-hidden bg-background border-border shadow-xl',
              position,
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                <h2 id="drawer-title" className="text-title-md text-foreground">
                  {title}
                </h2>
                <IconButton label="Close" size="sm" onClick={onClose}>
                  <X />
                </IconButton>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
