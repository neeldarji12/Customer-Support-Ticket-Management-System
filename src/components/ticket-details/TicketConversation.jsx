import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import ConversationMessage from './ConversationMessage';
import Button from '../common/Button';

export default function TicketConversation({ messages = [], onSendMessage }) {
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to newest message when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = reply.trim();
    if (!trimmed) {
      setError('Reply message cannot be empty or whitespace only.');
      return;
    }
    if (sending) return;

    try {
      setSending(true);
      setError(null);
      await onSendMessage(trimmed);
      setReply('');
    } catch (err) {
      setError(err.message || 'Failed to send response. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleQuickTemplate = (templateText) => {
    setReply(prev => (prev ? `${prev}\n${templateText}` : templateText));
    setError(null);
  };

  return (
    <div className="ticket-conversation-panel">
      {/* Header */}
      <div className="conversation-header-row">
        <div className="conversation-header-title">
          <MessageSquare size={16} className="section-title-icon" />
          <h3>Customer Correspondence</h3>
        </div>
        <div className="conversation-header-meta">
          <span className="conversation-live-badge">Live Channel</span>
          <span className="conversation-count-pill">{messages.length} Messages</span>
        </div>
      </div>

      {/* Message Thread Container */}
      <div className="conversation-thread-container">
        {messages.length === 0 ? (
          <div className="empty-thread-placeholder">
            <MessageSquare size={28} className="empty-thread-icon" />
            <p className="empty-thread-title">No conversation messages logged</p>
            <span className="empty-thread-sub">
              Compose an official reply below to initiate or update correspondence with the customer.
            </span>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ConversationMessage
              key={msg.id || index}
              message={msg}
            />
          ))
        )}
        <div ref={messagesEndRef} className="messages-bottom-anchor" />
      </div>

      {/* Quick Reply Shortcuts */}
      <div className="quick-templates-bar">
        <span className="quick-template-label">
          <Sparkles size={12} />
          Quick Responses:
        </span>
        <button
          type="button"
          className="quick-template-chip"
          onClick={() => handleQuickTemplate("Hi! We are currently investigating this issue and will update you shortly.")}
        >
          Investigating
        </button>
        <button
          type="button"
          className="quick-template-chip"
          onClick={() => handleQuickTemplate("Could you please provide server error logs or screenshots of the behavior?")}
        >
          Request Logs
        </button>
        <button
          type="button"
          className="quick-template-chip"
          onClick={() => handleQuickTemplate("A fix has been deployed to production. Could you please confirm if this resolves it on your end?")}
        >
          Fix Deployed
        </button>
      </div>

      {/* Error feedback banner if message submission failed */}
      {error && (
        <div className="conversation-error-alert" role="alert">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Reply Composer Form */}
      <form className="conversation-reply-box" onSubmit={handleSend}>
        <div className="reply-box-header">
          <span className="reply-box-label">Send Official Reply to Customer</span>
          <span className="reply-box-hint">Customer will receive this response via email & portal</span>
        </div>

        <textarea
          rows={3}
          className={`reply-textarea ${error ? 'has-textarea-error' : ''}`}
          placeholder="Compose an official customer response (Markdown supported)..."
          value={reply}
          onChange={(e) => {
            setReply(e.target.value);
            if (error) setError(null);
          }}
          disabled={sending}
        />

        <div className="reply-box-footer">
          <span className="char-count">{reply.trim().length} characters</span>
          <Button
            variant="primary"
            type="submit"
            disabled={!reply.trim() || sending}
            icon={sending ? <Loader2 size={14} className="spin-animation" /> : <Send size={14} />}
          >
            {sending ? 'Sending Reply...' : 'Send Response'}
          </Button>
        </div>
      </form>
    </div>
  );
}
