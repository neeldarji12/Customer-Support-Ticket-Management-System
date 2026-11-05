import React from 'react';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Tag,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import StatusBadge from '../tickets/StatusBadge';
import PriorityBadge from '../tickets/PriorityBadge';
import { formatTicketNumber, getTicketDueDate, isTicketOverdue } from '../../utils/ticketHelpers';
import { formatDateTime } from '../../utils/dateHelpers';

export default function TicketInfo({ ticket, agent }) {
  if (!ticket) return null;

  const ticketNum = formatTicketNumber(ticket.id);
  const dueDate = getTicketDueDate(ticket);
  const overdue = isTicketOverdue(ticket);

  return (
    <div className="ticket-info-panel">
      {/* Top Banner with ID and Status Badges */}
      <div className="ticket-info-header">
        <div className="ticket-title-group">
          <div className="ticket-id-tags">
            <span className="ticket-code-pill primary-code">{ticketNum}</span>
            <span className="ticket-raw-id">#{ticket.id}</span>
          </div>
          <h2 className="ticket-detail-title">{ticket.title}</h2>
        </div>

        <div className="ticket-detail-badges">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      {/* Description Section */}
      <div className="ticket-detail-desc-box">
        <h4 className="detail-section-heading">Issue Description</h4>
        <div className="detail-desc-text">
          {ticket.description || 'No detailed description provided.'}
        </div>
      </div>

      {/* Metadata 4-Column Grid */}
      <div className="ticket-meta-grid">
        {/* Customer Information */}
        <div className="meta-block">
          <span className="meta-label">
            <User size={13} className="meta-icon" />
            Customer Requester
          </span>
          <div className="meta-customer-row">
            <div className="meta-avatar">
              {ticket.customer?.avatar ? (
                <img
                  src={ticket.customer.avatar}
                  alt={ticket.customer.name}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <User size={14} />
              )}
            </div>
            <div>
              <span className="meta-value">{ticket.customer?.name || 'Anonymous Customer'}</span>
              <span className="meta-sub">
                <Mail size={11} />
                {ticket.customer?.email || 'No email on record'}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Agent */}
        <div className="meta-block">
          <span className="meta-label">
            <UserCheck size={13} className="meta-icon" />
            Assigned Agent
          </span>
          {agent ? (
            <div className="meta-agent-row">
              <img src={agent.avatar} alt={agent.name} className="meta-avatar" />
              <div>
                <span className="meta-value">{agent.name}</span>
                <span className="meta-sub">{agent.role}</span>
              </div>
            </div>
          ) : ticket.assignedAgentId ? (
            <div className="meta-agent-row">
              <div className="meta-avatar"><UserCheck size={14} /></div>
              <div>
                <span className="meta-value">Former Staff ({ticket.assignedAgentId})</span>
                <span className="meta-sub text-muted">Unlinked agent reference</span>
              </div>
            </div>
          ) : (
            <span className="meta-value text-muted italic">Unassigned (Queue)</span>
          )}
        </div>

        {/* Category */}
        <div className="meta-block">
          <span className="meta-label">
            <Tag size={13} className="meta-icon" />
            Category
          </span>
          <span className="category-tag">
            {ticket.category ? ticket.category.replace('_', ' ') : 'General'}
          </span>
        </div>

        {/* Due Date & SLA */}
        <div className="meta-block">
          <span className="meta-label">
            <Calendar size={13} className="meta-icon" />
            Resolution Target (SLA)
          </span>
          <div className="meta-due-date-row">
            <span className="meta-value">{formatDateTime(dueDate)}</span>
            {overdue && (
              <span className="overdue-indicator-pill">
                <AlertCircle size={11} strokeWidth={2.5} />
                Overdue
              </span>
            )}
          </div>
        </div>

        {/* Created At */}
        <div className="meta-block">
          <span className="meta-label">
            <Clock size={13} className="meta-icon" />
            Submitted On
          </span>
          <span className="meta-value">{formatDateTime(ticket.createdAt)}</span>
        </div>

        {/* Last Updated */}
        <div className="meta-block">
          <span className="meta-label">
            <Clock size={13} className="meta-icon" />
            Last Updated
          </span>
          <span className="meta-value">{formatDateTime(ticket.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
