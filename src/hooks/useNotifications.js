import { useState, useEffect, useCallback, useMemo } from 'react';
import { notificationApi, subscribeNotifications } from '../services/notificationApi';
import initialData from '../data/db.json';

export function useNotifications() {
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const local = localStorage.getItem('cstms_notifications');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            return parsed.sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          }
        } catch {
          // ignore error
        }
      }
    }
    return [...(initialData.notifications || [])].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  });

  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  useEffect(() => {
    notificationApi.getNotifications()
      .then(data => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // 1. Subscribe to pub/sub for instant reactive state updates
    const unsubscribe = subscribeNotifications((updated) => {
      setNotifications(
        [...updated].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      );
    });

    // 2. Window storage & custom events for multi-tab sync
    const handleCustomUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setNotifications(
          [...e.detail].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        );
      }
    };

    const handleStorage = (e) => {
      if (e.key === 'cstms_notifications') {
        try {
          const parsed = JSON.parse(e.newValue || '[]');
          if (Array.isArray(parsed)) {
            setNotifications(
              parsed.sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              )
            );
          }
        } catch {
          // ignore
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cstms_notifications_updated', handleCustomUpdate);
      window.addEventListener('storage', handleStorage);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('cstms_notifications_updated', handleCustomUpdate);
        window.removeEventListener('storage', handleStorage);
      }
    };
  }, []);

  const addNotification = async ({ title, message, type = 'INFO', ticketId, dedupeKey }) => {
    const created = await notificationApi.addNotification({
      title,
      message,
      type,
      ticketId,
      dedupeKey
    });
    return created;
  };

  const markAsRead = async (id) => {
    // Instant optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await notificationApi.markAsRead(id);
  };

  const markAllAsRead = async () => {
    // Instant optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await notificationApi.markAllAsRead();
  };

  const deleteNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await notificationApi.deleteNotification(id);
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    await notificationApi.clearAll();
  };

  // Immediate calculation of unread notifications
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refresh: fetchNotifications
  };
}
