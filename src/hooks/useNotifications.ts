import { useState, useCallback, useEffect } from 'react';
import { notificationService } from '@/services/database';
import type { AppNotification } from '@/types';

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(() => {
    if (!userId) return;
    const userNotifs = notificationService.getByUser(userId);
    setNotifications(userNotifs);
    setUnreadCount(userNotifs.filter(n => !n.isRead).length);
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 10 seconds to simulate live updates
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = useCallback((id: string) => {
    notificationService.markAsRead(id);
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(() => {
    if (!userId) return;
    notificationService.markAllAsRead(userId);
    fetchNotifications();
  }, [userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
}