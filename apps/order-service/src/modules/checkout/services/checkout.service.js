import { CheckoutRepository } from '../repositories/checkout.repository.js';
import { CartService } from '../../cart/services/cart.service.js';
import { RestaurantGateway } from '../../cart/gateways/restaurant.gateway.js';
import { PricingService } from '../../pricing/pricing.service.js';
import { OrderStateMachine, OrderStatus } from '../state/order.state.js';
import { ValidationError, ConflictError } from '@foodiego/core';
import pool from '../../../config/database.js';

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
    const menuItems = await restaurantGateway.getRestaurantMenu(cart.restaurant_id, traceId);

    // 4. Validate Prices, Stock, Availability
    const orderItemsSnapshot = [];
    for (const cartItem of cart.items) {
      const menuData = menuItems.find((m) => m.id === cartItem.menu_item_id);
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
        priceVersion: menuData.priceVersion,
      });
    }

    // 5. Run Pricing Pipeline
    const pricingContext = pricingService.calculatePricing(
      cart.items,
      menuItems,
      { id: cart.restaurant_id, delivery_fee: 5.0 },
      { id: addressId },
    );

    // 6. Determine initial order status
    // All orders must start as PENDING_RESERVATION and await Inventory.
    const initialStatus = OrderStatus.PENDING_RESERVATION;

    const orderData = {
      userId,
      restaurantId: cart.restaurant_id,
      status: initialStatus,
      subtotal: pricingContext.subtotal,
      deliveryFee: pricingContext.deliveryFee,
      tax: pricingContext.tax,
      discount: pricingContext.discount,
      total: pricingContext.total,
      currency: 'VND',
      paymentMethod,
      addressId,
      idempotencyKey,
    };

    // 7. Execute transaction: order creation + outbox event emission
    const orderId = await checkoutRepo.createOrderWithOutbox(
      orderData,
      orderItemsSnapshot,
      {
        eventType: 'OrderPendingReservation',
        payload: {
          restaurantId: cart.restaurant_id,
          items: orderItemsSnapshot.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })),
        },
        correlationId: idempotencyKey, // Using idempotency key as initial correlation ID
      },
      payload,
    );

    // 8. Clear Cart after successful checkout
    await cartService.clearCart(userId, traceId);

    return {
      orderId,
      status: initialStatus,
      total: pricingContext.total,
    };
  }
}
