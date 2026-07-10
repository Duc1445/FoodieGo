import { MenuService } from '../services/menu.service.js';

export class MenuController {
  constructor() {
    this.menuService = new MenuService();
  }

  getMenus = async (req, res, next) => {
    try {
      const responseData = await this.menuService.getMenus(req.query);
      res.json({ success: true, ...responseData });
    } catch (err) {
      next(err);
    }
  };

  getMenuById = async (req, res, next) => {
    try {
      const menu = await this.menuService.getMenuById(req.params.id);
      if (!menu) {
        return res.status(404).json({ success: false, message: 'Menu not found' });
      }
      res.json({ success: true, data: menu });
    } catch (err) {
      next(err);
    }
  };

  createMenu = async (req, res, next) => {
    try {
      const menu = await this.menuService.createMenu(req.body);
      res.status(201).json({ success: true, message: 'Menu created', data: menu });
    } catch (err) {
      next(err);
    }
  };

  updateMenu = async (req, res, next) => {
    try {
      const menu = await this.menuService.updateMenu(req.params.id, req.body);
      if (!menu) {
        return res.status(404).json({ success: false, message: 'Menu not found' });
      }
      res.json({ success: true, message: 'Menu updated', data: menu });
    } catch (err) {
      next(err);
    }
  };

  deleteMenu = async (req, res, next) => {
    try {
      const success = await this.menuService.deleteMenu(req.params.id);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Menu not found' });
      }
      res.json({ success: true, message: 'Menu deleted' });
    } catch (err) {
      next(err);
    }
  };
}
