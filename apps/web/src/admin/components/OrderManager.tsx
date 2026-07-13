import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminAPI, ADMIN_QUERY_KEY, type Order } from '../../shared/services/admin.api';
import { Button } from '@foodiego/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@foodiego/ui';
import { ShoppingBag, Eye } from 'lucide-react';

export function OrderManager() {
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: orders, isLoading } = useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'orders', statusFilter],
    queryFn: () => AdminAPI.getAllOrders(statusFilter ? { status: statusFilter } : undefined),
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  const orderList = orders || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Order Management
            </CardTitle>
            <CardDescription>Monitor and manage all orders</CardDescription>
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-input bg-background rounded-lg text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {orderList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No orders found</div>
        ) : (
          <div className="space-y-2">
            {orderList.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface OrderCardProps {
  order: Order;
}

function OrderCard({ order }: OrderCardProps) {
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PREPARING: 'bg-purple-100 text-purple-800',
    READY: 'bg-green-100 text-green-800',
    PICKED_UP: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
            <p className="text-sm text-muted-foreground">User ID: {order.userId.slice(0, 8)}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
            {order.status}
          </span>
        </div>
        <p className="text-sm font-medium mt-1">Total: ₫{order.total.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Restaurant ID: {order.restaurantId.slice(0, 8)}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" asChild>
          <a href={`/orders/${order.id}`} target="_blank" rel="noopener noreferrer">
            <Eye className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
