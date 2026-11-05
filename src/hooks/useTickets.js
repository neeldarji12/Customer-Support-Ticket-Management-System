import { useState, useEffect, useCallback } from 'react';
import { ticketApi } from '../services/ticketApi';
import initialData from '../data/db.json';

export function useTickets() {
  const [tickets, setTickets] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const local = localStorage.getItem('cstms_tickets');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // ignore
        }
      }
    }
    return initialData.tickets || [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ticketApi.getTickets();
      setTickets(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch tickets');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    ticketApi.getTickets()
      .then(data => {
        if (isMounted) {
          setTickets(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch tickets');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const createTicket = async (ticketData) => {
    const created = await ticketApi.createTicket(ticketData);
    setTickets(prev => [created, ...prev.filter(t => t.id !== created.id)]);
    return created;
  };

  const patchTicket = async (id, updates) => {
    const updated = await ticketApi.patchTicket(id, updates);
    setTickets(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  const updateTicket = async (id, updates) => {
    const updated = await ticketApi.updateTicket(id, updates);
    setTickets(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  const deleteTicket = async (id) => {
    await ticketApi.deleteTicket(id);
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    createTicket,
    patchTicket,
    updateTicket,
    deleteTicket
  };
}
