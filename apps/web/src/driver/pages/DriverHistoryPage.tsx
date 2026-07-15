import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@foodiego/ui';
import { DeliveryAPI, DRIVER_DELIVERIES_QUERY_KEY } from '../../shared/services/delivery.api';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { formatVnd } from '../../shared/constants/pricing';
import { History } from 'lucide-react';

export function DriverHistoryPage() {
  const user = useAuthStore((state) => state.getUser('driver'));

  const { data: deliveries, isLoading } = useQuery({
    queryKey: [...DRIVER_DELIVERIES_QUERY_KEY, 'history', user?.id],
    queryFn: () => DeliveryAPI.listDeliveries({ driverId: user?.id, status: 'delivered', limit: 100, sort: '-created_at' }),
    enabled: !!user?.id,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <History className="w-8 h-8 text-primary" />
          Delivery History
        </h1>
        <p className="text-gray-500 mt-2">Completed deliveries for your account.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completed Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !deliveries?.length ? (
            <p className="text-center text-muted-foreground py-8">No completed deliveries yet.</p>
          ) : (
            <div className="space-y-3">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="flex justify-between items-center p-4 border rounded-lg bg-card text-card-foreground">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Order #{delivery.orderId.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">Restaurant:</span> {delivery.restaurantName || 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Customer:</span> {delivery.customerName || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(delivery.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">Total: {formatVnd(Number(delivery.total || 0))}</p>
                    <p className="font-medium text-primary mt-1">Earned: {formatVnd(Number(delivery.deliveryFee || 15000))}</p>
                    <p className="text-sm font-semibold text-muted-foreground capitalize mt-1">{delivery.status}</p>
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
