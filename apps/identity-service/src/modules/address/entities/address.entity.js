export class AddressEntity {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.address = data.address;
    this.phone = data.phone;
    this.isDefault = data.is_default;
    this.isActive = data.is_active;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }
}
