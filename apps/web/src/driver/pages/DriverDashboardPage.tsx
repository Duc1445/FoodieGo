import { Card, CardContent, Skeleton } from '@foodiego/ui';
import { useQuery } from '@tanstack/react-query';
import { DeliveryAPI, DRIVER_DELIVERIES_QUERY_KEY } from '../../shared/services/delivery.api';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { Truck, CheckCircle, DollarSign } from 'lucide-react';
import { formatVnd } from '../../shared/constants/pricing';

export function DriverDashboardPage() {
  const user = useAuthStore((state) => state.getUser('driver'));

  // Fetch all deliveries for this driver to calculate stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: [...DRIVER_DELIVERIES_QUERY_KEY, 'stats', user?.id],
    queryFn: () => DeliveryAPI.getDriverStats(),
    enabled: !!user?.id,
  });

  const { data: deliveries } = useQuery({
    queryKey: [...DRIVER_DELIVERIES_QUERY_KEY, 'all', user?.id],
    queryFn: () => DeliveryAPI.listDeliveries({ driverId: user?.id, limit: 100 }),
    enabled: !!user?.id,
  });

  const activeDeliveries = deliveries?.filter(d => ['accepted', 'delivering'].includes(d.status)) || [];
  
  const completedToday = stats?.today_deliveries || 0;
  const earningsToday = Number(stats?.today_earnings || 0);
  const earningsThisMonth = Number(stats?.monthly_earnings || 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.full_name}</h1>
        <p className="text-gray-500 mt-2">Here's an overview of your deliveries and earnings today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Deliveries"
          value={isLoadingStats ? undefined : activeDeliveries.length.toString()}
          icon={<Truck className="w-5 h-5 text-blue-600" />}
          trend="Currently on the way"
        />
        <StatCard
          title="Completed Today"
          value={isLoadingStats ? undefined : completedToday.toString()}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          trend="Deliveries finished"
        />
        <StatCard
          title="Earnings Today"
          value={isLoadingStats ? undefined : formatVnd(earningsToday)}
          icon={<DollarSign className="w-5 h-5 text-yellow-600" />}
          trend="Total fees today"
        />
        <StatCard
          title="Monthly Earnings"
          value={isLoadingStats ? undefined : formatVnd(earningsThisMonth)}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
          trend="Total fees this month"
        />
      </div>

    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value?: string, icon: React.ReactNode, trend?: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {value === undefined ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-bold">{value}</p>
            )}
            {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
