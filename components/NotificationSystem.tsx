'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationSystem = ({ notifications, onRemove }: NotificationSystemProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5" />;
      case 'error': return <XCircle className="h-5 w-5" />;
      case 'warning': return <AlertCircle className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success-subtle border-success/30 text-success';
      case 'error': return 'bg-danger-subtle border-danger/30 text-danger';
      case 'warning': return 'bg-warning-subtle border-warning/30 text-warning';
      default: return 'bg-info-subtle border-info/30 text-info';
    }
  };

  return (
    <div className="fixed top-24 right-4 z-50 max-w-sm space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={cn('rounded-lg border p-4 shadow-lg', getColors(notification.type))}
          >
            <div className="flex items-start">
              <div className="mr-3 shrink-0">{getIcon(notification.type)}</div>
              <div className="flex-1">
                <h4 className="text-body-sm font-semibold">{notification.title}</h4>
                <p className="mt-1 text-body-sm">{notification.message}</p>
              </div>
              <button
                onClick={() => onRemove(notification.id)}
                className="ml-2 shrink-0 text-foreground-subtle hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification
  };
};

export default NotificationSystem;
