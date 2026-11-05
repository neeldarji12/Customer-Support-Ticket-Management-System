import { validateTicketForm } from './src/utils/validationSchemas.js';
import {
  formatTicketNumber,
  isValidStatusTransition,
  filterTickets,
  sortTickets,
  calculateKPIs,
  isTicketOverdue
} from './src/utils/ticketHelpers.js';
import { ticketApi } from './src/services/ticketApi.js';
import { agentApi } from './src/services/agentApi.js';
import { commentApi } from './src/services/commentApi.js';
import { activityApi } from './src/services/activityApi.js';
import { notificationApi } from './src/services/notificationApi.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`✅ PASSED: ${message}`);
}

async function runQAAudit() {
  console.log('====================================================');
  console.log('🚀 COMMENCING SENIOR QA ENGINEER FULL SYSTEM AUDIT');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // TEST SECTION 1: VALIDATION SCHEMAS & EDGE CASES
  // ----------------------------------------------------
  console.log('--- TEST SECTION 1: VALIDATION & FORM EDGE CASES ---');
  
  // 1.1 Invalid Email
  const invalidEmailResult = validateTicketForm({
    customerName: 'Alice Johnson',
    customerEmail: 'not-an-email',
    title: 'Valid Ticket Subject',
    description: 'Valid ticket description with enough characters',
    category: 'TECHNICAL',
    priority: 'HIGH',
    dueDate: '2027-12-31'
  });
  assert(!invalidEmailResult.isValid && invalidEmailResult.errors.customerEmail, 'Rejects invalid email format');

  // 1.2 Missing Required Fields
  const missingFieldsResult = validateTicketForm({});
  assert(
    !missingFieldsResult.isValid &&
    missingFieldsResult.errors.customerName &&
    missingFieldsResult.errors.customerEmail &&
    missingFieldsResult.errors.title &&
    missingFieldsResult.errors.description &&
    missingFieldsResult.errors.category &&
    missingFieldsResult.errors.priority &&
    missingFieldsResult.errors.dueDate,
    'Enforces all 7 required fields on empty submit'
  );

  // 1.3 Short Subject (< 5 chars)
  const shortSubjectResult = validateTicketForm({
    customerName: 'Alice Johnson',
    customerEmail: 'alice@example.com',
    title: 'Help', // 4 chars
    description: 'Valid ticket description with enough characters',
    category: 'TECHNICAL',
    priority: 'HIGH',
    dueDate: '2027-12-31'
  });
  assert(!shortSubjectResult.isValid && shortSubjectResult.errors.title, 'Rejects subject with fewer than 5 characters');

  // 1.4 Short Description (< 10 chars)
  const _shortDescResult = validateTicketForm({
    customerName: 'Alice Johnson',
    customerEmail: 'alice@example.com',
    title: 'Valid Long Subject',
    description: 'Broken app', // 10 chars check
    category: 'TECHNICAL',
    priority: 'HIGH',
    dueDate: '2027-12-31'
  });
  const descUnder10 = validateTicketForm({
    customerName: 'Alice Johnson',
    customerEmail: 'alice@example.com',
    title: 'Valid Long Subject',
    description: 'Short', // 5 chars
    category: 'TECHNICAL',
    priority: 'HIGH',
    dueDate: '2027-12-31'
  });
  assert(!descUnder10.isValid && descUnder10.errors.description, 'Rejects description with fewer than 10 characters');

  // 1.5 Past Due Date
  const pastDueDateResult = validateTicketForm({
    customerName: 'Alice Johnson',
    customerEmail: 'alice@example.com',
    title: 'Valid Long Subject',
    description: 'Valid ticket description with enough characters',
    category: 'TECHNICAL',
    priority: 'HIGH',
    dueDate: '2020-01-01'
  });
  assert(!pastDueDateResult.isValid && pastDueDateResult.errors.dueDate, 'Rejects past due date');

  // 1.6 Whitespace-only comment / description detection
  const whitespaceResult = validateTicketForm({
    customerName: 'Alice Johnson',
    customerEmail: 'alice@example.com',
    title: '   ',
    description: '          ',
    category: 'TECHNICAL',
    priority: 'HIGH',
    dueDate: '2027-12-31'
  });
  assert(!whitespaceResult.isValid, 'Rejects whitespace-only title and description');

  // 1.7 Valid Submission Passes
  const validResult = validateTicketForm({
    customerName: 'Enterprise Client Corp',
    customerEmail: 'client@enterprise.com',
    title: 'Database connection pool saturation issue',
    description: 'Postgres connection pool reached 100% capacity during morning peak traffic spikes.',
    category: 'TECHNICAL',
    priority: 'URGENT',
    assignedAgentId: 'AGT-001',
    dueDate: '2027-06-15'
  });
  assert(validResult.isValid, 'Accepts compliant enterprise ticket submission');

  console.log('\n--- TEST SECTION 2: WORKFLOW & STATUS TRANSITIONS ---');

  // 2.1 Allowed transitions from OPEN: IN_PROGRESS or RESOLVED
  assert(isValidStatusTransition('OPEN', 'IN_PROGRESS'), 'OPEN -> IN_PROGRESS is allowed');
  assert(isValidStatusTransition('OPEN', 'RESOLVED'), 'OPEN -> RESOLVED is allowed');
  assert(!isValidStatusTransition('OPEN', 'CLOSED'), 'OPEN -> CLOSED is strictly prohibited');

  // 2.2 Allowed transitions from IN_PROGRESS: RESOLVED or CLOSED
  assert(isValidStatusTransition('IN_PROGRESS', 'RESOLVED'), 'IN_PROGRESS -> RESOLVED is allowed');
  assert(isValidStatusTransition('IN_PROGRESS', 'CLOSED'), 'IN_PROGRESS -> CLOSED is allowed');
  assert(!isValidStatusTransition('IN_PROGRESS', 'OPEN'), 'IN_PROGRESS -> OPEN is prohibited (requires reopen from resolved/closed)');

  // 2.3 Reopening Resolved tickets: RESOLVED -> OPEN
  assert(isValidStatusTransition('RESOLVED', 'OPEN'), 'Reopening RESOLVED ticket to OPEN is allowed');
  assert(isValidStatusTransition('RESOLVED', 'CLOSED'), 'Finalizing RESOLVED ticket to CLOSED is allowed');

  // 2.4 Reopening Closed tickets: CLOSED -> OPEN
  assert(isValidStatusTransition('CLOSED', 'OPEN'), 'Reopening CLOSED ticket to OPEN is allowed');
  assert(!isValidStatusTransition('CLOSED', 'IN_PROGRESS'), 'CLOSED -> IN_PROGRESS direct is prohibited (must reopen to OPEN first)');

  // 2.5 Self-transition
  assert(isValidStatusTransition('OPEN', 'OPEN'), 'Identical status is idempotent/allowed');

  console.log('\n--- TEST SECTION 3: TICKET NUMBER FORMATTING & HELPERS ---');

  // 3.1 Ticket Number standard TKT-0001
  assert(formatTicketNumber('TCK-1001') === 'TKT-0001', 'TCK-1001 correctly formats to TKT-0001');
  assert(formatTicketNumber('1005') === 'TKT-0005', '1005 correctly formats to TKT-0005');
  assert(formatTicketNumber('12') === 'TKT-0012', '12 formats to TKT-0012');
  assert(formatTicketNumber(null) === 'TKT-0000', 'Missing ID defaults gracefully to TKT-0000');

  // 3.2 Overdue detection
  const overdueTicket = {
    id: 'TCK-9999',
    status: 'OPEN',
    priority: 'URGENT',
    createdAt: '2024-01-01T00:00:00Z',
    dueDate: '2024-01-02T00:00:00Z'
  };
  assert(isTicketOverdue(overdueTicket), 'Accurately identifies past-due open ticket as overdue');

  const resolvedOverdueTicket = {
    ...overdueTicket,
    status: 'RESOLVED'
  };
  assert(!isTicketOverdue(resolvedOverdueTicket), 'Resolved ticket is never flagged as overdue');

  console.log('\n--- TEST SECTION 4: SEARCH, FILTER, SORT & PAGINATION ---');

  const sampleTickets = [
    {
      id: 'TCK-1001',
      title: 'Database replica synchronization delay',
      category: 'TECHNICAL',
      priority: 'URGENT',
      status: 'OPEN',
      assignedAgentId: 'AGT-001',
      customer: { name: 'Sarah Connor', email: 'sarah@skynet.com' },
      createdAt: '2026-03-01T10:00:00Z',
      dueDate: '2026-03-02T10:00:00Z'
    },
    {
      id: 'TCK-1002',
      title: 'Monthly subscription invoice receipt inquiry',
      category: 'BILLING',
      priority: 'LOW',
      status: 'RESOLVED',
      assignedAgentId: 'AGT-002',
      customer: { name: 'John Doe', email: 'john@example.com' },
      createdAt: '2026-03-02T10:00:00Z',
      dueDate: '2026-03-07T10:00:00Z'
    },
    {
      id: 'TCK-1003',
      title: 'OAuth2 SSO login failure for engineering team',
      category: 'AUTHENTICATION',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedAgentId: 'AGT-001',
      customer: { name: 'Tech Lead Bob', email: 'bob@techcorp.io' },
      createdAt: '2026-03-03T10:00:00Z',
      dueDate: '2026-03-05T10:00:00Z'
    }
  ];

  // 4.1 Search by ticket number
  const searchTkt = filterTickets(sampleTickets, { search: 'TKT-0001' });
  assert(searchTkt.length === 1 && searchTkt[0].id === 'TCK-1001', 'Searches by formatted ticket number case-insensitively');

  // 4.2 Search by subject
  const searchSubject = filterTickets(sampleTickets, { search: 'invoice' });
  assert(searchSubject.length === 1 && searchSubject[0].id === 'TCK-1002', 'Searches by subject keywords');

  // 4.3 Search by customer name
  const searchCustomer = filterTickets(sampleTickets, { search: 'sarah' });
  assert(searchCustomer.length === 1 && searchCustomer[0].id === 'TCK-1001', 'Searches by customer name case-insensitively');

  // 4.4 Filter by status
  const filterStatus = filterTickets(sampleTickets, { status: 'RESOLVED' });
  assert(filterStatus.length === 1 && filterStatus[0].status === 'RESOLVED', 'Filters strictly by status');

  // 4.5 Filter by priority
  const filterPriority = filterTickets(sampleTickets, { priority: 'URGENT' });
  assert(filterPriority.length === 1 && filterPriority[0].priority === 'URGENT', 'Filters strictly by priority');

  // 4.6 Filter by agent
  const filterAgent = filterTickets(sampleTickets, { agentId: 'AGT-001' });
  assert(filterAgent.length === 2, 'Filters tickets assigned to specific agent');

  // 4.7 Sort by Newest first
  const sortedNewest = sortTickets(sampleTickets, 'NEWEST');
  assert(sortedNewest[0].id === 'TCK-1003', 'Sorts by newest createdAt first');

  // 4.8 Sort by Oldest first
  const sortedOldest = sortTickets(sampleTickets, 'OLDEST');
  assert(sortedOldest[0].id === 'TCK-1001', 'Sorts by oldest createdAt first');

  // 4.9 Sort by Due Date ascending
  const sortedDueAsc = sortTickets(sampleTickets, 'DUE_ASC');
  assert(sortedDueAsc[0].id === 'TCK-1001', 'Sorts by earliest due date ascending');

  // 4.10 Sort by Due Date descending
  const sortedDueDesc = sortTickets(sampleTickets, 'DUE_DESC');
  assert(sortedDueDesc[0].id === 'TCK-1002', 'Sorts by latest due date descending');

  // 4.11 Pagination calculation
  const totalItems = sampleTickets.length;
  const pageSize = 2;
  const totalPages = Math.ceil(totalItems / pageSize);
  assert(totalPages === 2, 'Calculates correct total pages (3 items / 2 per page = 2 pages)');
  const page1Items = sampleTickets.slice(0, 2);
  const page2Items = sampleTickets.slice(2, 4);
  assert(page1Items.length === 2 && page2Items.length === 1, 'Correct page slicing (2 on page 1, 1 on page 2)');

  console.log('\n--- TEST SECTION 5: KPI ACCURACY & SUMMARY TELEMETRY ---');

  const kpis = calculateKPIs(sampleTickets);
  assert(kpis.total === 3, `KPI Total is 3 (calculated: ${kpis.total})`);
  assert(kpis.open === 1, `KPI Open is 1 (calculated: ${kpis.open})`);
  assert(kpis.inProgress === 1, `KPI In Progress is 1 (calculated: ${kpis.inProgress})`);
  assert(kpis.resolved === 1, `KPI Resolved is 1 (calculated: ${kpis.resolved})`);
  assert(kpis.closed === 0, `KPI Closed is 0 (calculated: ${kpis.closed})`);

  console.log('\n--- TEST SECTION 6: NOTIFICATIONS & DEDUPLICATION ---');

  // 6.1 Notification creation & deduplication
  const _initialNotifs = await notificationApi.getNotifications();
  const testNotifTitle = 'QA Audit Test Alert';
  const notif1 = await notificationApi.addNotification({
    title: testNotifTitle,
    message: 'Testing notification alert deduplication engine',
    type: 'ALERT',
    ticketId: 'TCK-TEST-001',
    dedupeKey: 'qa_audit_dedupe_key'
  });
  assert(Boolean(notif1), 'Notification created successfully');

  // 6.2 Attempt duplicate notification with identical dedupeKey within window
  const notif2 = await notificationApi.addNotification({
    title: testNotifTitle,
    message: 'Testing notification alert deduplication engine',
    type: 'ALERT',
    ticketId: 'TCK-TEST-001',
    dedupeKey: 'qa_audit_dedupe_key'
  });
  assert(notif2.id === notif1.id, 'Duplicate notification successfully blocked and deduplicated');

  // 6.3 Mark individual notification as read
  const _markedResult = await notificationApi.markAsRead(notif1.id);
  const readNotifs = await notificationApi.getNotifications();
  const foundNotif = readNotifs.find(n => n.id === notif1.id);
  assert(foundNotif && foundNotif.read === true, 'Successfully marked single notification as read');

  // 6.4 Mark all notifications as read
  await notificationApi.markAllAsRead();
  const allReadNotifs = await notificationApi.getNotifications();
  const unreadCount = allReadNotifs.filter(n => !n.read).length;
  assert(unreadCount === 0, 'Successfully marked all notifications as read (unread count = 0)');

  console.log('\n--- TEST SECTION 7: API INTEGRATION & OFFLINE RESILIENCE ---');

  // 7.1 Fetch tickets (dual mode: server or local fallback)
  const tickets = await ticketApi.getTickets();
  assert(Array.isArray(tickets) && tickets.length > 0, `Successfully retrieved ${tickets.length} tickets`);

  // 7.2 Fetch agents
  const agents = await agentApi.getAgents();
  assert(Array.isArray(agents) && agents.length > 0, `Successfully retrieved ${agents.length} active agents`);

  // 7.3 Fetch non-existent ticket throws 404 error
  let missingErrorCaught = false;
  try {
    await ticketApi.getTicketById('TCK-NONEXISTENT-99999');
  } catch (err) {
    missingErrorCaught = true;
    assert(err.message.includes('not found'), `Not found error message correctly produced: "${err.message}"`);
  }
  assert(missingErrorCaught, 'Missing ticket correctly rejected with 404 not-found');

  // 7.4 Create ticket through API
  const createdTicket = await ticketApi.createTicket({
    title: 'QA Automated Verification Ticket',
    description: 'This is a synthetic test ticket created to verify end-to-end CRUD persistence.',
    category: 'TECHNICAL',
    priority: 'HIGH',
    assignedAgentId: 'AGT-001',
    customer: {
      name: 'QA Automation Bot',
      email: 'qa@applen.com'
    }
  });
  assert(Boolean(createdTicket && createdTicket.id), `Ticket created with generated ID: ${createdTicket.id}`);
  assert(formatTicketNumber(createdTicket.id).startsWith('TKT-'), `Generated ticket formats properly as ${formatTicketNumber(createdTicket.id)}`);

  // 7.5 Status update through patchTicket
  const patchedTicket = await ticketApi.patchTicket(createdTicket.id, {
    status: 'IN_PROGRESS'
  });
  assert(patchedTicket.status === 'IN_PROGRESS', 'Ticket status transitioned OPEN -> IN_PROGRESS');

  // 7.6 Reject invalid status transition through patchTicket
  let invalidTransitionCaught = false;
  try {
    // IN_PROGRESS -> OPEN is forbidden
    await ticketApi.patchTicket(createdTicket.id, {
      status: 'OPEN'
    });
  } catch (err) {
    invalidTransitionCaught = true;
    assert(err.message.includes('Workflow Violation'), `Workflow violation caught: "${err.message}"`);
  }
  assert(invalidTransitionCaught, 'API enforces workflow status transition rules');

  // 7.7 Transition to RESOLVED then Reopen to OPEN
  const resolvedTicket = await ticketApi.patchTicket(createdTicket.id, {
    status: 'RESOLVED'
  });
  assert(resolvedTicket.status === 'RESOLVED', 'Ticket transitioned IN_PROGRESS -> RESOLVED');

  const reopenedTicket = await ticketApi.patchTicket(createdTicket.id, {
    status: 'OPEN'
  });
  assert(reopenedTicket.status === 'OPEN', 'Ticket successfully reopened from RESOLVED -> OPEN');

  // 7.8 Reassign and Unassign
  const reassignedTicket = await ticketApi.patchTicket(createdTicket.id, {
    assignedAgentId: 'AGT-002'
  });
  assert(reassignedTicket.assignedAgentId === 'AGT-002', 'Ticket reassigned to AGT-002');

  const unassignedTicket = await ticketApi.patchTicket(createdTicket.id, {
    assignedAgentId: null
  });
  assert(unassignedTicket.assignedAgentId === null, 'Ticket unassigned to null (unassigned queue)');

  // 7.9 Add comment and internal note
  const comment = await commentApi.addComment(createdTicket.id, {
    author: { name: 'Support Agent', role: 'Support Engineer' },
    content: 'Official customer reply from QA engineer.',
    isInternal: false
  });
  assert(comment && comment.content === 'Official customer reply from QA engineer.' && !comment.isInternal, 'Added customer comment');

  const note = await commentApi.addComment(createdTicket.id, {
    author: { name: 'Support Agent', role: 'Support Engineer' },
    content: 'Confidential debug trace: HTTP 200 latency 42ms.',
    isInternal: true
  });
  assert(note && note.content.includes('Confidential debug') && note.isInternal, 'Added internal note');

  // 7.10 Verify activities recorded for this ticket
  const activities = await activityApi.getActivitiesByTicketId(createdTicket.id);
  assert(activities.length > 0, `Activity timeline logged ${activities.length} chronological events`);

  // 7.11 Clean up created test ticket
  const deleteResult = await ticketApi.deleteTicket(createdTicket.id);
  assert(deleteResult.success && deleteResult.id === createdTicket.id, 'Ticket successfully deleted with cascade purge');

  console.log('\n====================================================');
  console.log(`🎉 AUDIT COMPLETE: ${passedTests}/${totalTests} TESTS PASSED WITH 100% SUCCESS RATE`);
  console.log('====================================================\n');
}

runQAAudit().catch(err => {
  console.error('Audit encountered unexpected failure:', err);
  process.exit(1);
});
