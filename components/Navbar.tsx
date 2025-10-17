'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Church, Menu, X, ChevronDown, User, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

import { motion, AnimatePresence } from 'framer-motion';
import LoginModal from './LoginModal';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
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
  { name: 'Gallery', href: '/gallery' },
  { name: 'Give', href: '/give' },
  { name: 'Contact', href: '/contact' }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const themeContext = useTheme();
  const theme = themeContext?.theme || 'light';
  const toggleTheme = themeContext?.toggleTheme || (() => {});
  const { language, toggleLanguage, t } = useLanguage();

  const pathname = usePathname();

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(userData));
    (window as any).showNotification?.({ 
      type: 'success', 
      title: 'Welcome!', 
      message: 'You have successfully logged in.' 
    });
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    (window as any).showNotification?.({ 
      type: 'info', 
      title: 'Goodbye!', 
      message: 'You have been logged out.' 
    });
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg fixed w-full top-0 z-50 transition-colors">
      {/* Logo - Absolute Top Left */}
      <div className="absolute left-2 top-2 z-10">
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 rounded-lg">
            <Church className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
              Welcome to<br />Salem Primitive Baptist Church
            </h1>
          </div>
          <div className="sm:hidden">
            <h1 className="text-xs font-bold text-gray-900 dark:text-white">
              SPBC
            </h1>
          </div>
        </Link>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 pl-32 sm:pl-48">

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 flex-1">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? 'text-blue-600'
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      {item.name}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Link>
                    
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
                  <Link
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'text-blue-600'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Theme Toggle & Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('user')}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span>{user?.name || 'User'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                <AnimatePresence>
                  {activeDropdown === 'user' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                    >
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        My Profile
                      </Link>
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        Dashboard
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </button>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
            className="lg:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-6 space-y-4">
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
              
              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-gray-200">
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setShowLoginModal(true);
                        setIsOpen(false);
                      }}
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors w-full text-left"
                    >
                      Login
                    </button>
                    <Link
                      href="/register"
                      className="block px-3 py-2 text-base font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </nav>
  );
}