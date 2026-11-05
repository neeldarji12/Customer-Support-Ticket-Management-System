import { useState, useEffect, useCallback } from 'react';
import { agentApi } from '../services/agentApi';
import initialData from '../data/db.json';

export function useAgents() {
  const [agents, setAgents] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const local = localStorage.getItem('cstms_agents');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // ignore
        }
      }
    }
    return initialData.agents || [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await agentApi.getAgents();
      setAgents(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    agentApi.getAgents()
      .then(data => {
        if (isMounted) {
          setAgents(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { agents, loading, error, refresh: fetchAgents };
}
