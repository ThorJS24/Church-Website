'use client';

import { useEffect } from 'react';
import NotificationSystem, { useNotifications } from './NotificationSystem';
import Navbar from './Navbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { notifications, addNotification, removeNotification } = useNotifications();

  // Global notification function
  useEffect(() => {
    (window as any).showNotification = addNotification;
  }, [addNotification]);

  return (
    <>
      <Navbar />
      
      <div className="pt-16">
        <NotificationSystem 
          notifications={notifications}
          onRemove={removeNotification}
        />
        
        {children}
      </div>
    </>
  );
}