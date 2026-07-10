import { CategoryService } from '../services/category.service.js';

export class CategoryController {
  constructor() {
    this.categoryService = new CategoryService();
  }

  getAllCategories = async (req, res, next) => {
    try {
      const categories = await this.categoryService.getAllCategories();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  };

  getCategoryById = async (req, res, next) => {
    try {
      const category = await this.categoryService.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  };

  createCategory = async (req, res, next) => {
    try {
      const category = await this.categoryService.createCategory(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      if (error.code === '23505') return res.status(409).json({ success: false, message: 'Category name exists' });
      res.status(500).json({ success: false, message: error.message });
    }
  };

  updateCategory = async (req, res, next) => {
    try {
      const category = await this.categoryService.updateCategory(req.params.id, req.body);
      if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
      res.json({ success: true, data: category });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  deleteCategory = async (req, res, next) => {
    try {
      const success = await this.categoryService.deleteCategory(req.params.id);
      if (!success) return res.status(404).json({ success: false, message: 'Category not found' });
      res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
