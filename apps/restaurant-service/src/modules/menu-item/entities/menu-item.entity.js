export class MenuItemEntity {
  constructor({ id, name, description, price, image_url, category_id, is_available, created_at, updated_at, category_name }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.image_url = image_url;
    this.category_id = category_id;
    this.is_available = is_available;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.category_name = category_name;
  }
}
