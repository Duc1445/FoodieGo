import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminAPI, ADMIN_QUERY_KEY, type Restaurant } from '../../shared/services/admin.api';
import { Button } from '@foodiego/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@foodiego/ui';
import { Store, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

export function RestaurantManager() {
  const queryClient = useQueryClient();

  const { data: restaurants, isLoading } = useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'restaurants'],
    queryFn: () => AdminAPI.getAllRestaurants(),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (restaurantId: string) => AdminAPI.toggleRestaurantStatus(restaurantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'restaurants'] });
      toast.success('Restaurant status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update restaurant status');
    },
  });

  const handleToggleStatus = (restaurantId: string) => {
    toggleStatusMutation.mutate(restaurantId);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading restaurants...</div>;
  }

  const restaurantList = restaurants || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5" />
          Restaurant Management
        </CardTitle>
        <CardDescription>Manage restaurant accounts and status</CardDescription>
      </CardHeader>
      <CardContent>
        {restaurantList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No restaurants found</div>
        ) : (
          <div className="space-y-2">
            {restaurantList.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onToggleStatus={() => handleToggleStatus(restaurant.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onToggleStatus: () => void;
}

function RestaurantCard({ restaurant, onToggleStatus }: RestaurantCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-medium">{restaurant.name}</p>
            <p className="text-sm text-muted-foreground">{restaurant.address || 'No address'}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            restaurant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {restaurant.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        {restaurant.rating && (
          <p className="text-sm text-muted-foreground mt-1">
            Rating: {restaurant.rating.toFixed(1)} ({restaurant.total_reviews} reviews)
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Owner ID: {restaurant.owner_id}
        </p>
        <p className="text-xs text-muted-foreground">
          Added: {new Date(restaurant.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onToggleStatus}>
          {restaurant.is_active ? (
            <ToggleRight className="w-4 h-4 text-green-600" />
          ) : (
            <ToggleLeft className="w-4 h-4 text-red-600" />
          )}
        </Button>
      </div>
    </div>
  );
}
