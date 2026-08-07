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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) {
    return <>{children}</>;
  }

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
