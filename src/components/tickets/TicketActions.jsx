import React from 'react';
import {
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Clock,
  Archive,
  UserCheck,
  UserX
} from 'lucide-react';
import Dropdown from '../common/Dropdown';
import { getAllowedTransitions } from '../../utils/ticketHelpers';

export default function TicketActions({
  ticket,
  agents = [],
  onSelect,
  onEdit,
  onDelete,
  onStatusChange,
  onAssignAgent
}) {
  const allowedTransitions = getAllowedTransitions(ticket.status);
  const isResolvedOrClosed = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
  const activeAgents = agents.filter(a => a.status !== 'INACTIVE');

  const handleAction = (actionFn, ...args) => {
    if (actionFn) {
      actionFn(...args);
    }
  };

  return (
    <Dropdown
      align="right"
      trigger={
        <button
          type="button"
          className="btn-icon-more"
          aria-label={`Actions for ticket ${ticket.id}`}
        >
          <MoreHorizontal size={18} />
        </button>
      }
    >
      <div className="ticket-actions-menu">
        <button
          type="button"
          className="action-menu-item"
          onClick={() => handleAction(onSelect, ticket.id)}
        >
          <Eye size={15} />
          <span>View Details</span>
        </button>

        <button
          type="button"
          className="action-menu-item"
          onClick={() => handleAction(onEdit, ticket.id)}
        >
          <Edit3 size={15} />
          <span>Edit Ticket</span>
        </button>

        <div className="action-menu-divider" />

        {/* Workflow Lifecycle Transitions */}
        <div className="action-menu-section-title">Workflow Actions</div>

        {/* Reopen Ticket (if currently Resolved or Closed) */}
        {isResolvedOrClosed && allowedTransitions.includes('OPEN') && (
          <button
            type="button"
            className="action-menu-item action-reopen"
            onClick={() => handleAction(onStatusChange, ticket.id, 'OPEN')}
          >
            <RotateCcw size={15} />
            <span>Reopen Ticket (→ Open)</span>
          </button>
        )}

        {/* Move to In Progress (Allowed from Open) */}
        {allowedTransitions.includes('IN_PROGRESS') && (
          <button
            type="button"
            className="action-menu-item"
            onClick={() => handleAction(onStatusChange, ticket.id, 'IN_PROGRESS')}
          >
            <Clock size={15} />
            <span>Mark In Progress</span>
          </button>
        )}

        {/* Move to Resolved (Allowed from Open or In Progress) */}
        {allowedTransitions.includes('RESOLVED') && (
          <button
            type="button"
            className="action-menu-item"
            onClick={() => handleAction(onStatusChange, ticket.id, 'RESOLVED')}
          >
            <CheckCircle2 size={15} />
            <span>Mark Resolved</span>
          </button>
        )}

        {/* Move to Closed (Allowed from In Progress or Resolved) */}
        {allowedTransitions.includes('CLOSED') && (
          <button
            type="button"
            className="action-menu-item"
            onClick={() => handleAction(onStatusChange, ticket.id, 'CLOSED')}
          >
            <Archive size={15} />
            <span>Close Ticket</span>
          </button>
        )}

        {/* Assign / Reassign Agent */}
        {onAssignAgent && (
          <>
            <div className="action-menu-divider" />
            <div className="action-menu-section-title">Assignee Management</div>

            {ticket.assignedAgentId && (
              <button
                type="button"
                className="action-menu-item text-muted"
                onClick={() => handleAction(onAssignAgent, ticket.id, null)}
              >
                <UserX size={14} />
                <span>Move to Unassigned Queue</span>
              </button>
            )}

            {activeAgents.map(agent => (
              <button
                key={agent.id}
                type="button"
                className={`action-menu-item agent-sub-item ${ticket.assignedAgentId === agent.id ? 'is-active-agent' : ''}`}
                onClick={() => handleAction(onAssignAgent, ticket.id, agent.id)}
              >
                <UserCheck size={14} />
                <span className="agent-item-name">{agent.name}</span>
                {ticket.assignedAgentId === agent.id && (
                  <span className="agent-item-current">(Assigned)</span>
                )}
              </button>
            ))}
          </>
        )}

        <div className="action-menu-divider" />

        <button
          type="button"
          className="action-menu-item action-delete text-danger"
          onClick={() => handleAction(onDelete, ticket.id)}
        >
          <Trash2 size={15} />
          <span>Delete Ticket</span>
        </button>
      </div>
    </Dropdown>
  );
}
