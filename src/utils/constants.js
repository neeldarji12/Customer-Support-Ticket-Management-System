export const TICKET_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
};

export const TICKET_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};

export const TICKET_CATEGORIES = [
  'AUTHENTICATION',
  'BILLING',
  'TECHNICAL',
  'FEATURE_REQUEST',
  'INTEGRATION',
  'REPORTS',
  'GENERAL',
];

export const STATUS_COLORS = {
  OPEN: {
    bg: 'rgba(217, 119, 6, 0.14)',
    text: '#FBBF24',
    border: 'rgba(251, 191, 36, 0.28)'
  },
  IN_PROGRESS: {
    bg: 'rgba(201, 138, 60, 0.18)',
    text: '#E5B25D',
    border: 'rgba(229, 178, 93, 0.38)'
  },
  RESOLVED: {
    bg: 'rgba(16, 185, 129, 0.14)',
    text: '#34D399',
    border: 'rgba(52, 211, 153, 0.28)'
  },
  CLOSED: {
    bg: 'rgba(120, 113, 108, 0.16)',
    text: '#A8A29E',
    border: 'rgba(168, 162, 158, 0.25)'
  },
};

export const PRIORITY_COLORS = {
  LOW: {
    bg: 'rgba(148, 163, 184, 0.12)',
    text: '#94A3B8',
    border: 'rgba(148, 163, 184, 0.22)'
  },
  MEDIUM: {
    bg: 'rgba(217, 119, 6, 0.14)',
    text: '#FBBF24',
    border: 'rgba(251, 191, 36, 0.28)'
  },
  HIGH: {
    bg: 'rgba(234, 88, 12, 0.15)',
    text: '#FB923C',
    border: 'rgba(251, 146, 60, 0.32)'
  },
  URGENT: {
    bg: 'rgba(225, 29, 72, 0.16)',
    text: '#FB7185',
    border: 'rgba(251, 113, 133, 0.35)'
  },
};
