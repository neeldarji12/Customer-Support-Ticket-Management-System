import React from 'react';
import {
  History,
  PlusCircle,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Trash2,
  Clock,
  Activity as ActivityIcon
} from 'lucide-react';
import { formatDateTime, timeAgo } from '../../utils/dateHelpers';

const ACTIVITY_ICONS = {
  TICKET_CREATED: { icon: PlusCircle, color: 'var(--gold-accent)', bg: 'rgba(229, 178, 93, 0.12)' },
  AGENT_ASSIGNED: { icon: UserCheck, color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.12)' },
  STATUS_CHANGED: { icon: CheckCircle2, color: '#34D399', bg: 'rgba(52, 211, 153, 0.12)' },
  PRIORITY_CHANGED: { icon: AlertTriangle, color: '#FB923C', bg: 'rgba(251, 146, 60, 0.12)' },
  NOTE_ADDED: { icon: MessageSquare, color: 'var(--bronze-400)', bg: 'rgba(201, 138, 60, 0.12)' },
  TICKET_DELETED: { icon: Trash2, color: '#FB7185', bg: 'rgba(251, 113, 133, 0.12)' }
};

export default function ActivityTimeline({ activities = [] }) {
  // Sort activities chronologically (newest first for timeline view)
  const sorted = [...activities].sort(
    (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
  );

  return (
    <div className="activity-timeline-panel">
      <div className="timeline-header-row">
        <div className="timeline-header-title">
          <History size={16} className="section-title-icon" />
          <h3>Audit Log & Event Telemetry</h3>
        </div>
        <span className="timeline-count-pill">{activities.length} Recorded Events</span>
      </div>

      <div className="timeline-container">
        {sorted.length === 0 ? (
          <div className="empty-timeline-placeholder">
            <Clock size={26} className="empty-timeline-icon" />
            <p className="empty-timeline-title">No audit events recorded</p>
            <span className="empty-timeline-sub">
              Lifecycle changes, status transitions, and notes will automatically be cataloged here.
            </span>
          </div>
        ) : (
          <div className="timeline-vertical-track">
            {sorted.map((act, index) => {
              const config = ACTIVITY_ICONS[act.type] || {
                icon: ActivityIcon,
                color: 'var(--gold-accent)',
                bg: 'rgba(229, 178, 93, 0.1)'
              };
              const Icon = config.icon;

              return (
                <div key={act.id || index} className="timeline-entry">
                  {/* Node icon with connecting line */}
                  <div
                    className="timeline-node"
                    style={{ color: config.color, backgroundColor: config.bg }}
                  >
                    <Icon size={14} strokeWidth={2.2} />
                  </div>

                  {/* Event details */}
                  <div className="timeline-entry-content">
                    <div className="timeline-entry-top">
                      <span className="timeline-entry-desc">{act.description}</span>
                      <span className="timeline-entry-reltime">{timeAgo(act.timestamp)}</span>
                    </div>
                    <span className="timeline-entry-abstime">
                      <Clock size={11} />
                      {formatDateTime(act.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
