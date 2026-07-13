import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ReviewAPI, REVIEWS_QUERY_KEY, type CreateReviewDto } from '../../shared/services/review.api';
import { StarRating } from './StarRating';
import { Button } from '@foodiego/ui';
import { toast } from 'sonner';

interface ReviewFormProps {
  restaurantId: string;
  orderId?: string;
  onSuccess?: () => void;
}

export function ReviewForm({ restaurantId, orderId, onSuccess }: ReviewFormProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const createReviewMutation = useMutation({
    mutationFn: (data: CreateReviewDto) => ReviewAPI.createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_QUERY_KEY });
      toast.success('Review submitted successfully');
      setRating(0);
      setComment('');
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    createReviewMutation.mutate({
      restaurantId,
      orderId,
      rating,
      comment,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <StarRating rating={rating} onRatingChange={setRating} readonly={false} size={24} />
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Comment (optional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border rounded text-black bg-white"
          rows={4}
          maxLength={1000}
          placeholder="Share your experience..."
        />
        <p className="text-xs text-muted-foreground mt-1">
          {comment.length}/1000 characters
        </p>
      </div>
      <Button
        type="submit"
        disabled={createReviewMutation.isPending || rating === 0}
        className="w-full"
      >
        {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}
