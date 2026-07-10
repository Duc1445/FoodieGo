import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Skeleton } from '@foodiego/ui';
import { CheckCircle, AlertCircle, RefreshCw, Clock, MapPin, Phone } from 'lucide-react';
import { api } from '../../shared/api/api';

export function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isFromCheckout = location.state?.success === true;

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
    retry: 2,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <div className="text-center py-12">
          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
          <Skeleton className="h-4 w-full mx-auto mb-8" />
          <Skeleton className="h-64 w-full mb-4" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unable to Load Order</h2>
          <p className="text-muted-foreground mb-6">We couldn't retrieve your order details</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
            <Button onClick={() => navigate('/my-orders')}>View My Orders</Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-20 h-20 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Order Placed!</h1>
        <p className="text-muted-foreground text-lg">Your order #{orderId} has been received</p>
      </div>

      <Card className="p-8 mb-6">
        <div className="space-y-6">
          <div className="border-b pb-6">
            <h3 className="font-bold text-lg mb-4">Estimated Delivery Time</h3>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold text-primary">30-45 minutes</span>
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="font-bold text-lg mb-4">Delivery Details</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Address</p>
                  <p className="font-medium">{order.deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Contact Number</p>
                  <p className="font-medium">{order.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="font-bold text-lg mb-4">Order Items</h3>
            <div className="space-y-2">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span>₫{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>₫{(order.totalAmount - 25000).toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>Delivery Fee</span>
              <span>₫25,000</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-4 border-t">
              <span>Total</span>
              <span>₫{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={() => navigate('/track-order/' + orderId)}>
          Track Order
        </Button>
        <Button onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
      </div>

      {isFromCheckout && (
        <p className="text-center text-sm text-muted-foreground mt-6">
          You will receive a confirmation email shortly
        </p>
      )}
    </div>
  );
}
