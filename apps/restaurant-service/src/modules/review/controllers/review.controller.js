import * as reviewService from '../services/review.service.js';

export const createReview = async (req, res, next) => {
  try {
    const reviewData = {
      userId: req.user.id,
      restaurantId: req.body.restaurantId,
      orderId: req.body.orderId,
      rating: req.body.rating,
      comment: req.body.comment,
    };
    const review = await reviewService.createReview(reviewData);
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const getReviewById = async (req, res, next) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const getReviewByOrderId = async (req, res, next) => {
  try {
    const review = await reviewService.getReviewByOrderId(req.params.orderId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const getReviewsByRestaurantId = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    const reviews = await reviewService.getReviewsByRestaurantId(req.params.restaurantId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
    });
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

export const getReviewsByUserId = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    const reviews = await reviewService.getReviewsByUserId(req.params.userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
    });
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const updateData = {
      rating: req.body.rating,
      comment: req.body.comment,
    };
    const review = await reviewService.updateReview(req.params.id, updateData, req.user.id);
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const review = await reviewService.deleteReview(req.params.id, req.user.id, isAdmin);
    res.json({ success: true, message: 'Review deleted', data: review });
  } catch (err) {
    next(err);
  }
};

export const getRestaurantRating = async (req, res, next) => {
  try {
    const stats = await reviewService.getRestaurantRating(req.params.restaurantId);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};
