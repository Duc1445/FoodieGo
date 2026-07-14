import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@foodiego/ui';
import { useQuery } from '@tanstack/react-query';
import { DeliveryAPI, DRIVER_DELIVERIES_QUERY_KEY } from '../../shared/services/delivery.api';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { Truck, MapPin, CheckCircle, DollarSign, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DriverDashboardPage() {
  const user = useAuthStore((state) => state.getUser('shipper'));

  // Fetch all deliveries for this driver to calculate stats
  const { data: deliveries, isLoading: isLoadingStats } = useQuery({
    queryKey: [...DRIVER_DELIVERIES_QUERY_KEY, 'all', user?.id],
    queryFn: () => DeliveryAPI.listDeliveries({ driverId: user?.id, limit: 1000 }),
    enabled: !!user?.id,
  });

  // Fetch available deliveries
  const { data: availableDeliveries, isLoading: isLoadingAvailable } = useQuery({
    queryKey: [...DRIVER_DELIVERIES_QUERY_KEY, 'available'],
    queryFn: () => DeliveryAPI.listDeliveries({ status: 'waiting' }),
  });

  const activeDeliveries = deliveries?.filter(d => ['accepted', 'delivering'].includes(d.status)) || [];
  
  // Earnings calculations
  const today = new Date().setHours(0, 0, 0, 0);
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

  const deliveredDeliveries = deliveries?.filter(d => d.status === 'delivered') || [];
  
  const completedToday = deliveredDeliveries.filter(d => new Date(d.createdAt).getTime() >= today);
  const earningsToday = completedToday.reduce((sum, d) => sum + Number((d as any).delivery_fee || 0), 0);
  
  const completedThisMonth = deliveredDeliveries.filter(d => new Date(d.createdAt).getTime() >= startOfMonth);
  const earningsThisMonth = completedThisMonth.reduce((sum, d) => sum + Number((d as any).delivery_fee || 0), 0);

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
          value={isLoadingStats ? undefined : completedToday.length.toString()}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          trend="Deliveries finished"
        />
        <StatCard
          title="Earnings Today"
          value={isLoadingStats ? undefined : `$${earningsToday.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5 text-yellow-600" />}
          trend="Total fees today"
        />
        <StatCard
          title="Monthly Earnings"
          value={isLoadingStats ? undefined : `$${earningsThisMonth.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
          trend="Total fees this month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle>Active Deliveries</CardTitle>
            <Link to="/driver/active" className="text-sm text-primary hover:underline font-medium">View all</Link>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-32 w-full mt-4" />
            ) : activeDeliveries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>No active deliveries right now</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {activeDeliveries.slice(0, 3).map(delivery => (
                  <div key={delivery.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <span className="font-medium text-sm block">Order #{delivery.orderId.slice(0, 8)}</span>
                      <span className="text-xs text-muted-foreground capitalize">{delivery.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle>Available Orders</CardTitle>
            <Link to="/driver/available" className="text-sm text-primary hover:underline font-medium">View all</Link>
          </CardHeader>
          <CardContent>
            {isLoadingAvailable ? (
              <Skeleton className="h-32 w-full mt-4" />
            ) : !availableDeliveries || availableDeliveries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>No orders waiting</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {availableDeliveries.slice(0, 3).map(delivery => (
                  <div key={delivery.id} className="flex justify-between items-center p-3 border rounded-lg hover:border-primary/50 transition-colors">
                    <div>
                      <span className="font-medium text-sm block">Order #{delivery.orderId.slice(0, 8)}</span>
                      <span className="text-xs text-muted-foreground block mt-1">
                        Waiting since {new Date(delivery.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
          </div>
          <div className="p-3 bg-gray-50 rounded-full">{icon}</div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span className="text-muted-foreground">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
