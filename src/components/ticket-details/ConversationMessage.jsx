import React from 'react';
import { User, ShieldCheck } from 'lucide-react';
import { formatDateTime } from '../../utils/dateHelpers';

export default function ConversationMessage({ message }) {
  const isAgent = message.author?.role === 'Agent' || message.author?.role?.includes('Support') || message.author?.role?.includes('Engineer');

  return (
    <div className={`conversation-bubble-wrapper ${isAgent ? 'is-agent-reply' : 'is-customer-message'}`}>
      <div className="message-avatar-col">
        {message.author?.avatar ? (
          <img
            src={message.author.avatar}
            alt={message.author.name}
            className="message-avatar-img"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="message-avatar-fallback">
            {isAgent ? <ShieldCheck size={14} /> : <User size={14} />}
          </div>
        )}
      </div>

      <div className="message-bubble-content">
        <div className="message-bubble-header">
          <div className="message-author-info">
            <span className="message-author-name">{message.author?.name || 'User'}</span>
            <span className={`message-role-badge ${isAgent ? 'role-agent' : 'role-customer'}`}>
              {message.author?.role || (isAgent ? 'Support Specialist' : 'Customer')}
            </span>
          </div>
          <span className="message-timestamp">{formatDateTime(message.createdAt)}</span>
        </div>

        <div className="message-text-body">
          {message.content}
        </div>
      </div>
    </div>
  );
}
