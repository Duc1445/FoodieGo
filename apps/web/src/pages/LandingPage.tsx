import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { RestaurantAPI } from '../services/restaurant.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, RestaurantCardSkeleton } from '@foodiego/ui';

export function LandingPage() {
  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants', 'popular'],
    queryFn: () => RestaurantAPI.getRestaurants()
  });

  return (
    <div className="container mx-auto p-8">
      <section className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">Craving something delicious?</h1>
        <p className="text-xl text-muted-foreground">Get your favorite food delivered in minutes.</p>
      </section>

      <section>
        <h2 className="text-3xl font-bold tracking-tight mb-6">Popular Restaurants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <RestaurantCardSkeleton key={i} />)
          ) : (
            restaurants.map((restaurant) => (
              <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`} className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div 
                    className="h-48 w-full bg-cover bg-center" 
                    style={{ backgroundImage: `url(${restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'})` }} 
                  />
                  <CardHeader>
                    <CardTitle>{restaurant.name}</CardTitle>
                    <CardDescription>{restaurant.address}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{restaurant.description}</p>
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
