import React from 'react';
import { User, Calendar, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import TicketActions from './TicketActions';
import { formatTicketNumber, getTicketDueDate, isTicketOverdue } from '../../utils/ticketHelpers';
import { formatDate } from '../../utils/dateHelpers';

export default function TicketCard({
  ticket,
  agents = [],
  onSelect,
  onEdit,
  onDelete,
  onStatusChange,
  onAssignAgent
}) {
  const ticketNum = formatTicketNumber(ticket.id);
  const agent = agents.find(a => a.id === ticket.assignedAgentId);
  const dueDate = getTicketDueDate(ticket);
  const overdue = isTicketOverdue(ticket);

  return (
    <div className="mobile-ticket-card">
      <div className="mobile-card-top">
        <div className="mobile-card-id-row">
          <span
            className="ticket-code-pill"
            onClick={() => onSelect && onSelect(ticket.id)}
          >
            {ticketNum}
          </span>
          <PriorityBadge priority={ticket.priority} />
        </div>

        <div className="mobile-card-actions">
          <TicketActions
            ticket={ticket}
            agents={agents}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onAssignAgent={onAssignAgent}
          />
        </div>
      </div>

      <h4
        className="mobile-card-title"
        onClick={() => onSelect && onSelect(ticket.id)}
      >
        {ticket.title}
      </h4>

      {ticket.description && (
        <p className="mobile-card-desc">{ticket.description}</p>
      )}

      <div className="mobile-card-meta-grid">
        <div className="mobile-meta-item">
          <span className="mobile-meta-label">Customer</span>
          <div className="mobile-customer-info">
            <div className="customer-avatar-small">
              {ticket.customer?.avatar ? (
                <img
                  src={ticket.customer.avatar}
                  alt={ticket.customer.name}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <User size={12} />
              )}
            </div>
            <span className="mobile-customer-name">{ticket.customer?.name || 'Anonymous'}</span>
          </div>
        </div>

        <div className="mobile-meta-item">
          <span className="mobile-meta-label">Agent</span>
          {agent ? (
            <div className="agent-badge-pill">
              <img
                src={agent.avatar}
                alt={agent.name}
                className="agent-pill-avatar"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="agent-pill-name">{agent.name}</span>
            </div>
          ) : ticket.assignedAgentId ? (
            <span className="unlinked-agent-pill">Former Staff</span>
          ) : (
            <span className="unassigned-pill">Unassigned</span>
          )}
        </div>
      </div>

      <div className="mobile-card-footer">
        <div className="mobile-footer-left">
          <StatusBadge status={ticket.status} />
          {ticket.category && (
            <span className="category-tag">
              {ticket.category.replace('_', ' ')}
            </span>
          )}
        </div>

        <div className="mobile-footer-right">
          <div className="mobile-due-date">
            <Calendar size={12} />
            <span>{formatDate(dueDate)}</span>
          </div>
          {overdue && (
            <span className="overdue-indicator-pill">
              <AlertCircle size={10} />
              Overdue
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
