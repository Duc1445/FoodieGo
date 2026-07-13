import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import * as reviewController from '../controllers/review.controller.js';

const router = Router();

// Create review (authenticated users only)
router.post(
  '/',
  authenticate,
  body('restaurant_id').isUUID().withMessage('Invalid restaurant ID'),
  body('order_id').optional().isUUID().withMessage('Invalid order ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().isLength({ max: 1000 }).withMessage('Comment too long'),
  validate,
  reviewController.createReview
);

// Get review by ID (public)
router.get(
  '/:id',
  param('id').isUUID().withMessage('Invalid review ID'),
  validate,
  reviewController.getReviewById
);

// Get review by order ID (authenticated)
router.get(
  '/order/:orderId',
  authenticate,
  param('orderId').isUUID().withMessage('Invalid order ID'),
  validate,
  reviewController.getReviewByOrderId
);

// Get reviews by restaurant ID (public with pagination)
router.get(
  '/restaurant/:restaurantId',
  param('restaurantId').isUUID().withMessage('Invalid restaurant ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit'),
  query('sortBy').optional().isIn(['created_at', 'rating']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Invalid sort order'),
  validate,
  reviewController.getReviewsByRestaurantId
);

// Get reviews by user ID (authenticated, owner or admin)
router.get(
  '/user/:userId',
  authenticate,
  param('userId').isUUID().withMessage('Invalid user ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit'),
  validate,
  reviewController.getReviewsByUserId
);

// Update review (owner only)
router.put(
  '/:id',
  authenticate,
  param('id').isUUID().withMessage('Invalid review ID'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().isLength({ max: 1000 }).withMessage('Comment too long'),
  validate,
  reviewController.updateReview
);

// Delete review (owner or admin)
router.delete(
  '/:id',
  authenticate,
  param('id').isUUID().withMessage('Invalid review ID'),
  validate,
  reviewController.deleteReview
);

// Get restaurant rating stats (public)
router.get(
  '/restaurant/:restaurantId/rating',
  param('restaurantId').isUUID().withMessage('Invalid restaurant ID'),
  validate,
  reviewController.getRestaurantRating
);

export default router;
