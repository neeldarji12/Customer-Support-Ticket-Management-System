import initialData from '../data/db.json' with { type: 'json' };
import { apiRequest } from './apiClient.js';

const STORAGE_KEY = 'cstms_activities';
let memoryCache = null;

function getStoredActivities() {
  if (typeof window === 'undefined' || !window.localStorage) {
    if (!memoryCache) {
      memoryCache = [...(initialData.activities || [])];
    }
    return [...memoryCache];
  }
  const local = localStorage.getItem(STORAGE_KEY);
  if (!local) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData.activities || []));
    return initialData.activities || [];
  }
  try {
    const parsed = JSON.parse(local);
    return Array.isArray(parsed) ? parsed : (initialData.activities || []);
  } catch {
    return initialData.activities || [];
  }
}

function saveStoredActivities(activities) {
  memoryCache = activities;
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }
}

export const activityApi = {
  // GET /activities (or GET /activities?ticketId=:id)
  async getActivities(ticketId) {
    try {
      const endpoint = ticketId ? `/activities?ticketId=${encodeURIComponent(ticketId)}` : '/activities';
      const data = await apiRequest(endpoint);
      if (Array.isArray(data)) {
        const allLocal = getStoredActivities();
        if (ticketId) {
          const others = allLocal.filter(a => a.ticketId !== ticketId);
          saveStoredActivities([...others, ...data]);
        } else {
          saveStoredActivities(data);
        }
        return [...data].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }
    } catch {
      // JSON Server offline or network unreachable: seamlessly fall back to local mock
    }

    const activities = getStoredActivities().filter(a => !ticketId || a.ticketId === ticketId);
    return [...activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  // GET /activities?ticketId=:id
  async getActivitiesByTicketId(ticketId) {
    return this.getActivities(ticketId);
  },

  // GET /activities (with limit)
  async getRecentActivities(limit = 10) {
    try {
      const data = await apiRequest(`/activities?_sort=timestamp&_order=desc&_limit=${limit}`);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // JSON Server offline: fall back to local mock
    }
    const activities = getStoredActivities();
    const sorted = [...activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return sorted.slice(0, limit);
  },

  // POST /activities
  async logActivity({
    ticketId,
    action = 'UPDATE',
    type,
    previousValue = null,
    newValue = null,
    author = { name: 'Jordan Lee', role: 'Support Agent' },
    description,
    timestamp = new Date().toISOString()
  }) {
    const newAct = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ticketId,
      action: action || type || 'UPDATE',
      type: type || action || 'UPDATE',
      previousValue,
      newValue,
      author,
      description: description || `${action} event recorded`,
      timestamp
    };

    // 1. Optimistic persistence in local storage
    const activities = getStoredActivities();
    saveStoredActivities([newAct, ...activities]);

    // 2. Transmit to JSON Server if available
    try {
      await apiRequest('/activities', {
        method: 'POST',
        body: newAct
      });
    } catch {
      // JSON Server offline: local storage already persisted
    }

    return newAct;
  },

  // Prevent orphaned activities upon ticket deletion
  async deleteActivitiesByTicketId(ticketId) {
    const activities = getStoredActivities();
    const toDelete = activities.filter(a => a.ticketId === ticketId);
    const remaining = activities.filter(a => a.ticketId !== ticketId);
    saveStoredActivities(remaining);

    // Delete associated activities from JSON Server if running
    try {
      await Promise.all(
        toDelete.map(a =>
          apiRequest(`/activities/${a.id}`, { method: 'DELETE' }).catch(() => {})
        )
      );
    } catch {
      // offline: local storage already purged
    }

    return { success: true, purgedCount: toDelete.length };
  }
};
