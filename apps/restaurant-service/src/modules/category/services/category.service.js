import { CategoryRepository } from '../repositories/category.repository.js';
import redis from '../../../config/redis.js';

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
    return await this.categoryRepository.findById(id);
  }

  async createCategory(data) {
    const category = await this.categoryRepository.create(data);
    await redis.del('categories:all');
    return category;
  }

  async updateCategory(id, data) {
    const category = await this.categoryRepository.update(id, data);
    if (category) {
      await redis.del('categories:all');
    }
    return category;
  }

  async deleteCategory(id) {
    const success = await this.categoryRepository.remove(id);
    if (success) {
      await redis.del('categories:all');
    }
    return success;
  }
}
