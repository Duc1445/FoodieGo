import { CategoryRepository } from '../repositories/category.repository.js';
import redis from '../../../config/redis.js';
import { NotFoundError } from '@foodiego/core';

export class CategoryService {
  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async getAllCategories() {
    const cached = await redis.get('categories:all');
    if (cached) {
      return JSON.parse(cached);
    }
    const categories = await this.categoryRepository.findAll();
    await redis.set('categories:all', JSON.stringify(categories), 'EX', 3600);
    return categories;
  }

  async getCategoryById(id) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND', { id });
    }
    return category;
  }

  async createCategory(data) {
    const category = await this.categoryRepository.create(data);
    await redis.del('categories:all');
    return category;
  }

  async updateCategory(id, data) {
    const category = await this.categoryRepository.update(id, data);
    if (!category) {
      throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND', { id });
    }
    await redis.del('categories:all');
    return category;
  }

  async deleteCategory(id) {
    const success = await this.categoryRepository.remove(id);
    if (!success) {
      throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND', { id });
    }
    await redis.del('categories:all');
    return success;
  }
}
