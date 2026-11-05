import { z } from 'zod';

/**
 * Enterprise Validation Schema for Customer Support Tickets
 * Built with Zod for strict type checking and custom refined error messages
 */
export const ticketSchema = z.object({
  // 1. Customer Name (Required, min 3 chars)
  customerName: z
    .string()
    .trim()
    .min(1, 'Customer name is required')
    .min(3, 'Customer name must be at least 3 characters'),

  // 2. Email (Required, valid email format)
  customerEmail: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address format (e.g. name@domain.com)'),

  // 3. Subject (Required, min 5 chars, max 100 chars)
  title: z
    .string()
    .trim()
    .min(1, 'Subject is required')
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject cannot exceed 100 characters'),

  // 4. Description (Required, min 10 chars)
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters with sufficient detail'),

  // 5. Category (Technical, Billing, General, Authentication, Integration, Feature Request, Reports)
  category: z
    .string()
    .min(1, 'Please select a ticket category'),

  // 6. Priority (Low, Medium, High, Urgent)
  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
      errorMap: () => ({ message: 'Please select a priority level' })
    }),

  // 7. Assigned Agent (Optional, active agents or unassigned)
  assignedAgentId: z
    .string()
    .optional()
    .nullable(),

  // 8. Due Date (Required, past dates not allowed)
  dueDate: z
    .string()
    .min(1, 'Due date is required')
    .refine((dateVal) => {
      if (!dateVal) return false;
      // Allow today by comparing against midnight start of today
      const selected = new Date(dateVal + (dateVal.includes('T') ? '' : 'T23:59:59'));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, {
      message: 'Due date cannot be in the past'
    })
});

/**
 * Legacy schema compatibility wrapper
 */
export function validateTicketForm(formData) {
  const result = ticketSchema.safeParse(formData);
  if (result.success) {
    return { isValid: true, errors: {} };
  }

  const errors = {};
  result.error.issues.forEach(issue => {
    const field = issue.path[0];
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  });

  return { isValid: false, errors };
}
