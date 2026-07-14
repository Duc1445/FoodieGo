import { useQuery } from '@tanstack/react-query';
import { AdminAPI, ADMIN_QUERY_KEY } from '../../shared/services/admin.api';
import { AdminLoading } from '../components/AdminLoading';
import { Users, Store, ShoppingBag, AlertCircle, CheckSquare, Ticket } from 'lucide-react';

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'stats'],
    queryFn: () => AdminAPI.getStats(),
  });

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
        <StatCard title="Total Users" value={stats?.total_users || 0} icon={Users} color="text-blue-500" />
        <StatCard title="Customers" value={stats?.total_customers || 0} icon={Users} color="text-indigo-500" />
        <StatCard title="Merchants" value={stats?.total_merchants || 0} icon={Store} color="text-purple-500" />
        <StatCard title="Drivers" value={stats?.total_drivers || 0} icon={Users} color="text-cyan-500" />
        
        <StatCard title="Pending Merchants" value={stats?.pending_merchants || 0} icon={AlertCircle} color="text-orange-500" />
        <StatCard title="Approved Merchants" value={stats?.approved_merchants || 0} icon={Store} color="text-green-500" />
        <StatCard title="Pending Drivers" value={stats?.pending_drivers || 0} icon={AlertCircle} color="text-yellow-500" />
        <StatCard title="Approved Drivers" value={stats?.approved_drivers || 0} icon={Users} color="text-emerald-500" />
        <StatCard title="Rejected Applications" value={stats?.rejected_applications || 0} icon={AlertCircle} color="text-red-500" />

        <StatCard title="Total Orders" value={stats?.total_orders || 0} icon={ShoppingBag} color="text-sky-500" />
        <StatCard title="Active Orders" value={stats?.active_orders || 0} icon={ShoppingBag} color="text-blue-400" />
        <StatCard title="Today's Orders" value={stats?.today_orders || 0} icon={ShoppingBag} color="text-amber-500" />
        
        <StatCard title="Total Tickets" value={stats?.total_tickets || 0} icon={AlertCircle} color="text-purple-600" />
        <StatCard title="Open Tickets" value={stats?.open_tickets || 0} icon={AlertCircle} color="text-red-500" />
        <StatCard title="Closed Tickets" value={stats?.closed_tickets || 0} icon={CheckSquare} color="text-green-500" />
        
        <StatCard title="Total Promotions" value={stats?.total_promotions || 0} icon={Ticket} color="text-pink-500" />
        <StatCard title="Active Promotions" value={stats?.active_promotions || 0} icon={Ticket} color="text-rose-500" />
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
