// oxlint-disable react/only-export-components
import React, { createContext, useContext, useState } from 'react';
import { useTickets } from '../hooks/useTickets';

const TicketContext = createContext(null);

export function TicketProvider({ children }) {
  const ticketState = useTickets();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    priority: 'ALL',
    agentId: 'ALL'
  });

  return (
    <TicketContext.Provider value={{
      ...ticketState,
      selectedTicketId,
      setSelectedTicketId,
      filters,
      setFilters
    }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTicketContext() {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTicketContext must be used within a TicketProvider');
  }
  return context;
}
