import { restaurantRepository } from '../repositories/restaurant.repository.js';

export const getAllRestaurants = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const restaurants = await restaurantRepository.getAllRestaurants({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    res.json({ success: true, data: restaurants });
  } catch (err) {
    next(err);
  }
};

export const getPendingRestaurants = async (req, res, next) => {
  try {
    const restaurants = await restaurantRepository.getPendingRestaurants();
    res.json({ success: true, data: restaurants });
  } catch (err) {
    next(err);
  }
};

export const approveRestaurant = async (req, res, next) => {
  try {
    const restaurant = await restaurantRepository.approveRestaurant(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Pending restaurant not found' });
    }
    res.json({ success: true, message: 'Restaurant approved', data: restaurant });
  } catch (err) {
    next(err);
  }
};

export const rejectRestaurant = async (req, res, next) => {
  try {
    const restaurant = await restaurantRepository.rejectRestaurant(req.params.id, req.body.reason);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Pending restaurant not found' });
    }
    res.json({ success: true, message: 'Restaurant rejected', data: restaurant });
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

    res.json({
      success: true,
      message: 'Restaurant status updated successfully',
      data: restaurant,
    });
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await restaurantRepository.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};
