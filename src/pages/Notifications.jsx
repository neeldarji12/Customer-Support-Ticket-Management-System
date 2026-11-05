import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Trash2, Bell } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import NotificationItem from '../components/notifications/NotificationItem';
import Button from '../components/common/Button';
import { useNotificationContext } from '../context/NotificationContext';

export default function Notifications({ onNavigate }) {
  const navigate = useNavigate();
  const {
    notifications = [],
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    unreadCount = 0
  } = useNotificationContext() || {};

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [notifications]);

  const displayedNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return sortedNotifications.filter(n => !n.read);
    }
    return sortedNotifications;
  }, [sortedNotifications, activeTab]);

  const handleSelect = (n) => {
    if (n.ticketId) {
      if (onNavigate) {
        onNavigate('ticket-details', n.ticketId);
      } else {
        navigate(`/tickets/${n.ticketId}`);
      }
    }
  };

  const hasUnread = unreadCount > 0;

  return (
    <div className="notifications-page">
      <PageHeader
        title="Notifications Center"
        subtitle="Real-time operational alerts, ticket assignments, and workflow lifecycle events."
        actions={
          <div className="notifications-header-actions">
            {hasUnread && (
              <Button
                variant="secondary"
                size="sm"
                onClick={markAllAsRead}
                className="mark-all-btn"
              >
                <CheckCheck size={15} />
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && clearAllNotifications && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all notification history?')) {
                    clearAllNotifications();
                  }
                }}
                className="clear-all-btn text-sand-400"
              >
                <Trash2 size={15} />
                Clear History
              </Button>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="notifications-tabs-container">
        <button
          type="button"
          className={`notifications-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Bell size={15} />
          <span>All Notifications</span>
          <span className="tab-count-badge">{sortedNotifications.length}</span>
        </button>
        <button
          type="button"
          className={`notifications-tab-btn ${activeTab === 'unread' ? 'active' : ''}`}
          onClick={() => setActiveTab('unread')}
        >
          <span className="unread-status-dot" />
          <span>Unread</span>
          <span className="tab-count-badge unread-badge">{unreadCount}</span>
        </button>
      </div>

      {/* Notifications List Card */}
      <div className="notifications-list-card">
        {displayedNotifications.length === 0 ? (
          <div className="notifications-page-empty">
            <div className="notifications-empty-icon-wrap">
              <CheckCheck size={36} className="notifications-empty-icon" />
            </div>
            <h3 className="notifications-empty-title">
              {activeTab === 'unread' ? 'No unread notifications' : 'All caught up!'}
            </h3>
            <p className="notifications-empty-desc">
              {activeTab === 'unread'
                ? 'You have viewed all pending notifications in your queue.'
                : "No notifications recorded yet. We'll alert you as soon as tickets are created, assigned, or updated."}
            </p>
          </div>
        ) : (
          displayedNotifications.map(item => (
            <NotificationItem
              key={item.id}
              notification={item}
              onRead={markAsRead}
              onSelect={handleSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
