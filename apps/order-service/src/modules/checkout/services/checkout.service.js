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

// TODO (post-demo 16/7): refactor to event-driven saga with inventory-service.
// Current implementation is synchronous for demo reliability.
// The full saga flow (OrderPendingReservation → InventoryReserved → PaymentRequested → PaymentAuthorized)
// is preserved in consumer.worker.js but bypassed here until Inventory Service is implemented.

/**
 * Checks and reserves inventory synchronously within a database client.
 * Uses inventory_stock table with optimistic locking (version bump).
 *
 * Returns true if reservation succeeded.
 * Throws ValidationError if any item is out of stock.
 *
 * TODO (post-demo 16/7): replace with async saga via InventoryService.
 */
async function checkAndReserveInventory(client, items) {
  for (const item of items) {
    const sku = item.menuItemId; // Use menu_item_id as SKU

    // Attempt to lock and reduce available stock atomically
    const res = await client.query(
      `SELECT stock_item_id, total_quantity, reserved_quantity, version
       FROM inventory_stock
       WHERE stock_item_id = $1
       FOR UPDATE`,
      [sku],
    );

    if (res.rows.length === 0) {
      // No inventory record found — assume unlimited stock for menu items without stock tracking
      // TODO (post-demo 16/7): enforce strict inventory checks once Inventory Service seeds stock data
      continue;
    }

    const stock = res.rows[0];
    const available = stock.total_quantity - stock.reserved_quantity;

    if (available < item.quantity) {
      throw new ValidationError(
        `Item "${item.itemName}" is out of stock (available: ${available}, requested: ${item.quantity})`,
      );
    }

    // Reserve stock (increment reserved_quantity) with optimistic locking
    const updateRes = await client.query(
      `UPDATE inventory_stock
       SET reserved_quantity = reserved_quantity + $1,
           version = version + 1,
           updated_at = NOW()
       WHERE stock_item_id = $2 AND version = $3
       RETURNING version`,
      [item.quantity, sku, stock.version],
    );

    if (updateRes.rowCount === 0) {
      throw new ConflictError(`Inventory conflict for item "${item.itemName}". Please retry.`);
    }
  }
}

/**
 * Releases previously reserved inventory (on order cancellation).
 * Safe to call even if inventory record does not exist (no-op).
 *
 * TODO (post-demo 16/7): replace with OrderCancelled event consumed by Inventory Service.
 */
export async function releaseInventory(items) {
  if (!items || items.length === 0) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of items) {
      const sku = item.menu_item_id || item.menuItemId;
      await client.query(
        `UPDATE inventory_stock
         SET reserved_quantity = GREATEST(0, reserved_quantity - $1),
             version = version + 1,
             updated_at = NOW()
         WHERE stock_item_id = $2`,
        [item.quantity, sku],
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

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
    // All orders must start as CREATED and go through PENDING_RESERVATION → saga.
    const initialStatus = OrderStatus.CREATED;

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
        eventVersion: 1,
        payload: {
          orderId: undefined, // will be set inside the repo
          items: orderItemsSnapshot.map((item) => ({
            sku: item.menuItemId, // using menu item id as sku
            quantity: item.quantity,
          })),
          traceId,
        },
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
