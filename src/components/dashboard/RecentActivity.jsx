import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Trash2,
  Activity as ActivityIcon,
  Clock
} from 'lucide-react';
import { activityApi } from '../../services/activityApi';
import { timeAgo } from '../../utils/dateHelpers';

const ACTIVITY_CONFIG = {
  TICKET_CREATED: {
    icon: PlusCircle,
    color: 'var(--gold-accent)',
    bg: 'rgba(229, 178, 93, 0.12)'
  },
  AGENT_ASSIGNED: {
    icon: UserCheck,
    color: '#60A5FA',
    bg: 'rgba(96, 165, 250, 0.12)'
  },
  PRIORITY_CHANGED: {
    icon: AlertTriangle,
    color: '#FB923C',
    bg: 'rgba(251, 146, 60, 0.12)'
  },
  STATUS_CHANGED: {
    icon: CheckCircle2,
    color: '#34D399',
    bg: 'rgba(52, 211, 153, 0.12)'
  },
  NOTE_ADDED: {
    icon: MessageSquare,
    color: 'var(--bronze-400)',
    bg: 'rgba(201, 138, 60, 0.12)'
  },
  TICKET_DELETED: {
    icon: Trash2,
    color: '#FB7185',
    bg: 'rgba(251, 113, 133, 0.12)'
  }
};

export default function RecentActivity({ onSelectTicket }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    activityApi.getRecentActivities(6).then(data => {
      if (isMounted) {
        setActivities(data);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTicketClick = (ticketId) => {
    if (onSelectTicket) {
      onSelectTicket(ticketId);
    } else {
      navigate(`/tickets/${ticketId}`);
    }
  };

  return (
    <div className="chart-card recent-activity-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Recent Activity</h3>
          <p className="chart-subtitle">Audit trail of ticket updates, reassignments, and notes</p>
        </div>
        <span className="chart-total-pill">Live Feed</span>
      </div>

      {loading ? (
        <div className="activity-skeleton-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="activity-skeleton-item">
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 14, width: '75%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 11, width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="chart-empty-placeholder">
          <span>No recent activities recorded</span>
        </div>
      ) : (
        <div className="activity-timeline-feed">
          {activities.map((act) => {
            const config = ACTIVITY_CONFIG[act.type] || {
              icon: ActivityIcon,
              color: 'var(--gold-accent)',
              bg: 'rgba(229, 178, 93, 0.1)'
            };
            const Icon = config.icon;

            return (
              <div key={act.id} className="timeline-item">
                <div
                  className="timeline-icon-box"
                  style={{ color: config.color, backgroundColor: config.bg }}
                >
                  <Icon size={15} strokeWidth={2.2} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-text-row">
                    <span className="timeline-desc">{act.description}</span>
                    {act.ticketId && (
                      <button
                        type="button"
                        className="timeline-ticket-tag"
                        onClick={() => handleTicketClick(act.ticketId)}
                        title={`View ${act.ticketId}`}
                      >
                        #{act.ticketId}
                      </button>
                    )}
                  </div>
                  <div className="timeline-time">
                    <Clock size={11} strokeWidth={2} />
                    <span>{timeAgo(act.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
