// oxlint-disable react/only-export-components
import React, { createContext, useContext, useState, useEffect } from 'react';
import initialData from '../data/db.json' with { type: 'json' };

const AuthContext = createContext(null);
const STORAGE_KEY = 'cstms_auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  /**
   * Log in using work username/email and password credentials
   */
  const login = async ({ username, password }) => {
    setLoading(true);
    try {
      // Simulate authentic enterprise credential verification
      await new Promise(res => setTimeout(res, 280));

      const query = (username || '').trim().toLowerCase();
      if (!query) {
        throw new Error('Please enter your work username or email address.');
      }
      if (!password || password.length < 3) {
        throw new Error('Please enter your password (minimum 3 characters).');
      }

      const availableAgents = initialData.agents || [];
      // Match by exact email or username prefix (e.g. jordan.lee, taylor.w, samira.p)
      const matchedAgent = availableAgents.find(a => {
        const emailLower = a.email.toLowerCase();
        const prefix = emailLower.split('@')[0];
        const namePart = a.name.toLowerCase();
        return (
          emailLower === query ||
          prefix === query ||
          namePart === query ||
          namePart.startsWith(query)
        );
      });

      const authenticatedUser = matchedAgent
        ? {
            id: matchedAgent.id,
            name: matchedAgent.name,
            email: matchedAgent.email,
            role: matchedAgent.role,
            avatar: matchedAgent.avatar || '/assets/avatars/avatar-1.svg',
            status: 'Online',
            authenticatedAt: new Date().toISOString()
          }
        : {
            id: 'agt-custom',
            name: query.includes('@')
              ? query.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              : query.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            email: query.includes('@') ? query : `${query}@supportdesk.internal`,
            role: 'Support Specialist',
            avatar: '/assets/avatars/avatar-1.svg',
            status: 'Online',
            authenticatedAt: new Date().toISOString()
          };

      setUser(authenticatedUser);
      return authenticatedUser;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out current user
   */
  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        availableAgents: initialData.agents || []
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
