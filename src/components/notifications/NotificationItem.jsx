import React from 'react';
import {
  UserCheck,
  AlertTriangle,
  MessageSquare,
  Bell,
  Check,
  PlusCircle,
  Activity,
  Clock
} from 'lucide-react';
import { timeAgo } from '../../utils/dateHelpers';
import { formatTicketNumber } from '../../utils/ticketHelpers';

const NOTIFICATION_ICONS = {
  CREATED: {
    icon: PlusCircle,
    color: '#E5B25D',
    bg: 'rgba(229, 178, 93, 0.14)'
  },
  ASSIGNMENT: {
    icon: UserCheck,
    color: '#C98A3C',
    bg: 'rgba(201, 138, 60, 0.15)'
  },
  STATUS: {
    icon: Activity,
    color: '#34D399',
    bg: 'rgba(52, 211, 153, 0.15)'
  },
  ALERT: {
    icon: AlertTriangle,
    color: '#FB7185',
    bg: 'rgba(251, 113, 133, 0.15)'
  },
  MESSAGE: {
    icon: MessageSquare,
    color: '#38BDF8',
    bg: 'rgba(56, 189, 248, 0.15)'
  },
  DEFAULT: {
    icon: Bell,
    color: '#E5B25D',
    bg: 'rgba(229, 178, 93, 0.12)'
  }
};

export default function NotificationItem({ notification, onRead, onSelect }) {
  const isUnread = !notification.read;
  const config = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.DEFAULT;
  const IconComponent = config.icon;

  const handleClick = () => {
    if (isUnread && onRead) {
      onRead(notification.id);
    }
    if (onSelect) {
      onSelect(notification);
    }
  };

  const handleMarkAsReadOnly = (e) => {
    e.stopPropagation();
    if (onRead) {
      onRead(notification.id);
    }
  };

  return (
    <div
      className={`notification-item ${isUnread ? 'unread' : 'read'}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div
        className="notification-item-icon-badge"
        style={{ backgroundColor: config.bg, color: config.color }}
      >
        <IconComponent size={16} strokeWidth={2.2} />
      </div>

      <div className="notification-item-content">
        <div className="notification-item-header">
          <span className="notification-item-title">{notification.title}</span>
          {notification.ticketId && (
            <span className="notification-ticket-badge">
              {formatTicketNumber(notification.ticketId)}
            </span>
          )}
        </div>

        <div className="notification-item-message">{notification.message}</div>

        <div className="notification-item-meta">
          <Clock size={11} className="meta-time-icon" />
          <span className="notification-item-time">{timeAgo(notification.timestamp)}</span>
        </div>
      </div>

      <div className="notification-item-actions">
        {isUnread && (
          <>
            <button
              type="button"
              className="notification-mark-btn"
              onClick={handleMarkAsReadOnly}
              title="Mark as read"
              aria-label="Mark notification as read"
            >
              <Check size={12} strokeWidth={3} />
            </button>
            <span className="notification-unread-dot" title="Unread" />
          </>
        )}
      </div>
    </div>
  );
}
