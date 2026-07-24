'use client';

import { useState, useRef, useEffect } from 'react';
import { Languages, ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { code: 'en', name: 'English', nameNative: 'English', flag: '🇺🇸' },
  { code: 'ta', name: 'Tamil', nameNative: 'தமிழ்', flag: '🇮🇳' }
];

export default function LanguageToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { language, setLanguage } = useLanguage();

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleLanguageChange = (langCode: 'en' | 'ta') => {
    setLanguage(langCode);
    setIsOpen(false);
    
    // Trigger a page refresh to ensure all components update
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleKeyDown = (event: React.KeyboardEvent, langCode: 'en' | 'ta') => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleLanguageChange(langCode);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="
          inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium
          text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 
          border border-gray-300 dark:border-gray-600 rounded-xl
          hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400
          hover:border-blue-300 dark:hover:border-blue-600
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-all duration-200 shadow-sm hover:shadow-md
        "
        aria-label="Language Selector"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline font-medium">
          {currentLanguage.nameNative}
        </span>
        <span className="text-lg leading-none">{currentLanguage.flag}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="
              absolute right-0 z-50 mt-2 w-48 bg-white/95 dark:bg-gray-800/95 
              backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 
              rounded-2xl shadow-xl ring-1 ring-black/5 focus:outline-none overflow-hidden
            "
            role="listbox"
            aria-label="Language Selector"
          >
            <div className="py-2">
              {languages.map((lang) => (
                <motion.button
                  key={lang.code}
                  whileHover={{ x: 4 }}
                  onClick={() => handleLanguageChange(lang.code as 'en' | 'ta')}
                  onKeyDown={(e) => handleKeyDown(e, lang.code as 'en' | 'ta')}
                  className={`
                    w-full text-left px-4 py-3 text-sm transition-all duration-200
                    hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300
                    focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/30 focus:text-blue-700 dark:focus:text-blue-300
                    ${
                      language === lang.code 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 font-medium border-r-2 border-blue-500' 
                        : 'text-gray-700 dark:text-gray-300'
                    }
                  `}
                  role="option"
                  aria-selected={language === lang.code}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{lang.flag}</span>
                      <div>
                        <div className="font-medium">{lang.nameNative}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {lang.name}
                        </div>
                      </div>
                    </div>
                    {language === lang.code && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-blue-500 rounded-full"
                      />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}