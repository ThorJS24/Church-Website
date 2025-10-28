'use client';

import { useEffect } from 'react';
import NotificationSystem, { useNotifications } from './NotificationSystem';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { notifications, addNotification, removeNotification } = useNotifications();

  // Global notification function
  useEffect(() => {
    (window as any).showNotification = addNotification;
  }, [addNotification]);

  return (
    <>
      <NotificationSystem 
        notifications={notifications}
        onRemove={removeNotification}
      />
      
      {children}
    </>
  );
}