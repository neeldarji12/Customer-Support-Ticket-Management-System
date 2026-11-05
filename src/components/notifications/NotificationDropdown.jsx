import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Bell, ArrowRight } from 'lucide-react';
import NotificationItem from './NotificationItem';
import { useNotificationContext } from '../../context/NotificationContext';

export default function NotificationDropdown({ onClose, onNavigate }) {
  const navigate = useNavigate();
  const { notifications = [], markAsRead, markAllAsRead, unreadCount = 0 } = useNotificationContext() || {};
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  // Newest notifications first
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [notifications]);

  const displayedNotifications = useMemo(() => {
    if (filter === 'unread') {
      return sortedNotifications.filter(n => !n.read);
    }
    return sortedNotifications;
  }, [sortedNotifications, filter]);

  const handleSelectNotification = (item) => {
    if (item.ticketId) {
      if (onNavigate) {
        onNavigate('ticket-details', item.ticketId);
      } else {
        navigate(`/tickets/${item.ticketId}`);
      }
    } else {
      if (onNavigate) {
        onNavigate('notifications');
      } else {
        navigate('/notifications');
      }
    }
    if (onClose) onClose();
  };

  const handleViewAll = () => {
    if (onNavigate) {
      onNavigate('notifications');
    } else {
      navigate('/notifications');
    }
    if (onClose) onClose();
  };

  const hasUnread = unreadCount > 0;

  return (
    <div className="notification-dropdown-panel" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="notification-dropdown-header">
        <div className="notification-header-title">
          <span className="notification-header-icon-wrap">
            <Bell size={16} />
          </span>
          <h4 className="notification-dropdown-title">Notifications</h4>
          {hasUnread ? (
            <span className="notification-unread-count-pill">{unreadCount} New</span>
          ) : (
            <span className="notification-all-read-pill">All Read</span>
          )}
        </div>

        {hasUnread && (
          <button
            className="mark-all-read-btn"
            onClick={markAllAsRead}
            type="button"
            title="Mark all notifications as read"
          >
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="notification-dropdown-tabs">
        <button
          type="button"
          className={`dropdown-tab-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({sortedNotifications.length})
        </button>
        <button
          type="button"
          className={`dropdown-tab-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <div className="notification-dropdown-list">
        {displayedNotifications.length === 0 ? (
          <div className="notification-empty-state">
            <div className="notification-empty-icon-wrap">
              <CheckCheck size={28} className="notification-empty-icon" />
            </div>
            <h5 className="notification-empty-title">
              {filter === 'unread' ? 'No unread alerts' : 'All caught up!'}
            </h5>
            <p className="notification-empty-desc">
              {filter === 'unread'
                ? 'All notifications have been marked as read.'
                : "No notifications to show. You'll receive alerts here when tickets are created, assigned, or updated."}
            </p>
          </div>
        ) : (
          displayedNotifications.slice(0, 6).map(item => (
            <NotificationItem
              key={item.id}
              notification={item}
              onRead={markAsRead}
              onSelect={handleSelectNotification}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="notification-dropdown-footer">
        <button
          type="button"
          className="view-all-notifications-btn"
          onClick={handleViewAll}
        >
          <span>View all notifications</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
