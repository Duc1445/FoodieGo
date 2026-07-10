import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useLocationStore } from '../../shared/stores/useLocationStore';
import { calculateDistance } from '../../shared/utils/utils';
import { RestaurantAPI } from '../../shared/services/restaurant.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, RestaurantCardSkeleton } from '@foodiego/ui';

export function LandingPage() {
  const { lat, lng } = useLocationStore();
  
  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants', 'popular'],
    queryFn: () => RestaurantAPI.getRestaurants()
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

  return (
    <div className="container mx-auto p-8">
      <section className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">Craving something delicious?</h1>
        <p className="text-xl text-muted-foreground">Get your favorite food delivered in minutes.</p>
      </section>

      <section>
        <h2 className="text-3xl font-bold tracking-tight mb-6">Restaurants Near You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <RestaurantCardSkeleton key={i} />)
          ) : nearbyRestaurants.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No restaurants found within 5km of your location. Try changing your location!
            </div>
          ) : (
            nearbyRestaurants.map((restaurant) => (
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
            ))
          )}
        </div>
      </section>
    </div>
  );
}
