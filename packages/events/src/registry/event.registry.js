/**
 * Global Event Registry for FoodieGo.
 * Acts as the Single Source of Truth for all Domain Events.
 * Helps with Versioning, Schema Validation, and Code Generation mapping.
 */

export const EventTypes = {
  // Order Domain
  ORDER_CREATED: 'OrderCreated',
  ORDER_PENDING_RESERVATION: 'OrderPendingReservation',
  ORDER_CONFIRMED: 'OrderConfirmed',
  ORDER_CANCELLED: 'OrderCancelled',

  // Cart Domain
  CART_CREATED: 'CartCreated',
  ITEM_ADDED_TO_CART: 'ItemAddedToCart',
  ITEM_REMOVED_FROM_CART: 'ItemRemovedFromCart',
  CART_CHECKED_OUT: 'CartCheckedOut',

  // Restaurant/Menu Domain
  RESTAURANT_UPDATED: 'RestaurantUpdated',
  MENU_UPDATED: 'MenuUpdated',

  // Inventory Domain
  INVENTORY_RESERVED: 'InventoryReserved',
  INVENTORY_RESERVATION_FAILED: 'InventoryReservationFailed',
  INVENTORY_RELEASED: 'InventoryReleased',

  // Payment Domain
  PAYMENT_REQUESTED: 'PaymentRequested',
  PAYMENT_SUCCEEDED: 'PaymentSucceeded',
  PAYMENT_FAILED: 'PaymentFailed',
};

export class EventRegistry {
  static isValidEvent(eventType) {
    return Object.values(EventTypes).includes(eventType);
  }

  static getTopicFor(eventType) {
    // Basic routing mapping, can be expanded to return specific exchanges/topics
    if (!this.isValidEvent(eventType)) {
      throw new Error(`Unknown event type: ${eventType}`);
    }
    // Example: OrderCreated -> foodiego.orders.events
    const prefix = eventType.startsWith('Order')
      ? 'orders'
      : eventType.startsWith('Cart') || eventType.startsWith('Item')
        ? 'cart'
        : eventType.startsWith('Restaurant') || eventType.startsWith('Menu')
          ? 'restaurant'
          : eventType.startsWith('Inventory')
            ? 'inventory'
            : eventType.startsWith('Payment')
              ? 'payment'
              : 'general';
    return `foodiego.${prefix}.events`;
  }
}
