import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { OrderAPI } from '../../shared/services/order.api';
import { RestaurantAPI } from '../../shared/services/restaurant.api';
import { Card, CardHeader, CardTitle, CardContent, Badge, Skeleton, Button } from '@foodiego/ui';
import { ArrowLeft, RefreshCw, AlertCircle, MapPin, Phone, Clock, User, Package, Building2 } from 'lucide-react';
import { EmptyState } from '../../shared/components/EmptyState';
import { OrderStatus } from '@foodiego/platform-sdk/src/order-status';

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: order,
    isLoading: isLoadingOrder,
    isError: isOrderError,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => OrderAPI.getOrderDetail(id!),
    enabled: !!id,
    retry: false
  });

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', order?.restaurantId],
    queryFn: () => RestaurantAPI.getRestaurantById(order!.restaurantId),
    enabled: !!order?.restaurantId,
    staleTime: 1000 * 60 * 5
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => OrderAPI.updateOrderStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    }
  });

  const isLoading = isLoadingOrder;

  // Handle errors
  if (isOrderError) {
    const isUnauthorized = (error as any)?.response?.status === 401 || (error as any)?.response?.status === 403;
    const isNotFound = (error as any)?.response?.status === 404;

    return (
      <div className="container mx-auto p-4 max-w-4xl space-y-4">
        <Button variant="ghost" onClick={() => navigate('/admin/orders')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </Button>
        <EmptyState 
          icon={AlertCircle}
          title={isUnauthorized ? "Unauthorized" : isNotFound ? "Order Not Found" : "Failed to load order"}
          description={isUnauthorized ? "You don't have permission to view this order." : isNotFound ? "The order you're looking for doesn't exist." : "Something went wrong while fetching order details."}
          actionLabel="Try Again"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  // Handle loading
  if (isLoading || !order) {
    return (
      <div className="container mx-auto p-4 max-w-4xl space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="w-24 h-10" />
          <Skeleton className="w-48 h-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
              <CardContent className="space-y-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case OrderStatus.CREATED: return 'bg-yellow-500 hover:bg-yellow-600';
      case OrderStatus.MERCHANT_ACCEPTED: return 'bg-blue-500 hover:bg-blue-600';
      case OrderStatus.PREPARING: return 'bg-indigo-500 hover:bg-indigo-600';
      case OrderStatus.READY_FOR_PICKUP: return 'bg-orange-500 hover:bg-orange-600';
      case OrderStatus.DELIVERING: return 'bg-purple-500 hover:bg-purple-600';
      case OrderStatus.COMPLETED: return 'bg-green-500 hover:bg-green-600';
      case OrderStatus.CANCELLED: return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const adminStatusOptions = [
    OrderStatus.MERCHANT_ACCEPTED,
    OrderStatus.PREPARING,
    OrderStatus.READY_FOR_PICKUP,
    OrderStatus.DELIVERING,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED
  ];

  const handleStatusChange = (newStatus: string) => {
    statusMutation.mutate(newStatus);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Orders
          </Button>
          <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
          <Badge className={`${getStatusColor(order.status)} text-white capitalize`}>
            {order.status}
          </Badge>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Status Update Section */}
          <Card>
            <CardHeader>
              <CardTitle>Update Order Status (Admin Override)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {adminStatusOptions.map((status) => (
                  <Button
                    key={status}
                    variant={order.status === status ? "default" : "outline"}
                    onClick={() => handleStatusChange(status)}
                    disabled={statusMutation.isPending}
                  >
                    {status.replace(/_/g, ' ')}
                  </Button>
                ))}
                {statusMutation.isPending && (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Restaurant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Restaurant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="font-medium">{restaurant?.name || 'Unknown Restaurant'}</div>
              {restaurant?.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <span className="text-sm text-muted-foreground">{restaurant.address}</span>
                </div>
              )}
              {restaurant?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${restaurant.phone}`} className="text-blue-600 hover:underline">
                    {restaurant.phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{order.customerName || 'Unknown'}</span>
              </div>
              {order.customerPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:underline">
                    {order.customerPhone}
                  </a>
                </div>
              )}
              {order.deliveryAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <span className="text-sm">{order.deliveryAddress}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items Section */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0 border-border">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium">{item.itemName}</div>
                    <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                  </div>
                  <div className="font-semibold text-right">
                    ${((item.itemPrice * item.quantity) / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${(order.subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>${(order.deliveryFee / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${(order.tax / 100).toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${(order.discount / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="pt-4 mt-2 border-t border-border flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${(order.total / 100).toFixed(2)}</span>
              </div>
              {order.paymentMethod && (
                <div className="pt-2 flex justify-between text-muted-foreground">
                  <span>Payment Method</span>
                  <span>{order.paymentMethod}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Promotions */}
          {order.promotions && order.promotions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Applied Promotions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {order.promotions.map((promo, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0 border-border">
                    <div>
                      <div className="font-medium">{promo.code}</div>
                      <div className="text-sm text-muted-foreground">{promo.type}</div>
                    </div>
                    <div className="text-green-600 font-semibold">
                      -${(promo.amount / 100).toFixed(2)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Delivery Information */}
          {order.delivery && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.delivery.name && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>Driver: {order.delivery.name}</span>
                  </div>
                )}
                {order.delivery.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${order.delivery.phone}`} className="text-blue-600 hover:underline">
                      {order.delivery.phone}
                    </a>
                  </div>
                )}
                {order.delivery.vehicleInfo && (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span>{order.delivery.vehicleInfo}</span>
                  </div>
                )}
                {order.delivery.status && (
                  <div className="flex items-center gap-2">
                    <Badge className="capitalize">{order.delivery.status}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Timeline */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <div>
                  <div className="font-medium">Order Placed</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              {order.status !== OrderStatus.CREATED && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div>
                    <div className="font-medium">Merchant Accepted</div>
                    <div className="text-sm text-muted-foreground">
                      {order.merchantAcceptedAt ? new Date(order.merchantAcceptedAt).toLocaleString() : 'Pending'}
                    </div>
                  </div>
                </div>
              )}
              {order.status !== OrderStatus.CREATED && order.status !== OrderStatus.MERCHANT_ACCEPTED && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <div>
                    <div className="font-medium">Preparing</div>
                    <div className="text-sm text-muted-foreground">
                      {order.preparingAt ? new Date(order.preparingAt).toLocaleString() : 'Pending'}
                    </div>
                  </div>
                </div>
              )}
              {order.status === OrderStatus.READY_FOR_PICKUP || order.status === OrderStatus.DELIVERING || order.status === OrderStatus.COMPLETED && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <div>
                    <div className="font-medium">Ready for Pickup</div>
                    <div className="text-sm text-muted-foreground">
                      {order.readyForPickupAt ? new Date(order.readyForPickupAt).toLocaleString() : 'Pending'}
                    </div>
                  </div>
                </div>
              )}
              {order.status === OrderStatus.DELIVERING && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <div>
                    <div className="font-medium">Delivering</div>
                    <div className="text-sm text-muted-foreground">
                      {order.deliveringAt ? new Date(order.deliveringAt).toLocaleString() : 'Pending'}
                    </div>
                  </div>
                </div>
              )}
              {order.status === OrderStatus.COMPLETED && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div>
                    <div className="font-medium">Completed</div>
                    <div className="text-sm text-muted-foreground">
                      {order.completedAt ? new Date(order.completedAt).toLocaleString() : 'Pending'}
                    </div>
                  </div>
                </div>
              )}
              {order.status === OrderStatus.CANCELLED && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div>
                    <div className="font-medium">Cancelled</div>
                    <div className="text-sm text-muted-foreground">
                      {order.cancelledAt ? new Date(order.cancelledAt).toLocaleString() : 'Pending'}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
