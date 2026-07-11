import { useState, useEffect } from 'react';
import { useCartStore } from '../stores/useCartStore';
import { Button, Badge } from '@foodiego/ui';
import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { calculateDeliveryFee, calculateTotal } from '../constants/pricing';

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { items, restaurant, summary, actions } = useCartStore();
  const { name: restaurantName } = restaurant;
  const { totalItems, totalPrice: subtotal } = summary;
  const deliveryFee = calculateDeliveryFee(subtotal);
  const total = calculateTotal(subtotal, deliveryFee);
  const { removeItem, updateQuantity, clearCart } = actions;

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="relative p-2 hover:bg-accent rounded-full transition-colors flex items-center justify-center focus:outline-none"
      >
        <ShoppingCart className="w-6 h-6 text-foreground" />
        {totalItems > 0 && (
          <Badge className="absolute -top-1 -right-1 px-1.5 min-w-[20px] h-5 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-none">
            {totalItems}
          </Badge>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-background shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Your Cart</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
              <ShoppingCart className="w-16 h-16 opacity-20" />
              <p>Your cart is empty.</p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Order from</span>
                <span className="text-sm font-bold text-primary truncate max-w-[200px]">{restaurantName}</span>
              </div>
              
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 border rounded-lg bg-card">
                    <div 
                      className="w-16 h-16 rounded-md bg-cover bg-center shrink-0" 
                      style={{ backgroundImage: `url(${item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'})` }} 
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="font-bold text-sm">₫{Number(item.price).toLocaleString()}</div>
                        <div className="flex items-center border rounded-md overflow-hidden bg-background">
                          <button 
                            className="px-2 py-1 hover:bg-accent text-muted-foreground transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                          <button 
                            className="px-2 py-1 hover:bg-accent text-muted-foreground transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t bg-card mt-auto">
            <div className="flex items-center justify-between mb-2 text-muted-foreground text-sm">
              <span>Subtotal</span>
              <span>₫{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mb-4 text-muted-foreground text-sm">
              <span>Delivery</span>
              <span>₫{deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mb-6 font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">₫{total.toLocaleString()}</span>
            </div>
            <Button 
              className="w-full h-12 text-base font-bold shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => {
                navigate('/checkout');
                setIsOpen(false);
              }}
            >
              Checkout (₫{total.toLocaleString()})
            </Button>
            
            <div className="mt-4 text-center">
              <button 
                onClick={clearCart}
                className="text-xs text-muted-foreground hover:text-destructive underline"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
