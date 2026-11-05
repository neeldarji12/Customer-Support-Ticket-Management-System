import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

const STATUS_CONFIG = {
  OPEN: { label: 'Open', color: '#FBBF24' },
  IN_PROGRESS: { label: 'In Progress', color: '#E5B25D' },
  RESOLVED: { label: 'Resolved', color: '#34D399' },
  CLOSED: { label: 'Closed', color: '#78716C' },
};

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const { name, value, percent } = data;
    return (
      <div className="recharts-custom-tooltip">
        <div className="tooltip-header">
          <span className="tooltip-dot" style={{ backgroundColor: data.payload.color }} />
          <span className="tooltip-title">{name}</span>
        </div>
        <div className="tooltip-body">
          <span className="tooltip-value">{value} tickets</span>
          <span className="tooltip-percent">({(percent * 100).toFixed(1)}%)</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function TicketStatusChart({ tickets = [] }) {
  const counts = {
    OPEN: tickets.filter(t => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    RESOLVED: tickets.filter(t => t.status === 'RESOLVED').length,
    CLOSED: tickets.filter(t => t.status === 'CLOSED').length,
  };

  const chartData = [
    { name: 'Open', value: counts.OPEN, color: STATUS_CONFIG.OPEN.color },
    { name: 'In Progress', value: counts.IN_PROGRESS, color: STATUS_CONFIG.IN_PROGRESS.color },
    { name: 'Resolved', value: counts.RESOLVED, color: STATUS_CONFIG.RESOLVED.color },
    { name: 'Closed', value: counts.CLOSED, color: STATUS_CONFIG.CLOSED.color },
  ];

  const total = tickets.length;

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Ticket Status Distribution</h3>
          <p className="chart-subtitle">Real-time breakdown of tickets across resolution stages</p>
        </div>
        <span className="chart-total-pill">{total} Total</span>
      </div>

      <div className="recharts-wrapper-container" style={{ width: '100%', height: 260 }}>
        {total === 0 ? (
          <div className="chart-empty-placeholder">
            <span>No tickets recorded</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                stroke="#181B24"
                strokeWidth={2}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={entry.color}
                    style={{ filter: `drop-shadow(0 2px 6px ${entry.color}35)` }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
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
    </div>
  );
}
