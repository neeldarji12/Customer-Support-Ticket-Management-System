# APPLEN SOLUTIONS — Customer Support Ticket Management System (CSTMS)

An enterprise-grade, responsive Customer Support Ticket Management System built with **React 19**, **Vite**, **React Router 7**, **React Hook Form**, **Zod**, and **Recharts**. Designed for high-volume customer support operations with comprehensive ticket lifecycle tracking, SLA calculation, agent assignment workflows, customer correspondence threads, isolated confidential internal audit notes, real-time analytics, and dual-mode REST API connectivity with transparent offline caching.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [Architecture & System Design](#architecture--system-design)
4. [Installation & Setup](#installation--setup)
5. [Frontend & Backend Startup](#frontend--backend-startup)
6. [Mock REST API Endpoints](#mock-rest-api-endpoints)
7. [Main Features](#main-features)
8. [Automated Testing Suite](#automated-testing-suite)
9. [Project Limitations](#project-limitations)
10. [Completed Features Summary](#completed-features-summary)
11. [Pending Features](#pending-features)
12. [GitHub Submission Instructions](#github-submission-instructions)

---

## 1. Project Overview

The **APPLEN SOLUTIONS CSTMS** provides a complete end-to-end support triage and ticket resolution management suite. Built to satisfy rigorous enterprise SLA constraints, it delivers:
- **Executive Telemetry & KPI Analytics:** Live dashboard with dynamic statistics and interactive Recharts distributions.
- **Support Ticket Operations:** Advanced data table with search, multifaceted filtering, SLA sorting, and responsive mobile card transformations.
- **Form Handling with Type Safety:** Full create and edit forms powered by React Hook Form and Zod schemas with comprehensive field error messages.
- **Enterprise Workflow Engine:** Enforced state transitions (`OPEN` → `IN_PROGRESS` → `RESOLVED` / `CLOSED`), reopen capability, and agent assignment management.
- **Dual-Pane Correspondence:** Customer-facing communication channel partitioned from strictly confidential internal engineering audit notes.
- **Local Notification Subsystem:** Pub/Sub alert dispatching with unread badges and intelligent 3-second deduplication.
- **Dual-Mode Data Architecture:** First-class JSON Server REST API integration with automatic fallback to offline persistence if the server is stopped.

---

## 2. Technologies Used

### Frontend Core
- **React 19.3.1:** Latest React runtime leveraging modern hooks and concurrent rendering capabilities.
- **Vite 8.3.6:** High-performance frontend build tooling and development server.
- **React Router 7.18.5:** Declarative client-side routing with URL search param synchronisation.

### Form State & Validation
- **React Hook Form 7.91.0:** Performant, uncontrolled form validation minimizing re-renders.
- **Zod 4.6.7:** Strict schema-based TypeScript-first validation with custom error refinements.
- **@hookform/resolvers 7.0.3:** Seamless bridge connecting Zod validation schemas with React Hook Form.

### Data Visualisation & UI Icons
- **Recharts 3.10.1:** Responsive SVG charting library powering donut status distributions, priority volume bars, and agent workload capacity visualisations.
- **Lucide React 1.69.0:** Clean, accessible SVG iconography.

### Code Quality & Mock Backend
- **Oxlint 1.90.0:** Blazing-fast static linter verifying code standards and zero warnings.
- **JSON Server:** Full-featured mock REST API serving persistent CRUD operations on port 3001.

---

## 3. Architecture & System Design

```
customer-ticket-management-system/
├── public/
│   ├── assets/
│   │   ├── logo.svg
│   │   └── avatars/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/              # Reusable UI atoms (Button, Modal, Toast, Loader, Skeleton, etc.)
│   │   ├── dashboard/           # KPICards, Recharts charts, RecentTickets, AgentWorkload
│   │   ├── layout/              # Sidebar (collapsible & mobile drawer), Header, MainLayout
│   │   ├── notifications/       # NotificationBell, Dropdown, NotificationItem
│   │   ├── ticket-details/      # TicketInfo, TicketConversation, InternalNotes, ActivityTimeline, AssignmentPanel
│   │   └── tickets/             # TicketTable, TicketCard (mobile), TicketForm, TicketFilters, Pagination
│   ├── context/                 # TicketContext and NotificationContext providers
│   ├── data/
│   │   └── db.json              # Mock database seeds (tickets, agents, comments, activities, notifications)
│   ├── hooks/                   # useTickets, useAgents, useNotifications, useDebounce
│   ├── pages/                   # Dashboard, Tickets, CreateTicket, EditTicket, TicketDetails, Reports, Notifications, Settings, NotFound
│   ├── services/                # ticketApi, agentApi, commentApi, activityApi, notificationApi, apiClient
│   ├── style/                   # Modular CSS stylesheets with dark charcoal and bronze/gold theme
│   ├── utils/                   # ticketHelpers, dateHelpers, validationSchemas, constants
│   ├── App.jsx                  # Main router definitions and provider wiring
│   └── main.jsx                 # React root bootstrap
├── test-qa-audit.js             # Automated 62-point QA validation test suite
├── package.json
└── vite.config.js
```

---

## 4. Installation & Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ or v24+ recommended)
- **npm:** v9.0.0 or higher

### Installation Steps
```bash
# 1. Clone repository
git clone <repository-url>
cd Customer-Ticket-Managment-System

# 2. Install all dependencies
npm install
```

---

## 5. Frontend & Backend Startup

### 1. Start Mock REST API (JSON Server)
In your primary terminal, start the local JSON Server mock API:
```bash
npm run api
```
*Runs on `http://localhost:3001` with auto-watching enabled for `src/data/db.json`.*

### 2. Start Frontend Application (Vite Dev Server)
In a secondary terminal, launch the client application:
```bash
npm run dev
```
*Access the application at `http://localhost:5173` (or the displayed localhost port).*

### 3. Production Build & Lint Checks
```bash
# Run static lint analysis (0 errors, 0 warnings enforced)
npm run lint

# Run full 62-point automated test suite
npm test

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 6. Mock REST API Endpoints

The application interacts with JSON Server on `http://localhost:3001`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/tickets` | Retrieve all tickets |
| `GET` | `/tickets/:id` | Retrieve single ticket by ID |
| `POST` | `/tickets` | Create a new ticket |
| `PUT` | `/tickets/:id` | Full replacement update of a ticket |
| `PATCH` | `/tickets/:id` | Partial update (status, assignee, priority) |
| `DELETE` | `/tickets/:id` | Remove ticket and cascade delete related items |
| `GET` | `/agents` | Fetch support agent directory |
| `GET` | `/comments` | Retrieve comments (filterable via `?ticketId=:id`) |
| `POST` | `/comments` | Append customer reply or internal note |
| `GET` | `/activities` | Fetch activity timeline entries (`?ticketId=:id`) |
| `POST` | `/activities` | Record audit timeline log |
| `GET` | `/notifications` | Fetch system notifications |

> **Offline Resilience:** If the JSON Server is stopped or unreachable, the central API client (`src/services/apiClient.js`) transparently falls back to local storage and memory caches without throwing unhandled exceptions or disrupting user interactions.

---

## 7. Main Features

### 1. Support Tickets Table & Cards
- **9 Core Columns:** Ticket Number (`TKT-xxxx`), Subject, Customer (with avatar fallback), Category, Priority badge, Assigned Agent, Status badge, Due Date (with overdue indicator), Actions dropdown.
- **Search:** Case-insensitive search across ticket IDs, subjects, customer names, and emails.
- **Filters & Sorting:** Multivariable filtering by Status, Priority, and Agent; sorting by Newest, Oldest, Due Date Ascending, and Due Date Descending.
- **Pagination:** Configurable page size (5 or 10 records per page) with auto-reset on query changes and clean edge-case handling.
- **Adaptive Mobile View:** Responsive layout breakpoint (`<=860px`) automatically transforms tabular data into touch-friendly cards.

### 2. Form Handling & Zod Validation
- **Customer Name:** Required, minimum 3 characters.
- **Email:** Required, validated RFC email regex.
- **Subject:** Required, 5 to 100 characters.
- **Description:** Required, minimum 10 characters.
- **Category:** Selection required (Technical, Billing, General, Authentication, Integration, Feature Request, Reports).
- **Priority:** Selection required (Low, Medium, High, Urgent with associated SLA hours).
- **Assigned Agent:** Optional selection of active agents or unassigned queue.
- **Due Date:** Required, past dates rejected.

### 3. Workflow State Machine & Timeline
- Validates status flow: `OPEN` → `IN_PROGRESS` → `RESOLVED` / `CLOSED`.
- Direct jump from `OPEN` to `CLOSED` or `IN_PROGRESS` to `OPEN` is strictly prohibited.
- Reopen capability allows `RESOLVED` or `CLOSED` tickets to return cleanly to `OPEN`.
- Complete activity history logs author, timestamp, previous value, new value, and description.

### 4. Dual-Pane Correspondence & Notes
- **Customer Replies:** Customer-facing communication stream with message entrance animations and quick response templates.
- **Internal Notes:** High-visibility confidentiality banner, isolated storage (`isInternal: true`), distinct styling, strictly separated from public thread.
- **Validation:** Empty and whitespace-only submissions are blocked.

### 5. Telemetry & Analytics
- **Executive KPIs:** Total, Open, In Progress, Resolved, Closed, and Overdue counts derived dynamically from live records.
- **Visualisations:** Recharts donut distribution and bar charts with custom tooltips, legend formatting, and responsive containers.
- **Agent Workload:** Real-time breakdown of assigned, open, in-progress, and resolved volumes per agent.

### 6. Notification System
- Header notification bell with live unread badge counter.
- Notifications auto-dispatched on ticket creation, assignment, reassignment, and status changes.
- In-memory/local storage 3-second deduplication engine preventing duplicate toast or panel alerts.

---

## 8. Automated Testing Suite

The project includes an end-to-end automated verification script (`test-qa-audit.js`) running directly in Node.js ESM.

To execute the test suite:
```bash
npm test
```

### Verified Test Areas (62/62 Passed):
1. **Validation Schemas:** Invalid email format rejection, 7 required fields enforcement, subject length guards, description length guards, past date rejection, whitespace message blocking.
2. **Workflow State Transitions:** Open to In Progress / Resolved, prevention of Open to Closed, In Progress to Resolved / Closed, Reopening from Resolved / Closed to Open, self-transitions.
3. **Number Formatting & SLA:** Sequential `TKT-xxxx` formatting, missing ID fallbacks, SLA overdue detection.
4. **Search, Filter & Pagination:** Multi-keyword search, status filters, priority filters, agent filters, sorting rules, page math.
5. **Dashboard & KPIs:** Formula accuracy, dynamic updates after mutations.
6. **Notifications:** Creation, 3-second deduplication, mark read, mark all read.
7. **REST API & Storage:** GET, POST, PUT, PATCH, DELETE, 404 error handling, cascade orphan purge.

---

## 9. Project Limitations

1. **Authentication & Multi-Tenant Access Control:**
   - Current implementation operates under a single active support agent profile ("Jordan Lee"). RBAC (Role-Based Access Control) with multi-user login and JWT authentication can be integrated via backend token exchange.
2. **File Attachments:**
   - Ticket conversations and internal notes support rich text and quick response snippets; binary file/screenshot upload directly to S3 or blob storage is not included in the mock REST setup.
3. **WebSockets for Multi-Client Synchronization:**
   - State synchronization operates via reactive Pub/Sub events and local REST polling/re-fetching. Multi-browser real-time push synchronization across different machines requires a WebSocket or SSE server.

---

## 10. Completed Features Summary

- [x] **Complete Ticket Management Page:** Responsive data table, card view switch, action menus.
- [x] **Create & Edit Ticket Forms:** React Hook Form + Zod schema validation, past date block, SLA due dates.
- [x] **Ticket Details Page:** Summary pane, tabbed correspondence, isolated internal notes, audit timeline.
- [x] **Workflow & Assignment Engine:** Enforced transition rules, reopen flow, agent assignment/unassignment.
- [x] **Conversation & Notes:** Separate customer vs internal threads, whitespace guards, quick responses.
- [x] **Executive Dashboard & KPIs:** 6 dynamic metric cards, Recharts visualizations, recent activity.
- [x] **Analytics & Reports Page:** Status breakdown, priority volume, agent workload capacity metrics.
- [x] **Notification Subsystem:** Header bell, unread badge, dropdown panel, deduplication engine.
- [x] **Search, Filter, Sort & Pagination:** Debounced input, multifaceted filters, 4 sort modes, safe pagination.
- [x] **REST API Integration:** Full JSON Server CRUD with offline fallback and cascade entity deletion.
- [x] **Responsive UI/UX:** Mobile drawer sidebar, table-to-card transformation, zero horizontal overflow.
- [x] **Zero Console Errors:** 0 linter warnings, 0 build warnings, 100% test pass rate.

---

## 11. Pending Features

**None.** All required features from the functional specification, UI/UX guidelines, and QA audit requirements have been fully implemented, verified, and tested.

---

## 12. GitHub Submission Instructions

To push this repository to GitHub:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Stage all project files
git add .

# 3. Create initial commit
git commit -m "feat: complete APPLEN SOLUTIONS Customer Support Ticket Management System"

# 4. Set main branch
git branch -M main

# 5. Link your remote GitHub repository
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Push to GitHub
git push -u origin main
```

---
*Created by the Senior Frontend Engineering Team for APPLEN SOLUTIONS.*
