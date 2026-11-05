import React from 'react';
import {
  UserCheck,
  RotateCcw,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  UserX
} from 'lucide-react';
import { TICKET_PRIORITY } from '../../utils/constants';
import {
  formatTicketNumber,
  getTicketDueDate,
  isTicketOverdue,
  getAllowedTransitions
} from '../../utils/ticketHelpers';
import { formatDateTime } from '../../utils/dateHelpers';
import Button from '../common/Button';

export default function AssignmentPanel({
  ticket,
  agents = [],
  onAssignAgent,
  onStatusChange,
  onPriorityChange,
  onEditTicket
}) {
  const currentAgent = agents.find(a => a.id === ticket.assignedAgentId);
  const isMissingAgent = Boolean(ticket.assignedAgentId && !currentAgent);
  const activeAgents = agents.filter(a => a.status !== 'INACTIVE');

  const isResolvedOrClosed = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
  const allowedTransitions = getAllowedTransitions(ticket.status);
  const dueDate = getTicketDueDate(ticket);
  const overdue = isTicketOverdue(ticket);

  return (
    <div className="assignment-panel">
      <div className="panel-header">
        <h4 className="panel-title">Operations & Triage</h4>
        <span className="panel-ticket-tag">{formatTicketNumber(ticket.id)}</span>
      </div>

      {/* 1. Status Management & Workflow Section */}
      <div className="panel-section">
        <div className="section-label-row">
          <label className="section-label" htmlFor="ticketStatusSelect">
            <Activity size={13} className="section-label-icon" />
            Status & Workflow
          </label>
          <span className="status-current-badge">{ticket.status}</span>
        </div>

        {/* Workflow Action Transitions */}
        <div className="workflow-transitions-container">
          {isResolvedOrClosed ? (
            <div className="reopen-action-box">
              <div className="reopen-notice">
                Ticket is currently <strong>{ticket.status}</strong>.
              </div>
              <Button
                variant="secondary"
                className="reopen-btn"
                onClick={() => onStatusChange('OPEN')}
                icon={<RotateCcw size={14} />}
              >
                Reopen Ticket (Move to Open)
              </Button>
            </div>
          ) : (
            <div className="workflow-quick-buttons">
              {ticket.status === 'OPEN' && (
                <>
                  <button
                    type="button"
                    className="workflow-btn btn-in-progress"
                    onClick={() => onStatusChange('IN_PROGRESS')}
                  >
                    <span>Start Investigation</span>
                    <ArrowRight size={13} />
                  </button>
                  <button
                    type="button"
                    className="workflow-btn btn-resolve"
                    onClick={() => onStatusChange('RESOLVED')}
                  >
                    <span>Resolve Directly</span>
                    <CheckCircle2 size={13} />
                  </button>
                </>
              )}

              {ticket.status === 'IN_PROGRESS' && (
                <>
                  <button
                    type="button"
                    className="workflow-btn btn-resolve"
                    onClick={() => onStatusChange('RESOLVED')}
                  >
                    <span>Mark as Resolved</span>
                    <CheckCircle2 size={13} />
                  </button>
                  <button
                    type="button"
                    className="workflow-btn btn-close"
                    onClick={() => onStatusChange('CLOSED')}
                  >
                    <span>Close Ticket</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Fallback Select allowing ONLY valid status transitions */}
          <div className="status-select-group">
            <label htmlFor="ticketStatusSelect" className="field-sublabel">
              Manual Status Transition:
            </label>
            <select
              id="ticketStatusSelect"
              className="panel-select"
              value={ticket.status}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <option value={ticket.status} disabled>
                {ticket.status.replace('_', ' ')} (Current)
              </option>
              {allowedTransitions.map(targetStatus => (
                <option key={targetStatus} value={targetStatus}>
                  Move to → {targetStatus.replace('_', ' ')}
                </option>
              ))}
            </select>
            <span className="workflow-guard-hint">
              Restricted to authorized workflow lifecycle states.
            </span>
          </div>
        </div>
      </div>

      {/* 2. Priority Management Section */}
      <div className="panel-section">
        <label className="section-label" htmlFor="ticketPrioritySelect">
          <AlertTriangle size={13} className="section-label-icon" />
          SLA Priority Level
        </label>
        <select
          id="ticketPrioritySelect"
          className="panel-select"
          value={ticket.priority}
          onChange={(e) => onPriorityChange(e.target.value)}
        >
          {Object.keys(TICKET_PRIORITY).map(p => (
            <option key={p} value={p}>
              {p} Priority
            </option>
          ))}
        </select>
      </div>

      {/* 3. Assigned Agent Section (Assign / Reassign / Unassign) */}
      <div className="panel-section">
        <label className="section-label" htmlFor="ticketAgentSelect">
          <UserCheck size={13} className="section-label-icon" />
          Support Assignee
        </label>

        {currentAgent ? (
          <div className="current-agent-card">
            <img
              src={currentAgent.avatar}
              alt={currentAgent.name}
              className="agent-avatar-medium"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="current-agent-info">
              <span className="current-agent-name">{currentAgent.name}</span>
              <span className="current-agent-role">{currentAgent.role}</span>
              <span className="current-agent-email">{currentAgent.email}</span>
            </div>
          </div>
        ) : isMissingAgent ? (
          /* Gracefully handle deleted or missing agent references */
          <div className="missing-agent-card">
            <UserX size={20} className="missing-agent-icon" />
            <div className="current-agent-info">
              <span className="current-agent-name">Former Staff Member</span>
              <span className="current-agent-role">Agent record unlinked ({ticket.assignedAgentId})</span>
              <span className="missing-agent-hint">Please reassign to an active agent</span>
            </div>
          </div>
        ) : (
          <div className="unassigned-notice">
            <AlertCircle size={15} />
            <span>Currently unassigned in general queue</span>
          </div>
        )}

        <div className="agent-select-wrapper">
          <select
            id="ticketAgentSelect"
            className="panel-select"
            value={ticket.assignedAgentId || ''}
            onChange={(e) => onAssignAgent(e.target.value || null)}
          >
            <option value="">Unassigned (General Queue)</option>
            {activeAgents.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} — {a.role}
              </option>
            ))}
            {isMissingAgent && (
              <option value={ticket.assignedAgentId} disabled>
                Unlinked Agent ({ticket.assignedAgentId})
              </option>
            )}
          </select>
        </div>
      </div>

      {/* 4. SLA & Target Resolution Summary */}
      <div className="panel-section">
        <label className="section-label">
          <Calendar size={13} className="section-label-icon" />
          Target Resolution Date
        </label>
        <div className="sla-target-box">
          <span className="sla-date-text">{formatDateTime(dueDate)}</span>
          {overdue ? (
            <span className="sla-overdue-tag">
              <AlertCircle size={12} strokeWidth={2.5} />
              Overdue SLA
            </span>
          ) : (
            <span className="sla-valid-tag">
              <CheckCircle2 size={12} />
              Within SLA Target
            </span>
          )}
        </div>
      </div>

      {/* Quick Action Buttons */}
      {onEditTicket && (
        <div className="panel-footer-actions">
          <Button
            variant="secondary"
            className="edit-shortcut-btn"
            onClick={onEditTicket}
            icon={<ExternalLink size={14} />}
          >
            Edit All Fields
          </Button>
        </div>
      )}
    </div>
  );
}
