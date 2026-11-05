import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  MessageSquare,
  Lock,
  History,
  AlertCircle
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import TicketInfo from '../components/ticket-details/TicketInfo';
import TicketConversation from '../components/ticket-details/TicketConversation';
import InternalNotes from '../components/ticket-details/InternalNotes';
import ActivityTimeline from '../components/ticket-details/ActivityTimeline';
import AssignmentPanel from '../components/ticket-details/AssignmentPanel';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { useTicketContext } from '../context/TicketContext';
import { useAgents } from '../hooks/useAgents';
import { useNotificationContext } from '../context/NotificationContext';
import { commentApi } from '../services/commentApi';
import { activityApi } from '../services/activityApi';
import { formatTicketNumber } from '../utils/ticketHelpers';

export default function TicketDetails({ ticketId: propTicketId, onNavigate }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tickets = [], updateTicket, loading: ticketsLoading } = useTicketContext() || {};
  const { agents = [] } = useAgents() || {};
  const { addToast } = useNotificationContext() || {};

  const effectiveId = propTicketId || id;
  const [activeTab, setActiveTab] = useState('conversation');
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const ticket = tickets.find(t => t.id === effectiveId);
  const assignedAgent = agents.find(a => a.id === ticket?.assignedAgentId);

  useEffect(() => {
    const currentTicketId = ticket?.id;
    if (!currentTicketId) return;

    Promise.all([
      commentApi.getCommentsByTicketId(currentTicketId),
      activityApi.getActivitiesByTicketId(currentTicketId)
    ]).then(([cmts, acts]) => {
      setComments(cmts);
      setActivities(acts);
      setCommentsLoading(false);
    }).catch(() => {
      setCommentsLoading(false);
    });
  }, [ticket?.id]);

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('tickets');
    } else {
      navigate('/tickets');
    }
  };

  const handleEdit = () => {
    if (onNavigate) {
      onNavigate('edit-ticket', ticket.id);
    } else {
      navigate(`/tickets/${ticket.id}/edit`);
    }
  };

  const handleSendMessage = async (content) => {
    if (!ticket) return;
    const authorName = assignedAgent ? assignedAgent.name : 'Jordan Lee';
    const authorAvatar = assignedAgent ? assignedAgent.avatar : '/assets/avatars/avatar-1.svg';

    const newComment = await commentApi.addComment(ticket.id, {
      author: {
        name: authorName,
        role: 'Support Engineer',
        avatar: authorAvatar
      },
      content,
      isInternal: false
    });

    setComments(prev => [...prev, newComment]);

    // Re-sync activities
    const updatedActivities = await activityApi.getActivitiesByTicketId(ticket.id);
    setActivities(updatedActivities);

    if (addToast) addToast('Customer reply posted successfully', 'success');
  };

  const handleAddNote = async (content) => {
    if (!ticket) return;
    const authorName = assignedAgent ? assignedAgent.name : 'Jordan Lee';
    const authorAvatar = assignedAgent ? assignedAgent.avatar : '/assets/avatars/avatar-1.svg';

    const newNote = await commentApi.addComment(ticket.id, {
      author: {
        name: authorName,
        role: 'Support Engineer',
        avatar: authorAvatar
      },
      content,
      isInternal: true
    });

    setComments(prev => [...prev, newNote]);

    // Re-sync activities
    const updatedActivities = await activityApi.getActivitiesByTicketId(ticket.id);
    setActivities(updatedActivities);

    if (addToast) addToast('Internal note saved to ticket audit', 'info');
  };

  const handleAssignAgent = async (newAgentId) => {
    if (!ticket || !updateTicket) return;
    try {
      await updateTicket(ticket.id, { assignedAgentId: newAgentId });
      const agentObj = agents.find(a => a.id === newAgentId);
      if (addToast) {
        addToast(
          newAgentId
            ? `Ticket assigned to ${agentObj ? agentObj.name : 'agent'}`
            : 'Ticket moved to unassigned queue',
          'success'
        );
      }
      const updatedActivities = await activityApi.getActivitiesByTicketId(ticket.id);
      setActivities(updatedActivities);
    } catch (err) {
      if (addToast) addToast(err.message || 'Failed to update assignment', 'error');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!ticket || !updateTicket) return;
    try {
      await updateTicket(ticket.id, { status: newStatus });
      const isReopen = newStatus === 'OPEN';
      if (addToast) {
        addToast(
          isReopen
            ? `Ticket ${formatTicketNumber(ticket.id)} reopened successfully`
            : `Status updated to ${newStatus.replace('_', ' ')}`,
          'info'
        );
      }
      const updatedActivities = await activityApi.getActivitiesByTicketId(ticket.id);
      setActivities(updatedActivities);
    } catch (err) {
      if (addToast) addToast(err.message || 'Invalid status transition', 'error');
    }
  };

  const handlePriorityChange = async (newPriority) => {
    if (!ticket || !updateTicket) return;
    try {
      await updateTicket(ticket.id, { priority: newPriority });
      if (addToast) {
        addToast(`Priority level updated to ${newPriority}`, 'info');
      }
      const updatedActivities = await activityApi.getActivitiesByTicketId(ticket.id);
      setActivities(updatedActivities);
    } catch (err) {
      if (addToast) addToast(err.message || 'Failed to update priority', 'error');
    }
  };

  // Loading State
  if (ticketsLoading && !ticket) {
    return <Loader text="Loading ticket details & conversation thread..." />;
  }

  // Not Found State
  if (!ticket) {
    return (
      <div className="ticket-details-page">
        <PageHeader title="Ticket Not Found" />
        <div className="ticket-not-found-card">
          <AlertCircle size={44} className="not-found-icon" />
          <h3 className="not-found-title">Ticket Not Found</h3>
          <p className="not-found-desc">
            The requested ticket {effectiveId ? `(${effectiveId})` : ''} does not exist or has been removed from the support database.
          </p>
          <Button variant="secondary" icon={<ArrowLeft size={14} />} onClick={handleBack}>
            Back to All Tickets
          </Button>
        </div>
      </div>
    );
  }

  const publicComments = comments.filter(c => !c.isInternal);
  const internalNotes = comments.filter(c => c.isInternal);
  const formattedNumber = formatTicketNumber(ticket.id);

  return (
    <div className="ticket-details-page">
      <PageHeader
        title={`Ticket ${formattedNumber}`}
        subtitle="Complete customer ticket audit trail, correspondence thread, and assignment management."
        actions={
          <div className="details-header-actions">
            <Button
              variant="secondary"
              icon={<ArrowLeft size={14} />}
              onClick={handleBack}
            >
              Back to Tickets
            </Button>
            <Button
              variant="primary"
              icon={<Edit3 size={14} />}
              onClick={handleEdit}
            >
              Edit Ticket
            </Button>
          </div>
        }
      />

      <div className="ticket-details-layout">
        {/* Left / Main Column */}
        <div className="ticket-details-main">
          {/* Ticket Information Overview Panel */}
          <TicketInfo ticket={ticket} agent={assignedAgent} />

          {/* Tab Navigation for Conversation, Notes, and Timeline */}
          <div className="details-tabs-header">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'conversation' ? 'active' : ''}`}
              onClick={() => setActiveTab('conversation')}
            >
              <MessageSquare size={14} />
              <span>Customer Conversation</span>
              <span className="tab-pill-count">{publicComments.length}</span>
            </button>

            <button
              type="button"
              className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              <Lock size={14} />
              <span>Internal Notes</span>
              <span className="tab-pill-count">{internalNotes.length}</span>
            </button>

            <button
              type="button"
              className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              <History size={14} />
              <span>Activity Timeline</span>
              <span className="tab-pill-count">{activities.length}</span>
            </button>
          </div>

          {/* Active Tab View */}
          <div className="details-tab-content">
            {commentsLoading ? (
              <div className="tab-loading-skeleton">
                <div className="skeleton" style={{ height: 160, borderRadius: 10, marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 100, borderRadius: 10 }} />
              </div>
            ) : (
              <>
                {activeTab === 'conversation' && (
                  <TicketConversation
                    messages={publicComments}
                    onSendMessage={handleSendMessage}
                  />
                )}

                {activeTab === 'notes' && (
                  <InternalNotes
                    notes={internalNotes}
                    onAddNote={handleAddNote}
                  />
                )}

                {activeTab === 'timeline' && (
                  <ActivityTimeline activities={activities} />
                )}
              </>
            )}
          </div>
        </div>

        {/* Right / Sidebar Operations Column */}
        <div className="ticket-details-sidebar">
          <AssignmentPanel
            ticket={ticket}
            agents={agents}
            onAssignAgent={handleAssignAgent}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onEditTicket={handleEdit}
          />
        </div>
      </div>
    </div>
  );
}
