'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export default function AnimatedCard({ 
  children, 
  className = '', 
  delay = 0, 
  hover = true 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={hover ? { 
        y: -10, 
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        transition: { duration: 0.3 }
      } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      className={`${className} transition-all duration-300`}
    >
      {children}
    </motion.div>
  );
}