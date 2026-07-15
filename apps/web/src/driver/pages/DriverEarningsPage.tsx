import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@foodiego/ui';
import { DeliveryAPI, DRIVER_DELIVERIES_QUERY_KEY } from '../../shared/services/delivery.api';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { formatVnd } from '../../shared/constants/pricing';
import { DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function DriverEarningsPage() {
  const user = useAuthStore((state) => state.getUser('driver'));

  const { data: stats, isLoading } = useQuery({
    queryKey: [...DRIVER_DELIVERIES_QUERY_KEY, 'earnings', user?.id],
    queryFn: () => DeliveryAPI.getDriverStats(),
    enabled: !!user?.id,
  });

  const earningsToday = Number(stats?.today_earnings || 0);
  const earningsThisMonth = Number(stats?.monthly_earnings || 0);
  const totalEarnings = Number(stats?.total_earnings || 0);
  const completedToday = stats?.today_deliveries || 0;
  const totalDeliveries = stats?.total_deliveries || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-primary" />
          Earnings
        </h1>
        <p className="text-gray-500 mt-2">Delivery fee earnings in VND.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Today</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-32" /> : (
              <>
                <p className="text-2xl font-bold">{formatVnd(earningsToday)}</p>
                <p className="text-sm text-muted-foreground mt-1">{completedToday} deliveries</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-32" /> : (
              <p className="text-2xl font-bold">{formatVnd(earningsThisMonth)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">All Time</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-32" /> : (
              <>
                <p className="text-2xl font-bold">{formatVnd(totalEarnings)}</p>
                <p className="text-sm text-muted-foreground mt-1">{totalDeliveries} deliveries</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Daily Earnings (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.earnings_by_day || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" fontSize={12} tickMargin={10} />
                  <YAxis fontSize={12} tickFormatter={(val) => `₫${val / 1000}k`} />
                  <Tooltip formatter={(value: any) => formatVnd(value)} />
                  <Bar dataKey="earnings" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
