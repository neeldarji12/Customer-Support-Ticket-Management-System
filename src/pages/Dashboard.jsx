import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Clock,
  Activity,
  CheckCircle2,
  Archive,
  AlertOctagon,
  Plus,
  AlertCircle
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import KPICard from '../components/dashboard/KPICard';
import TicketStatusChart from '../components/dashboard/TicketStatusChart';
import PriorityChart from '../components/dashboard/PriorityChart';
import AgentWorkload from '../components/dashboard/AgentWorkload';
import RecentTickets from '../components/dashboard/RecentTickets';
import RecentActivity from '../components/dashboard/RecentActivity';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import Skeleton from '../components/common/Skeleton';
import { useTicketContext } from '../context/TicketContext';
import { calculateKPIs } from '../utils/ticketHelpers';

export default function Dashboard({ onNavigate }) {
  const navigate = useNavigate();
  const {
    tickets = [],
    loading = false,
    error = null,
    fetchTickets,
    setFilters
  } = useTicketContext() || {};

  // Automatic real-time telemetry synchronization (auto-sync without manual refresh)
  useEffect(() => {
    if (!fetchTickets) return;

    // Background auto-refresh polling every 12 seconds
    const interval = setInterval(() => {
      fetchTickets().catch(() => {});
    }, 12000);

    // Immediate auto-sync when browser window or tab regains focus
    const handleFocus = () => {
      fetchTickets().catch(() => {});
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchTickets]);

  const handleCreate = () => {
    if (onNavigate) {
      onNavigate('create-ticket');
    } else {
      navigate('/tickets/create');
    }
  };

  const handleSelectTicket = (id) => {
    if (onNavigate) {
      onNavigate('ticket-details', id);
    } else {
      navigate(`/tickets/${id}`);
    }
  };

  const handleFilterNavigate = (status) => {
    if (setFilters) {
      setFilters(prev => ({
        ...prev,
        status: status || 'ALL',
        priority: 'ALL',
        search: ''
      }));
    }
    if (onNavigate) {
      onNavigate('tickets');
    } else {
      navigate('/tickets');
    }
  };

  // Dynamic calculations from real REST API tickets
  const kpis = calculateKPIs(tickets);

  // If loading and no tickets exist yet, display the full Skeleton dashboard
  if (loading && tickets.length === 0) {
    return (
      <div className="dashboard-page">
        <PageHeader
          title="Executive Overview"
          subtitle="Real-time support telemetry, ticket resolution pipeline, and team capacity."
        />

        <div className="kpi-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="kpi-skeleton-card">
              <div className="kpi-skeleton-header">
                <Skeleton width="45%" height="14px" />
                <Skeleton width="36px" height="36px" borderRadius="8px" />
              </div>
              <Skeleton width="55%" height="32px" style={{ margin: '14px 0 8px' }} />
              <Skeleton width="30%" height="12px" />
            </div>
          ))}
        </div>

        <div className="dashboard-charts-grid">
          <div className="chart-card">
            <Skeleton width="40%" height="20px" style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height="220px" borderRadius="10px" />
          </div>
          <div className="chart-card">
            <Skeleton width="40%" height="20px" style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height="220px" borderRadius="10px" />
          </div>
        </div>

        <div className="dashboard-bottom-grid">
          <div className="bottom-grid-main">
            <div className="chart-card">
              <Skeleton width="35%" height="20px" style={{ marginBottom: 16 }} />
              <Skeleton width="100%" height="240px" borderRadius="8px" />
            </div>
          </div>
          <div className="bottom-grid-side">
            <div className="chart-card">
              <Skeleton width="40%" height="20px" style={{ marginBottom: 16 }} />
              <Skeleton width="100%" height="200px" borderRadius="8px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Executive Overview"
        subtitle="Real-time support telemetry, ticket resolution pipeline, and team capacity."
        actions={
          <div className="dashboard-header-actions">
            <div className="live-auto-sync-badge" title="Telemetry updates automatically in real time without manual refresh">
              <span className="live-pulse-dot" />
              <span>Auto-Sync</span>
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

      {/* API Error Banner if request failed and no cached tickets are available */}
      {error && tickets.length === 0 && (
        <div className="dashboard-error-banner" role="alert">
          <div className="error-banner-content">
            <AlertCircle size={20} className="error-banner-icon" />
            <div>
              <h4 className="error-banner-title">Failed to Synchronize Telemetry</h4>
              <p className="error-banner-desc">{error}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => fetchTickets && fetchTickets()}>
            Retry Connection
          </Button>
        </div>
      )}

      {/* Empty State when no tickets exist in database */}
      {tickets.length === 0 && !loading && !error ? (
        <EmptyState
          title="No Support Tickets Recorded"
          description="Your support operations pipeline is currently empty. Create your first customer ticket to populate telemetry, SLAs, and team workload metrics."
          actionText="Create First Ticket"
          onAction={handleCreate}
          icon="🎫"
        />
      ) : (
        <>
          {/* 6 Dynamic KPI Cards */}
          <div className="kpi-grid">
            <KPICard
              title="Total Tickets"
              value={kpis.total}
              icon={Ticket}
              color="var(--gold-accent)"
              indicator="All Stages"
              onClick={() => handleFilterNavigate('ALL')}
            />
            <KPICard
              title="Open Tickets"
              value={kpis.open}
              icon={Clock}
              color="#FBBF24"
              indicator="Needs Action"
              onClick={() => handleFilterNavigate('OPEN')}
            />
            <KPICard
              title="In Progress"
              value={kpis.inProgress}
              icon={Activity}
              color="var(--bronze-400)"
              indicator="In Flight"
              onClick={() => handleFilterNavigate('IN_PROGRESS')}
            />
            <KPICard
              title="Resolved"
              value={kpis.resolved}
              icon={CheckCircle2}
              color="#34D399"
              indicator="SLA Met"
              onClick={() => handleFilterNavigate('RESOLVED')}
            />
            <KPICard
              title="Closed"
              value={kpis.closed}
              icon={Archive}
              color="#78716C"
              indicator="Archived"
              onClick={() => handleFilterNavigate('CLOSED')}
            />
            <KPICard
              title="Overdue Tickets"
              value={kpis.overdue}
              icon={AlertOctagon}
              color="#FB7185"
              indicator={kpis.overdue > 0 ? "Critical SLA" : "Within SLA"}
              indicatorColor={kpis.overdue > 0 ? "#FB7185" : "#34D399"}
              onClick={() => handleFilterNavigate('ALL')}
            />
          </div>

          {/* Recharts Data Visualizations */}
          <div className="dashboard-charts-grid">
            <TicketStatusChart tickets={tickets} />
            <PriorityChart tickets={tickets} />
          </div>

          {/* Additional Sections: Recent Tickets, Agent Workload & Recent Activity */}
          <div className="dashboard-bottom-grid">
            <div className="bottom-grid-main">
              <RecentTickets
                tickets={tickets}
                onSelectTicket={handleSelectTicket}
              />
            </div>
            <div className="bottom-grid-side">
              <AgentWorkload tickets={tickets} />
              <RecentActivity onSelectTicket={handleSelectTicket} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
