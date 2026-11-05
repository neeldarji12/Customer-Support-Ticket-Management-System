import React from 'react';
import { RotateCcw, Filter, ArrowUpDown } from 'lucide-react';
import { TICKET_STATUS, TICKET_PRIORITY } from '../../utils/constants';

export default function TicketFilters({
  status = 'ALL',
  priority = 'ALL',
  agentId = 'ALL',
  sortBy = 'NEWEST',
  agents = [],
  onStatusChange,
  onPriorityChange,
  onAgentChange,
  onSortChange,
  onReset
}) {
  const isFiltered = status !== 'ALL' || priority !== 'ALL' || agentId !== 'ALL' || sortBy !== 'NEWEST';

  return (
    <div className="ticket-filters-bar">
      <div className="filters-group-left">
        <div className="filter-item">
          <label htmlFor="filterStatus">
            <Filter size={12} className="filter-label-icon" />
            Status
          </label>
          <select
            id="filterStatus"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            {Object.keys(TICKET_STATUS).map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="filterPriority">
            <Filter size={12} className="filter-label-icon" />
            Priority
          </label>
          <select
            id="filterPriority"
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            {Object.keys(TICKET_PRIORITY).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="filterAgent">
            <Filter size={12} className="filter-label-icon" />
            Assigned Agent
          </label>
          <select
            id="filterAgent"
            value={agentId}
            onChange={(e) => onAgentChange(e.target.value)}
          >
            <option value="ALL">All Agents</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="filters-group-right">
        <div className="filter-item sort-item">
          <label htmlFor="filterSort">
            <ArrowUpDown size={12} className="filter-label-icon" />
            Sort By
          </label>
          <select
            id="filterSort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
            <option value="DUE_ASC">Due Date (Earliest First)</option>
            <option value="DUE_DESC">Due Date (Latest First)</option>
          </select>
        </div>

        {isFiltered && (
          <button
            type="button"
            className="filter-reset-btn"
            onClick={onReset}
            title="Reset all filters and sorting"
          >
            <RotateCcw size={13} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
