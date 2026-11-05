import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Menu,
  X,
  User,
  Sliders,
  LogOut,
  ChevronDown,
  Check,
  ChevronRight,
  Home,
  Circle
} from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';
import Dropdown from '../common/Dropdown';
import Button from '../common/Button';
import { useNotificationContext } from '../../context/NotificationContext';

export default function Header({ onToggleMobileMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useNotificationContext() || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [agentStatus, setAgentStatus] = useState('Online');
  const searchInputRef = useRef(null);

  // Global keyboard shortcut '/' to focus search
  useEffect(() => {
    function handleKeyDown(e) {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute page title and breadcrumbs based on URL path
  const getRouteInfo = (pathname) => {
    if (pathname === '/' || pathname === '/dashboard') {
      return {
        title: 'Executive Dashboard',
        breadcrumbs: [
          { label: 'Overview', path: '/dashboard' },
          { label: 'Dashboard', path: '/dashboard' }
        ]
      };
    }
    if (pathname === '/tickets') {
      return {
        title: 'Support Tickets',
        breadcrumbs: [
          { label: 'Support Desk', path: '/tickets' },
          { label: 'Ticket Directory', path: '/tickets' }
        ]
      };
    }
    if (pathname === '/tickets/create' || pathname === '/create-ticket') {
      return {
        title: 'Create Ticket',
        breadcrumbs: [
          { label: 'Support Desk', path: '/tickets' },
          { label: 'Create New Ticket', path: '/tickets/create' }
        ]
      };
    }
    if (pathname.startsWith('/tickets/') && pathname.endsWith('/edit')) {
      const id = pathname.split('/')[2];
      return {
        title: `Edit Ticket #${id}`,
        breadcrumbs: [
          { label: 'Support Desk', path: '/tickets' },
          { label: id, path: `/tickets/${id}` },
          { label: 'Edit', path: pathname }
        ]
      };
    }
    if (pathname.startsWith('/tickets/')) {
      const id = pathname.split('/')[2];
      return {
        title: `Ticket Details #${id}`,
        breadcrumbs: [
          { label: 'Support Desk', path: '/tickets' },
          { label: id, path: pathname }
        ]
      };
    }
    if (pathname === '/reports') {
      return {
        title: 'Reports & Intelligence',
        breadcrumbs: [
          { label: 'Analytics', path: '/reports' },
          { label: 'SLA Performance', path: '/reports' }
        ]
      };
    }
    if (pathname === '/notifications') {
      return {
        title: 'Notifications Center',
        breadcrumbs: [
          { label: 'Activity', path: '/notifications' },
          { label: 'All Alerts', path: '/notifications' }
        ]
      };
    }
    if (pathname === '/settings') {
      return {
        title: 'Desk Settings',
        breadcrumbs: [
          { label: 'System', path: '/settings' },
          { label: 'Preferences', path: '/settings' }
        ]
      };
    }
    return {
      title: 'Not Found',
      breadcrumbs: [
        { label: '404', path: pathname }
      ]
    };
  };

  const routeInfo = getRouteInfo(location.pathname);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/tickets?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (location.pathname === '/tickets') {
      navigate('/tickets');
    }
  };

  const handleStatusChange = (status) => {
    setAgentStatus(status);
    if (addToast) {
      addToast(`Status updated to: ${status}`, 'info');
    }
  };

  const handleSignOut = () => {
    if (addToast) {
      addToast('Session saved. Session restored in demo mode.', 'info');
    }
  };

  return (
    <header className="app-header">
      {/* Left Section: Mobile Menu Button + Page Info */}
      <div className="header-left">
        <button
          type="button"
          className="header-mobile-toggle"
          onClick={onToggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-page-meta">
          <nav className="header-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/dashboard" className="breadcrumb-item breadcrumb-home" title="Go to Dashboard">
              <Home size={13} />
            </Link>
            {routeInfo.breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label + idx}>
                <ChevronRight size={11} className="breadcrumb-separator" />
                <Link
                  to={crumb.path}
                  className={`breadcrumb-item ${idx === routeInfo.breadcrumbs.length - 1 ? 'current' : ''}`}
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </nav>
          <h2 className="header-page-title">{routeInfo.title}</h2>
        </div>
      </div>

      {/* Center Section: Global Search Bar */}
      <div className="header-center">
        <form className="header-search-form" onSubmit={handleSearchSubmit}>
          <span className="search-icon">
            <Search size={16} strokeWidth={2} />
          </span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search tickets, customers, IDs... (Press /)"
            className="header-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery ? (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="search-shortcut-hint" title="Press / to focus">/</kbd>
          )}
        </form>
      </div>

      {/* Right Section: Actions, Notifications, Profile */}
      <div className="header-right">
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={15} strokeWidth={2.5} />}
          onClick={() => navigate('/tickets/create')}
          className="header-create-ticket-btn"
        >
          New Ticket
        </Button>

        <NotificationBell />

        {/* User Profile Dropdown */}
        <Dropdown
          align="right"
          closeOnClick={false}
          trigger={({ isOpen }) => (
            <div className={`header-user-trigger ${isOpen ? 'active' : ''}`} role="button" tabIndex={0}>
              <div className="header-avatar-wrapper">
                <img src="/assets/avatars/avatar-1.svg" alt="Jordan Lee" className="header-avatar" />
                <span
                  className={`status-indicator ${agentStatus.toLowerCase().replace(/\s+/g, '-')}`}
                  title={`Status: ${agentStatus}`}
                />
              </div>
              <div className="header-user-info">
                <span className="header-username">Jordan Lee</span>
                <span className="header-user-role">Agent</span>
              </div>
              <ChevronDown size={14} className={`header-chevron ${isOpen ? 'rotate' : ''}`} />
            </div>
          )}
        >
          {({ close }) => (
            <div className="user-profile-menu">
              <div className="profile-menu-header">
                <div className="profile-avatar-large">
                  <img src="/assets/avatars/avatar-1.svg" alt="Jordan Lee" />
                  <span className={`status-indicator ${agentStatus.toLowerCase().replace(/\s+/g, '-')}`} />
                </div>
                <div className="profile-header-text">
                  <div className="profile-name">Jordan Lee</div>
                  <div className="profile-email">jordan.lee@supportdesk.internal</div>
                  <div className="profile-badge">Senior Support Engineer</div>
                </div>
              </div>

              {/* Status Selector */}
              <div className="profile-status-section">
                <span className="profile-section-label">AGENT AVAILABILITY</span>
                <div className="status-options-grid">
                  {[
                    { label: 'Online', desc: 'Accepting tickets', color: '#34D399' },
                    { label: 'In Meeting', desc: 'Queued routing', color: '#FBBF24' },
                    { label: 'Offline', desc: 'Unavailable', color: '#94A3B8' }
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      className={`status-option-btn ${agentStatus === s.label ? 'active' : ''}`}
                      onClick={() => handleStatusChange(s.label)}
                    >
                      <Circle size={8} fill={s.color} color={s.color} />
                      <span className="status-btn-label">{s.label}</span>
                      {agentStatus === s.label && <Check size={12} className="status-check-icon" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="profile-menu-divider" />

              {/* Navigation Links */}
              <div className="profile-menu-links">
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    navigate('/settings');
                    close();
                  }}
                >
                  <User size={15} />
                  <span>My Profile & Skills</span>
                </button>
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    navigate('/settings');
                    close();
                  }}
                >
                  <Sliders size={15} />
                  <span>Desk Preferences</span>
                </button>
              </div>

              <div className="profile-menu-divider" />

              <div className="profile-menu-footer">
                <button
                  type="button"
                  className="profile-signout-btn"
                  onClick={() => {
                    handleSignOut();
                    close();
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </Dropdown>
      </div>
    </header>
  );
}
