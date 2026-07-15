import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@foodiego/ui';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../../shared/stores/useCartStore';
import { calculateDeliveryFee, calculateTotal, formatVnd } from '../../shared/constants/pricing';
import { toast } from 'sonner';

export function CartPage() {
  const navigate = useNavigate();
  const { items, restaurant, summary, pendingItemIds, actions } = useCartStore();
  const { removeItem, updateQuantity } = actions;
  const { name: restaurantName } = restaurant;
  const { totalPrice: subtotal } = summary;
  const deliveryFee = calculateDeliveryFee(subtotal);
  const total = calculateTotal(subtotal, deliveryFee);

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await updateQuantity(itemId, quantity);
    } catch {
      toast.error('Could not update quantity. Please try again.');
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch {
      toast.error('Could not remove item. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add items from restaurants to get started</p>
          <Button onClick={() => navigate('/')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">{restaurantName}</h3>
            <div className="space-y-4">
              {items.map((item) => {
                const isPending = pendingItemIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between border-b pb-4 last:border-0 transition-opacity ${isPending ? 'opacity-60' : ''}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{formatVnd(Number(item.price))}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button
                          className="px-3 py-2 hover:bg-accent disabled:opacity-50"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={isPending}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 font-semibold">{item.quantity}</span>
                        <button
                          className="px-3 py-2 hover:bg-accent disabled:opacity-50"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isPending}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-bold min-w-[80px] text-right">{formatVnd(Number(item.price) * item.quantity)}</p>
                      <button
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        onClick={() => handleRemove(item.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="col-span-1">
          <Card className="p-6 sticky top-4">
            <h3 className="font-bold text-lg mb-6">Order Summary</h3>
            <div className="space-y-3 border-b pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatVnd(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{formatVnd(deliveryFee)}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span>{formatVnd(total)}</span>
            </div>
            <Button
              className="w-full mb-2"
              onClick={() => navigate('/checkout')}
            >
              Checkout
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
