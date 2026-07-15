import { Card, CardHeader, CardTitle, CardContent } from '@foodiego/ui';
import { useQuery } from '@tanstack/react-query';
import { getMerchantStats, getMerchantMenu } from '../../shared/services/merchant.api';
import { formatVnd } from '../../shared/constants/pricing';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function MerchantDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['merchant-stats'],
    queryFn: getMerchantStats,
  });

  const { data: menu, isLoading: menuLoading } = useQuery({
    queryKey: ['merchant-menu'],
    queryFn: getMerchantMenu,
  });

  const activeMenuItems = menu?.length || 0;
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-white text-black">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border">
        <h1 className="text-3xl font-bold tracking-tight">Merchant Dashboard</h1>
        <p className="text-muted-foreground mt-2">View your analytics and performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {statsLoading ? '...' : formatVnd(Number(stats?.total_revenue || 0))}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statsLoading ? '...' : (stats?.total_orders || 0)}</p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Active Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{menuLoading ? '...' : activeMenuItems}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Day (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {statsLoading ? (
              <div className="h-full flex items-center justify-center">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.revenue_by_day || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" fontSize={12} tickMargin={10} />
                  <YAxis fontSize={12} tickFormatter={(val) => `₫${val / 1000}k`} />
                  <Tooltip formatter={(value: any) => formatVnd(value)} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Month (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {statsLoading ? (
              <div className="h-full flex items-center justify-center">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.revenue_by_month || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} tickMargin={10} />
                  <YAxis fontSize={12} tickFormatter={(val) => `₫${val / 1000}k`} />
                  <Tooltip formatter={(value: any) => formatVnd(value)} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
