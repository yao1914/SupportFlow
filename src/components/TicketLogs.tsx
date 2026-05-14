import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, History, Cpu, Target, Clock, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { Ticket } from '../App';
import { cn } from '../lib/utils';

interface TicketLogsProps {
  tickets: Ticket[];
}

export default function TicketLogs({ tickets }: TicketLogsProps) {
  const [timeRange, setTimeRange] = useState<string>('7');

  const filteredTickets = tickets.filter(ticket => {
    if (timeRange === 'all') return true;
    const ticketDate = new Date(ticket.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - ticketDate.getTime()) / (1000 * 3600 * 24);
    return diffDays <= parseInt(timeRange);
  });

  // Process data for charts
  const groupedByDate = filteredTickets.reduce((acc: any, ticket) => {
    const date = new Date(ticket.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = {
        date,
        low: 0, medium: 0, high: 0,
        deptConfSum: 0,
        prioConfSum: 0,
        count: 0
      };
    }
    acc[date][ticket.priority]++;
    acc[date].deptConfSum += (ticket.confidenceLevel?.department || 0.85) * 100;
    acc[date].prioConfSum += (ticket.confidenceLevel?.priority || 0.78) * 100;
    acc[date].count++;
    return acc;
  }, {});

  const chartData = Object.values(groupedByDate).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  ).map((d: any) => ({
    name: d.date,
    low: d.low || 0,
    medium: d.medium || 0,
    high: d.high || 0,
    deptAvg: d.count > 0 ? d.deptConfSum / d.count : 0,
    prioAvg: d.count > 0 ? d.prioConfSum / d.count : 0,
    total: d.count || 0
  }));

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

  const getConfidenceColor = (level: number) => {
    if (level >= 0.9) return 'text-green-600';
    if (level >= 0.7) return 'text-blue-600';
    if (level >= 0.5) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ticket Logs</h1>
            <p className="text-gray-500">System classification and metadata history</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer shadow-sm"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets Per Day Chart (Stacked) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">Tickets Received Per Day</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="low" name="Low" stackId="a" fill="#9ca3af" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" name="Medium" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="high" name="High" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confidence Levels Chart (Averaged) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900">Avg Model Confidence (%)</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <YAxis 
                  domain={[0, 100]}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Line 
                  type="monotone" 
                  dataKey="deptAvg" 
                  name="Avg Dept Confidence" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="prioAvg" 
                  name="Avg Priority Confidence" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Received Time</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Dept Confidence</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Priority Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No logs available for this time range.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={ticket.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-blue-600">#{ticket.id}</span>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{ticket.subject}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-700 uppercase">{getDepartmentLabel(ticket.department)}</span>
                          <span className={cn("text-[10px] font-bold", getConfidenceColor(ticket.confidenceLevel?.department || 0.85))}>
                            {((ticket.confidenceLevel?.department || 0.85) * 100).toFixed(1)}% Confidence
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-col">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit",
                            getPriorityColor(ticket.priority)
                          )}>
                            {ticket.priority}
                          </span>
                          <span className={cn("text-[10px] font-bold", getConfidenceColor(ticket.confidenceLevel?.priority || 0.78))}>
                            {((ticket.confidenceLevel?.priority || 0.78) * 100).toFixed(1)}% Confidence
                          </span>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
