export class CategoryEntity {
  constructor({ id, name, description, image_url, is_active, created_at, updated_at }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.image_url = image_url;
    this.is_active = is_active;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
