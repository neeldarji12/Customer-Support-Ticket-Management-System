import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck
} from 'lucide-react';
import { useTicketContext } from '../../context/TicketContext';
import { useNotificationContext } from '../../context/NotificationContext';

export default function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile
}) {
  const navigate = useNavigate();
  const { tickets = [] } = useTicketContext() || {};
  const { unreadCount = 0 } = useNotificationContext() || {};

  // Count active unresolved tickets
  const activeTicketCount = tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      to: '/tickets',
      label: 'Tickets',
      icon: Ticket,
      badge: activeTicketCount > 0 ? activeTicketCount : null,
      badgeColor: 'bronze'
    },
    {
      to: '/reports',
      label: 'Reports',
      icon: BarChart3,
      badge: null
    },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
      badgeColor: 'gold'
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      badge: null
    },
  ];

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleBrandClick = () => {
    navigate('/dashboard');
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside
      className={`app-sidebar ${isCollapsed ? 'collapsed' : 'expanded'} ${isMobileOpen ? 'mobile-visible' : ''}`}
      aria-label="Main Navigation"
    >
      {/* Brand Header */}
      <div className="sidebar-brand-wrapper">
        <div className="sidebar-brand" onClick={handleBrandClick} role="button" tabIndex={0}>
          {isCollapsed ? (
            <div className="brand-logo-collapsed" title="APPLEN SOLUTIONS">
              <svg width="34" height="34" viewBox="0 0 46 46" fill="none">
                <rect width="46" height="46" rx="10" fill="#181B24" stroke="#C98A3C" strokeWidth="1.5" />
                <path d="M14 34L23 16L32 34" stroke="url(#sidebarGold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 29H29" stroke="url(#sidebarGold)" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="23" cy="16" r="2.5" fill="#E5B25D"/>
                <defs>
                  <linearGradient id="sidebarGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E5B25D" />
                    <stop offset="100%" stopColor="#C98A3C" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          ) : (
            <img src="/assets/logo.svg" alt="Applen Solutions Logo" className="brand-logo" />
          )}
        </div>

        {/* Mobile Close Button */}
        <button
          type="button"
          className="sidebar-mobile-close"
          onClick={onCloseMobile}
          aria-label="Close sidebar drawer"
        >
          <X size={18} />
        </button>

        {/* Desktop Collapse Toggle Button */}
        <button
          type="button"
          className="sidebar-desktop-collapse"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-title">
          {!isCollapsed && <span>MAIN MENU</span>}
        </div>
        <ul className="nav-list">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.to} className="nav-item">
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  <span className="nav-icon-container">
                    <IconComponent size={19} strokeWidth={2} />
                  </span>

                  {!isCollapsed && (
                    <span className="nav-text">{item.label}</span>
                  )}

                  {!isCollapsed && item.badge !== null && (
                    <span className={`nav-badge nav-badge-${item.badgeColor || 'bronze'}`}>
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip visible only when collapsed */}
                  {isCollapsed && (
                    <span className="nav-tooltip" role="tooltip">
                      {item.label}
                      {item.badge !== null && ` (${item.badge})`}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section at Bottom */}
      <div className="sidebar-footer">
        <div
          className="user-profile-preview"
          onClick={() => {
            navigate('/settings');
            handleNavClick();
          }}
          role="button"
          tabIndex={0}
          title={isCollapsed ? 'Jordan Lee — Senior Support Engineer (Online)' : undefined}
        >
          <div className="avatar-wrapper">
            <img src="/assets/avatars/avatar-1.svg" alt="Jordan Lee" className="user-avatar" />
            <span className="status-indicator online" title="Status: Online" />
          </div>

          {!isCollapsed && (
            <div className="user-info">
              <div className="user-name-row">
                <span className="user-name">Jordan Lee</span>
                <ShieldCheck size={14} className="user-verified-icon" title="Senior Certified Agent" />
              </div>
              <span className="user-role">Senior Support Engineer</span>
            </div>
          )}

          {isCollapsed && (
            <span className="nav-tooltip user-tooltip" role="tooltip">
              Jordan Lee · Online
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
