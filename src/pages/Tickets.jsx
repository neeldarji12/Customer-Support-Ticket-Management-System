import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search as SearchIcon, RotateCcw, LayoutGrid, Table } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import TicketTable from '../components/tickets/TicketTable';
import TicketCard from '../components/tickets/TicketCard';
import TicketSearch from '../components/tickets/TicketSearch';
import TicketFilters from '../components/tickets/TicketFilters';
import TicketPagination from '../components/tickets/TicketPagination';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useTicketContext } from '../context/TicketContext';
import { useAgents } from '../hooks/useAgents';
import { useNotificationContext } from '../context/NotificationContext';
import { useDebounce } from '../hooks/useDebounce';
import { filterTickets, sortTickets, formatTicketNumber } from '../utils/ticketHelpers';

export default function Tickets({ onNavigate }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { tickets = [], loading, deleteTicket, updateTicket, filters: contextFilters } = useTicketContext() || {};
  const { agents = [] } = useAgents() || {};
  const { addToast } = useNotificationContext() || {};

  // URL search query with local input state for debounced searching
  const urlSearch = searchParams.get('search') || '';
  const urlStatus = searchParams.get('status') || contextFilters?.status || 'ALL';

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 250);

  const [status, setStatus] = useState(urlStatus);
  const [priority, setPriority] = useState(contextFilters?.priority || 'ALL');
  const [agentId, setAgentId] = useState(contextFilters?.agentId || 'ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // View Mode: 'card' (default) or 'table'
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('cstms_tickets_view_mode') || 'card';
    }
    return 'card';
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('cstms_tickets_view_mode', mode);
    }
  };

  // Synchronize debounced search to URL search param
  useEffect(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (debouncedSearch) {
        next.set('search', debouncedSearch);
      } else {
        next.delete('search');
      }
      return next;
    }, { replace: true });
  }, [debouncedSearch, setSearchParams]);

  const handleSearchInputChange = (val) => {
    setSearchInput(val);
    setCurrentPage(1);
  };

  // Filter and sort tickets
  const filteredAndSorted = useMemo(() => {
    const filtered = filterTickets(tickets, {
      search: debouncedSearch,
      status,
      priority,
      agentId
    });
    return sortTickets(filtered, sortBy);
  }, [tickets, debouncedSearch, status, priority, agentId, sortBy]);

  // Correct page count and pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTickets = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, safeCurrentPage, pageSize]);

  // Actions
  const handleSelect = (id) => {
    if (onNavigate) {
      onNavigate('ticket-details', id);
    } else {
      navigate(`/tickets/${id}`);
    }
  };

  const handleEdit = (id) => {
    if (onNavigate) {
      onNavigate('edit-ticket', id);
    } else {
      navigate(`/tickets/${id}/edit`);
    }
  };

  const handleCreate = () => {
    if (onNavigate) {
      onNavigate('create-ticket');
    } else {
      navigate('/tickets/create');
    }
  };

  const handleDelete = async () => {
    if (deleteTargetId && deleteTicket) {
      const targetFormatted = formatTicketNumber(deleteTargetId);
      await deleteTicket(deleteTargetId);
      if (addToast) addToast(`Ticket ${targetFormatted} permanently deleted`, 'success');
      setDeleteTargetId(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (updateTicket) {
      try {
        await updateTicket(id, { status: newStatus });
        const targetFormatted = formatTicketNumber(id);
        const isReopen = newStatus === 'OPEN';
        if (addToast) {
          addToast(
            isReopen
              ? `Ticket ${targetFormatted} reopened successfully`
              : `Ticket ${targetFormatted} marked as ${newStatus.replace('_', ' ')}`,
            'info'
          );
        }
      } catch (err) {
        if (addToast) addToast(err.message || 'Invalid status transition', 'error');
      }
    }
  };

  const handleAssignAgent = async (id, newAgentId) => {
    if (updateTicket) {
      try {
        await updateTicket(id, { assignedAgentId: newAgentId });
        const targetFormatted = formatTicketNumber(id);
        const assigned = agents.find(a => a.id === newAgentId);
        if (addToast) {
          addToast(
            newAgentId
              ? `Ticket ${targetFormatted} assigned to ${assigned ? assigned.name : 'agent'}`
              : `Ticket ${targetFormatted} moved to unassigned queue`,
            'success'
          );
        }
      } catch (err) {
        if (addToast) addToast(err.message || 'Failed to update assignment', 'error');
      }
    }
  };

  const handleResetFilters = () => {
    setStatus('ALL');
    setPriority('ALL');
    setAgentId('ALL');
    setSortBy('NEWEST');
    setSearchInput('');
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
  };

  if (loading && tickets.length === 0) {
    return <Loader text="Loading support ticket database..." />;
  }

  return (
    <div className="tickets-page">
      <PageHeader
        title="Support Tickets"
        subtitle="Manage, triage, reassign, and track enterprise customer support inquiries."
        actions={
          <div className="tickets-header-actions">
            <div className="view-mode-toggle" role="group" aria-label="Ticket view mode">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'card' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('card')}
                title="Card View (Default)"
                aria-pressed={viewMode === 'card'}
              >
                <LayoutGrid size={15} />
                <span>Cards</span>
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('table')}
                title="Detailed Table View"
                aria-pressed={viewMode === 'table'}
              >
                <Table size={15} />
                <span>Details / Table</span>
              </button>
            </div>

            <Button
              variant="primary"
              icon={<Plus size={15} strokeWidth={2.5} />}
              onClick={handleCreate}
            >
              Create Ticket
            </Button>
          </div>
        }
      />

      {/* Search and Filters Toolbar Card */}
      <div className="tickets-controls-card">
        <div className="search-row-container">
          <TicketSearch
            search={searchInput}
            onSearchChange={handleSearchInputChange}
          />
        </div>

        <TicketFilters
          status={status}
          priority={priority}
          agentId={agentId}
          sortBy={sortBy}
          agents={agents}
          onStatusChange={(val) => { setStatus(val); setCurrentPage(1); }}
          onPriorityChange={(val) => { setPriority(val); setCurrentPage(1); }}
          onAgentChange={(val) => { setAgentId(val); setCurrentPage(1); }}
          onSortChange={(val) => { setSortBy(val); setCurrentPage(1); }}
          onReset={handleResetFilters}
        />
      </div>

      {/* Empty State when no tickets exist in system */}
      {tickets.length === 0 ? (
        <EmptyState
          title="No Support Tickets Found"
          description="There are currently no tickets in the support system. Create your first ticket to get started."
          actionText="Create First Ticket"
          onAction={handleCreate}
          icon="🎫"
        />
      ) : filteredAndSorted.length === 0 ? (
        /* No results state when filters/search return 0 results */
        <div className="tickets-no-results-card">
          <div className="no-results-icon-box">
            <SearchIcon size={32} />
          </div>
          <h3 className="no-results-title">No Matching Tickets</h3>
          <p className="no-results-desc">
            No support requests match your search criteria. Try modifying your search keywords or resetting your active filters.
          </p>
          <Button
            variant="secondary"
            icon={<RotateCcw size={14} />}
            onClick={handleResetFilters}
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <>
          {/* Ticket Display: Card View (Default) or Detailed Table View */}
          {viewMode === 'card' ? (
            <div className="ticket-cards-grid">
              {paginatedTickets.map(ticket => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  agents={agents}
                  onSelect={handleSelect}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeleteTargetId(id)}
                  onStatusChange={handleStatusChange}
                  onAssignAgent={handleAssignAgent}
                />
              ))}
            </div>
          ) : (
            <div className="tickets-table-container">
              <TicketTable
                tickets={paginatedTickets}
                agents={agents}
                onSelectTicket={handleSelect}
                onEditTicket={handleEdit}
                onDeleteTicket={(id) => setDeleteTargetId(id)}
                onStatusChange={handleStatusChange}
                onAssignAgent={handleAssignAgent}
              />
            </div>
          )}

          {/* Pagination Controls */}
          <TicketPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredAndSorted.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </>
      )}

      {/* Delete Confirmation Modal Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Support Ticket"
        message={`Are you sure you want to permanently delete ticket ${formatTicketNumber(deleteTargetId)}? This action cannot be undone and will remove all associated comments and telemetry.`}
        confirmText="Delete Ticket"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
