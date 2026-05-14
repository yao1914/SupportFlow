import React, { useState } from 'react';
import { Plus, Clock, CheckCircle2, AlertCircle, Ticket as TicketIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { UserProfile, Ticket } from '../App';

interface UserPortalProps {
  user: UserProfile;
  tickets: Ticket[];
  onAddTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export default function UserPortal({ user, tickets, onAddTicket }: UserPortalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    setIsSubmitting(true);

    try {
      // Use environment variable for production API, fallback to localhost for local testing
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, description }),
      });

      if (!response.ok) throw new Error('Backend prediction failed');

      const prediction = await response.json();

      onAddTicket({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        subject,
        description,
        status: 'open',
        priority: prediction.priority as 'low' | 'medium' | 'high',
        department: prediction.department as 'billing_payments' | 'customer_service' | 'it_technical' | 'product_support',
        confidenceLevel: {
          priority: prediction.confidence.priority,
          department: prediction.confidence.department,
        },
      });

      setSubject('');
      setDescription('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('ML Backend error:', error);
      // Fallback: still create ticket with default values if backend is down
      onAddTicket({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        subject,
        description,
        status: 'open',
        priority: 'medium',
        department: 'customer_service',
        confidenceLevel: { priority: 0, department: 0 },
      });
      setSubject('');
      setDescription('');
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDepartmentLabel = (dept: string) => {
    switch (dept) {
      case 'billing_payments': return 'Billing and Payments';
      case 'customer_service': return 'Customer Service';
      case 'it_technical': return 'IT & Technical Support';
      case 'product_support': return 'Product Support';
      default: return dept;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Support Tickets</h1>
          <p className="text-gray-500">Track and manage your requests</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tickets.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl py-16 text-center">
            <TicketIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No tickets yet</h3>
            <p className="text-gray-500 mb-6">Need help? Create your first support ticket.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-600 font-semibold hover:underline"
            >
              Create a ticket now
            </button>
          </div>
        ) : (
          tickets.map((ticket) => (
            <motion.div
              layout
              key={ticket.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {getDepartmentLabel(ticket.department)}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {ticket.subject}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-1 mt-1">
                    {ticket.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                  <span className="text-[10px] text-gray-400 font-medium">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Create New Ticket</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                  <input
                    required
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of the issue"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
