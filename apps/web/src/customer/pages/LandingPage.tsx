import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useLocationStore } from '../../shared/stores/useLocationStore';
import { calculateDistance } from '../../shared/utils/utils';
import { RestaurantAPI } from '../../shared/services/restaurant.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, RestaurantCardSkeleton, Button } from '@foodiego/ui';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function LandingPage() {
  const { lat, lng } = useLocationStore();
  
  const { data: restaurants = [], isLoading, error, refetch } = useQuery({
    queryKey: ['restaurants', 'all'],
    queryFn: () => RestaurantAPI.getRestaurants(),
    retry: 2,
  });

  const nearbyRestaurants = useMemo(() => {
    return restaurants
      .map(r => {
        const distance = calculateDistance(lat, lng, r.latitude, r.longitude);
        return { ...r, distance };
      })
      .filter(r => r.distance <= 5) // Only within 5km
      .sort((a, b) => a.distance - b.distance);
  }, [restaurants, lat, lng]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <section className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Craving something delicious?</h1>
          <p className="text-xl text-muted-foreground">Get your favorite food delivered in minutes.</p>
        </section>
        <section>
          <h2 className="text-3xl font-bold tracking-tight mb-6">Restaurants Near You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
          </div>
        </section>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <section className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Craving something delicious?</h1>
          <p className="text-xl text-muted-foreground">Get your favorite food delivered in minutes.</p>
        </section>
        <section className="py-12 text-center">
          <div className="max-w-md mx-auto p-8 border rounded-lg bg-red-50 border-red-200">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Restaurants</h3>
            <p className="text-red-700 mb-6">We couldn't load restaurants at this time. Please try again.</p>
            <Button onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </section>
      </div>
    );
  }

  // Empty state
  if (nearbyRestaurants.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <section className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Craving something delicious?</h1>
          <p className="text-xl text-muted-foreground">Get your favorite food delivered in minutes.</p>
        </section>
        <section className="py-12 text-center">
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <p className="text-lg mb-4">No restaurants found within 5km of your location.</p>
            <p className="text-sm">Try changing your location in settings or check back later.</p>
          </div>
        </section>
      </div>
    );
  }

  // Success state
  return (
    <div className="container mx-auto p-8">
      <section className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">Craving something delicious?</h1>
        <p className="text-xl text-muted-foreground">Get your favorite food delivered in minutes.</p>
      </section>

      <section>
        <h2 className="text-3xl font-bold tracking-tight mb-6">Restaurants Near You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nearbyRestaurants.map((restaurant) => (
            <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`} className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                <div 
                  className="h-48 w-full bg-cover bg-center" 
                  style={{ backgroundImage: `url(${restaurant.cover_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'})` }} 
                />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                    <div className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-semibold">
                      ★ {restaurant.rating.toFixed(1)}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-1">{restaurant.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{restaurant.distance.toFixed(1)} km</span>
                    <span>•</span>
                    <span>{(restaurant.distance * 10).toFixed(0)} mins</span>
                    <span>•</span>
                    <span>Fee: ₫{restaurant.delivery_fee.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
