'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export default function EnhancedLoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let success = false;

      if (isLogin) {
        success = await login(formData.email, formData.password);
      } else {
        success = await register({ name: formData.name, email: formData.email, password: formData.password });
      }

      if (success) {
        onLogin();
        onClose();
        setFormData({ name: '', email: '', password: '' });
      } else {
        setError(isLogin ? 'Invalid email or password' : 'Registration failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isLogin ? 'Welcome Back' : 'Join Our Community'}>
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-subtle px-4 py-3 text-body-sm text-danger">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <Input
            label="Full Name"
            leftIcon={<User />}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your full name"
            required={!isLogin}
          />
        )}

        <Input
          label="Email Address"
          type="email"
          leftIcon={<Mail />}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter your email"
          required
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          leftIcon={<Lock />}
          rightIcon={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="pointer-events-auto text-foreground-subtle hover:text-foreground">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Enter your password"
          required
        />

        <Button type="submit" fullWidth loading={loading}>
          {loading ? (isLogin ? 'Signing In...' : 'Creating Account...') : isLogin ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button onClick={() => setIsLogin(!isLogin)} className="text-body-sm font-medium text-accent hover:text-accent-hover">
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </Modal>
  );
}
