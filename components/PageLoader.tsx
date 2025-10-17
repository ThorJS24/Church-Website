'use client';

import { motion } from 'framer-motion';
import { Church } from 'lucide-react';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center"
        >
          <Church className="h-8 w-8 text-white" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-gray-600 dark:text-gray-300 text-lg font-medium"
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
};

export default PageLoader;