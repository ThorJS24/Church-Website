'use client';

import { motion } from 'framer-motion';
import { Heart, Star, Cross } from 'lucide-react';

export default function FloatingElements() {
  const elements = [
    { Icon: Heart, delay: 0, x: '10%', y: '20%' },
    { Icon: Star, delay: 2, x: '80%', y: '30%' },
    { Icon: Cross, delay: 4, x: '20%', y: '70%' },
    { Icon: Heart, delay: 6, x: '90%', y: '80%' },
    { Icon: Star, delay: 8, x: '5%', y: '50%' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      {elements.map(({ Icon, delay, x, y }, index) => (
        <motion.div
          key={index}
          className="absolute text-blue-200/20 dark:text-blue-400/10"
          style={{ left: x, top: y }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Icon className="w-8 h-8" />
        </motion.div>
      ))}
    </div>
  );
}