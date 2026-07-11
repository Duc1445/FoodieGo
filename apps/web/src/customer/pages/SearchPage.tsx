import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FoodAPI, Food } from '../../shared/services/food.api';
import { Card, CardHeader, CardTitle, CardDescription, Input, Button, FoodCardSkeleton } from '@foodiego/ui';
import { Search as SearchIcon, AlertCircle, RefreshCw } from 'lucide-react';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      if (query !== searchParams.get('q')) {
        setSearchParams({ q: query });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [query, setSearchParams, searchParams]);

  const { data: filteredFoods = [], isLoading, error, refetch } = useQuery({
    queryKey: ['foods', 'search', debouncedQuery],
    queryFn: () => FoodAPI.getAllFoods({ q: debouncedQuery }),
    retry: 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(query);
    setSearchParams({ q: query });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input 
              type="text" 
              placeholder="Search for delicious food..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled>
              <SearchIcon className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Loading...</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <FoodCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input 
              type="text" 
              placeholder="Search for delicious food..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <SearchIcon className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </div>
        <div className="py-12 text-center">
          <div className="max-w-md mx-auto p-8 border rounded-lg bg-red-50 border-red-200">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Foods</h3>
            <p className="text-red-700 mb-6">We couldn't load the food catalog. Please try again.</p>
            <Button onClick={() => refetch()} className="gap-2" variant="outline">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input 
            type="text" 
            placeholder="Search for delicious food..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <SearchIcon className="w-4 h-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          {initialQuery ? `Search Results for "${initialQuery}"` : "All Foods"}
        </h2>

        {filteredFoods.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg">No foods found matching your criteria.</p>
            {initialQuery && <p className="text-sm mt-2">Try searching with different keywords.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFoods.map((food: Food) => (
              <Link key={food.id} to={`/food/${food.id}`} className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
                <Card 
                  className="overflow-hidden hover:shadow-lg transition-all group h-full"
                >
                  <div 
                    className="h-40 w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300" 
                    style={{ backgroundImage: `url(${food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'})` }} 
                  />
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{food.name}</CardTitle>
                      <span className="font-bold text-primary">₫{Number(food.price).toLocaleString()}</span>
                    </div>
                    <CardDescription className="line-clamp-2 mt-2">{food.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
