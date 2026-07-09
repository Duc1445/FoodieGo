import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RestaurantAPI } from '../services/restaurant.api';
import { FoodAPI } from '../services/food.api';
import { Card, Badge, Skeleton, Button } from '@foodiego/ui';
import { Star, MapPin, Clock, ArrowLeft } from 'lucide-react';

export function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: restaurant, isLoading: isRestaurantLoading } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => RestaurantAPI.getRestaurantById(id!),
    enabled: !!id
  });

  const { data: foods = [], isLoading: isFoodsLoading } = useQuery({
    queryKey: ['foods', 'restaurant', id],
    queryFn: () => FoodAPI.getFoods(), // Replace with getFoodsByRestaurant when API supports it
    enabled: !!id
  });

  const isLoading = isRestaurantLoading || isFoodsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 animate-pulse">
        <Skeleton className="h-64 w-full rounded-2xl mb-8" />
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-6 w-1/4 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return <div className="text-center p-12">Restaurant not found.</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      
      <div 
        className="h-64 md:h-80 w-full rounded-3xl bg-cover bg-center mb-8 relative shadow-lg" 
        style={{ backgroundImage: `url(${restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'})` }} 
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-3xl" />
        <div className="absolute bottom-0 left-0 p-8 text-white">
          <Badge className="mb-3 bg-primary/90 hover:bg-primary">Open Now</Badge>
          <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
          <div className="flex items-center gap-4 text-sm opacity-90">
            <span className="flex items-center"><Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" /> {restaurant.rating || 4.5}</span>
            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {restaurant.address}</span>
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> 20-30 min</span>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">About</h2>
        <p className="text-muted-foreground max-w-3xl leading-relaxed">{restaurant.description}</p>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.map((food) => (
            <Link key={food.id} to={`/food/${food.id}`} className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-xl">
              <Card 
                className="flex flex-row overflow-hidden hover:shadow-md transition-shadow h-32 w-full"
              >
                <div 
                  className="w-1/3 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'})` }} 
                />
                <div className="w-2/3 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-base line-clamp-1">{food.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{food.description}</p>
                  </div>
                  <div className="font-bold text-primary">${Number(food.price).toFixed(2)}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
