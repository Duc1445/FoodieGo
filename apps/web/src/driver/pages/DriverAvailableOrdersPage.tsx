import { Card, CardContent, Skeleton, Button, Badge } from '@foodiego/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DeliveryAPI, DRIVER_DELIVERIES_QUERY_KEY } from '../../shared/services/delivery.api';
import { toast } from 'sonner';
import { CheckCircle, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../../shared/components/EmptyState';

export function DriverAvailableOrdersPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: availableDeliveries, isLoading } = useQuery({
    queryKey: [...DRIVER_DELIVERIES_QUERY_KEY, 'available'],
    queryFn: () => DeliveryAPI.listDeliveries({ status: 'waiting', limit: 50, sort: '-created_at' }),
    refetchInterval: 15000,
  });

  // Also fetch orders with READY_FOR_PICKUP status that don't have a delivery yet
  const { data: readyOrders } = useQuery({
    queryKey: ['orders', 'ready-for-pickup'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_GATEWAY_URL}/orders?status=READY_FOR_PICKUP`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('driver_token')}`,
        },
      });
      const data = await res.json();
      return data.data || [];
    },
    refetchInterval: 15000,
    enabled: true,
  });

  // Combine available deliveries and ready orders
  const allAvailableOrders = [
    ...(availableDeliveries || []).map((d: any) => ({
      id: d.id,
      orderId: d.orderId,
      createdAt: d.createdAt,
      note: d.note,
      type: 'delivery',
    })),
    ...(readyOrders || []).map((o: any) => ({
      id: o.id,
      orderId: o.id,
      createdAt: o.createdAt,
      note: o.deliveryAddress,
      type: 'order',
    })),
  ];

  const acceptDeliveryMutation = useMutation({
    mutationFn: (deliveryId: string) => DeliveryAPI.acceptDelivery(deliveryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVER_DELIVERIES_QUERY_KEY });
      toast.success('Delivery accepted');
      navigate('/driver/active');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to accept delivery');
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Available Orders</h1>
          <p className="text-foreground/70">Orders waiting for a driver</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : !allAvailableOrders || allAvailableOrders.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No orders available"
              description="Wait for new orders to arrive."
            />
          ) : (
            <div className="grid gap-4">
              {allAvailableOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-4 border rounded-lg hover:border-primary/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg">Order #{order.orderId.slice(0, 8)}</span>
                      <Badge variant={order.type === 'delivery' ? 'default' : 'secondary'}>
                        {order.type === 'delivery' ? 'Delivery' : 'Ready for Pickup'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span>Created: {new Date(order.createdAt).toLocaleTimeString()}</span>
                    </div>
                    {order.note && (
                      <p className="text-sm mt-2 p-2 bg-muted rounded-md border text-muted-foreground">
                        {order.type === 'delivery' ? `Note: ${order.note}` : `Address: ${order.note}`}
                      </p>
                    )}
                  </div>
                  {order.type === 'delivery' ? (
                    <Button
                      onClick={() => acceptDeliveryMutation.mutate(order.id)}
                      disabled={acceptDeliveryMutation.isPending}
                      size="lg"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Accept Order
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate(`/driver/orders/${order.orderId}`)}
                      variant="outline"
                      size="lg"
                    >
                      View Details
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
