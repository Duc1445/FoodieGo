import { CheckoutRepository } from '../repositories/checkout.repository.js';
import { CartService } from '../../cart/services/cart.service.js';
import { RestaurantGateway } from '../../cart/gateways/restaurant.gateway.js';
import { PricingService } from '../../pricing/pricing.service.js';
import { OrderStateMachine, OrderStatus } from '../state/order.state.js';
import { ValidationError, ConflictError } from '@foodiego/core';

const checkoutRepo = new CheckoutRepository();
const cartService = new CartService();
const restaurantGateway = new RestaurantGateway();
const pricingService = new PricingService();

export class CheckoutService {
  async processCheckout(userId, payload, traceId) {
    const { cartVersion, idempotencyKey, addressId, paymentMethod } = payload;
    
    // 1. Fetch Cart
    const cart = await cartService.getCart(userId, traceId);
    if (!cart || cart.items.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    // 2. Validate Cart Version (Optimistic Locking)
    if (cart.version !== cartVersion) {
      throw new ConflictError('Cart has been modified. Please review your cart again.');
    }

    // 3. Fetch Full Menu from Restaurant (Gateway)
    // In real app, we might just fetch the items in the cart or the whole menu.
    const menuItems = await restaurantGateway.getRestaurantMenu(cart.restaurant_id, traceId);
    
    // 4. Validate Prices, Stock, Availability
    const orderItemsSnapshot = [];
    for (const cartItem of cart.items) {
      const menuData = menuItems.find(m => m.id === cartItem.menu_item_id);
      if (!menuData) {
        throw new ValidationError(`Item ${cartItem.menu_item_id} is no longer available`);
      }
      if (!menuData.availability) {
        throw new ValidationError(`Item ${menuData.name} is out of stock or unavailable`);
      }
      
      orderItemsSnapshot.push({
        menuItemId: menuData.id,
        quantity: cartItem.quantity,
        itemName: menuData.name,
        itemPrice: menuData.price,
        priceVersion: menuData.priceVersion
      });
    }

    // Optional: Restaurant-level validations (Open, Active) could be done via another Gateway call
    // Assuming RestaurantGateway throws if restaurant is inactive.

    // 5. Run Pricing Pipeline
    // We pass the fresh menu items to calculate the exact final price
    const pricingContext = pricingService.calculatePricing(cart.items, menuItems, { id: cart.restaurant_id, delivery_fee: 5.00 }, { id: addressId });

    // 6. Build Order State
    const stateMachine = new OrderStateMachine(OrderStatus.CREATED);
    stateMachine.transitionTo(OrderStatus.PENDING_RESERVATION);
    
    const orderData = {
      userId,
      restaurantId: cart.restaurant_id,
      status: stateMachine.state,
      subtotal: pricingContext.subtotal,
      deliveryFee: pricingContext.deliveryFee,
      tax: pricingContext.tax,
      discount: pricingContext.discount,
      total: pricingContext.total,
      currency: 'USD',
      paymentMethod,
      addressId,
      idempotencyKey
    };

    // 7. Outbox Event
    const outboxEvent = {
      eventType: 'OrderPendingReservation',
      eventVersion: 1,
      payload: {
        orderId: null, // Will be replaced by repository after INSERT
        items: cart.items.map(item => ({
          sku: item.menu_item_id, // Use menu_item_id as SKU
          quantity: item.quantity
        })),
        traceId
      }
    };

    // 8. Transaction (Insert Order, Order Items, Outbox)
    const orderId = await checkoutRepo.createOrderWithOutbox(orderData, orderItemsSnapshot, outboxEvent, payload);

    // 9. Clear Cart after successful checkout
    await cartService.clearCart(userId, traceId);

    return {
      orderId,
      status: stateMachine.state,
      total: pricingContext.total
    };
  }
}
