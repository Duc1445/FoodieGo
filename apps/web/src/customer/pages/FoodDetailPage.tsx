import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FoodAPI } from '../../shared/services/food.api';
import { RestaurantAPI } from '../../shared/services/restaurant.api';
import { Button, Badge, Skeleton } from '@foodiego/ui';
import { ArrowLeft, ShoppingCart, Plus, Minus, AlertCircle, RefreshCw } from 'lucide-react';
import { useCartStore } from '../../shared/stores/useCartStore';
import { toast } from 'sonner';

export function FoodDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);
  
  const [quantity, setQuantity] = useState(1);

  const { data: food, isLoading: isFoodLoading, error: foodError, refetch: refetchFood } = useQuery({
    queryKey: ['food', id],
    queryFn: () => FoodAPI.getFoodById(id!),
    enabled: !!id,
    retry: 2,
  });

  const restaurantId = (food as any)?.restaurant_id;

  const { data: restaurant, isLoading: isRestaurantLoading, error: restaurantError } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => RestaurantAPI.getRestaurantById(restaurantId),
    enabled: !!restaurantId,
    retry: 2,
  });

  const isLoading = isFoodLoading || (!!restaurantId && isRestaurantLoading);
  const error = foodError || restaurantError;

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <Skeleton className="h-12 w-20 mb-4" />
        <div className="flex flex-col md:flex-row gap-12">
          <Skeleton className="w-full md:w-1/2 h-96 rounded-3xl" />
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/4 mb-6" />
            <Skeleton className="h-24 w-full mb-8" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !food) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="py-12 text-center">
          <div className="max-w-md mx-auto p-8 border rounded-lg bg-red-50 border-red-200">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Food Not Found</h3>
            <p className="text-red-700 mb-6">We couldn't load this item. It may have been removed or is temporarily unavailable.</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => refetchFood()} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
              <Button onClick={() => navigate('/')} variant="outline">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!restaurant) {
      toast.error('Cannot add to cart. Restaurant info missing.');
      return;
    }
    const success = addItem(food, quantity, { id: restaurant.id, name: restaurant.name });
    if (success) {
      toast.success(`Added ${quantity}x ${food.name} to cart!`);
      navigate(-1);
    } else {
      toast.error('You can only order from one restaurant at a time. Please clear your cart first.');
    }
  };

  // Success state
  return (
    <div className="container mx-auto p-8 max-w-5xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      
      <div className="bg-card border rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row">
        <div 
          className="w-full md:w-1/2 h-80 md:h-auto bg-cover bg-center" 
          style={{ backgroundImage: `url(${food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80'})` }} 
        />
        
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          {food.is_available ? (
            <Badge className="w-fit mb-4 bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none">Available</Badge>
          ) : (
            <Badge variant="destructive" className="w-fit mb-4">Out of Stock</Badge>
          )}
          
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">{food.name}</h1>
          <p className="text-3xl font-bold text-primary mb-6">₫{Number(food.price).toLocaleString()}</p>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{food.description || "A delicious meal crafted with the finest ingredients. Enjoy the rich flavors and perfect balance of spices."}</p>
          </div>

          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button 
                className="px-4 py-3 hover:bg-accent text-muted-foreground transition-colors disabled:opacity-50"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
              <button 
                className="px-4 py-3 hover:bg-accent text-muted-foreground transition-colors"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-xl font-bold">
              Total: ₫{(Number(food.price) * quantity).toLocaleString()}
            </div>
          </div>

          <Button 
            size="lg" 
            className="w-full text-lg h-14 rounded-xl shadow-lg"
            onClick={handleAddToCart}
            disabled={!food.is_available}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
