import { CategoryService } from '../services/category.service.js';
import { successResponse, ConflictError, NotFoundError } from '@foodiego/core';

export class CategoryController {
  constructor() {
    this.categoryService = new CategoryService();
  }

  async getAllCategories(req, res, next) {
    try {
      const categories = await this.categoryService.getAllCategories();
      return successResponse(res, categories);
    } catch (err) {
      next(err);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const category = await this.categoryService.getCategoryById(req.params.id);
      if (!category) {
        throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND', { id: req.params.id });
      }
      return successResponse(res, category);
    } catch (err) {
      next(err);
    }
  }

  async createCategory(req, res, next) {
    try {
      const category = await this.categoryService.createCategory(req.body);
      res.status(201);
      return successResponse(res, category);
    } catch (error) {
      if (error.code === '23505') {
        return next(new ConflictError('Category name exists', { name: req.body.name }));
      }
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await this.categoryService.updateCategory(req.params.id, req.body);
      if (!category) {
         throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND', { id: req.params.id });
      }
      return successResponse(res, category);
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const success = await this.categoryService.deleteCategory(req.params.id);
      if (!success) {
         throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND', { id: req.params.id });
      }
      return successResponse(res, { deleted: true });
    } catch (error) {
      next(error);
    }
  }
}
