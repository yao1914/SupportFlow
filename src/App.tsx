/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import UserPortal from './components/UserPortal';
import AdminDashboard from './components/AdminDashboard';
import TicketLogs from './components/TicketLogs';
import Layout from './components/Layout';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'user' | 'developer';
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  description: string;
  status: 'open' | 'closed';
  priority: 'low' | 'medium' | 'high';
  department: 'billing_payments' | 'customer_service' | 'it_technical' | 'product_support';
  confidenceLevel?: {
    priority: number;
    department: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('supportflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('supportflow_tickets');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('supportflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('supportflow_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('supportflow_tickets', JSON.stringify(tickets));
  }, [tickets]);

  const login = (profile: UserProfile) => {
    setUser(profile);
  };

  const logout = () => {
    setUser(null);
  };

  const addTicket = (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTicket: Ticket = {
      ...ticket,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
  };

  const deleteTicket = (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={login} /> : <Navigate to="/" />} />
        
        <Route element={user ? <Layout user={user} onLogout={logout} /> : <Navigate to="/login" />}>
          <Route path="/" element={
            user?.role === 'admin' || user?.role === 'developer' ? <Navigate to="/admin" /> : <UserPortal user={user} tickets={tickets.filter(t => t.userId === user?.uid)} onAddTicket={addTicket} onUpdateTicket={updateTicket} />
          } />
          <Route path="/admin" element={
            user?.role === 'admin' || user?.role === 'developer' ? <AdminDashboard user={user} tickets={tickets} onUpdateTicket={updateTicket} onDeleteTicket={deleteTicket} /> : <Navigate to="/" />
          } />
          <Route path="/logs" element={
            user?.role === 'developer' ? <TicketLogs tickets={tickets} /> : <Navigate to="/" />
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
