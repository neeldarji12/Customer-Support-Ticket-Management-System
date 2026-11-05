import React from 'react';
import { Bell } from 'lucide-react';
import Dropdown from '../common/Dropdown';
import NotificationDropdown from './NotificationDropdown';
import { useNotificationContext } from '../../context/NotificationContext';

export default function NotificationBell({ onNavigate }) {
  const { unreadCount = 0 } = useNotificationContext() || {};

  return (
    <Dropdown
      align="right"
      closeOnClick={false}
      trigger={({ isOpen }) => (
        <button
          className={`notification-bell-btn ${isOpen ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
          aria-label={`Notifications (${unreadCount} unread)`}
          title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'Notifications'}
          type="button"
        >
          <span className="bell-icon">
            <Bell size={18} strokeWidth={2} />
          </span>
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}
    >
      {({ close }) => (
        <NotificationDropdown onClose={close} onNavigate={onNavigate} />
      )}
    </Dropdown>
  );
}
