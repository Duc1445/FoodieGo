export class MenuItemEntity {
  constructor({
    id,
    name,
    description,
    price,
    image_url,
    category_id,
    status,
    created_at,
    updated_at,
    category_name,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.image_url = image_url;
    this.category_id = category_id;
    this.status = status;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.category_name = category_name;
  }
}
