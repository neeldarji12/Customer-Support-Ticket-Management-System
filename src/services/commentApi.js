import initialData from '../data/db.json' with { type: 'json' };
import { apiRequest } from './apiClient.js';
import { activityApi } from './activityApi.js';

const STORAGE_KEY = 'cstms_comments';
let memoryCache = null;

function getStoredComments() {
  if (typeof window === 'undefined' || !window.localStorage) {
    if (!memoryCache) {
      memoryCache = [...(initialData.comments || [])];
    }
    return [...memoryCache];
  }
  const local = localStorage.getItem(STORAGE_KEY);
  if (!local) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData.comments || []));
    return initialData.comments || [];
  }
  try {
    const parsed = JSON.parse(local);
    return Array.isArray(parsed) ? parsed : (initialData.comments || []);
  } catch {
    return initialData.comments || [];
  }
}

function saveComments(comments) {
  memoryCache = comments;
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
  }
}

export const commentApi = {
  // GET /comments (or GET /comments?ticketId=:id)
  async getComments(ticketId) {
    try {
      const endpoint = ticketId ? `/comments?ticketId=${encodeURIComponent(ticketId)}` : '/comments';
      const data = await apiRequest(endpoint);
      if (Array.isArray(data)) {
        const allLocal = getStoredComments();
        if (ticketId) {
          const others = allLocal.filter(c => c.ticketId !== ticketId);
          saveComments([...others, ...data]);
        } else {
          saveComments(data);
        }
        return [...data].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      }
    } catch {
      // JSON Server offline or network failure: seamlessly fall back to local mock
    }

    const comments = getStoredComments().filter(c => !ticketId || c.ticketId === ticketId);
    return [...comments].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  },

  // GET /comments?ticketId=:id
  async getCommentsByTicketId(ticketId) {
    return this.getComments(ticketId);
  },

  // POST /comments (Add customer reply or private internal note)
  async addComment(ticketId, comment) {
    if (!comment || !comment.content || !comment.content.trim()) {
      throw new Error('Comment message cannot be blank or whitespace-only.');
    }

    const isInternal = Boolean(comment.isInternal);
    const commentType = isInternal ? 'INTERNAL_NOTE' : 'CUSTOMER_REPLY';

    const newComment = {
      id: `cmt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ticketId,
      type: commentType,
      isInternal,
      author: comment.author || {
        name: 'Jordan Lee',
        role: 'Support Specialist',
        avatar: '/assets/avatars/avatar-1.svg'
      },
      content: comment.content.trim(),
      createdAt: new Date().toISOString()
    };

    // 1. Optimistic persistence in local storage
    const localComments = getStoredComments();
    saveComments([...localComments, newComment]);

    // 2. Transmit to JSON Server if available
    try {
      const serverComment = await apiRequest('/comments', {
        method: 'POST',
        body: newComment
      });
      if (serverComment && serverComment.id) {
        // sync server response
      }
    } catch {
      // JSON Server offline: local storage is already updated
    }

    // 3. Register in Activity Audit
    activityApi.logActivity({
      ticketId,
      action: isInternal ? 'NOTE_ADDED' : 'REPLY_SENT',
      type: isInternal ? 'NOTE_ADDED' : 'NOTE_ADDED',
      previousValue: null,
      newValue: isInternal ? 'Internal Note' : 'Public Reply',
      author: newComment.author,
      description: isInternal
        ? `Internal note added by ${newComment.author?.name || 'Agent'}`
        : `Customer reply sent by ${newComment.author?.name || 'Agent'}`
    }).catch(() => {});

    return newComment;
  },

  // DELETE /comments?ticketId=:id (Purge associated comments when ticket is deleted)
  async deleteCommentsByTicketId(ticketId) {
    const comments = getStoredComments();
    const toDelete = comments.filter(c => c.ticketId === ticketId);
    const remaining = comments.filter(c => c.ticketId !== ticketId);
    saveComments(remaining);

    // Delete associated comments from JSON Server if running
    try {
      await Promise.all(
        toDelete.map(c =>
          apiRequest(`/comments/${c.id}`, { method: 'DELETE' }).catch(() => {})
        )
      );
    } catch {
      // offline: local storage already purged
    }

    return { success: true, purgedCount: toDelete.length };
  }
};
