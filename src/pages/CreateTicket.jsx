import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import TicketForm from '../components/tickets/TicketForm';
import { useTicketContext } from '../context/TicketContext';
import { useAgents } from '../hooks/useAgents';
import { useNotificationContext } from '../context/NotificationContext';
import { formatTicketNumber } from '../utils/ticketHelpers';

export default function CreateTicket({ onNavigate }) {
  const navigate = useNavigate();
  const { createTicket } = useTicketContext() || {};
  const { agents = [] } = useAgents() || {};
  const { addToast } = useNotificationContext() || {};
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = () => {
    if (onNavigate) {
      onNavigate('tickets');
    } else {
      navigate('/tickets');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const newTicket = await createTicket(formData);
      const formattedId = formatTicketNumber(newTicket.id);
      if (addToast) {
        addToast(`Ticket ${formattedId} created successfully!`, 'success');
      }
      if (onNavigate) {
        onNavigate('tickets');
      } else {
        navigate('/tickets');
      }
    } catch (err) {
      if (addToast) {
        addToast(err.message || 'Failed to create ticket', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-ticket-page">
      <PageHeader
        title="Create Support Ticket"
        subtitle="Log a new customer inquiry, classify SLA priority, assign an agent, and establish resolution deadlines."
      />
      <div className="form-card">
        <TicketForm
          agents={agents}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={submitting}
        />
      </div>
    </div>
  );
}
