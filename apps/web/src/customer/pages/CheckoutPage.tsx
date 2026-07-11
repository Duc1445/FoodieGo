import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '@foodiego/ui';
import { ArrowLeft, MapPin, Phone } from 'lucide-react';
import { useCartStore } from '../../shared/stores/useCartStore';
import { FeatureUnavailable } from '../../shared/components/FeatureUnavailable';
import { calculateDeliveryFee, calculateTotal } from '../../shared/constants/pricing';

const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  WALLET: 'wallet',
} as const;

type PaymentMethodType = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

interface CheckoutFormData {
  deliveryAddress: string;
  phone: string;
  notes: string;
  paymentMethod: PaymentMethodType;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, summary } = useCartStore();
  const { totalPrice: subtotal } = summary;
  const deliveryFee = calculateDeliveryFee(subtotal);
  const totalAmount = calculateTotal(subtotal, deliveryFee);

  const [formData, setFormData] = useState<CheckoutFormData>({
    deliveryAddress: '',
    phone: '',
    notes: '',
    paymentMethod: PAYMENT_METHODS.CASH,
  });
  
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.deliveryAddress.trim()) {
      setError('Please enter a delivery address');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Please enter a phone number');
      return;
    }

    // Intercept Submit button. Show <FeatureUnavailable /> modal. Do NOT call backend API.
    setShowUnavailableModal(true);
  };

  if (showUnavailableModal) {
    return (
      <FeatureUnavailable 
        title="Checkout Unavailable" 
        description="Checkout functionality and backend cart synchronization will be available in Sprint 2B."
        actionLabel="Back to Cart"
        onAction={() => navigate('/cart')}
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/cart')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No items in cart</p>
          <Button onClick={() => navigate('/')} className="mt-4">Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate('/cart')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cart
      </Button>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {error && (
            <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Delivery Information</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter your delivery address"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Delivery Notes</label>
                <textarea
                  placeholder="e.g., Leave at door, ring bell twice"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-4">Payment Method</label>
                <div className="space-y-3">
                  {Object.values(PAYMENT_METHODS).map(method => (
                    <label key={method} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value={method}
                        checked={formData.paymentMethod === method}
                        onChange={() => setFormData({ ...formData, paymentMethod: method as PaymentMethodType })}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm capitalize">{method === PAYMENT_METHODS.CASH ? 'Cash on Delivery' : method === PAYMENT_METHODS.CARD ? 'Credit/Debit Card' : 'Digital Wallet'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full mt-6 h-12 text-lg"
              >
                Place Order - ₫{totalAmount.toLocaleString()}
              </Button>
            </form>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="p-6 sticky top-4">
            <h3 className="font-bold text-lg mb-6">Order Summary</h3>
            <div className="space-y-3 border-b pb-4 mb-4 max-h-[300px] overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="line-clamp-1 pr-2">{item.quantity}x {item.name}</span>
                  <span className="flex-shrink-0">₫{(Number(item.price) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-b pb-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₫{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span>₫{deliveryFee.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">₫{totalAmount.toLocaleString()}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
