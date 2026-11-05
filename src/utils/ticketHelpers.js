import { STATUS_COLORS, PRIORITY_COLORS } from './constants.js';

export function getStatusStyle(status) {
  return STATUS_COLORS[status] || STATUS_COLORS.OPEN;
}

export function getPriorityStyle(priority) {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.LOW;
}

/**
 * Enterprise workflow status transitions:
 * - OPEN: can move to IN_PROGRESS or RESOLVED.
 * - IN_PROGRESS: can move to RESOLVED or CLOSED.
 * - RESOLVED: can be reopened to OPEN or finalized to CLOSED.
 * - CLOSED: can be reopened to OPEN.
 */
export const ALLOWED_STATUS_TRANSITIONS = {
  OPEN: ['IN_PROGRESS', 'RESOLVED'],
  IN_PROGRESS: ['RESOLVED', 'CLOSED'],
  RESOLVED: ['OPEN', 'CLOSED'],
  CLOSED: ['OPEN']
};

export function isValidStatusTransition(currentStatus, targetStatus) {
  if (!currentStatus || !targetStatus) return false;
  if (currentStatus === targetStatus) return true;
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

export function getAllowedTransitions(currentStatus) {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
}

/**
 * Format ticket ID into standard enterprise notation (e.g., TKT-0001)
 */
export function formatTicketNumber(id) {
  if (!id) return 'TKT-0000';
  const match = String(id).match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    const seq = num >= 1000 ? num - 1000 : num;
    return `TKT-${String(seq).padStart(4, '0')}`;
  }
  return String(id).toUpperCase();
}

/**
 * Calculate or retrieve due date according to priority SLA policy
 */
export function getTicketDueDate(ticket) {
  if (!ticket) return null;
  if (ticket.dueDate) return ticket.dueDate;
  if (!ticket.createdAt) return null;

  const createdTime = new Date(ticket.createdAt).getTime();
  if (isNaN(createdTime)) return null;

  const hoursMap = {
    URGENT: 24,       // 24 hours SLA
    HIGH: 48,         // 48 hours SLA
    MEDIUM: 72,       // 72 hours SLA
    LOW: 120          // 120 hours (5 days) SLA
  };
  const slaHours = hoursMap[ticket.priority] || 72;
  return new Date(createdTime + slaHours * 60 * 60 * 1000).toISOString();
}

export function isTicketOverdue(ticket) {
  if (!ticket || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
    return false;
  }
  if (ticket.isOverdue === true) return true;

  const due = getTicketDueDate(ticket);
  if (!due) return false;
  return new Date(due).getTime() < Date.now();
}

export function calculateKPIs(tickets = []) {
  const total = tickets.length;
  const open = tickets.filter(t => t.status === 'OPEN').length;
  const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolved = tickets.filter(t => t.status === 'RESOLVED').length;
  const closed = tickets.filter(t => t.status === 'CLOSED').length;
  const overdue = tickets.filter(t => isTicketOverdue(t)).length;

  return { total, open, inProgress, resolved, closed, overdue };
}

/**
 * Multi-field case-insensitive search and filter
 */
export function filterTickets(tickets = [], { search = '', status = 'ALL', priority = 'ALL', agentId = 'ALL' } = {}) {
  const query = search.trim().toLowerCase();

  return tickets.filter(ticket => {
    if (!ticket) return false;

    const tktFormatted = formatTicketNumber(ticket.id).toLowerCase();
    const rawId = (ticket.id || '').toLowerCase();
    const title = (ticket.title || '').toLowerCase();
    const customerName = (ticket.customer?.name || '').toLowerCase();
    const customerEmail = (ticket.customer?.email || '').toLowerCase();
    const category = (ticket.category || '').toLowerCase();

    const matchesSearch =
      !query ||
      tktFormatted.includes(query) ||
      rawId.includes(query) ||
      title.includes(query) ||
      customerName.includes(query) ||
      customerEmail.includes(query) ||
      category.includes(query);

    const matchesStatus = status === 'ALL' || ticket.status === status;
    const matchesPriority = priority === 'ALL' || ticket.priority === priority;
    const matchesAgent = agentId === 'ALL' || ticket.assignedAgentId === agentId;

    return matchesSearch && matchesStatus && matchesPriority && matchesAgent;
  });
}

/**
 * Sort tickets by selected sorting rule
 */
export function sortTickets(tickets = [], sortBy = 'NEWEST') {
  const list = [...tickets];
  switch (sortBy) {
    case 'NEWEST':
      return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    case 'OLDEST':
      return list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    case 'DUE_ASC':
      return list.sort((a, b) => {
        const dueA = new Date(getTicketDueDate(a) || 0).getTime();
        const dueB = new Date(getTicketDueDate(b) || 0).getTime();
        return dueA - dueB;
      });
    case 'DUE_DESC':
      return list.sort((a, b) => {
        const dueA = new Date(getTicketDueDate(a) || 0).getTime();
        const dueB = new Date(getTicketDueDate(b) || 0).getTime();
        return dueB - dueA;
      });
    default:
      return list;
  }
}
