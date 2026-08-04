'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Church, Menu, X, ChevronDown, User, LogOut, Sun, Moon, Search,
  Home, Calendar, BookOpen, Users, Heart, Camera, Phone, Gift
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import SearchModal from '@/components/SearchModal';
import LanguageToggle from '@/components/LanguageToggle';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedLoginModal from './EnhancedLoginModal';

const navigationItems = [
  { 
    key: 'home', 
    href: '/', 
    icon: Home, 
    labelKey: 'nav.home',
    primary: true
  },
  { 
    key: 'about', 
    href: '/about/beliefs', 
    icon: Users, 
    labelKey: 'nav.about',
    dropdown: [
      { key: 'beliefs', href: '/about/beliefs', labelKey: 'nav.beliefs' },
      { key: 'branches', href: '/about/branches', labelKey: 'nav.branches' },
      { key: 'pastors', href: '/about/pastors', labelKey: 'nav.pastors' },
      { key: 'history', href: '/about/history', labelKey: 'nav.history' }
    ]
  },
  { 
    key: 'services', 
    href: '/services', 
    icon: Heart, 
    labelKey: 'nav.services',
    primary: true
  },
  { 
    key: 'events', 
    href: '/events', 
    icon: Calendar, 
    labelKey: 'nav.events',
    primary: true
  },
  { 
    key: 'sermons', 
    href: '/sermons', 
    icon: BookOpen, 
    labelKey: 'nav.sermons',
    primary: true
  },
  { 
    key: 'ministries', 
    href: '/ministries', 
    icon: Users, 
    labelKey: 'nav.ministries',
    dropdown: [
      { key: 'all', href: '/ministries', labelKey: 'nav.allMinistries' },
      { key: 'children', href: '/ministries#children', labelKey: 'nav.children' },
      { key: 'youth', href: '/ministries#youth', labelKey: 'nav.youth' },
      { key: 'adults', href: '/ministries#adults', labelKey: 'nav.adults' },
      { key: 'smallGroups', href: '/small-groups', labelKey: 'nav.smallGroups' },
      { key: 'testimonials', href: '/testimonials', labelKey: 'nav.testimonials' }
    ]
  },
  {
    key: 'community',
    href: '/community',
    icon: Users,
    labelKey: 'nav.community'
  },
  {
    key: 'gallery',
    href: '/gallery',
    icon: Camera,
    labelKey: 'nav.gallery'
  },
  {
    key: 'blog',
    href: '/blog',
    icon: BookOpen,
    labelKey: 'nav.blog'
  },
  {
    key: 'give',
    href: '/give', 
    icon: Gift, 
    labelKey: 'nav.give'
  },
  { 
    key: 'contact', 
    href: '/contact', 
    icon: Phone, 
    labelKey: 'nav.contact'
  }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme() || { theme: 'light', toggleTheme: () => {} };
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const handleNavigation = (href: string) => {
    setIsOpen(false);
    setActiveDropdown(null);
    router.push(href);
  };

  const handleLogout = async () => {
    await logout();
    setActiveDropdown(null);
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const primaryItems = navigationItems.filter(item => item.primary);
  const secondaryItems = navigationItems.filter(item => !item.primary);

  return (
    <>
      <nav 
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50' 
            : 'bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-3 group transition-transform hover:scale-105"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 rounded-xl">
                  <Church className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Salem PBC
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  {t('nav.tagline')}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {primaryItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <motion.div
                    key={item.key}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={item.href}
                      className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                    >
                      <Icon className={`h-4 w-4 transition-colors ${
                        active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 group-hover:text-blue-600'
                      }`} />
                      <span>{t(item.labelKey)}</span>
                      {active && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
              
              {/* More Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleDropdown('more')}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                >
                  <span>{t('nav.more')}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                    activeDropdown === 'more' ? 'rotate-180' : ''
                  }`} />
                </motion.button>
                
                <AnimatePresence>
                  {activeDropdown === 'more' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2 overflow-hidden"
                    >
                      {secondaryItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.key}>
                            {item.dropdown ? (
                              <div className="relative group/sub">
                                <Link
                                  href={item.href}
                                  className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                  <div className="flex items-center space-x-3">
                                    <Icon className="h-4 w-4 text-gray-500" />
                                    <span>{t(item.labelKey)}</span>
                                  </div>
                                  <ChevronDown className="h-4 w-4 -rotate-90" />
                                </Link>
                                <div className="absolute left-full top-0 ml-1 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                                  {item.dropdown.map((subItem) => (
                                    <Link
                                      key={subItem.key}
                                      href={subItem.href}
                                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                      {t(subItem.labelKey)}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <Link
                                href={item.href}
                                className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                              >
                                <Icon className="h-4 w-4 text-gray-500" />
                                <span>{t(item.labelKey)}</span>
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearchModal(true)}
                className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
                aria-label={t('common.search')}
              >
                <Search className="h-5 w-5" />
              </motion.button>

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
                aria-label={t('nav.toggleTheme')}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </motion.button>

              {/* Language Toggle */}
              <LanguageToggle />

              {/* Auth Section */}
              {user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleDropdown('user')}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl border border-blue-200/50 dark:border-blue-700/50 transition-all duration-200"
                  >
                    <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-24 truncate">
                      {user.displayName || user.firstName || user.email}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </motion.button>
                  
                  <AnimatePresence>
                    {activeDropdown === 'user' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2 overflow-hidden"
                      >
                        <Link 
                          href="/profile" 
                          className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          {t('nav.profile')}
                        </Link>
                        <Link 
                          href="/dashboard" 
                          className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          {t('nav.dashboard')}
                        </Link>
                        <hr className="my-2 border-gray-200 dark:border-gray-600" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('nav.logout')}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
                  >
                    {t('nav.login')}
                  </motion.button>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/register"
                      className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {t('nav.register')}
                    </Link>
                  </motion.div>
                </div>
              )}

              {/* Mobile menu button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="px-4 py-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
                {/* Mobile Auth */}
                {!user && (
                  <div className="flex space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setShowLoginModal(true);
                        setIsOpen(false);
                      }}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 text-center"
                    >
                      {t('nav.login')}
                    </button>
                    <Link
                      href="/register"
                      className="flex-1 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      {t('nav.register')}
                    </Link>
                  </div>
                )}
                
                {/* Mobile Navigation Items */}
                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <div key={item.key}>
                        {item.dropdown ? (
                          <div>
                            <button
                              onClick={() => toggleDropdown(item.key)}
                              className={`flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                                active
                                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <Icon className={`h-5 w-5 ${
                                  active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
                                }`} />
                                <span>{t(item.labelKey)}</span>
                              </div>
                              <ChevronDown className={`h-4 w-4 transition-transform ${
                                activeDropdown === item.key ? 'rotate-180' : ''
                              }`} />
                            </button>
                            <AnimatePresence>
                              {activeDropdown === item.key && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="ml-8 mt-2 space-y-1"
                                >
                                  {item.dropdown.map((subItem) => (
                                    <Link
                                      key={subItem.key}
                                      href={subItem.href}
                                      className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                                      onClick={() => handleNavigation(subItem.href)}
                                    >
                                      {t(subItem.labelKey)}
                                    </Link>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                              active
                                ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                            onClick={() => handleNavigation(item.href)}
                          >
                            <Icon className={`h-5 w-5 ${
                              active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
                            }`} />
                            <span>{t(item.labelKey)}</span>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      <EnhancedLoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => setShowLoginModal(false)}
      />
      
      <SearchModal 
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </>
  );
}