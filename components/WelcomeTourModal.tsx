'use client';

import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Church, Book, Heart, Users, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useMounted } from '@/hooks/useMounted';
import { cn } from '@/lib/cn';

const SLIDES = [
  { icon: Church, title: 'Welcome to the Family!', description: "We're glad you're here. This dashboard is your home base — let's take a quick look around." },
  { icon: Book, title: 'Catch Up on Sermons', description: 'Browse and save your favorite sermons to revisit anytime from your library.' },
  { icon: Heart, title: 'Prayer & Community', description: "Submit prayer requests, see what others are praying for, and let us know how we can support you." },
  { icon: Users, title: 'Get Involved', description: 'Explore ministries and small groups, or sign up to volunteer — your quick actions are right on this page.' },
];

export function WelcomeTourModal({ onClose }: { onClose: () => void }) {
  const { updateUser } = useAuth();
  const [index, setIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  useFocusTrap(true, onClose, modalRef);

  const finish = async () => {
    await updateUser({ hasSeenWelcomeTour: true });
    onClose();
  };

  if (!mounted) return null;
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome tour"
        tabIndex={-1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl">
          <IconButton label="Skip tour" size="sm" variant="ghost" onClick={finish} className="absolute right-3 top-3">
            <X className="h-4 w-4" />
          </IconButton>

          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }} className="pt-4 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle">
                <slide.icon className="h-7 w-7 text-accent" />
              </div>
              <h2 className="text-title-lg text-foreground">{slide.title}</h2>
              <p className="mt-2 text-body-sm text-foreground-muted">{slide.description}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex justify-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn('h-2 w-2 rounded-full transition-colors', i === index ? 'bg-accent' : 'bg-surface-active hover:bg-surface-hover')}
              />
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            {index > 0 && (
              <Button variant="outline" leftIcon={<ChevronLeft className="h-4 w-4" />} onClick={() => setIndex((i) => i - 1)}>Back</Button>
            )}
            <Button fullWidth rightIcon={!isLast ? <ChevronRight className="h-4 w-4" /> : undefined} onClick={() => (isLast ? finish() : setIndex((i) => i + 1))}>
              {isLast ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
