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
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${glowClasses[glowIntensity]} ${className} transition-all duration-300`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -1, transition: { duration: 0.2 } }}
    >
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
}