import { MenuItemService } from '../services/menu-item.service.js';
const service = new MenuItemService();

export class MenuItemController {
  async getByRestaurantId(req, res) {
    try {
      const menu = await service.getMenuByRestaurantId(req.params.id);
      res.json({ success: true, data: menu });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const menuItems = await service.getAllMenuItems();
      res.json({ success: true, data: menuItems });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const menuItem = await service.getMenuItemById(req.params.id);
      if (!menuItem) return res.status(404).json({ success: false, message: 'Menu item not found' });
      res.json({ success: true, data: menuItem });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
