export class PricingContext {
  constructor(cartItems, menuItems, restaurant, address) {
    this.cartItems = cartItems;
    this.menuItems = menuItems;
    this.restaurant = restaurant;
    this.address = address;

    // Pipeline accumulated values
    this.subtotal = 0;
    this.discount = 0;
    this.deliveryFee = 0;
    this.tax = 0;
    this.total = 0;
  }
}

export class BasePriceStage {
  process(context) {
    let subtotal = 0;
    for (const item of context.cartItems) {
      const menuData = context.menuItems.find((m) => m.id === item.menu_item_id);
      if (menuData) {
        subtotal += parseFloat(menuData.price) * item.quantity;
      }
    }
    context.subtotal = subtotal;
  }
}

export class DiscountStage {
  process(context) {
    // Placeholder for discounts (Restaurant, Platform, Voucher)
    context.discount = 0;
  }
}

export class DeliveryStage {
  process(context) {
    const FREE_DELIVERY_THRESHOLD = 300000;
    const DEFAULT_DELIVERY_FEE = 15000;
    const baseFee = context.restaurant
      ? parseFloat(context.restaurant.delivery_fee || DEFAULT_DELIVERY_FEE)
      : DEFAULT_DELIVERY_FEE;
    context.deliveryFee = context.subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : baseFee;
  }
}

export class TaxStage {
  process(context) {
    context.tax = 0;
  }
}

export class RoundingStage {
  process(context) {
    context.subtotal = Math.round(context.subtotal);
    context.discount = Math.round(context.discount);
    context.deliveryFee = Math.round(context.deliveryFee);
    context.tax = Math.round(context.tax);
    context.total = Math.round(
      context.subtotal - context.discount + context.deliveryFee + context.tax,
    );
  }
}
