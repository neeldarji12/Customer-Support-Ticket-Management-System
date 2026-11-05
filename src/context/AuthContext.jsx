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
   * Log in using an agent profile or email credentials
   */
  const login = async ({ email, password: _password, agentId }) => {
    setLoading(true);
    try {
      // Simulate authentic network latency
      await new Promise(res => setTimeout(res, 250));

      const availableAgents = initialData.agents || [];
      let matchedAgent = null;

      if (agentId) {
        matchedAgent = availableAgents.find(a => a.id === agentId);
      } else if (email) {
        matchedAgent = availableAgents.find(
          a => a.email.toLowerCase() === email.trim().toLowerCase()
        );
      }

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
            name: email ? email.split('@')[0].replace(/[._]/g, ' ') : 'Support Agent',
            email: email || 'agent@supportdesk.internal',
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
