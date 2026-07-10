import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Card } from '@foodiego/ui';
import { CheckCircle } from 'lucide-react';
import { FeatureUnavailable } from '../../shared/components/FeatureUnavailable';

export function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isFromCheckout = location.state?.success === true;

  if (!isFromCheckout) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <FeatureUnavailable 
          title="Order Details" 
          description="The order details feature is currently under development and will be available in Sprint 2B."
        />
      </div>
    );
  }

  // Success state from Checkout (Optimistic without backend refetch)
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-20 h-20 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Order Placed!</h1>
        <p className="text-muted-foreground text-lg">Your order #{orderId} has been received</p>
      </div>

      <Card className="p-8 mb-6 text-center">
        <p className="text-muted-foreground mb-4">
          Since you just placed this order, we are processing it. 
          Detailed order tracking will be available in Sprint 2B.
        </p>
        <p className="text-sm font-medium">Please save your order ID for reference: <span className="text-primary">{orderId}</span></p>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        You will receive a confirmation email shortly
      </p>
    </div>
  );
}
