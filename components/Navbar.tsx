'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Church, Menu, X, ChevronDown, User, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import SearchModal from '@/components/SearchModal';
import { Search } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import EnhancedLoginModal from './EnhancedLoginModal';

const navigation = [
  { name: 'Home', href: '/' },
  { 
    name: 'About', 
    href: '/about/beliefs',
    dropdown: [
      { name: 'Our Beliefs', href: '/about/beliefs' },
      { name: 'Our Branches', href: '/about/branches' },
      { name: 'Our Pastors', href: '/about/pastors' },
      { name: 'Our History', href: '/about/history' }
    ]
  },
  { name: 'Services', href: '/services' },
  { 
    name: 'Ministries', 
    href: '/ministries',
    dropdown: [
      { name: 'All Ministries', href: '/ministries' },
      { name: 'Children', href: '/ministries#children' },
      { name: 'Youth', href: '/ministries#youth' },
      { name: 'Adults', href: '/ministries#adults' }
    ]
  },
  { name: 'Events', href: '/events' },
  { name: 'Sermons', href: '/sermons' },
  { name: 'Community', href: '/community' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Give', href: '/give' },
  { name: 'Contact', href: '/contact/forms' }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const { user, logout } = useAuth();
  const themeContext = useTheme();
  const theme = themeContext?.theme || 'light';
  const toggleTheme = themeContext?.toggleTheme || (() => {});
  const { language, t } = useLanguage();

  const pathname = usePathname();

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleLogin = () => {
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    logout();
    setActiveDropdown(null);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg fixed w-full top-0 z-50 transition-colors">
      {/* Logo - Responsive */}
      <div className="absolute left-2 sm:left-4 top-2 z-10">
        <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1 sm:p-1.5 rounded-lg">
            <Church className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
              Welcome to<br />Salem Primitive Baptist Church
            </h1>
          </div>
          <div className="md:hidden">
            <h1 className="text-xs font-bold text-gray-900 dark:text-white">
              SPBC
            </h1>
          </div>
        </Link>
      </div>
      
      {/* Top Right Auth Buttons */}
      <div className="absolute right-2 sm:right-4 top-2 sm:top-4 z-20">
        <div className="flex items-center space-x-1 sm:space-x-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => toggleDropdown('user')}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 min-w-0 max-w-[120px] sm:max-w-none"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3" />
                </div>
                <span className="truncate hidden sm:block">{user.name}</span>
                <span className="truncate sm:hidden">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 flex-shrink-0" />
              </button>
              
              <AnimatePresence>
                {activeDropdown === 'user' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2"
                  >
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      My Profile
                    </Link>
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      Dashboard
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-all duration-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 btn-touch whitespace-nowrap"
              >
                Login
              </button>
              <Link
                href="/register"
                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 btn-touch whitespace-nowrap text-center min-w-[60px] sm:min-w-[80px]"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 pl-20 sm:pl-32 md:pl-48">

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-3">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 ${
                          pathname === item.href
                            ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
                            : 'text-gray-700 dark:text-gray-300 hover:text-blue-600'
                        }`}
                      >
                        {item.name}
                        <motion.div
                          animate={{ rotate: activeDropdown === item.name ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </motion.div>
                      </Link>
                    </motion.div>
                    
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2"
                        >
                          {item.dropdown.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              href={dropdownItem.href}
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 transition-colors"
                            >
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={item.href}
                      className={`px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 ${
                        pathname === item.href
                          ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
                          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Search Bar & Theme Toggle */}
          <div className="hidden lg:flex items-center space-x-6 mr-40 ml-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                onClick={() => setShowSearchModal(true)}
                className="pl-9 pr-4 py-2 w-40 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm cursor-pointer"
                readOnly
              />
            </div>



            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all duration-300"
              aria-label="Toggle theme"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.5 }}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </motion.div>
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center ml-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors btn-touch"
            >
              {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
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
            className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mobile-menu"
          >
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Auth Buttons */}
              {!user && (
                <div className="flex flex-col space-y-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowLoginModal(true);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-center"
                  >
                    Login
                  </button>
                  <Link
                    href="/register"
                    className="w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
              
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.dropdown ? (
                    <div>
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className="flex items-center justify-between w-full px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                      >
                        {item.name}
                        <ChevronDown className={`h-4 w-4 transition-transform ${
                          activeDropdown === item.name ? 'rotate-180' : ''
                        }`} />
                      </button>
                      <AnimatePresence>
                        {activeDropdown === item.name && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-4 mt-2 space-y-2"
                          >
                            {item.dropdown.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.name}
                                href={dropdownItem.href}
                                className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                                onClick={() => setIsOpen(false)}
                              >
                                {dropdownItem.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 text-base font-medium transition-colors ${
                        pathname === item.href
                          ? 'text-blue-600'
                          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              

            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <EnhancedLoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
      
      <SearchModal 
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </nav>
  );
}