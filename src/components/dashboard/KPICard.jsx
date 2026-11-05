import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

function AnimatedCounter({ value, suffix = '', duration = 650 }) {
  const target = typeof value === 'number' ? value : parseInt(value, 10);
  const [count, setCount] = useState(() => (isNaN(target) ? value : 0));

  useEffect(() => {
    if (isNaN(target)) {
      return;
    }

    let startTimestamp = null;
    let frameId;
    const startVal = 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out expo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startVal + (target - startVal) * ease);
      setCount(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return (
    <span className="counter-number">
      {isNaN(target) ? value : count}
      {suffix}
    </span>
  );
}

export default function KPICard({
  title,
  value,
  suffix = '',
  change,
  trend = 'up',
  icon,
  color = 'var(--bronze-500)',
  indicator,
  indicatorColor,
  onClick
}) {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && icon.$$typeof)) {
      const IconComponent = icon;
      return <IconComponent size={20} strokeWidth={2} />;
    }
    return icon;
  };

  return (
    <div
      className={`kpi-card ${onClick ? 'kpi-clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        {icon && (
          <span className="kpi-icon-badge" style={{ backgroundColor: `${color}18`, color }}>
            {renderIcon()}
          </span>
        )}
      </div>

      <div className="kpi-value-row">
        <div className="kpi-value">
          <AnimatedCounter value={value} suffix={suffix} />
        </div>

        {indicator && (
          <span
            className="kpi-indicator-pill"
            style={{
              backgroundColor: `${indicatorColor || color}16`,
              color: indicatorColor || color,
              borderColor: `${indicatorColor || color}30`
            }}
          >
            {indicator}
          </span>
        )}
      </div>

      {change && (
        <div className={`kpi-change ${trend === 'up' ? 'kpi-positive' : 'kpi-negative'}`}>
          {trend === 'up' ? (
            <ArrowUpRight size={14} strokeWidth={2.5} />
          ) : (
            <ArrowDownRight size={14} strokeWidth={2.5} />
          )}
          <span>{change} vs last cycle</span>
        </div>
      )}
    </div>
  );
}
