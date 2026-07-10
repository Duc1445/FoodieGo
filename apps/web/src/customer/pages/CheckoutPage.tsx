import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, Input } from '@foodiego/ui';
import { ArrowLeft, AlertCircle, Loader2, MapPin, Phone } from 'lucide-react';
import { useCartStore } from '../../shared/stores/useCartStore';
import { api } from '../../shared/api/api';

interface CheckoutFormData {
  deliveryAddress: string;
  phone: string;
  notes: string;
  paymentMethod: 'cash' | 'card' | 'wallet';
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart, restaurantId } = useCartStore();
  const [formData, setFormData] = useState<CheckoutFormData>({
    deliveryAddress: '',
    phone: '',
    notes: '',
    paymentMethod: 'cash',
  });
  const [error, setError] = useState('');

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const totalAmount = getTotalPrice() + 25000 + Math.round(getTotalPrice() * 0.1);
      const payload = {
        items: items.map(item => ({
          foodId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        restaurantId,
        deliveryAddress: formData.deliveryAddress,
        phone: formData.phone,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
        totalAmount,
      };

      const res = await api.post('/orders', payload);
      return res.data;
    },
    onSuccess: (data) => {
      clearCart();
      navigate(`/order/${data.orderId}`, { state: { success: true } });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create order');
    },
  });

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

    createOrderMutation.mutate();
  };

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

  const totalAmount = getTotalPrice() + 25000 + Math.round(getTotalPrice() * 0.1);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate('/cart')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cart
      </Button>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          {error && (
            <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
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
                    disabled={createOrderMutation.isPending}
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
                    disabled={createOrderMutation.isPending}
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
                  disabled={createOrderMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-4">Payment Method</label>
                <div className="space-y-3">
                  {(['cash', 'card', 'wallet'] as const).map(method => (
                    <label key={method} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value={method}
                        checked={formData.paymentMethod === method}
                        onChange={() => setFormData({ ...formData, paymentMethod: method })}
                        disabled={createOrderMutation.isPending}
                        className="w-4 h-4"
                      />
                      <span className="text-sm capitalize">{method === 'cash' ? 'Cash on Delivery' : method === 'card' ? 'Credit/Debit Card' : 'Digital Wallet'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full mt-6"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {createOrderMutation.isPending ? 'Creating Order...' : `Place Order - ₫${totalAmount.toLocaleString()}`}
              </Button>
            </form>
          </Card>
        </div>

        <div className="col-span-1">
          <Card className="p-6 sticky top-4">
            <h3 className="font-bold text-lg mb-6">Order Summary</h3>
            <div className="space-y-3 border-b pb-4 mb-4 max-h-[300px] overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>₫{(Number(item.price) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-b pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₫{getTotalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>₫25,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>₫{Math.round(getTotalPrice() * 0.1).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₫{totalAmount.toLocaleString()}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
