'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  Phone
} from 'lucide-react';

const navigationItems = [
  {
    key: 'home',
    href: '/',
    icon: Home,
    labelKey: 'nav.home'
  },
  {
    key: 'prayer',
    href: '/prayer',
    icon: MessageSquare,
    labelKey: 'nav.prayer'
  },
  {
    key: 'events',
    href: '/events',
    icon: Calendar,
    labelKey: 'nav.events'
  },
  {
    key: 'sermons',
    href: '/sermons',
    icon: BookOpen,
    labelKey: 'nav.sermons'
  },
  {
    key: 'contact',
    href: '/contact',
    icon: Phone,
    labelKey: 'nav.contact'
  }
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <div className="h-16 md:hidden" />
      
      <nav 
        className="
          fixed bottom-0 left-0 right-0 z-40 md:hidden
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
          border-t border-gray-200/50 dark:border-gray-700/50 shadow-2xl
        "
        role="navigation"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <motion.div
                key={item.key}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Link
                  href={item.href}
                  className={`
                    flex flex-col items-center justify-center px-3 py-2
                    min-w-[60px] min-h-[60px] rounded-2xl transition-all duration-300
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${
                      active 
                        ? 'text-blue-600 dark:text-blue-400 bg-gradient-to-t from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 shadow-lg transform -translate-y-1' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:transform hover:-translate-y-0.5'
                    }
                  `}
                  aria-label={t(item.labelKey)}
                  aria-current={active ? 'page' : undefined}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <Icon 
                      className={`w-5 h-5 mb-1 transition-colors ${
                        active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                      }`}
                      aria-hidden="true"
                    />
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                  <span 
                    className={`
                      text-xs font-medium leading-none transition-colors
                      ${
                        active 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-600 dark:text-gray-400'
                      }
                    `}
                  >
                    {t(item.labelKey)}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="activeBackground"
                      className="absolute inset-0 bg-gradient-to-t from-blue-100/50 to-purple-100/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>
    </>
  );
}