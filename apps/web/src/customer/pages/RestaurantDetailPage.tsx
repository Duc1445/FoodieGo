import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RestaurantAPI } from '../../shared/services/restaurant.api';
import { Food } from '../../shared/services/food.api';
import { Card, Badge, Skeleton, Button } from '@foodiego/ui';
import { Star, MapPin, Clock, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

export function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: restaurant, isLoading: isRestaurantLoading, error: restaurantError } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => RestaurantAPI.getRestaurantById(id!),
    enabled: !!id,
    retry: 2,
  });

  const { data: menuCategories = [], isLoading: isMenuLoading, error: menuError, refetch: refetchMenu } = useQuery({
    queryKey: ['menu', 'restaurant', id],
    queryFn: () => RestaurantAPI.getMenuByRestaurantId(id!),
    enabled: !!id,
    retry: 2,
  });

  const isLoading = isRestaurantLoading || isMenuLoading;
  const error = restaurantError || menuError;

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <Skeleton className="h-12 w-20 mb-4" />
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

  // Error state
  if (error || !restaurant) {
    return (
      <div className="container mx-auto p-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="py-12 text-center">
          <div className="max-w-md mx-auto p-8 border rounded-lg bg-red-50 border-red-200">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Restaurant Not Found</h3>
            <p className="text-red-700 mb-6">We couldn't load this restaurant. It may have been removed or is temporarily unavailable.</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="container mx-auto p-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      
      <div 
        className="h-64 md:h-80 w-full rounded-3xl bg-cover bg-center mb-8 relative shadow-lg" 
        style={{ backgroundImage: `url(${restaurant.cover_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'})` }} 
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-3xl" />
        <div className="absolute bottom-0 left-0 p-8 text-white w-full flex flex-row items-end">
          <div 
            className="w-24 h-24 rounded-full border-4 border-white bg-white mr-6 bg-cover bg-center"
            style={{ backgroundImage: `url(${restaurant.logo})` }}
          />
          <div>
            <Badge className="mb-3 bg-primary/90 hover:bg-primary">
              {restaurant.status === 'open' ? 'Open Now' : 'Closed'}
            </Badge>
            <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <span className="flex items-center"><Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" /> {restaurant.rating || 4.5}</span>
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {restaurant.address || "District 1, HCMC"}</span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {restaurant.opening_time} - {restaurant.closing_time}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">About</h2>
        <p className="text-muted-foreground max-w-3xl leading-relaxed">{restaurant.description}</p>
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-8">Menu</h2>
        {menuCategories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No menu available for this restaurant.</p>
            <Button onClick={() => refetchMenu()} variant="outline" className="mt-4 gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        ) : (
          menuCategories.sort((a: any, b: any) => a.display_order - b.display_order).map((category: any) => (
            <div key={category.id} className="mb-12">
              <h3 className="text-xl font-bold mb-6 border-b pb-2">{category.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items && category.items.length > 0 ? (
                  category.items.sort((a: any, b: any) => a.display_order - b.display_order).map((food: Food) => (
                    <Link key={food.id} to={`/food/${food.id}`} state={{ restaurantName: restaurant.name, restaurantId: restaurant.id }} className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-xl">
                      <Card 
                        className="flex flex-row overflow-hidden hover:shadow-md transition-shadow h-32 w-full"
                      >
                        <div 
                          className="w-1/3 bg-cover bg-center" 
                          style={{ backgroundImage: `url(${food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'})` }} 
                        />
                        <div className="w-2/3 p-4 flex flex-col justify-between">
                          <div>
                            <h4 className="font-semibold text-base line-clamp-1">{food.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{food.description}</p>
                          </div>
                          <div className="font-bold text-primary">₫{Number(food.price).toLocaleString()}</div>
                        </div>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <div className="text-muted-foreground">No items in this category.</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
