import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';
import { useAgents } from '../../hooks/useAgents';

function CustomWorkloadTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="recharts-custom-tooltip">
        <div className="tooltip-header">
          <span className="tooltip-dot" style={{ backgroundColor: data.color }} />
          <span className="tooltip-title">{data.name}</span>
        </div>
        <div className="tooltip-body">
          <span className="tooltip-value">{data.activeTickets} active tickets</span>
          <span className="tooltip-percent">({data.utilization}% load)</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function AgentWorkload({ tickets = [] }) {
  const { agents = [], loading } = useAgents();

  const maxCapacityPerAgent = 5;

  const workloadData = agents.map(agent => {
    // Dynamically calculate from real tickets
    const activeCount = tickets.filter(
      t => t.assignedAgentId === agent.id && t.status !== 'RESOLVED' && t.status !== 'CLOSED'
    ).length;

    const utilization = Math.min(Math.round((activeCount / maxCapacityPerAgent) * 100), 100);
    const color = utilization >= 80 ? '#FB7185' : utilization >= 50 ? '#FBBF24' : '#34D399';

    return {
      id: agent.id,
      name: agent.name.split(' ')[0], // First name for axis readability
      fullName: agent.name,
      role: agent.role,
      avatar: agent.avatar,
      email: agent.email,
      activeTickets: activeCount,
      utilization,
      color
    };
  });

  if (loading) {
    return (
      <div className="chart-card">
        <div className="skeleton" style={{ height: '240px', borderRadius: '12px' }} />
      </div>
    );
  }

  return (
    <div className="chart-card agent-workload-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Agent Workload & Distribution</h3>
          <p className="chart-subtitle">Active queue volume against team throughput limit</p>
        </div>
        <span className="chart-total-pill">{agents.length} Agents</span>
      </div>

      {/* Recharts Bar Chart */}
      <div className="recharts-wrapper-container" style={{ width: '100%', height: 180, marginBottom: '1.25rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={workloadData}
            layout="vertical"
            margin={{ top: 5, right: 25, left: 15, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#272C39" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, maxCapacityPerAgent]}
              stroke="#8A7B6E"
              tick={{ fill: '#B7A89A', fontSize: 11 }}
              axisLine={{ stroke: '#272C39' }}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#8A7B6E"
              tick={{ fill: '#B7A89A', fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip content={<CustomWorkloadTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
            <Bar dataKey="activeTickets" radius={[0, 6, 6, 0]} maxBarSize={22}>
              {workloadData.map((entry) => (
                <Cell
                  key={`agent-bar-${entry.id}`}
                  fill={entry.color}
                  style={{ filter: `drop-shadow(0 2px 6px ${entry.color}35)` }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Agent Workload Summary List */}
      <div className="agent-workload-summary-title">TEAM CAPACITY BREAKDOWN</div>
      <div className="agent-workload-list">
        {workloadData.map(agent => (
          <div key={agent.id} className="agent-workload-item">
            <div className="agent-workload-header">
              <img src={agent.avatar} alt={agent.fullName} className="agent-avatar-small" />
              <div className="agent-details">
                <div className="agent-name">{agent.fullName}</div>
                <div className="agent-role">{agent.role}</div>
              </div>
              <div className="agent-ticket-count" style={{ color: agent.color }}>
                {agent.activeTickets} / {maxCapacityPerAgent} active ({agent.utilization}%)
              </div>
            </div>
            <div className="workload-progress-bar">
              <div
                className="workload-fill"
                style={{
                  width: `${Math.max(agent.utilization, 6)}%`,
                  backgroundColor: agent.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
