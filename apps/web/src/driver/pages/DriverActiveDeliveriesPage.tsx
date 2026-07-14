import { Card, CardContent, Badge, Button, Skeleton } from '@foodiego/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DeliveryAPI, DRIVER_DELIVERIES_QUERY_KEY } from '../../shared/services/delivery.api';
import { OrderAPI } from '../../shared/services/order.api';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { toast } from 'sonner';
import { CheckCircle, Truck, Package } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@foodiego/ui';

export function DriverActiveDeliveriesPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.getUser('shipper'));
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: activeDeliveries, isLoading } = useQuery({
    queryKey: [...DRIVER_DELIVERIES_QUERY_KEY, 'active', user?.id],
    queryFn: () => DeliveryAPI.listDeliveries({ driverId: user?.id }),
    refetchInterval: 15000,
    enabled: !!user?.id,
  });

  // Filter only active ones (accepted or delivering)
  const currentActive = activeDeliveries?.filter(d => ['accepted', 'delivering'].includes(d.status)) || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ deliveryId, status }: { deliveryId: string; status: 'delivering' | 'delivered' }) =>
      DeliveryAPI.updateDeliveryStatus(deliveryId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVER_DELIVERIES_QUERY_KEY });
      toast.success('Delivery status updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Truck className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Active Deliveries</h1>
          <p className="text-muted-foreground">Manage your current orders</p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-32 w-full rounded-lg" />
        ) : currentActive.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No active deliveries</p>
            <p className="text-sm">Go to Available Orders to accept one.</p>
          </div>
        ) : (
          currentActive.map((delivery) => {
            const canPickup = delivery.status === 'accepted';
            const canDeliver = delivery.status === 'delivering';

            return (
              <Card key={delivery.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 cursor-pointer" onClick={() => setSelectedOrderId(delivery.orderId)}>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg hover:underline text-primary">Order #{delivery.orderId.slice(0, 8)}</span>
                        <Badge variant={delivery.status === 'accepted' ? 'secondary' : 'default'}>
                          {delivery.status === 'accepted' ? 'Assigned' : 'On The Way'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Accepted at: {new Date(delivery.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {canPickup && (
                        <Button
                          onClick={() => updateStatusMutation.mutate({ deliveryId: delivery.id, status: 'delivering' })}
                          disabled={updateStatusMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Pick Up
                        </Button>
                      )}
                      {canDeliver && (
                        <Button
                          onClick={() => updateStatusMutation.mutate({ deliveryId: delivery.id, status: 'delivered' })}
                          disabled={updateStatusMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {selectedOrderId && (
        <OrderDetailDialog 
          orderId={selectedOrderId} 
          onClose={() => setSelectedOrderId(null)} 
        />
      )}
    </div>
  );
}

function OrderDetailDialog({ orderId, onClose }: { orderId: string, onClose: () => void }) {
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => OrderAPI.getOrderDetail(orderId),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>
        {isLoading || !order ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <span>Order ID:</span>
              <span className="text-foreground font-medium">{order.id.slice(0, 8)}</span>
              <span>Status:</span>
              <span className="text-foreground font-medium">{order.status}</span>
              <span>Total:</span>
              <span className="text-foreground font-medium">${Number(order.total).toFixed(2)}</span>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Items</h4>
              <ul className="space-y-2">
                {order.items?.map((item: any) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.quantity}x {item.itemName}</span>
                    <span>${Number(item.itemPrice * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
