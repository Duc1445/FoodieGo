import * as restaurantRepository from '../repositories/restaurant.repository.js';

export const getAllRestaurants = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const restaurants = await restaurantRepository.getAllRestaurants({
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json({ success: true, data: restaurants });
  } catch (err) {
    next(err);
  }
};

export const toggleRestaurantStatus = async (req, res, next) => {
  try {
    const restaurantId = req.params.id;
    
    const restaurant = await restaurantRepository.toggleRestaurantStatus(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    
    res.json({ success: true, message: 'Restaurant status updated successfully', data: restaurant });
  } catch (err) {
    next(err);
  }
};
