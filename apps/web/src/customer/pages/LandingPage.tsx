import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { useLocationStore } from '../../shared/stores/useLocationStore';
import { RestaurantAPI } from '../../shared/services/restaurant.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, RestaurantCardSkeleton, Button } from '@foodiego/ui';
import { AlertCircle, RefreshCw, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Image } from '../../shared/components/Image';
import { formatVnd } from '../../shared/constants/pricing';

export function LandingPage() {
  const { lat, lng } = useLocationStore();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const querySearch = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const [searchTerm, setSearchTerm] = useState(querySearch);
  const limit = 6;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== querySearch) {
        setSearchParams(params => {
          if (searchTerm) {
            params.set('search', searchTerm);
          } else {
            params.delete('search');
          }
          params.set('page', '1');
          return params;
        });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, querySearch, setSearchParams]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchTerm !== querySearch) {
        setSearchParams(params => {
          if (searchTerm) {
            params.set('search', searchTerm);
          } else {
            params.delete('search');
          }
          params.set('page', '1');
          return params;
        });
      }
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchParams(params => {
      params.delete('search');
      params.set('page', '1');
      return params;
    });
  };

  const updatePage = (newPage: number) => {
    setSearchParams(params => {
      params.set('page', newPage.toString());
      return params;
    });
  };

  const { data, isLoading, isPlaceholderData, error, refetch } = useQuery({
    queryKey: ['restaurants', page, limit, querySearch, lat, lng],
    queryFn: () => RestaurantAPI.getRestaurants({ page, limit, search: querySearch, lat, lng, radius: 10 }),
    placeholderData: keepPreviousData,
    retry: 2,
  });

  const restaurants = data || [];
  const pagination = data?.pagination;

  const nearbyRestaurants = useMemo(() => {
    return restaurants.map(r => ({ ...r, distance: r.distance || 0 }));
  }, [restaurants]);

  const handleNextPage = () => {
    if (pagination && page * limit < pagination.total) {
      updatePage(page + 1);
    }
  };

  const handlePrevPage = () => {
    updatePage(Math.max(page - 1, 1));
  };

  return (
    <div className="container mx-auto p-8">
      <section className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">Craving something delicious?</h1>
        <p className="text-xl text-muted-foreground mb-8">Get your favorite food delivered in minutes.</p>
        
        <div className="max-w-2xl mx-auto relative">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-4 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-12 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm text-lg"
            />
            {searchTerm && (
              <button
                onClick={handleClear}
                className="absolute right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight">
            {querySearch ? `Search Results for "${querySearch}"` : "Restaurants"}
          </h2>
        </div>

        {error && (
          <div className="py-12 text-center">
            <div className="max-w-md mx-auto p-8 border rounded-lg bg-red-50 border-red-200">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Restaurants</h3>
              <p className="text-red-700 mb-6">We couldn't load restaurants at this time. Please try again.</p>
              <Button onClick={() => refetch()} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {isLoading && !isPlaceholderData && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: limit }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
          </div>
        )}

        {!isLoading && !error && nearbyRestaurants.length === 0 && (
          <div className="py-12 text-center">
            <div className="col-span-full py-12 text-center text-muted-foreground">
              <p className="text-lg mb-4">No restaurants found.</p>
              <p className="text-sm">Try adjusting your search criteria or check back later.</p>
            </div>
          </div>
        )}

        {!error && nearbyRestaurants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-100 transition-opacity duration-200" style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
            {nearbyRestaurants.map((restaurant) => (
              <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`} className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                  <div className="h-48 w-full relative">
                    <Image
                      src={restaurant.cover_image}
                      alt={restaurant.name}
                      fallback="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                      <div className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-semibold">
                        ★ {Number(restaurant.rating || 0).toFixed(1)}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-1">{restaurant.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    {(() => {
                      const distance = restaurant.distance ?? 0;
                      return (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{distance.toFixed(1)} km</span>
                      <span>•</span>
                      <span>{(distance * 10).toFixed(0)} mins</span>
                      <span>•</span>
                      <span>Fee: {formatVnd(restaurant.delivery_fee)}</span>
                    </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.total > limit && !error && (
          <div className="mt-12 flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              onClick={handlePrevPage}
              disabled={page === 1 || isPlaceholderData}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              Page {page} of {Math.ceil(pagination.total / limit)}
            </span>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={page * limit >= pagination.total || isPlaceholderData}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
