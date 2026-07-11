import { Card, CardHeader, CardTitle, CardContent, Skeleton, Badge } from '@foodiego/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMerchantOrders, updateOrderStatus, UpdateOrderStatusDto } from '../../shared/services/merchant.api';
import { toast } from 'sonner';

export function MerchantDashboardPage() {
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
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h1 className="text-3xl font-bold tracking-tight">Merchant Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your incoming orders and restaurant.</p>
      </div>

      <Card>
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
            <p className="text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-4 border rounded-md">
                  <div>
                    <p className="font-semibold">Order #{order.id.slice(0,8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="font-medium">${Number(order.total).toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant={order.status === 'COMPLETED' || order.status === 'DELIVERING' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                    
                    <select
                      className="border rounded px-3 py-2 text-sm"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updateStatusMutation.isPending}
                    >
                        <option value="" disabled>Update Status</option>
                        <option value="CONFIRMED">Confirmed (Pending)</option>
                        <option value="PREPARING">Preparing (Cooking)</option>
                        <option value="READY">Ready for Pickup</option>
                        <option value="DELIVERING">Delivering</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
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
