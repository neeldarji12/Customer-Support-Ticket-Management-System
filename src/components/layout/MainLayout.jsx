import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from '../common/Toast';
import { useNotificationContext } from '../../context/NotificationContext';

export default function MainLayout({ children }) {
  const location = useLocation();
  const { toasts = [], removeToast } = useNotificationContext() || {};

  // Persist sidebar collapsed state in localStorage safely
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('applen_sidebar_collapsed') === 'true';
    }
    return false;
  });

  // Mobile drawer open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('applen_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div
      className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} ${
        isMobileOpen ? 'mobile-menu-active' : ''
      }`}
    >
      {/* Mobile Backdrop Overlay */}
      <div
        className={`mobile-sidebar-backdrop ${isMobileOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobileMenu}
      />

      {/* Main App Content Viewport */}
      <div className="app-main-wrapper">
        <Header onToggleMobileMenu={toggleMobileMenu} />

        <main className="app-content-container" key={location.pathname}>
          {children || <Outlet />}
        </main>
      </div>

      {/* Global Toast Alerts */}
      <div className="toast-container" aria-live="polite">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast && removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
