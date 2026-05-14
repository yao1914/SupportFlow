import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Clock, CheckCircle2, AlertCircle, 
  Trash2, Tag, ArrowUpRight, Inbox, Ticket as TicketIcon, Plus,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Ticket, UserProfile } from '../App';

interface AdminDashboardProps {
  user: UserProfile;
  tickets: Ticket[];
  onUpdateTicket: (id: string, updates: Partial<Ticket>) => void;
  onDeleteTicket: (id: string) => void;
}

export default function AdminDashboard({ user, tickets, onUpdateTicket, onDeleteTicket }: AdminDashboardProps) {
  const [filterDept, setFilterDept] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const updatePriority = (ticketId: string, newPriority: string) => {
    onUpdateTicket(ticketId, { priority: newPriority as any });
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, priority: newPriority as any });
    }
  };

  const updateDepartment = (ticketId: string, newDept: string) => {
    onUpdateTicket(ticketId, { department: newDept as any });
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, department: newDept as any });
    }
  };

  const updateCreatedAt = (ticketId: string, newDate: string) => {
    onUpdateTicket(ticketId, { createdAt: new Date(newDate).toISOString() });
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, createdAt: new Date(newDate).toISOString() });
    }
  };

  const deleteTicket = (ticketId: string) => {
    onDeleteTicket(ticketId);
    setSelectedTicket(null);
    setShowDeleteConfirm(null);
  };

  const filteredTickets = tickets.filter(t => {
    const deptMatch = filterDept === 'all' || t.department === filterDept;
    return deptMatch;
  });

  const stats = {
    total: tickets.length,
    high: tickets.filter(t => t.priority === 'high').length,
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Overview of all support requests</p>
        </div>
        
          <div className="flex items-center gap-3">
            {user.role === 'developer' && (
              <Link 
                to="/logs"
                className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-blue-600 shadow-sm"
                title="View Ticket Logs"
              >
                <Plus className="w-5 h-5" />
              </Link>
            )}
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Departments</option>
                <option value="billing_payments">Billing and Payments</option>
                <option value="customer_service">Customer Service</option>
                <option value="it_technical">IT & Technical Support</option>
                <option value="product_support">Product Support</option>
              </select>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Total Tickets', value: stats.total, icon: Inbox, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'High Priority', value: stats.high, icon: ArrowUpRight, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ticket</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Department & Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                        No tickets found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <tr 
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={cn(
                          "hover:bg-blue-50/50 cursor-pointer transition-colors",
                          selectedTicket?.id === ticket.id && "bg-blue-50"
                        )}
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 truncate max-w-[200px]">{ticket.subject}</p>
                          <p className="text-[10px] text-gray-400 font-medium">#{ticket.id}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{ticket.userName}</p>
                          <p className="text-xs text-gray-500">{ticket.userEmail}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                              {getDepartmentLabel(ticket.department)}
                            </span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              getPriorityColor(ticket.priority)
                            )}>
                              {ticket.priority}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedTicket ? (
              <motion.div
                key={selectedTicket.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24 shadow-sm"
              >
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Ticket Details</h2>
                  <button 
                    onClick={() => setSelectedTicket(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Subject</label>
                    <p className="text-lg font-bold text-gray-900">{selectedTicket.subject}</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Description</label>
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">
                      {selectedTicket.description}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Date & Time Received</label>
                    <input
                      type="datetime-local"
                      value={new Date(selectedTicket.createdAt).toISOString().slice(0, 16)}
                      onChange={(e) => updateCreatedAt(selectedTicket.id, e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Priority</label>
                      <select
                        value={selectedTicket.priority}
                        onChange={(e) => updatePriority(selectedTicket.id, e.target.value)}
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500",
                          getPriorityColor(selectedTicket.priority)
                        )}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Department</label>
                      <select
                        value={selectedTicket.department}
                        onChange={(e) => updateDepartment(selectedTicket.id, e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="billing_payments">Billing and Payments</option>
                        <option value="customer_service">Customer Service</option>
                        <option value="it_technical">IT & Technical Support</option>
                        <option value="product_support">Product Support</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${selectedTicket.userName}`} 
                        className="w-8 h-8 rounded-full" 
                        alt=""
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-900">{selectedTicket.userName}</p>
                        <p className="text-[10px] text-gray-500">{selectedTicket.userEmail}</p>
                      </div>
                    </div>
                    {showDeleteConfirm === selectedTicket.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteTicket(selectedTicket.id)}
                          className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(selectedTicket.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                <TicketIcon className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Select a ticket to view details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
