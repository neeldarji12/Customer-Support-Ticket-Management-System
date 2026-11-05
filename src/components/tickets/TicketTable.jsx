import React from 'react';
import { User, AlertCircle, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import TicketActions from './TicketActions';
import { formatTicketNumber, getTicketDueDate, isTicketOverdue } from '../../utils/ticketHelpers';
import { formatDate } from '../../utils/dateHelpers';

export default function TicketTable({
  tickets = [],
  agents = [],
  onSelectTicket,
  onEditTicket,
  onDeleteTicket,
  onStatusChange,
  onAssignAgent
}) {
  const getAgent = (agentId) => {
    return agents.find(a => a.id === agentId);
  };

  return (
    <div className="ticket-table-wrapper">
      <table className="ticket-table">
        <thead>
          <tr>
            <th>Ticket Number</th>
            <th>Subject</th>
            <th>Customer</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Assigned Agent</th>
            <th>Status</th>
            <th>Due Date</th>
            <th className="actions-header" aria-label="Actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => {
            const ticketNum = formatTicketNumber(ticket.id);
            const agent = getAgent(ticket.assignedAgentId);
            const dueDate = getTicketDueDate(ticket);
            const overdue = isTicketOverdue(ticket);

            return (
              <tr key={ticket.id} className="ticket-table-row">
                {/* 1. Ticket Number */}
                <td
                  className="ticket-id-cell"
                  onClick={() => onSelectTicket(ticket.id)}
                  title="Click to view ticket details"
                >
                  <span className="ticket-code-pill">{ticketNum}</span>
                </td>

                {/* 2. Subject */}
                <td
                  className="ticket-info-cell"
                  onClick={() => onSelectTicket(ticket.id)}
                  title="Click to view ticket details"
                >
                  <div className="ticket-row-title">{ticket.title}</div>
                  <div className="ticket-row-desc-preview">{ticket.description}</div>
                </td>

                {/* 3. Customer Name */}
                <td>
                  <div className="customer-cell">
                    <div className="customer-row">
                      <div className="customer-avatar-small">
                        {ticket.customer?.avatar ? (
                          <img
                            src={ticket.customer.avatar}
                            alt={ticket.customer.name}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <User size={13} />
                        )}
                      </div>
                      <div className="customer-meta">
                        <span className="customer-name">{ticket.customer?.name || 'Anonymous'}</span>
                        <span className="customer-email">{ticket.customer?.email}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* 4. Category */}
                <td>
                  <span className="category-tag">
                    {ticket.category ? ticket.category.replace('_', ' ') : 'General'}
                  </span>
                </td>

                {/* 5. Priority */}
                <td>
                  <PriorityBadge priority={ticket.priority} />
                </td>

                {/* 6. Assigned Agent */}
                <td>
                  {agent ? (
                    <div className="agent-badge-pill" title={`${agent.name} (${agent.role})`}>
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="agent-pill-avatar"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <span className="agent-pill-name">{agent.name}</span>
                    </div>
                  ) : ticket.assignedAgentId ? (
                    <span className="unlinked-agent-pill" title={`Agent ID ${ticket.assignedAgentId} unlinked`}>
                      Former Staff
                    </span>
                  ) : (
                    <span className="unassigned-pill">Unassigned</span>
                  )}
                </td>

                {/* 7. Status */}
                <td>
                  <StatusBadge status={ticket.status} />
                </td>

                {/* 8. Due Date */}
                <td className="due-date-cell">
                  <div className="due-date-container">
                    <div className="due-date-text">
                      <Calendar size={13} className="due-date-icon" />
                      <span>{formatDate(dueDate)}</span>
                    </div>
                    {overdue && (
                      <span className="overdue-indicator-pill">
                        <AlertCircle size={11} strokeWidth={2.5} />
                        Overdue
                      </span>
                    )}
                  </div>
                </td>

                {/* 9. Actions */}
                <td className="actions-cell">
                  <TicketActions
                    ticket={ticket}
                    agents={agents}
                    onSelect={onSelectTicket}
                    onEdit={onEditTicket}
                    onDelete={onDeleteTicket}
                    onStatusChange={onStatusChange}
                    onAssignAgent={onAssignAgent}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
