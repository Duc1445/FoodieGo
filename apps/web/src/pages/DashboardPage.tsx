import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@foodiego/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

interface AnalyticsData {
  overview: {
    revenue: number;
    revenueChange: number;
    orders: number;
    ordersChange: number;
    avgOrderValue: number;
    avgOrderValueChange: number;
    prepTime: number;
    prepTimeChange: number;
  };
  revenueTrend: { date: string; value: number }[];
  topFoods: { name: string; sales: number }[];
  recentOrders: { id: string; customer: string; status: string; total: number; time: string }[];
}

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'analytics'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: AnalyticsData }>('/portal/analytics');
      return res.data.data;
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500">Failed to load analytics</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Restaurant Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${data.overview.revenue.toLocaleString()}</div>
            <p className="text-xs mt-1 opacity-80">{data.overview.revenueChange > 0 ? '+' : ''}{data.overview.revenueChange}% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.overview.orders}</div>
            <p className={`text-xs mt-1 ${data.overview.ordersChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.overview.ordersChange > 0 ? '+' : ''}{data.overview.ordersChange}% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${data.overview.avgOrderValue}</div>
            <p className={`text-xs mt-1 ${data.overview.avgOrderValueChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.overview.avgOrderValueChange > 0 ? '+' : ''}{data.overview.avgOrderValueChange}% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Prep Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.overview.prepTime}m</div>
            <p className={`text-xs mt-1 ${data.overview.prepTimeChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.overview.prepTimeChange > 0 ? '+' : ''}{data.overview.prepTimeChange}m from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="currentColor" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    className="text-primary"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">${order.total.toFixed(2)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : order.status === 'PREPARING' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
