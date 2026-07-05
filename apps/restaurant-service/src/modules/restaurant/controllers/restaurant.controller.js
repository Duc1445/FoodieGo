import { RestaurantService } from '../services/restaurant.service.js';
const service = new RestaurantService();

export class RestaurantController {
  async getAll(req, res) {
    try {
      const restaurants = await service.getAllRestaurants(req.query);
      res.json({ success: true, data: restaurants });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const restaurant = await service.getRestaurantById(req.params.id);
      if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
      res.json({ success: true, data: restaurant });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
