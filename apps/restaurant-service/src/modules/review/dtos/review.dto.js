export const createReviewSchema = {
  user_id: {
    in: ['body'],
    isUUID: true,
    optional: true, // Will be taken from JWT
  },
  restaurant_id: {
    in: ['body'],
    isUUID: true,
    notEmpty: { errorMessage: 'Restaurant ID is required' },
  },
  order_id: {
    in: ['body'],
    isUUID: true,
    optional: true,
  },
  rating: {
    in: ['body'],
    isInt: { options: { min: 1, max: 5 }, errorMessage: 'Rating must be between 1 and 5' },
    notEmpty: { errorMessage: 'Rating is required' },
  },
  comment: {
    in: ['body'],
    isString: { errorMessage: 'Comment must be a string' },
    optional: true,
    isLength: { options: { max: 1000 }, errorMessage: 'Comment must not exceed 1000 characters' },
  },
};

export const updateReviewSchema = {
  rating: {
    in: ['body'],
    isInt: { options: { min: 1, max: 5 }, errorMessage: 'Rating must be between 1 and 5' },
    optional: true,
  },
  comment: {
    in: ['body'],
    isString: { errorMessage: 'Comment must be a string' },
    optional: true,
    isLength: { options: { max: 1000 }, errorMessage: 'Comment must not exceed 1000 characters' },
  },
  is_active: {
    in: ['body'],
    isBoolean: { errorMessage: 'is_active must be a boolean' },
    optional: true,
  },
};
