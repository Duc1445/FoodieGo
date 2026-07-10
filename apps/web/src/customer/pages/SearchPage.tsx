import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FoodAPI, Food } from '../../shared/services/food.api';
import { Card, CardHeader, CardTitle, CardDescription, Input, Button, FoodCardSkeleton } from '@foodiego/ui';
import { Search as SearchIcon } from 'lucide-react';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);

  const { data: foods = [], isLoading } = useQuery({
    queryKey: ['foods', 'search', initialQuery],
    queryFn: () => FoodAPI.getFoods({ search: initialQuery })
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <FoodCardSkeleton key={i} />)}
          </div>
        ) : foods.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No foods found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {foods.map((food: Food) => (
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
                      <span className="font-bold text-primary">${Number(food.price).toFixed(2)}</span>
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
