import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TicketProvider } from './context/TicketContext';
import { NotificationProvider } from './context/NotificationContext';
import MainLayout from './components/layout/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import CreateTicket from './pages/CreateTicket';
import TicketDetails from './pages/TicketDetails';
import EditTicket from './pages/EditTicket';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <TicketProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/tickets/create" element={<CreateTicket />} />
              <Route path="/create-ticket" element={<Navigate to="/tickets/create" replace />} />
              <Route path="/tickets/:id" element={<TicketDetails />} />
              <Route path="/tickets/:id/edit" element={<EditTicket />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </TicketProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}
