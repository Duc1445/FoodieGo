import { useQuery } from '@tanstack/react-query';
import { AdminAPI, ADMIN_QUERY_KEY } from '../../shared/services/admin.api';
import { AdminLoading } from '../components/AdminLoading';
import { Users, Store, AlertCircle, CheckSquare, Ticket } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'stats'],
    queryFn: () => AdminAPI.getStats(),
  });

  const dashboardStats = stats ?? {
    total_users: 0,
    total_customers: 0,
    total_merchants: 0,
    total_drivers: 0,
    total_admins: 0,
    active_drivers: 0,
    active_restaurants: 0,
    api_health: 'Healthy',
    api_uptime: 0,
    total_tickets: 0,
    open_tickets: 0,
    closed_tickets: 0,
    resolved_tickets: 0,
  };

  if (isLoading) {
    return <AdminLoading text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-bold mb-2 text-slate-800">System Overview</h2>
        <p className="text-slate-500">Welcome to the Admin Portal. Monitor platform performance below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={dashboardStats.total_users} icon={Users} color="text-blue-500" />
        <StatCard title="Active Drivers" value={dashboardStats.active_drivers ?? dashboardStats.total_drivers} icon={Users} color="text-cyan-500" />
        <StatCard title="Active Restaurants" value={dashboardStats.active_restaurants} icon={Store} color="text-purple-500" />
        <StatCard title="API Health" value={dashboardStats.api_health || 'Healthy'} icon={CheckSquare} color="text-green-500" />
        
        <StatCard title="API Uptime (hrs)" value={dashboardStats.api_uptime ? (dashboardStats.api_uptime / 3600).toFixed(1) : '0.0'} icon={AlertCircle} color="text-emerald-500" />
        <StatCard title="Open Tickets" value={dashboardStats.open_tickets} icon={AlertCircle} color="text-red-500" />
        <StatCard title="Resolved Tickets" value={dashboardStats.resolved_tickets || dashboardStats.closed_tickets} icon={CheckSquare} color="text-indigo-500" />
        <StatCard title="Total Tickets" value={dashboardStats.total_tickets} icon={Ticket} color="text-slate-500" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-bold mb-4">User Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Customers', value: dashboardStats.total_customers },
                    { name: 'Merchants', value: dashboardStats.total_merchants },
                    { name: 'Drivers', value: dashboardStats.total_drivers },
                    { name: 'Admins', value: dashboardStats.total_admins },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  <Cell fill="#6366f1" />
                  <Cell fill="#a855f7" />
                  <Cell fill="#06b6d4" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center">
      <div className={`p-4 rounded-full bg-slate-50 ${color} mr-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
