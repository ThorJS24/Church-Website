'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  align: 'left' | 'right';
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('Dropdown.* must be used within <Dropdown>');
  return ctx;
}

export interface DropdownProps {
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ children, align = 'left', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, align }}>
      <div ref={rootRef} className={cn('relative inline-block', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownTrigger({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { isOpen, setIsOpen } = useDropdownContext();
  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      onClick={() => setIsOpen(!isOpen)}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenu({ children, className }: { children: ReactNode; className?: string }) {
  const { isOpen, align } = useDropdownContext();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            'absolute z-40 mt-2 min-w-[12rem] overflow-hidden rounded-lg border border-border bg-background p-1 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DropdownItem({
  children,
  className,
  onClick,
  destructive,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { destructive?: boolean }) {
  const { setIsOpen } = useDropdownContext();
  return (
    <button
      type="button"
      role="menuitem"
      onClick={(e) => {
        onClick?.(e);
        setIsOpen(false);
      }}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-body-sm transition-colors duration-fast',
        destructive ? 'text-danger hover:bg-danger-subtle' : 'text-foreground hover:bg-surface-hover',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-border" role="separator" />;
}
