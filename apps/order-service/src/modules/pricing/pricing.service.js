import { 
  PricingContext, 
  BasePriceStage, 
  DiscountStage, 
  DeliveryStage, 
  TaxStage, 
  RoundingStage 
} from './pricing.pipeline.js';

export class PricingService {
  constructor() {
    this.stages = [
      new BasePriceStage(),
      new DiscountStage(),
      new DeliveryStage(),
      new TaxStage(),
      new RoundingStage()
    ];
  }

  /**
   * Calculates all pricing details for a cart
   * @param {Array} cartItems 
   * @param {Array} menuItems 
   * @param {Object} restaurant 
   * @param {Object} address 
   * @returns {PricingContext} Contains subtotal, discount, delivery, tax, total
   */
  calculatePricing(cartItems, menuItems, restaurant = null, address = null) {
    const context = new PricingContext(cartItems, menuItems, restaurant, address);
    
    for (const stage of this.stages) {
      stage.process(context);
    }
    
    return context;
  }

  /**
   * For backwards compatibility with Cart Service currently just needing subtotal
   */
  calculateSubtotal(cartItems, menuItems) {
    const context = this.calculatePricing(cartItems, menuItems);
    return context.subtotal;
  }
}
