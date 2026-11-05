import initialData from '../data/db.json' with { type: 'json' };
import { apiRequest } from './apiClient.js';
import { activityApi } from './activityApi.js';
import { notificationApi } from './notificationApi.js';
import { commentApi } from './commentApi.js';
import { isValidStatusTransition, formatTicketNumber } from '../utils/ticketHelpers.js';

const STORAGE_KEY = 'cstms_tickets';
let memoryCache = null;

function getStoredTickets() {
  if (typeof window === 'undefined' || !window.localStorage) {
    if (!memoryCache) {
      memoryCache = [...(initialData.tickets || [])];
    }
    return [...memoryCache];
  }
  const local = localStorage.getItem(STORAGE_KEY);
  if (!local) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData.tickets || []));
    return initialData.tickets || [];
  }
  try {
    const parsed = JSON.parse(local);
    return Array.isArray(parsed) ? parsed : (initialData.tickets || []);
  } catch (e) {
    console.error('Failed to parse stored tickets:', e);
    return initialData.tickets || [];
  }
}

function saveStoredTickets(tickets) {
  memoryCache = tickets;
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  }
}

export const ticketApi = {
  // GET /tickets
  async getTickets() {
    try {
      const data = await apiRequest('/tickets');
      if (Array.isArray(data) && data.length > 0) {
        saveStoredTickets(data);
        return data;
      }
    } catch {
      // JSON Server offline or network unreachable: seamlessly fall back to local mock
    }
    return [...getStoredTickets()];
  },

  // GET /tickets/:id
  async getTicketById(id) {
    try {
      const data = await apiRequest(`/tickets/${id}`);
      if (data && data.id) {
        return data;
      }
    } catch (err) {
      if (err.status === 404) {
        // Fall back to local storage check before rejecting
        const local = getStoredTickets().find(t => t.id === id);
        if (local) return { ...local };
        throw new Error(`Ticket #${id} was not found.`);
      }
      // JSON Server offline: fall back to local mock
    }

    const ticket = getStoredTickets().find(t => t.id === id);
    if (ticket) return { ...ticket };
    throw new Error(`Ticket #${id} was not found.`);
  },

  // POST /tickets
  async createTicket(ticketData) {
    const tickets = getStoredTickets();
    const hoursMap = { URGENT: 24, HIGH: 48, MEDIUM: 72, LOW: 120 };
    const slaHours = hoursMap[ticketData.priority] || 72;
    const nowIso = new Date().toISOString();
    const computedDueDate =
      ticketData.dueDate || new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();

    const newTicket = {
      id: `TCK-${1000 + tickets.length + 1}`,
      status: ticketData.status || 'OPEN',
      ...ticketData,
      dueDate: computedDueDate,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // 1. Optimistic local persistence
    const updated = [newTicket, ...tickets];
    saveStoredTickets(updated);

    // 2. Transmit to JSON Server
    try {
      await apiRequest('/tickets', {
        method: 'POST',
        body: newTicket
      });
    } catch {
      // JSON Server offline: local storage already persisted
    }

    // 3. Record Activity Audit Log
    activityApi.logActivity({
      ticketId: newTicket.id,
      action: 'TICKET_CREATED',
      type: 'TICKET_CREATED',
      previousValue: null,
      newValue: 'OPEN',
      author: { name: newTicket.customer?.name || 'Customer Requester', role: 'Customer' },
      description: `Ticket created by ${newTicket.customer?.name || 'Customer'}`
    }).catch(() => {});

    // 4. Notification for Ticket Creation
    const ticketNum = formatTicketNumber(newTicket.id);
    notificationApi.addNotification({
      title: 'New Ticket Created',
      message: `Ticket #${ticketNum}: "${newTicket.subject || newTicket.title || 'Support Request'}" has been created`,
      type: 'CREATED',
      ticketId: newTicket.id,
      dedupeKey: `create_${newTicket.id}`
    }).catch(() => {});

    // 5. Notification for initial assignment if assigned
    if (newTicket.assignedAgentId) {
      const assignedAgent = (initialData.agents || []).find(a => a.id === newTicket.assignedAgentId);
      const agentName = assignedAgent ? assignedAgent.name : 'an agent';
      notificationApi.addNotification({
        title: 'Ticket Assigned',
        message: `Ticket #${ticketNum} has been assigned to ${agentName}`,
        type: 'ASSIGNMENT',
        ticketId: newTicket.id,
        dedupeKey: `assign_${newTicket.id}_${newTicket.assignedAgentId}`
      }).catch(() => {});
    }

    return newTicket;
  },

  // PATCH /tickets/:id (Partial ticket updates, workflow transitions, and assignment)
  async patchTicket(id, updates) {
    const tickets = getStoredTickets();
    const index = tickets.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Ticket #${id} was not found.`);
    }

    const prev = tickets[index];

    // Prevent invalid status transitions according to business workflow
    if (updates.status && updates.status !== prev.status) {
      if (!isValidStatusTransition(prev.status, updates.status)) {
        throw new Error(
          `Workflow Violation: Cannot transition status from ${prev.status} to ${updates.status}.`
        );
      }
    }

    const nowIso = new Date().toISOString();
    const merged = {
      ...prev,
      ...updates,
      customer: {
        ...(prev.customer || {}),
        ...(updates.customer || {})
      },
      updatedAt: nowIso
    };

    // 1. Optimistic local persistence
    tickets[index] = merged;
    saveStoredTickets(tickets);

    // 2. Transmit to JSON Server via PATCH /tickets/:id
    try {
      await apiRequest(`/tickets/${id}`, {
        method: 'PATCH',
        body: updates
      });
    } catch (err) {
      if (err.status === 404) {
        throw new Error(`Ticket #${id} was not found on server.`);
      }
      // JSON Server offline: local storage already persisted
    }

    const currentAuthor = updates.author || { name: 'Jordan Lee', role: 'Support Agent' };
    const formattedNum = formatTicketNumber(id);

    // 3. Record Status Change or Reopening Event
    if (updates.status && updates.status !== prev.status) {
      const isReopen = updates.status === 'OPEN' && (prev.status === 'RESOLVED' || prev.status === 'CLOSED');
      const actionType = isReopen ? 'REOPENED' : 'STATUS_CHANGED';

      activityApi.logActivity({
        ticketId: id,
        action: actionType,
        type: actionType,
        previousValue: prev.status,
        newValue: updates.status,
        author: currentAuthor,
        description: isReopen
          ? `Ticket reopened from ${prev.status} back to OPEN`
          : `Status changed from ${prev.status} to ${updates.status}`
      }).catch(() => {});

      notificationApi.addNotification({
        title: isReopen ? 'Ticket Reopened' : 'Status Changed',
        message: `Ticket #${formattedNum} moved from ${prev.status.replace('_', ' ')} to ${updates.status.replace('_', ' ')}`,
        type: isReopen ? 'ALERT' : 'STATUS',
        ticketId: id,
        dedupeKey: `status_${id}_${updates.status}`
      }).catch(() => {});
    }

    // 4. Record Assignment & Reassignment Events
    if (updates.assignedAgentId !== undefined && updates.assignedAgentId !== prev.assignedAgentId) {
      const isUnassign = !updates.assignedAgentId;
      const isReassign = Boolean(prev.assignedAgentId && updates.assignedAgentId);
      const actionType = isUnassign ? 'UNASSIGNED' : isReassign ? 'REASSIGNED' : 'ASSIGNED';
      const targetAgent = (initialData.agents || []).find(a => a.id === updates.assignedAgentId);
      const agentName = targetAgent ? targetAgent.name : 'an agent';

      activityApi.logActivity({
        ticketId: id,
        action: actionType,
        type: 'AGENT_ASSIGNED',
        previousValue: prev.assignedAgentId || 'Unassigned',
        newValue: updates.assignedAgentId || 'Unassigned',
        author: currentAuthor,
        description: isUnassign
          ? `Ticket unassigned from agent`
          : isReassign
          ? `Ticket reassigned from previous agent to ${agentName}`
          : `Ticket assigned to ${agentName}`
      }).catch(() => {});

      notificationApi.addNotification({
        title: isReassign ? 'Ticket Reassigned' : isUnassign ? 'Ticket Unassigned' : 'Ticket Assigned',
        message: isReassign
          ? `Ticket #${formattedNum} has been reassigned to ${agentName}`
          : isUnassign
          ? `Ticket #${formattedNum} returned to triage queue`
          : `Ticket #${formattedNum} has been assigned to ${agentName}`,
        type: 'ASSIGNMENT',
        ticketId: id,
        dedupeKey: `assign_${id}_${updates.assignedAgentId || 'unassigned'}`
      }).catch(() => {});
    }

    // 5. Record Priority Changes
    if (updates.priority && updates.priority !== prev.priority) {
      activityApi.logActivity({
        ticketId: id,
        action: 'PRIORITY_CHANGED',
        type: 'PRIORITY_CHANGED',
        previousValue: prev.priority,
        newValue: updates.priority,
        author: currentAuthor,
        description: `Priority updated from ${prev.priority} to ${updates.priority}`
      }).catch(() => {});

      if (updates.priority === 'URGENT') {
        notificationApi.addNotification({
          title: 'Urgent Priority Escalation',
          message: `Ticket #${formattedNum} has been escalated to URGENT priority`,
          type: 'ALERT',
          ticketId: id,
          dedupeKey: `urgent_${id}`
        }).catch(() => {});
      }
    }

    return merged;
  },

  // PUT /tickets/:id (Full ticket update)
  async updateTicket(id, updates) {
    const tickets = getStoredTickets();
    const index = tickets.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Ticket #${id} was not found.`);
    }

    const prev = tickets[index];
    const nowIso = new Date().toISOString();
    const fullTicket = {
      ...prev,
      ...updates,
      customer: {
        ...(prev.customer || {}),
        ...(updates.customer || {})
      },
      updatedAt: nowIso
    };

    // 1. Optimistic local persistence
    tickets[index] = fullTicket;
    saveStoredTickets(tickets);

    // 2. Transmit to JSON Server via PUT /tickets/:id
    try {
      await apiRequest(`/tickets/${id}`, {
        method: 'PUT',
        body: fullTicket
      });
    } catch (err) {
      if (err.status === 404) {
        throw new Error(`Ticket #${id} was not found on server.`);
      }
      // JSON Server offline: local storage already persisted
    }

    return fullTicket;
  },

  // DELETE /tickets/:id
  async deleteTicket(id) {
    const tickets = getStoredTickets();
    const deletedTicket = tickets.find(t => t.id === id);
    const filtered = tickets.filter(t => t.id !== id);
    saveStoredTickets(filtered);

    // 1. Prevent orphaned comments and activities after ticket deletion
    await Promise.all([
      commentApi.deleteCommentsByTicketId(id).catch(() => {}),
      activityApi.deleteActivitiesByTicketId(id).catch(() => {})
    ]);

    // 2. Transmit DELETE /tickets/:id to JSON Server
    try {
      await apiRequest(`/tickets/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      if (err.status === 404) {
        // already removed on server
      }
      // JSON Server offline: local storage and related entities purged
    }

    // 3. Log deletion audit event (general system log)
    activityApi.logActivity({
      ticketId: id,
      action: 'TICKET_DELETED',
      type: 'TICKET_DELETED',
      previousValue: deletedTicket?.status || 'OPEN',
      newValue: 'DELETED',
      author: { name: 'Jordan Lee', role: 'Support Agent' },
      description: `Ticket #${formatTicketNumber(id)} was permanently deleted`
    }).catch(() => {});

    return { success: true, id };
  }
};
