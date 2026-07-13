import { useQuery } from '@tanstack/react-query';
import { ReviewAPI, REVIEWS_QUERY_KEY, type Review } from '../../shared/services/review.api';
import { StarRating } from './StarRating';
import { Skeleton } from '@foodiego/ui';

interface ReviewListProps {
  restaurantId: string;
}

export function ReviewList({ restaurantId }: ReviewListProps) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: [REVIEWS_QUERY_KEY, 'restaurant', restaurantId],
    queryFn: () => ReviewAPI.getReviewsByRestaurantId(restaurantId, { limit: 10 }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No reviews yet. Be the first to review!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-start justify-between mb-2">
        <div>
          <StarRating rating={review.rating} readonly size={16} />
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(review.createdAt)}
          </p>
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-foreground mt-2">{review.comment}</p>
      )}
    </div>
  );
}
