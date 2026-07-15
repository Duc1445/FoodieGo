import { useQuery } from '@tanstack/react-query';
import { OrderAPI, OrderSummary } from '../../shared/services/order.api';
import { RestaurantAPI } from '../../shared/services/restaurant.api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Badge, Skeleton } from '@foodiego/ui';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, ExternalLink } from 'lucide-react';
import { EmptyState } from '../../shared/components/EmptyState';

const OrderCard = ({ order }: { order: OrderSummary }) => {
  const navigate = useNavigate();
  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', order.restaurantId],
    queryFn: () => RestaurantAPI.getRestaurantById(order.restaurantId),
    staleTime: 1000 * 60 * 5,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'MERCHANT_ACCEPTED': return 'bg-blue-500 hover:bg-blue-600';
      case 'PREPARING': return 'bg-indigo-500 hover:bg-indigo-600';
      case 'READY_FOR_PICKUP': return 'bg-teal-500 hover:bg-teal-600';
      case 'DRIVER_ACCEPTED': return 'bg-cyan-500 hover:bg-cyan-600';
      case 'PICKED_UP': return 'bg-blue-600 hover:bg-blue-700';
      case 'DELIVERING': return 'bg-purple-500 hover:bg-purple-600';
      case 'COMPLETED': return 'bg-green-500 hover:bg-green-600';
      case 'CANCELLED': return 'bg-red-500 hover:bg-red-600';
      case 'EXPIRED': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Order #{order.id.slice(0, 8)}
        </CardTitle>
        <Badge className={`${getStatusColor(order.status)} text-white capitalize`}>
          {order.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : restaurant?.logo ? (
              <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            {isLoading ? (
              <Skeleton className="h-5 w-3/4" />
            ) : (
              <p className="text-base font-semibold leading-none">{restaurant?.name || 'Unknown Restaurant'}</p>
            )}
            <div className="flex items-center text-sm text-muted-foreground pt-1">
              <Clock className="w-3 h-3 mr-1" />
              {new Date(order.createdAt).toLocaleDateString(undefined, { 
                year: 'numeric', month: 'short', day: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              })}
            </div>
            <p className="text-sm font-medium mt-2">
              Total: ${(order.total / 100).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => navigate(`/orders/${order.id}`)}
        >
          View Details
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export function MyOrdersPage() {
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['my-orders'],
    queryFn: OrderAPI.getOrders,
    refetchInterval: 5000, // Poll every 5s for live updates
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl space-y-4">
        <h1 className="text-2xl font-bold mb-6">Order History</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-4 w-1/4" /></CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              </CardContent>
              <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <EmptyState 
          icon={Package}
          title="Failed to load orders"
          description="We couldn't fetch your order history right now. Please try again later."
        />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <EmptyState 
          icon={Package}
          title="No orders found"
          description="You haven't placed any orders yet. Once you do, they will appear here."
          actionLabel="Browse Restaurants"
          onAction={() => window.location.href = '/'}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
