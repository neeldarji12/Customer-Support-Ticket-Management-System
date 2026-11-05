import initialData from '../data/db.json' with { type: 'json' };

const STORAGE_KEY = 'cstms_notifications';
let memoryCache = null;

// Pub/Sub listeners for immediate reactive state updates across the app
const listeners = new Set();

export function subscribeNotifications(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners(notifications) {
  listeners.forEach(cb => {
    try {
      cb(notifications);
    } catch (e) {
      console.error('Notification subscriber error:', e);
    }
  });

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('cstms_notifications_updated', { detail: notifications })
      );
    } catch {
      // ignore in non-browser environments
    }
  }
}

function getStoredNotifications() {
  if (typeof window === 'undefined' || !window.localStorage) {
    if (!memoryCache) {
      memoryCache = [...(initialData.notifications || [])];
    }
    return [...memoryCache].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  const local = localStorage.getItem(STORAGE_KEY);
  if (!local) {
    const list = initialData.notifications || [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return [...list].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  try {
    const parsed = JSON.parse(local);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return [];
  } catch (e) {
    console.error('Failed to parse notifications:', e);
    return (initialData.notifications || []).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

function saveNotifications(notifications) {
  memoryCache = notifications;
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }
}

export const notificationApi = {
  async getNotifications() {
    return new Promise(resolve => {
      setTimeout(() => resolve(getStoredNotifications()), 40);
    });
  },

  async addNotification({ title, message, type = 'INFO', ticketId, dedupeKey }) {
    return new Promise(resolve => {
      setTimeout(() => {
        const notifs = getStoredNotifications();
        const now = Date.now();
        const key = dedupeKey || `${ticketId || 'system'}_${type}_${title}`;

        // Deduplication check: prevent identical notification within 3 seconds
        const isDuplicate = notifs.some(n => {
          if (n.dedupeKey === key || (n.ticketId === ticketId && n.type === type && n.title === title)) {
            const diff = now - new Date(n.timestamp).getTime();
            return diff < 3000;
          }
          return false;
        });

        if (isDuplicate) {
          return resolve(notifs[0]);
        }

        const newNotif = {
          id: `notif-${now}-${Math.random().toString(36).substr(2, 4)}`,
          title,
          message,
          type,
          read: false,
          timestamp: new Date().toISOString(),
          ticketId: ticketId || null,
          dedupeKey: key
        };

        const updated = [newNotif, ...notifs];
        saveNotifications(updated);
        notifyListeners(updated);
        resolve(newNotif);
      }, 40);
    });
  },

  async markAsRead(id) {
    return new Promise(resolve => {
      setTimeout(() => {
        const notifs = getStoredNotifications().map(n =>
          n.id === id ? { ...n, read: true } : n
        );
        saveNotifications(notifs);
        notifyListeners(notifs);
        resolve({ success: true });
      }, 30);
    });
  },

  async markAllAsRead() {
    return new Promise(resolve => {
      setTimeout(() => {
        const notifs = getStoredNotifications().map(n => ({ ...n, read: true }));
        saveNotifications(notifs);
        notifyListeners(notifs);
        resolve({ success: true });
      }, 30);
    });
  },

  async deleteNotification(id) {
    return new Promise(resolve => {
      setTimeout(() => {
        const notifs = getStoredNotifications().filter(n => n.id !== id);
        saveNotifications(notifs);
        notifyListeners(notifs);
        resolve({ success: true });
      }, 30);
    });
  },

  async clearAll() {
    return new Promise(resolve => {
      setTimeout(() => {
        saveNotifications([]);
        notifyListeners([]);
        resolve({ success: true });
      }, 30);
    });
  }
};
