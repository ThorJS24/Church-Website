'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book } from 'lucide-react';

interface ScriptureReferenceProps {
  reference: string;
  verse: string;
  version?: string;
}

export default function ScriptureReference({ reference, verse, version = 'NKJV' }: ScriptureReferenceProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors underline decoration-dotted underline-offset-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Book className="w-3 h-3 mr-1" />
        {reference}
      </button>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 max-h-96 overflow-y-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-xl px-4 py-3 min-w-80 max-w-2xl w-max">
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-900 dark:text-white">
                  {reference} ({version})
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-300 italic leading-relaxed whitespace-pre-line">
                  "{verse}"
                </div>
              </div>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-gray-600"></div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800 -mt-1"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}