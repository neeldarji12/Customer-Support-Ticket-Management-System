import React, { useEffect, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Calendar,
  User,
  Mail,
  FileText,
  Tag,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { ticketSchema } from '../../utils/validationSchemas';
import Button from '../common/Button';

// Standard Categories required: Technical, Billing, General (with enterprise extensions)
const CATEGORY_OPTIONS = [
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'BILLING', label: 'Billing' },
  { value: 'GENERAL', label: 'General' },
  { value: 'AUTHENTICATION', label: 'Authentication & Security' },
  { value: 'INTEGRATION', label: 'API & Webhooks' },
  { value: 'FEATURE_REQUEST', label: 'Feature Request' },
  { value: 'REPORTS', label: 'Reports & Analytics' }
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low (5 days SLA)', color: '#94A3B8' },
  { value: 'MEDIUM', label: 'Medium (3 days SLA)', color: '#FBBF24' },
  { value: 'HIGH', label: 'High (48h SLA)', color: '#FB923C' },
  { value: 'URGENT', label: 'Urgent (24h Critical SLA)', color: '#FB7185' }
];

// Helper to format ISO date to YYYY-MM-DD for date input
function toDateInputValue(isoDate) {
  if (!isoDate) return '';
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

// Helper to get today's date in YYYY-MM-DD for min attribute
function getTodayInputValue() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getFallbackDueDate() {
  return new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
}

export default function TicketForm({
  initialData = {},
  agents = [],
  onSubmit,
  onCancel,
  isSubmitting = false
}) {
  const isEditMode = Boolean(initialData.id);

  // Compute default values from existing ticket (for editing) or empty fields (for creating)
  const defaultValues = {
    customerName: initialData.customer?.name || '',
    customerEmail: initialData.customer?.email || '',
    title: initialData.title || '',
    description: initialData.description || '',
    category: initialData.category || 'TECHNICAL',
    priority: initialData.priority || 'MEDIUM',
    assignedAgentId: initialData.assignedAgentId || '',
    dueDate: toDateInputValue(initialData.dueDate) || ''
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting: formIsSubmitting }
  } = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues
  });

  // Re-synchronize defaults if initialData changes (e.g. async fetch)
  useEffect(() => {
    reset({
      customerName: initialData.customer?.name || '',
      customerEmail: initialData.customer?.email || '',
      title: initialData.title || '',
      description: initialData.description || '',
      category: initialData.category || 'TECHNICAL',
      priority: initialData.priority || 'MEDIUM',
      assignedAgentId: initialData.assignedAgentId || '',
      dueDate: toDateInputValue(initialData.dueDate) || ''
    });
  }, [initialData, reset]);

  const activeAgents = agents.filter(agent => agent.status !== 'INACTIVE');
  const submitting = isSubmitting || formIsSubmitting;
  const currentTitle = useWatch({ control, name: 'title', defaultValue: '' });
  const minDate = getTodayInputValue();

  const handleFormSubmit = useCallback(async (data) => {
    if (submitting) return;

    // Convert date input back to ISO string
    const dueDateIso = data.dueDate
      ? new Date(`${data.dueDate}T12:00:00Z`).toISOString()
      : getFallbackDueDate();

    const payload = {
      ...initialData,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      priority: data.priority,
      status: initialData.status || 'OPEN',
      assignedAgentId: data.assignedAgentId || null,
      dueDate: dueDateIso,
      customer: {
        ...(initialData.customer || {}),
        name: data.customerName.trim(),
        email: data.customerEmail.trim(),
        avatar: initialData.customer?.avatar || '/assets/avatars/avatar-1.svg'
      }
    };

    await onSubmit(payload);
  }, [submitting, initialData, onSubmit]);

  return (
    <form className="ticket-form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {/* Customer Information Section */}
      <div className="form-section-header">
        <h3 className="form-section-title">Customer Information</h3>
        <p className="form-section-desc">Primary contact details of the requester</p>
      </div>

      <div className="form-grid-2">
        {/* 1. Customer Name */}
        <div className={`form-field ${errors.customerName ? 'has-error' : ''}`}>
          <label htmlFor="customerName" className="form-label">
            <User size={13} className="label-icon" />
            Customer Name <span className="required-star">*</span>
          </label>
          <div className="input-with-icon-wrapper">
            <input
              id="customerName"
              type="text"
              className={`form-input ${errors.customerName ? 'input-error' : ''}`}
              placeholder="e.g. Alex Morgan"
              disabled={submitting}
              {...register('customerName')}
            />
          </div>
          {errors.customerName && (
            <span className="field-error-message" role="alert">
              <AlertCircle size={13} />
              {errors.customerName.message}
            </span>
          )}
        </div>

        {/* 2. Customer Email */}
        <div className={`form-field ${errors.customerEmail ? 'has-error' : ''}`}>
          <label htmlFor="customerEmail" className="form-label">
            <Mail size={13} className="label-icon" />
            Customer Email <span className="required-star">*</span>
          </label>
          <div className="input-with-icon-wrapper">
            <input
              id="customerEmail"
              type="email"
              className={`form-input ${errors.customerEmail ? 'input-error' : ''}`}
              placeholder="e.g. alex.morgan@acme.inc"
              disabled={submitting}
              {...register('customerEmail')}
            />
          </div>
          {errors.customerEmail && (
            <span className="field-error-message" role="alert">
              <AlertCircle size={13} />
              {errors.customerEmail.message}
            </span>
          )}
        </div>
      </div>

      {/* Ticket Details Section */}
      <div className="form-section-header" style={{ marginTop: '1.75rem' }}>
        <h3 className="form-section-title">Ticket Classification & Scope</h3>
        <p className="form-section-desc">Issue overview, priority level, categorization, and timeline</p>
      </div>

      {/* 3. Subject (Title) */}
      <div className={`form-field ${errors.title ? 'has-error' : ''}`}>
        <div className="label-row-between">
          <label htmlFor="title" className="form-label">
            <FileText size={13} className="label-icon" />
            Subject <span className="required-star">*</span>
          </label>
          <span className="char-counter">
            {currentTitle.length} / 100 characters (min 5)
          </span>
        </div>
        <input
          id="title"
          type="text"
          className={`form-input ${errors.title ? 'input-error' : ''}`}
          placeholder="Brief summary of customer issue (e.g. Unable to connect OAuth provider)"
          maxLength={100}
          disabled={submitting}
          {...register('title')}
        />
        {errors.title && (
          <span className="field-error-message" role="alert">
            <AlertCircle size={13} />
            {errors.title.message}
          </span>
        )}
      </div>

      {/* 4. Description */}
      <div className={`form-field ${errors.description ? 'has-error' : ''}`}>
        <label htmlFor="description" className="form-label">
          <FileText size={13} className="label-icon" />
          Description <span className="required-star">*</span>
        </label>
        <textarea
          id="description"
          rows={4}
          className={`form-textarea ${errors.description ? 'input-error' : ''}`}
          placeholder="Detailed problem description, steps to reproduce, error codes, and customer impact (minimum 10 characters)..."
          disabled={submitting}
          {...register('description')}
        />
        {errors.description && (
          <span className="field-error-message" role="alert">
            <AlertCircle size={13} />
            {errors.description.message}
          </span>
        )}
      </div>

      {/* 5. Category, 6. Priority, 8. Due Date */}
      <div className="form-grid-3">
        {/* Category */}
        <div className={`form-field ${errors.category ? 'has-error' : ''}`}>
          <label htmlFor="category" className="form-label">
            <Tag size={13} className="label-icon" />
            Category <span className="required-star">*</span>
          </label>
          <select
            id="category"
            className={`form-select ${errors.category ? 'input-error' : ''}`}
            disabled={submitting}
            {...register('category')}
          >
            {CATEGORY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="field-error-message" role="alert">
              <AlertCircle size={13} />
              {errors.category.message}
            </span>
          )}
        </div>

        {/* Priority */}
        <div className={`form-field ${errors.priority ? 'has-error' : ''}`}>
          <label htmlFor="priority" className="form-label">
            <AlertTriangle size={13} className="label-icon" />
            Priority <span className="required-star">*</span>
          </label>
          <select
            id="priority"
            className={`form-select ${errors.priority ? 'input-error' : ''}`}
            disabled={submitting}
            {...register('priority')}
          >
            {PRIORITY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.priority && (
            <span className="field-error-message" role="alert">
              <AlertCircle size={13} />
              {errors.priority.message}
            </span>
          )}
        </div>

        {/* 8. Due Date */}
        <div className={`form-field ${errors.dueDate ? 'has-error' : ''}`}>
          <label htmlFor="dueDate" className="form-label">
            <Calendar size={13} className="label-icon" />
            Due Date <span className="required-star">*</span>
          </label>
          <input
            id="dueDate"
            type="date"
            min={minDate}
            className={`form-input date-picker-input ${errors.dueDate ? 'input-error' : ''}`}
            disabled={submitting}
            {...register('dueDate')}
          />
          {errors.dueDate && (
            <span className="field-error-message" role="alert">
              <AlertCircle size={13} />
              {errors.dueDate.message}
            </span>
          )}
        </div>
      </div>

      {/* 7. Assigned Agent (Optional, active agents only, unassigned option) */}
      <div className="form-grid-2" style={{ marginTop: '0.5rem' }}>
        <div className="form-field">
          <label htmlFor="assignedAgentId" className="form-label">
            <UserCheck size={13} className="label-icon" />
            Assigned Agent <span className="optional-tag">(Optional)</span>
          </label>
          <select
            id="assignedAgentId"
            className="form-select"
            disabled={submitting}
            {...register('assignedAgentId')}
          >
            <option value="">Unassigned (Queue / Triage)</option>
            {activeAgents.map(agent => (
              <option key={agent.id} value={agent.id}>
                {agent.name} — {agent.role}
              </option>
            ))}
          </select>
          <span className="field-helper-text">
            Assign directly to an available support specialist or leave unassigned in general triage.
          </span>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="form-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={submitting}
          icon={<XCircle size={15} />}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={submitting}
          icon={
            submitting ? (
              <Loader2 size={15} className="spin-animation" />
            ) : (
              <CheckCircle2 size={15} />
            )
          }
        >
          {submitting
            ? isEditMode
              ? 'Updating Ticket...'
              : 'Creating Ticket...'
            : isEditMode
            ? 'Save Ticket Changes'
            : 'Create Support Ticket'}
        </Button>
      </div>
    </form>
  );
}
