import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { OrderAPI } from '../../shared/services/order.api';
import { RestaurantAPI } from '../../shared/services/restaurant.api';
import { ReviewAPI } from '../../shared/services/review.api';
import { Card, CardHeader, CardTitle, CardContent, Badge, Skeleton, Button } from '@foodiego/ui';
import { Package, ArrowLeft, RefreshCw, AlertCircle, Star } from 'lucide-react';
import { EmptyState } from '../../shared/components/EmptyState';
import { OrderTimeline } from '../components/OrderTimeline';
import { ReviewForm } from '../components/ReviewForm';
import { OrderStatus } from '@foodiego/platform-sdk/src/order-status';
import { useState } from 'react';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const {
    data: order,
    isLoading: isLoadingOrder,
    isError: isOrderError,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['order', id],
    queryFn: () => OrderAPI.getOrderDetail(id!),
    enabled: !!id,
    retry: false
  });

  const { data: restaurant, isLoading: isLoadingRestaurant } = useQuery({
    queryKey: ['restaurant', order?.restaurantId],
    queryFn: () => RestaurantAPI.getRestaurantById(order!.restaurantId),
    enabled: !!order?.restaurantId,
    staleTime: 1000 * 60 * 5
  });

  const { data: existingReview } = useQuery({
    queryKey: ['review', 'order', id],
    queryFn: () => ReviewAPI.getReviewByOrderId(id!),
    enabled: !!id && order?.status === 'COMPLETED',
  });

  const isLoading = isLoadingOrder || isLoadingRestaurant;

  // Handle errors
  if (isOrderError) {
    const isUnauthorized = (error as any)?.response?.status === 401 || (error as any)?.response?.status === 403;
    const isNotFound = (error as any)?.response?.status === 404;

    return (
      <div className="container mx-auto p-4 max-w-4xl space-y-4">
        <Button variant="ghost" onClick={() => navigate('/orders')} className="mb-4">
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
            <Card>
              <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
              <CardContent className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-4 w-full" />)}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
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
      case OrderStatus.CONFIRMED: return 'bg-blue-500 hover:bg-blue-600';
      case OrderStatus.PREPARING: return 'bg-indigo-500 hover:bg-indigo-600';
      case OrderStatus.READY: return 'bg-orange-500 hover:bg-orange-600';
      case OrderStatus.DELIVERING: return 'bg-purple-500 hover:bg-purple-600';
      case OrderStatus.COMPLETED: return 'bg-green-500 hover:bg-green-600';
      case OrderStatus.CANCELLED: return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Orders
          </Button>
          <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
          <Badge className={`${getStatusColor(order.status)} text-white capitalize`}>
            {order.status}
          </Badge>
          {import.meta.env.DEV && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const statuses = [OrderStatus.CREATED, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.DELIVERING, OrderStatus.COMPLETED];
                const currentIdx = statuses.indexOf(order.status as any);
                if (currentIdx >= 0 && currentIdx < statuses.length - 1) {
                  const nextStatus = statuses[currentIdx + 1];
                  try {
                    await OrderAPI.updateOrderStatus(order.id, nextStatus);
                    refetch();
                  } catch (e) {
                    console.error('Failed to advance status', e);
                  }
                }
              }}
              className="ml-2 border-dashed border-red-400 text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              Advance Status (DEV)
            </Button>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Header Section */}
          <Card>
            <CardHeader className="bg-muted/30">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
                  {restaurant?.logo ? (
                    <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">
                    <Link to={`/restaurant/${restaurant?.id}`} className="hover:underline">
                      {restaurant?.name || 'Unknown Restaurant'}
                    </Link>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Placed on {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardHeader>
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

          {/* Price Summary */}
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
            </CardContent>
          </Card>
        </div>

        {/* Timeline Component */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline currentStatus={order.status} />
            </CardContent>
          </Card>
        </div>

        {/* Review Section - Only show for completed orders */}
        {order.status === 'COMPLETED' && !existingReview && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Rate Your Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showReviewForm ? (
                  <ReviewForm
                    restaurantId={order.restaurantId}
                    orderId={order.id}
                    onSuccess={() => setShowReviewForm(false)}
                  />
                ) : (
                  <Button onClick={() => setShowReviewForm(true)} className="w-full">
                    Write a Review
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Existing Review Display */}
        {existingReview && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Your Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${
                          star <= existingReview.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {existingReview.comment && (
                  <p className="text-sm text-muted-foreground">{existingReview.comment}</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
