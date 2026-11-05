import React, { useState, useRef, useEffect } from 'react';
import { Lock, ShieldAlert, Plus, Loader2, AlertCircle, FileCode } from 'lucide-react';
import Button from '../common/Button';
import { formatDateTime } from '../../utils/dateHelpers';

export default function InternalNotes({ notes = [], onAddNote }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const notesEndRef = useRef(null);

  // Auto-scroll to newest internal note
  useEffect(() => {
    if (notesEndRef.current) {
      notesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [notes.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Internal note cannot be empty or whitespace only.');
      return;
    }
    if (submitting) return;

    try {
      setSubmitting(true);
      setError(null);
      await onAddNote(trimmed);
      setContent('');
    } catch (err) {
      setError(err.message || 'Failed to save internal note.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickNote = (templateText) => {
    setContent(prev => (prev ? `${prev}\n${templateText}` : templateText));
    setError(null);
  };

  return (
    <div className="internal-notes-panel">
      {/* High-visibility Confidentiality Watermark Banner */}
      <div className="internal-notes-banner">
        <div className="banner-left">
          <Lock size={16} className="banner-icon" />
          <div className="banner-text">
            <strong>Internal Team Audit Notes:</strong> Visible exclusively to support engineers and internal staff. This section is strictly isolated and <em>never</em> disclosed to customers.
          </div>
        </div>
        <span className="banner-confidential-pill">Confidential</span>
      </div>

      {/* Notes Thread */}
      <div className="internal-notes-list">
        {notes.length === 0 ? (
          <div className="empty-notes-placeholder">
            <ShieldAlert size={28} className="empty-notes-icon" />
            <p className="empty-notes-title">No confidential notes on record</p>
            <span className="empty-notes-sub">
              Leave private engineering notes, reproduction steps, server trace IDs, or team handover context below.
            </span>
          </div>
        ) : (
          notes.map((note, index) => (
            <div key={note.id || index} className="internal-note-card">
              <div className="note-card-header">
                <div className="note-author-group">
                  <div className="note-avatar-circle">
                    <Lock size={12} className="note-lock-badge" />
                    <span>{note.author?.name ? note.author.name.charAt(0) : 'A'}</span>
                  </div>
                  <div className="note-author-meta">
                    <div className="note-author-row">
                      <span className="note-author-name">{note.author?.name || 'Support Engineer'}</span>
                      <span className="internal-staff-pill">Internal Staff</span>
                    </div>
                    <span className="note-author-role">{note.author?.role || 'Engineer'}</span>
                  </div>
                </div>
                <span className="note-time">{formatDateTime(note.createdAt)}</span>
              </div>

              <div className="note-content-body">
                {note.content}
              </div>
            </div>
          ))
        )}
        <div ref={notesEndRef} className="notes-bottom-anchor" />
      </div>

      {/* Quick Note Presets */}
      <div className="quick-notes-presets-bar">
        <span className="quick-presets-label">
          <FileCode size={12} />
          Presets:
        </span>
        <button
          type="button"
          className="quick-preset-chip"
          onClick={() => handleQuickNote("Checked server logs at timestamp. OAuth client secret expired, rotation required.")}
        >
          Auth Logs Checked
        </button>
        <button
          type="button"
          className="quick-preset-chip"
          onClick={() => handleQuickNote("Handover to Tier 2 Engineering: Reproduction steps verified on staging environment.")}
        >
          Tier 2 Handover
        </button>
        <button
          type="button"
          className="quick-preset-chip"
          onClick={() => handleQuickNote("Customer account billing verified against Stripe invoice ledger.")}
        >
          Stripe Verified
        </button>
      </div>

      {/* Error Feedback */}
      {error && (
        <div className="conversation-error-alert" role="alert">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Note Composer */}
      <form onSubmit={handleSubmit} className="add-note-form">
        <div className="note-form-header">
          <span className="note-form-label">Add Confidential Team Note</span>
          <span className="note-form-hint">Stored securely in ticket audit history</span>
        </div>

        <textarea
          rows={3}
          className={`note-textarea ${error ? 'has-textarea-error' : ''}`}
          placeholder="Record private context, reproduction logs, escalation details, or handover instructions..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (error) setError(null);
          }}
          disabled={submitting}
        />

        <div className="note-form-actions">
          <span className="char-count">{content.trim().length} characters</span>
          <Button
            variant="secondary"
            type="submit"
            disabled={!content.trim() || submitting}
            icon={submitting ? <Loader2 size={14} className="spin-animation" /> : <Plus size={14} />}
          >
            {submitting ? 'Saving Note...' : 'Add Private Note'}
          </Button>
        </div>
      </form>
    </div>
  );
}
