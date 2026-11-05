import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, User } from 'lucide-react';
import StatusBadge from '../tickets/StatusBadge';
import PriorityBadge from '../tickets/PriorityBadge';
import { timeAgo } from '../../utils/dateHelpers';

export default function RecentTickets({ tickets = [], onSelectTicket }) {
  const navigate = useNavigate();

  // Sort by createdAt desc to ensure truly latest 5 tickets
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const handleRowClick = (id) => {
    if (onSelectTicket) {
      onSelectTicket(id);
    } else {
      navigate(`/tickets/${id}`);
    }
  };

  const handleViewAll = () => {
    navigate('/tickets');
  };

  return (
    <div className="chart-card recent-tickets-card">
      <div className="recent-tickets-header">
        <div>
          <h3 className="chart-title">Recent Tickets</h3>
          <p className="chart-subtitle">Latest customer support inquiries requiring team attention</p>
        </div>
        <button
          type="button"
          className="recent-view-all-btn"
          onClick={handleViewAll}
        >
          <span>View All ({tickets.length})</span>
          <ArrowRight size={14} strokeWidth={2.2} />
        </button>
      </div>

      <div className="table-responsive">
        {recentTickets.length === 0 ? (
          <div className="chart-empty-placeholder">
            <span>No tickets currently in the pipeline</span>
          </div>
        ) : (
          <table className="recent-tickets-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th aria-label="Actions" style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {recentTickets.map(ticket => (
                <tr
                  key={ticket.id}
                  onClick={() => handleRowClick(ticket.id)}
                  className="clickable-row"
                >
                  <td className="ticket-id-cell">
                    <span className="ticket-code-pill">#{ticket.id}</span>
                  </td>
                  <td className="ticket-title-cell">
                    <span className="ticket-title-text" title={ticket.title}>
                      {ticket.title}
                    </span>
                    {ticket.category && (
                      <span className="ticket-category-tag">{ticket.category}</span>
                    )}
                  </td>
                  <td className="ticket-customer-cell">
                    <div className="customer-info-box">
                      <div className="customer-avatar-badge">
                        {ticket.customer?.avatar ? (
                          <img
                            src={ticket.customer.avatar}
                            alt={ticket.customer.name}
                            className="customer-avatar-img"
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
                  </td>
                  <td>
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td>
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="text-muted">
                    <span className="ticket-time-text">{timeAgo(ticket.createdAt)}</span>
                  </td>
                  <td className="ticket-action-cell">
                    <div className="row-action-arrow">
                      <ChevronRight size={16} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
