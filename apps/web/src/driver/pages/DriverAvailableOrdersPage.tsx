import { Card, CardContent, Skeleton, Button } from '@foodiego/ui';
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
    queryFn: () => DeliveryAPI.listDeliveries({ status: 'waiting' }),
    refetchInterval: 15000,
  });

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
          ) : !availableDeliveries || availableDeliveries.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No orders available"
              description="Wait for new orders to arrive."
            />
          ) : (
            <div className="grid gap-4">
              {availableDeliveries.map((delivery) => (
                <div key={delivery.id} className="flex justify-between items-center p-4 border rounded-lg hover:border-primary/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg">Order #{delivery.orderId.slice(0, 8)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span>Created: {new Date(delivery.createdAt).toLocaleTimeString()}</span>
                    </div>
                    {delivery.note && (
                      <p className="text-sm mt-2 p-2 bg-muted rounded-md border text-muted-foreground">
                        Note: {delivery.note}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => acceptDeliveryMutation.mutate(delivery.id)}
                    disabled={acceptDeliveryMutation.isPending}
                    size="lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Accept Order
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
