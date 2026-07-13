import { Card, CardHeader, CardTitle, CardContent, Skeleton, Badge } from '@foodiego/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DeliveryAPI, type Delivery, DRIVER_DELIVERIES_QUERY_KEY } from '../../shared/services/delivery.api';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { toast } from 'sonner';
import { Button } from '@foodiego/ui';
import { CheckCircle, Package } from 'lucide-react';

export function DriverDashboardPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Fetch available deliveries (waiting status)
  const { data: availableDeliveries, isLoading: loadingAvailable } = useQuery({
    queryKey: [...DRIVER_DELIVERIES_QUERY_KEY, 'available'],
    queryFn: () => DeliveryAPI.listDeliveries({ status: 'waiting' }),
    refetchInterval: 15000, // 15s polling
  });

  // Fetch driver's active deliveries (accepted/delivering)
  const { data: activeDeliveries, isLoading: loadingActive } = useQuery({
    queryKey: [...DRIVER_DELIVERIES_QUERY_KEY, 'active', user?.id],
    queryFn: () => DeliveryAPI.listDeliveries({ status: 'accepted', driverId: user?.id }),
    refetchInterval: 15000, // 15s polling
    enabled: !!user?.id,
  });

  const acceptDeliveryMutation = useMutation({
    mutationFn: (deliveryId: string) => DeliveryAPI.acceptDelivery(deliveryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVER_DELIVERIES_QUERY_KEY });
      toast.success('Delivery accepted');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to accept delivery');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ deliveryId, status }: { deliveryId: string; status: 'accepted' | 'delivering' | 'delivered' }) =>
      DeliveryAPI.updateDeliveryStatus(deliveryId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVER_DELIVERIES_QUERY_KEY });
      toast.success('Delivery status updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  const handleAccept = (deliveryId: string) => {
    acceptDeliveryMutation.mutate(deliveryId);
  };

  const handleStatusUpdate = (deliveryId: string, status: 'accepted' | 'delivering' | 'delivered') => {
    updateStatusMutation.mutate({ deliveryId, status });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-white text-black">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border">
        <h1 className="text-3xl font-bold tracking-tight">Driver Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your deliveries and available orders.</p>
      </div>

      {/* Available Deliveries */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Available Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAvailable ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !availableDeliveries || availableDeliveries.length === 0 ? (
            <p className="text-muted-foreground">No available orders at the moment.</p>
          ) : (
            <div className="space-y-4">
              {availableDeliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  onAccept={() => handleAccept(delivery.id)}
                  isAccepting={acceptDeliveryMutation.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Deliveries */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Active Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingActive ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !activeDeliveries || activeDeliveries.length === 0 ? (
            <p className="text-muted-foreground">No active deliveries.</p>
          ) : (
            <div className="space-y-4">
              {activeDeliveries.map((delivery) => (
                <ActiveDeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  onStatusUpdate={handleStatusUpdate}
                  isUpdating={updateStatusMutation.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DeliveryCard({ delivery, onAccept, isAccepting }: { delivery: Delivery; onAccept: () => void; isAccepting: boolean }) {
  return (
    <div className="flex justify-between items-center p-4 border border-border rounded-md bg-card text-card-foreground">
      <div>
        <p className="font-semibold text-foreground">Order #{delivery.orderId.slice(0, 8)}</p>
        <p className="text-sm text-muted-foreground">
          {new Date(delivery.createdAt).toLocaleString()}
        </p>
        {delivery.note && (
          <p className="text-sm text-muted-foreground mt-1">Note: {delivery.note}</p>
        )}
      </div>
      <Button
        onClick={onAccept}
        disabled={isAccepting}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Accept
      </Button>
    </div>
  );
}

function ActiveDeliveryCard({
  delivery,
  onStatusUpdate,
  isUpdating,
}: {
  delivery: Delivery;
  onStatusUpdate: (deliveryId: string, status: 'accepted' | 'delivering' | 'delivered') => void;
  isUpdating: boolean;
}) {
  const canPickup = delivery.status === 'accepted';
  const canDeliver = delivery.status === 'delivering';

  return (
    <div className="flex justify-between items-center p-4 border border-border rounded-md bg-card text-card-foreground">
      <div>
        <p className="font-semibold text-foreground">Order #{delivery.orderId.slice(0, 8)}</p>
        <p className="text-sm text-muted-foreground">
          {new Date(delivery.createdAt).toLocaleString()}
        </p>
        {delivery.note && (
          <p className="text-sm text-muted-foreground mt-1">Note: {delivery.note}</p>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <Badge variant={delivery.status === 'delivered' ? 'default' : 'secondary'}>
          {delivery.status}
        </Badge>
        
        <div className="flex gap-2">
          {canPickup && (
            <Button
              onClick={() => onStatusUpdate(delivery.id, 'delivering')}
              disabled={isUpdating}
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Package className="w-4 h-4 mr-2" />
              Pick Up
            </Button>
          )}
          {canDeliver && (
            <Button
              onClick={() => onStatusUpdate(delivery.id, 'delivered')}
              disabled={isUpdating}
              size="sm"
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
