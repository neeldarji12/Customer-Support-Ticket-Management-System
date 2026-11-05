import React, { useEffect, useMemo } from 'react';
import {
  Ticket,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  RotateCcw,
  Download,
  AlertCircle,
  Users,
  Layers,
  BarChart3,
  PieChart as PieIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import PageHeader from '../components/layout/PageHeader';
import KPICard from '../components/dashboard/KPICard';
import Button from '../components/common/Button';
import { useTicketContext } from '../context/TicketContext';
import { useAgents } from '../hooks/useAgents';
import { calculateKPIs } from '../utils/ticketHelpers';

const STATUS_CONFIG = {
  OPEN: { label: 'Open', color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.12)' },
  IN_PROGRESS: { label: 'In Progress', color: '#E5B25D', bg: 'rgba(229, 178, 93, 0.12)' },
  RESOLVED: { label: 'Resolved', color: '#34D399', bg: 'rgba(52, 211, 153, 0.12)' },
  CLOSED: { label: 'Closed', color: '#78716C', bg: 'rgba(120, 113, 108, 0.12)' },
};

const PRIORITY_CONFIG = [
  { key: 'URGENT', name: 'Urgent', color: '#FB7185', bg: 'rgba(251, 113, 133, 0.12)' },
  { key: 'HIGH', name: 'High', color: '#FB923C', bg: 'rgba(251, 146, 60, 0.12)' },
  { key: 'MEDIUM', name: 'Medium', color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.12)' },
  { key: 'LOW', name: 'Low', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)' },
];

function StatusTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const { name, value, percent } = data;
    const color = data.payload?.color || 'var(--gold-accent)';
    return (
      <div className="recharts-custom-tooltip">
        <div className="tooltip-header">
          <span className="tooltip-dot" style={{ backgroundColor: color }} />
          <span className="tooltip-title">{name}</span>
        </div>
        <div className="tooltip-body">
          <span className="tooltip-value">{value} tickets</span>
          {percent !== undefined && (
            <span className="tooltip-percent">({(percent * 100).toFixed(1)}%)</span>
          )}
        </div>
      </div>
    );
  }
  return null;
}

function PriorityTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const color = data.payload?.color || 'var(--gold-accent)';
    const total = data.payload?.total || 1;
    const percent = Math.round((data.value / total) * 100);
    return (
      <div className="recharts-custom-tooltip">
        <div className="tooltip-header">
          <span className="tooltip-dot" style={{ backgroundColor: color }} />
          <span className="tooltip-title">{label} Priority</span>
        </div>
        <div className="tooltip-body">
          <span className="tooltip-value">{data.value} tickets</span>
          <span className="tooltip-percent">({percent}% of volume)</span>
        </div>
      </div>
    );
  }
  return null;
}

function WorkloadTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const agentData = payload[0]?.payload;
    return (
      <div className="recharts-custom-tooltip workload-tooltip">
        <div className="tooltip-header">
          <span className="tooltip-title">{agentData?.fullName || label}</span>
          <span className="tooltip-subtitle">{agentData?.role || ''}</span>
        </div>
        <div className="workload-tooltip-content">
          <div className="tooltip-stat-row">
            <span className="tooltip-stat-label">
              <span className="tooltip-dot" style={{ backgroundColor: '#FBBF24' }} /> Open:
            </span>
            <span className="tooltip-stat-val">{agentData?.openTickets ?? 0}</span>
          </div>
          <div className="tooltip-stat-row">
            <span className="tooltip-stat-label">
              <span className="tooltip-dot" style={{ backgroundColor: '#E5B25D' }} /> In Progress:
            </span>
            <span className="tooltip-stat-val">{agentData?.inProgressTickets ?? 0}</span>
          </div>
          <div className="tooltip-stat-row">
            <span className="tooltip-stat-label">
              <span className="tooltip-dot" style={{ backgroundColor: '#34D399' }} /> Resolved:
            </span>
            <span className="tooltip-stat-val">{agentData?.resolvedTickets ?? 0}</span>
          </div>
          <div className="tooltip-stat-divider" />
          <div className="tooltip-stat-row total-row">
            <span className="tooltip-stat-label">Total Assigned:</span>
            <span className="tooltip-stat-val highlight">{agentData?.assignedTickets ?? 0}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default function Reports() {
  const {
    tickets = [],
    loading: ticketsLoading = false,
    error: ticketsError = null,
    fetchTickets
  } = useTicketContext() || {};

  const {
    agents = [],
    loading: agentsLoading = false,
    error: agentsError = null
  } = useAgents();

  // Automatic real-time reports synchronization (auto-sync without manual refresh)
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

  const loading = ticketsLoading || agentsLoading;
  const error = ticketsError || agentsError;

  // 1. Dynamic KPIs (Ticket Summary)
  const kpis = useMemo(() => calculateKPIs(tickets), [tickets]);
  const resolutionPercentage = kpis.total > 0 ? Math.round((kpis.resolved / kpis.total) * 100) : 0;

  // 2. Status Distribution Data
  const statusData = useMemo(() => {
    const counts = {
      OPEN: tickets.filter(t => t.status === 'OPEN').length,
      IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
      RESOLVED: tickets.filter(t => t.status === 'RESOLVED').length,
      CLOSED: tickets.filter(t => t.status === 'CLOSED').length,
    };
    const total = tickets.length;

    return [
      {
        key: 'OPEN',
        name: STATUS_CONFIG.OPEN.label,
        value: counts.OPEN,
        color: STATUS_CONFIG.OPEN.color,
        percent: total > 0 ? counts.OPEN / total : 0
      },
      {
        key: 'IN_PROGRESS',
        name: STATUS_CONFIG.IN_PROGRESS.label,
        value: counts.IN_PROGRESS,
        color: STATUS_CONFIG.IN_PROGRESS.color,
        percent: total > 0 ? counts.IN_PROGRESS / total : 0
      },
      {
        key: 'RESOLVED',
        name: STATUS_CONFIG.RESOLVED.label,
        value: counts.RESOLVED,
        color: STATUS_CONFIG.RESOLVED.color,
        percent: total > 0 ? counts.RESOLVED / total : 0
      },
      {
        key: 'CLOSED',
        name: STATUS_CONFIG.CLOSED.label,
        value: counts.CLOSED,
        color: STATUS_CONFIG.CLOSED.color,
        percent: total > 0 ? counts.CLOSED / total : 0
      },
    ];
  }, [tickets]);

  // 3. Priority Distribution Data
  const priorityData = useMemo(() => {
    const total = tickets.length;
    return PRIORITY_CONFIG.map(item => {
      const count = tickets.filter(t => t.priority === item.key).length;
      return {
        key: item.key,
        name: item.name,
        count,
        color: item.color,
        total,
        percent: total > 0 ? Math.round((count / total) * 100) : 0
      };
    });
  }, [tickets]);

  // 4. Agent Workload Breakdown (handles missing agents and unassigned tickets)
  const workloadData = useMemo(() => {
    const agentMap = new Map((agents || []).map(a => [a.id, a]));

    const list = (agents || []).map(agent => {
      const agentTickets = tickets.filter(t => t.assignedAgentId === agent.id);
      const openTickets = agentTickets.filter(t => t.status === 'OPEN').length;
      const inProgressTickets = agentTickets.filter(t => t.status === 'IN_PROGRESS').length;
      const resolvedTickets = agentTickets.filter(t => t.status === 'RESOLVED').length;
      const closedTickets = agentTickets.filter(t => t.status === 'CLOSED').length;
      const assignedTickets = agentTickets.length;
      const resolutionRate = assignedTickets > 0 ? Math.round((resolvedTickets / assignedTickets) * 100) : 0;

      return {
        id: agent.id,
        name: agent.name.split(' ')[0],
        fullName: agent.name,
        role: agent.role,
        avatar: agent.avatar,
        email: agent.email,
        assignedTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        resolutionRate,
        isUnassigned: false
      };
    });

    // Capture tickets with missing or unassigned agent references
    const unassignedTickets = tickets.filter(
      t => !t.assignedAgentId || !agentMap.has(t.assignedAgentId)
    );

    if (unassignedTickets.length > 0) {
      const openTickets = unassignedTickets.filter(t => t.status === 'OPEN').length;
      const inProgressTickets = unassignedTickets.filter(t => t.status === 'IN_PROGRESS').length;
      const resolvedTickets = unassignedTickets.filter(t => t.status === 'RESOLVED').length;
      const closedTickets = unassignedTickets.filter(t => t.status === 'CLOSED').length;
      const assignedTickets = unassignedTickets.length;
      const resolutionRate = assignedTickets > 0 ? Math.round((resolvedTickets / assignedTickets) * 100) : 0;

      list.push({
        id: 'unassigned',
        name: 'Unassigned',
        fullName: 'Unassigned / Queue',
        role: 'Triage Pool',
        avatar: null,
        email: 'triage@applen.com',
        assignedTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        resolutionRate,
        isUnassigned: true
      });
    }

    return list;
  }, [agents, tickets]);

  const handleExportCSV = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const lines = [
      ['APPLEN SOLUTIONS - SUPPORT ANALYTICS & SLA REPORT'],
      [`Generated at: ${now.toLocaleString()}`],
      [''],
      ['--- 1. TICKET SUMMARY ---'],
      ['Metric', 'Value'],
      ['Total Tickets', kpis.total],
      ['Resolved Tickets', kpis.resolved],
      ['Overdue Tickets', kpis.overdue],
      ['Resolution Percentage', `${resolutionPercentage}%`],
      ['Open Tickets', kpis.open],
      ['In Progress Tickets', kpis.inProgress],
      ['Closed Tickets', kpis.closed],
      [''],
      ['--- 2. TICKETS BY STATUS ---'],
      ['Status', 'Count', 'Percentage'],
      ...statusData.map(s => [s.name, s.value, `${Math.round(s.percent * 100)}%`]),
      [''],
      ['--- 3. TICKETS BY PRIORITY ---'],
      ['Priority', 'Count', 'Percentage'],
      ...priorityData.map(p => [p.name, p.count, `${p.percent}%`]),
      [''],
      ['--- 4. AGENT WORKLOAD ---'],
      ['Agent Name', 'Assigned Tickets', 'Open Tickets', 'In Progress Tickets', 'Resolved Tickets', 'Resolution Rate'],
      ...workloadData.map(w => [
        `"${w.fullName}"`,
        w.assignedTickets,
        w.openTickets,
        w.inProgressTickets,
        w.resolvedTickets,
        `${w.resolutionRate}%`
      ])
    ];

    const csvContent = lines.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `applen-support-analytics-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="reports-page">
        <PageHeader
          title="Support Analytics & SLA Reports"
          subtitle="Loading real-time enterprise support analytics..."
        />
        <div className="reports-summary-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '12px' }} />
          ))}
        </div>
        <div className="reports-charts-grid">
          <div className="skeleton" style={{ height: '380px', borderRadius: '12px' }} />
          <div className="skeleton" style={{ height: '380px', borderRadius: '12px' }} />
        </div>
        <div className="skeleton" style={{ height: '420px', borderRadius: '12px' }} />
      </div>
    );
  }

  if (error && tickets.length === 0) {
    return (
      <div className="reports-page">
        <PageHeader
          title="Support Analytics & SLA Reports"
          subtitle="Support intelligence and resolution velocity metrics."
        />
        <div className="reports-error-card">
          <AlertCircle size={44} className="reports-error-icon" />
          <h3 className="reports-error-title">Unable to Load Analytics Data</h3>
          <p className="reports-error-desc">{error}</p>
          <Button variant="primary" onClick={() => fetchTickets && fetchTickets()}>
            <RotateCcw size={16} />
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <PageHeader
        title="Support Analytics & SLA Reports"
        subtitle="Dynamic ticket intelligence, resolution velocity, and team workload analytics."
        actions={
          <div className="reports-header-actions">
            <div className="live-auto-sync-badge" title="Reports & Analytics update automatically in real time without manual refresh">
              <span className="live-pulse-dot" />
              <span>Auto-Sync</span>
            </div>
            <Button
              variant="primary"
              onClick={handleExportCSV}
              className="reports-export-btn"
            >
              <Download size={15} />
              Export CSV
            </Button>
          </div>
        }
      />

      {/* =========================================================================
          SECTION 4: TICKET SUMMARY (Executive KPIs)
          ========================================================================= */}
      <section className="reports-section">
        <div className="section-label-row">
          <h2 className="section-title">
            <Layers size={18} className="section-title-icon" />
            Executive Ticket Summary
          </h2>
          <span className="section-meta-pill">Real-time REST API Calculation</span>
        </div>

        <div className="reports-summary-grid">
          <KPICard
            title="Total Tickets"
            value={kpis.total}
            icon={Ticket}
            color="var(--bronze-500)"
            indicator="Total Volume"
          />
          <KPICard
            title="Resolved Tickets"
            value={kpis.resolved}
            icon={CheckCircle2}
            color="#34D399"
            indicator={kpis.total > 0 ? `${resolutionPercentage}% completed` : '0%'}
            indicatorColor="#34D399"
          />
          <KPICard
            title="Overdue Tickets"
            value={kpis.overdue}
            icon={AlertOctagon}
            color="#FB7185"
            indicator={kpis.overdue > 0 ? 'Requires Action' : 'Within SLA'}
            indicatorColor={kpis.overdue > 0 ? '#FB7185' : '#34D399'}
          />
          <KPICard
            title="Resolution Rate"
            value={resolutionPercentage}
            suffix="%"
            icon={TrendingUp}
            color="var(--gold-accent)"
            indicator={resolutionPercentage >= 75 ? 'Target Met' : 'Under Target'}
            indicatorColor={resolutionPercentage >= 75 ? '#34D399' : '#E5B25D'}
          />
        </div>
      </section>

      {/* =========================================================================
          SECTIONS 1 & 2: TICKETS BY STATUS & TICKETS BY PRIORITY
          ========================================================================= */}
      <div className="reports-charts-grid">
        {/* SECTION 1: TICKETS BY STATUS */}
        <div className="chart-card reports-chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">
                <PieIcon size={16} className="inline-title-icon" />
                Tickets by Status
              </h3>
              <p className="chart-subtitle">Volume breakdown across resolution lifecycle stages</p>
            </div>
            <span className="chart-total-pill">{kpis.total} Total</span>
          </div>

          <div className="recharts-wrapper-container" style={{ width: '100%', height: 260 }}>
            {kpis.total === 0 ? (
              <div className="chart-empty-placeholder">
                <span>No tickets recorded yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    stroke="#181B24"
                    strokeWidth={2}
                  >
                    {statusData.map((entry) => (
                      <Cell
                        key={`status-cell-${entry.key}`}
                        fill={entry.color}
                        style={{ filter: `drop-shadow(0 2px 8px ${entry.color}35)` }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<StatusTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => (
                      <span style={{ color: 'var(--sand-300)', fontSize: '0.8rem', fontWeight: 500 }}>
                        {value} ({entry.payload.value})
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status Breakdown Pills */}
          <div className="reports-status-breakdown">
            {statusData.map((item) => (
              <div key={item.key} className="status-breakdown-item">
                <div className="status-breakdown-dot" style={{ backgroundColor: item.color }} />
                <div className="status-breakdown-text">
                  <span className="status-breakdown-name">{item.name}</span>
                  <span className="status-breakdown-count">
                    {item.value} <span className="status-pct">({Math.round(item.percent * 100)}%)</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: TICKETS BY PRIORITY */}
        <div className="chart-card reports-chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">
                <BarChart3 size={16} className="inline-title-icon" />
                Tickets by Priority
              </h3>
              <p className="chart-subtitle">Distribution of tickets categorized by SLA urgency level</p>
            </div>
            <span className="chart-total-pill">4 Levels</span>
          </div>

          <div className="recharts-wrapper-container" style={{ width: '100%', height: 260 }}>
            {kpis.total === 0 ? (
              <div className="chart-empty-placeholder">
                <span>No tickets recorded yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={priorityData}
                  margin={{ top: 20, right: 15, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#272C39" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#8A7B6E"
                    tick={{ fill: '#B7A89A', fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: '#272C39' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#8A7B6E"
                    tick={{ fill: '#B7A89A', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<PriorityTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {priorityData.map((entry) => (
                      <Cell
                        key={`priority-${entry.key}`}
                        fill={entry.color}
                        style={{ filter: `drop-shadow(0 2px 8px ${entry.color}30)` }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Priority Breakdown Pills */}
          <div className="reports-priority-breakdown">
            {priorityData.map((item) => (
              <div key={item.key} className="priority-breakdown-item">
                <span
                  className="priority-indicator-chip"
                  style={{
                    backgroundColor: `${item.color}18`,
                    color: item.color,
                    borderColor: `${item.color}35`
                  }}
                >
                  {item.name}
                </span>
                <span className="priority-count-val">{item.count}</span>
                <span className="priority-pct-val">({item.percent}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: AGENT WORKLOAD
          ========================================================================= */}
      <section className="reports-section">
        <div className="chart-card reports-workload-card">
          <div className="chart-card-header workload-header">
            <div>
              <h3 className="chart-title">
                <Users size={16} className="inline-title-icon" />
                Agent Workload Breakdown
              </h3>
              <p className="chart-subtitle">
                Comprehensive workload tracking across agents: Assigned, Open, In Progress, and Resolved tickets
              </p>
            </div>
            <div className="workload-header-badges">
              <span className="chart-total-pill">{workloadData.length} Agents / Queues</span>
            </div>
          </div>

          {/* Recharts Workload Grouped Bar Chart */}
          <div className="recharts-wrapper-container" style={{ width: '100%', height: 260, marginBottom: '2rem' }}>
            {workloadData.length === 0 || kpis.total === 0 ? (
              <div className="chart-empty-placeholder">
                <span>No agent assignments recorded yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={workloadData}
                  margin={{ top: 15, right: 25, left: -15, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#272C39" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#8A7B6E"
                    tick={{ fill: '#B7A89A', fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: '#272C39' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#8A7B6E"
                    tick={{ fill: '#B7A89A', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<WorkloadTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={32}
                    formatter={(value) => (
                      <span style={{ color: 'var(--sand-300)', fontSize: '0.8rem', fontWeight: 500 }}>
                        {value}
                      </span>
                    )}
                  />
                  <Bar dataKey="openTickets" name="Open" fill="#FBBF24" radius={[4, 4, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="inProgressTickets" name="In Progress" fill="#E5B25D" radius={[4, 4, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="resolvedTickets" name="Resolved" fill="#34D399" radius={[4, 4, 0, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Agent Workload Tabular Data Breakdown */}
          <div className="workload-table-wrapper">
            <table className="workload-table">
              <thead>
                <tr>
                  <th>Agent Name</th>
                  <th className="text-center">Assigned Tickets</th>
                  <th className="text-center">Open Tickets</th>
                  <th className="text-center">In Progress</th>
                  <th className="text-center">Resolved</th>
                  <th className="text-right">Resolution Rate</th>
                </tr>
              </thead>
              <tbody>
                {workloadData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-sand-500">
                      No agent workload data available
                    </td>
                  </tr>
                ) : (
                  workloadData.map((agent) => (
                    <tr key={agent.id} className={agent.isUnassigned ? 'unassigned-row' : ''}>
                      <td>
                        <div className="agent-identity-cell">
                          {agent.avatar ? (
                            <img src={agent.avatar} alt={agent.fullName} className="agent-table-avatar" />
                          ) : (
                            <div className="agent-table-avatar-placeholder">
                              {agent.isUnassigned ? '?' : agent.fullName.charAt(0)}
                            </div>
                          )}
                          <div className="agent-identity-info">
                            <div className="agent-table-name">
                              {agent.fullName}
                              {agent.isUnassigned && (
                                <span className="unassigned-badge">Unassigned</span>
                              )}
                            </div>
                            <div className="agent-table-role">{agent.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="workload-stat-badge total-badge">
                          {agent.assignedTickets}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="workload-stat-badge open-badge">
                          {agent.openTickets}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="workload-stat-badge progress-badge">
                          {agent.inProgressTickets}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="workload-stat-badge resolved-badge">
                          {agent.resolvedTickets}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="agent-resolution-progress">
                          <span className="agent-resolution-pct">{agent.resolutionRate}%</span>
                          <div className="agent-progress-bar-track">
                            <div
                              className="agent-progress-bar-fill"
                              style={{
                                width: `${agent.resolutionRate}%`,
                                backgroundColor:
                                  agent.resolutionRate >= 70
                                    ? '#34D399'
                                    : agent.resolutionRate >= 40
                                    ? '#E5B25D'
                                    : '#FB7185'
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
