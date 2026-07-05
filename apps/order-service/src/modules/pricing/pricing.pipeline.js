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
      const menuData = context.menuItems.find(m => m.id === item.menu_item_id);
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
    // Placeholder for distance calculation, using restaurant base delivery fee for now
    context.deliveryFee = context.restaurant ? parseFloat(context.restaurant.delivery_fee || 0) : 0;
  }
}

export class TaxStage {
  process(context) {
    // 8% tax on (subtotal - discount + delivery)
    const taxableAmount = Math.max(0, context.subtotal - context.discount + context.deliveryFee);
    context.tax = taxableAmount * 0.08;
  }
}

export class RoundingStage {
  process(context) {
    context.subtotal = parseFloat(context.subtotal.toFixed(2));
    context.discount = parseFloat(context.discount.toFixed(2));
    context.deliveryFee = parseFloat(context.deliveryFee.toFixed(2));
    context.tax = parseFloat(context.tax.toFixed(2));
    
    context.total = parseFloat((context.subtotal - context.discount + context.deliveryFee + context.tax).toFixed(2));
  }
}
