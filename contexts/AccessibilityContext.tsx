'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type TextSize = 'normal' | 'large' | 'larger';

interface AccessibilityContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [textSize, setTextSizeState] = useState<TextSize>('normal');
  const [highContrast, setHighContrast] = useState(false);

  // Read persisted preferences after mount and apply them in place, rather
  // than gating the Provider itself behind a `mounted` flag — that would
  // mean AccessibilityMenu (and its useId()-based DropdownMenu) renders
  // `null` during SSR/initial hydration and then mounts moments later,
  // shifting how many useId()-consuming components exist ahead of other
  // Radix primitives (like CommandPalette's DialogTitle) further down the
  // tree between renders — the suspected cause of an intermittent id
  // hydration-mismatch warning seen once during a full-site audit.
  useEffect(() => {
    const savedTextSize = localStorage.getItem('a11y-text-size') as TextSize | null;
    if (savedTextSize) {
      setTextSizeState(savedTextSize);
      document.documentElement.setAttribute('data-text-size', savedTextSize);
    }
    const savedHighContrast = localStorage.getItem('a11y-high-contrast') === 'true';
    setHighContrast(savedHighContrast);
    document.documentElement.classList.toggle('high-contrast', savedHighContrast);
  }, []);

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
    localStorage.setItem('a11y-text-size', size);
    document.documentElement.setAttribute('data-text-size', size);
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => {
      const next = !prev;
      localStorage.setItem('a11y-high-contrast', String(next));
      document.documentElement.classList.toggle('high-contrast', next);
      return next;
    });
  };

  return (
    <AccessibilityContext.Provider value={{ textSize, setTextSize, highContrast, toggleHighContrast }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  return context;
}
