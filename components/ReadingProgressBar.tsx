'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setProgress(scrollHeight > 0 ? Math.min(100, (window.scrollY / scrollHeight) * 100) : 0);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed left-0 right-0 top-16 z-30 h-0.5 bg-transparent">
      <motion.div className="h-full bg-accent" style={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
    </div>
  );
}
