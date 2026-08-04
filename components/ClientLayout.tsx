'use client';

import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import NotificationSystem, { useNotifications } from './NotificationSystem';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { notifications, addNotification, removeNotification } = useNotifications();

  // Global notification function
  useEffect(() => {
    (window as any).showNotification = addNotification;
  }, [addNotification]);

  return (
    // reducedMotion="user" makes every framer-motion animation in the app
    // respect the OS-level prefers-reduced-motion setting automatically —
    // the CSS media query in globals.css only covers native CSS
    // transitions/animations, not framer-motion's own JS-driven ones.
    <MotionConfig reducedMotion="user">
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />

      {children}
    </MotionConfig>
  );
}