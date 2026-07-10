import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Badge, Skeleton, Button } from '@foodiego/ui';
import { AlertCircle, RefreshCw, Clock, CheckCircle2, Truck } from 'lucide-react';
import { api } from '../../shared/api/api';

interface Order {
  id: string;
  restaurantName: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  deliveryTime?: string;
  itemsCount: number;
}

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  PENDING: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Pending' },
  CONFIRMED: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle2, label: 'Confirmed' },
  PREPARING: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Preparing' },
  OUT_FOR_DELIVERY: { color: 'bg-purple-100 text-purple-700', icon: Truck, label: 'On the way' },
  DELIVERED: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Delivered' },
  CANCELLED: { color: 'bg-red-100 text-red-700', icon: Clock, label: 'Cancelled' },
};

export function MyOrdersPage() {
  const navigate = useNavigate();
  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get('/orders/my-orders');
      return res.data;
    },
    retry: 2,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200 mb-6">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700">Failed to load orders</p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2 gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="text-center py-12">
          <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">Start ordering from your favorite restaurants</p>
          <Button onClick={() => navigate('/')}>Browse Restaurants</Button>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order: Order) => {
          const config = statusConfig[order.status];
          const StatusIcon = config.icon;

          return (
            <Card 
              key={order.id} 
              className="p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/order/${order.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{order.restaurantName}</h3>
                  <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                </div>
                <Badge className={config.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Items</p>
                  <p className="font-semibold">{order.itemsCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-semibold">₫{order.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-semibold">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
