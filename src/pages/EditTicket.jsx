import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import TicketForm from '../components/tickets/TicketForm';
import { useTicketContext } from '../context/TicketContext';
import { useAgents } from '../hooks/useAgents';
import { useNotificationContext } from '../context/NotificationContext';
import Button from '../components/common/Button';
import { formatTicketNumber } from '../utils/ticketHelpers';

export default function EditTicket({ ticketId: propTicketId, onNavigate }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tickets = [], updateTicket, loading } = useTicketContext() || {};
  const { agents = [] } = useAgents() || {};
  const { addToast } = useNotificationContext() || {};
  const [submitting, setSubmitting] = useState(false);

  const effectiveId = propTicketId || id;
  const ticket = tickets.find(t => t.id === effectiveId);

  const handleCancel = () => {
    if (onNavigate) {
      onNavigate('ticket-details', effectiveId);
    } else {
      navigate(effectiveId ? `/tickets/${effectiveId}` : '/tickets');
    }
  };

  if (loading && !ticket) {
    return (
      <div className="edit-ticket-page">
        <PageHeader title="Loading Ticket Details..." />
        <div className="form-card">
          <div className="skeleton" style={{ height: 400, borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="edit-ticket-page">
        <PageHeader title="Ticket Not Found" />
        <div className="form-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <AlertCircle size={40} style={{ color: '#FB7185', marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--sand-100)', marginBottom: '0.5rem' }}>Unable to locate ticket</h3>
          <p style={{ color: 'var(--sand-400)', marginBottom: '1.5rem' }}>
            The requested ticket {effectiveId ? `(${effectiveId})` : ''} does not exist or has been removed.
          </p>
          <Button
            variant="secondary"
            icon={<ArrowLeft size={15} />}
            onClick={() => navigate('/tickets')}
          >
            Return to Tickets
          </Button>
        </div>
      </div>
    );
  }

  const formattedTicketId = formatTicketNumber(ticket.id);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      await updateTicket(ticket.id, formData);
      if (addToast) {
        addToast(`Ticket ${formattedTicketId} updated successfully!`, 'success');
      }
      if (onNavigate) {
        onNavigate('ticket-details', ticket.id);
      } else {
        navigate(`/tickets/${ticket.id}`);
      }
    } catch (err) {
      if (addToast) {
        addToast(err.message || 'Failed to update ticket', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="edit-ticket-page">
      <PageHeader
        title={`Edit Ticket ${formattedTicketId}`}
        subtitle={`Modify issue details, priority tier, category classification, or assignees.`}
        actions={
          <Button
            variant="secondary"
            icon={<ArrowLeft size={14} />}
            onClick={handleCancel}
          >
            Cancel & Return
          </Button>
        }
      />
      <div className="form-card">
        <TicketForm
          initialData={ticket}
          agents={agents}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={submitting}
        />
      </div>
    </div>
  );
}
