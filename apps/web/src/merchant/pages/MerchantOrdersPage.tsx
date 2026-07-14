import { Card, CardHeader, CardTitle, CardContent, Skeleton, Badge } from '@foodiego/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMerchantOrders, updateOrderStatus, UpdateOrderStatusDto } from '../../shared/services/merchant.api';
import { toast } from 'sonner';
import { Package } from 'lucide-react';
import { EmptyState } from '../../shared/components/EmptyState';

export function MerchantOrdersPage() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['merchantOrders'],
    queryFn: getMerchantOrders,
    refetchInterval: 15000, // 15s polling
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string, status: UpdateOrderStatusDto['status'] }) => 
      updateOrderStatus(orderId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantOrders'] });
      toast.success('Order status updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update status');
    }
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus as any });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-white text-black">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-2">Manage your incoming orders.</p>
      </div>

      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !orders || orders.length === 0 ? (
            <EmptyState 
              icon={Package}
              title="No orders yet"
              description="Your restaurant has not received any orders yet."
            />
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-4 border border-border rounded-md bg-card text-card-foreground">
                  <div>
                    <p className="font-semibold text-foreground">Order #{order.id.slice(0,8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="font-medium text-foreground">${Number(order.total).toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant={order.status === 'COMPLETED' || order.status === 'DELIVERING' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                    
                    <select
                      className="border border-input rounded px-3 py-2 text-sm bg-white text-black"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updateStatusMutation.isPending || order.status === 'COMPLETED' || order.status === 'CANCELLED' || order.status === 'REFUNDED'}
                    >
                        <option value="" disabled>Update Status</option>
                        <option value="CONFIRMED" disabled={!['PAID'].includes(order.status) && order.status !== 'CONFIRMED'}>Confirmed (Pending)</option>
                        <option value="PREPARING" disabled={!['CONFIRMED'].includes(order.status) && order.status !== 'PREPARING'}>Preparing (Cooking)</option>
                        <option value="READY" disabled={!['PREPARING'].includes(order.status) && order.status !== 'READY'}>Ready for Pickup</option>
                        <option value="DELIVERING" disabled={!['READY'].includes(order.status) && order.status !== 'DELIVERING'}>Delivering</option>
                        <option value="COMPLETED" disabled={!['DELIVERING'].includes(order.status) && order.status !== 'COMPLETED'}>Completed</option>
                        <option value="CANCELLED" disabled={['COMPLETED', 'CANCELLED', 'REFUNDED', 'DELIVERING', 'READY'].includes(order.status)}>Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
