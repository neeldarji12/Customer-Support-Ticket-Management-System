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

const PRIORITY_CONFIG = [
  { key: 'URGENT', name: 'Urgent', color: '#FB7185' },
  { key: 'HIGH', name: 'High', color: '#FB923C' },
  { key: 'MEDIUM', name: 'Medium', color: '#FBBF24' },
  { key: 'LOW', name: 'Low', color: '#94A3B8' },
];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="recharts-custom-tooltip">
        <div className="tooltip-header">
          <span className="tooltip-dot" style={{ backgroundColor: data.payload.color }} />
          <span className="tooltip-title">{label} Priority</span>
        </div>
        <div className="tooltip-body">
          <span className="tooltip-value">{data.value} tickets</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function PriorityChart({ tickets = [] }) {
  const chartData = PRIORITY_CONFIG.map(item => ({
    name: item.name,
    count: tickets.filter(t => t.priority === item.key).length,
    color: item.color
  }));

  const total = tickets.length;

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Priority Distribution</h3>
          <p className="chart-subtitle">Volume of tickets classified by SLA severity</p>
        </div>
        <span className="chart-total-pill">4 Levels</span>
      </div>

      <div className="recharts-wrapper-container" style={{ width: '100%', height: 260 }}>
        {total === 0 ? (
          <div className="chart-empty-placeholder">
            <span>No tickets recorded</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
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
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {chartData.map((entry) => (
                  <Cell
                    key={`priority-${entry.name}`}
                    fill={entry.color}
                    style={{ filter: `drop-shadow(0 2px 8px ${entry.color}30)` }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
