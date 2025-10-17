'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { signInWithGoogle } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { name: string; email: string }) => void;
}

const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    resetEmail: '',
    resetPhone: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser = { 
      name: 'John Doe', 
      email: loginType === 'email' ? formData.email : `user@phone-${formData.phone}.com` 
    };
    onLogin(mockUser);
    onClose();
    setFormData({ email: '', phone: '', password: '', resetEmail: '', resetPhone: '' });
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      
      const userData = {
        name: user.displayName || 'User',
        email: user.email || '',
        photoURL: user.photoURL,
        uid: user.uid
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      onLogin(userData);
      onClose();
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert('Google sign-in failed. Please try again.');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    (window as any).showNotification?.({
      type: 'info',
      title: 'Reset Link Sent',
      message: `Password reset instructions sent to your ${loginType}.`
    });
    setShowForgotPassword(false);
    setFormData({ ...formData, resetEmail: '', resetPhone: '' });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                {showForgotPassword && (
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="mr-3 text-gray-400 hover:text-gray-600"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {showForgotPassword ? 'Reset Password' : 'Login'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {!showForgotPassword ? (
              <>
                {/* Login Type Toggle */}
                <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setLoginType('email')}
                    className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      loginType === 'email'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </button>
                  <button
                    onClick={() => setLoginType('phone')}
                    className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      loginType === 'phone'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Phone
                  </button>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {loginType === 'email' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter your email"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Login
                  </button>
                </form>
                
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleGoogleSignIn}
                    className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </>
            ) : (
              /* Forgot Password Form */
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Enter your {loginType} address and we'll send you a link to reset your password.
                </p>

                {loginType === 'email' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.resetEmail}
                      onChange={(e) => setFormData({ ...formData, resetEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your email"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.resetPhone}
                      onChange={(e) => setFormData({ ...formData, resetPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your phone number"
                    />
                  </div>
                )}

                <div className="flex mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setLoginType('email')}
                    className={`flex-1 flex items-center justify-center py-1 px-3 rounded-md text-xs font-medium transition-colors ${
                      loginType === 'email'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginType('phone')}
                    className={`flex-1 flex items-center justify-center py-1 px-3 rounded-md text-xs font-medium transition-colors ${
                      loginType === 'phone'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Phone
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginModal;