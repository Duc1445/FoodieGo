import * as reviewRepository from '../repositories/review.repository.js';
import { ReviewEntity } from '../entities/review.entity.js';

export const createReview = async (reviewData) => {
  // Check if review already exists for this order
  if (reviewData.orderId) {
    const existing = await reviewRepository.findByOrderId(reviewData.orderId);
    if (existing) {
      throw new Error('Review already exists for this order');
    }
  }

  const review = await reviewRepository.create(reviewData);
  return new ReviewEntity(review);
};

export const getReviewById = async (id) => {
  const review = await reviewRepository.findById(id);
  if (!review) {
    throw new Error('Review not found');
  }
  return new ReviewEntity(review);
};

export const getReviewByOrderId = async (orderId) => {
  const review = await reviewRepository.findByOrderId(orderId);
  if (!review) {
    return null;
  }
  return new ReviewEntity(review);
};

export const getReviewsByRestaurantId = async (restaurantId, options = {}) => {
  const reviews = await reviewRepository.findByRestaurantId(restaurantId, options);
  return reviews.map(review => new ReviewEntity(review));
};

export const getReviewsByUserId = async (userId, options = {}) => {
  const reviews = await reviewRepository.findByUserId(userId, options);
  return reviews.map(review => new ReviewEntity(review));
};

export const updateReview = async (id, updateData, userId) => {
  const existing = await reviewRepository.findById(id);
  if (!existing) {
    throw new Error('Review not found');
  }

  // Check ownership
  if (existing.user_id !== userId) {
    throw new Error('You can only update your own reviews');
  }

  const review = await reviewRepository.update(id, updateData);
  return new ReviewEntity(review);
};

export const deleteReview = async (id, userId, isAdmin = false) => {
  const existing = await reviewRepository.findById(id);
  if (!existing) {
    throw new Error('Review not found');
  }

  // Check ownership or admin
  if (!isAdmin && existing.user_id !== userId) {
    throw new Error('You can only delete your own reviews');
  }

  const review = await reviewRepository.softDelete(id);
  return new ReviewEntity(review);
};

export const getRestaurantRating = async (restaurantId) => {
  const stats = await reviewRepository.getAverageRating(restaurantId);
  return {
    averageRating: parseFloat(stats.avg_rating) || 0,
    totalReviews: parseInt(stats.total_reviews) || 0,
  };
};
