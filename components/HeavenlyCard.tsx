'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface HeavenlyCardProps {
  children: ReactNode;
  className?: string;
  glowIntensity?: 'low' | 'medium' | 'high';
  delay?: number;
}

export default function HeavenlyCard({ 
  children, 
  className = '', 
  glowIntensity = 'medium',
  delay = 0 
}: HeavenlyCardProps) {
  const glowClasses = {
    low: 'shadow-lg hover:shadow-xl',
    medium: 'shadow-xl hover:shadow-2xl',
    high: 'shadow-2xl hover:shadow-3xl'
  };

  return (
    <motion.div
      className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-yellow-200/30 dark:border-yellow-700/30 ${glowClasses[glowIntensity]} ${className} hover:border-yellow-300/50 dark:hover:border-yellow-600/50 transition-all duration-300`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
}