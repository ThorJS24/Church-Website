'use client';

import { useEffect, useState } from 'react';
import NotificationSystem, { useNotifications } from './NotificationSystem';
import WelcomeMessage from './WelcomeMessage';

import { LanguageProvider } from '../contexts/LanguageContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { notifications, addNotification, removeNotification } = useNotifications();
  const [user, setUser] = useState<{ name: string; email?: string } | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  // Check for logged in user on mount only
  useEffect(() => {
    const mockUser = localStorage.getItem('user');
    if (mockUser) {
      const userData = JSON.parse(mockUser);
      setUser(userData);
      setShowWelcome(true);
    }
  }, []);

  // Global notification function
  useEffect(() => {
    (window as any).showNotification = addNotification;
  }, [addNotification]);

  return (
    <LanguageProvider>
      {showWelcome && user && (
        <WelcomeMessage 
          user={user} 
        />
      )}
      
      <NotificationSystem 
        notifications={notifications}
        onRemove={removeNotification}
      />
      
      {children}
    </LanguageProvider>
  );
}