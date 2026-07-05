import { CartRepository } from '../repositories/cart.repository.js';
import { PricingService } from '../../pricing/pricing.service.js';
import { RestaurantGateway } from '../gateways/restaurant.gateway.js';
import { MockDomainEventPublisher } from '../events/domain.events.js';
import { CartConflictError, MenuItemUnavailableError, NotFoundError } from '@foodiego/core';

const cartRepo = new CartRepository();
const pricingService = new PricingService();
const restaurantGateway = new RestaurantGateway();
const eventPublisher = new MockDomainEventPublisher();

export class CartService {
  async getCart(userId, traceId) {
    let cart = await cartRepo.getCart(userId);
    if (!cart) {
      return { user_id: userId, items: [], subtotal: 0, restaurant_id: null, version: 1 };
    }
    
    // Fetch latest prices for items to return accurate summary
    if (cart.items.length > 0) {
      const menuItems = await restaurantGateway.getRestaurantMenu(cart.restaurant_id, traceId);
      cart.subtotal = pricingService.calculateSubtotal(cart.items, menuItems);
    } else {
      cart.subtotal = 0;
    }
    
    return cart;
  }

  async addItem(userId, menuItemId, quantity, traceId) {
    // 1. Fetch item details from Restaurant Gateway mapped to DTO
    const itemDetails = await restaurantGateway.getMenuItemDetails(menuItemId, traceId);
    if (!itemDetails) {
      throw new NotFoundError(`Menu item ${menuItemId} not found`);
    }
    
    if (!itemDetails.availability) {
      throw new MenuItemUnavailableError(menuItemId);
    }
    
    // 2. Get current cart
    let cart = await cartRepo.getCart(userId);
    
    if (!cart) {
      cart = {
        user_id: userId,
        restaurant_id: itemDetails.restaurantId,
        items: [],
        version: 1
      };
    }
    
    // 3. Single Restaurant Policy check
    if (cart.restaurant_id !== itemDetails.restaurantId && cart.items.length > 0) {
      throw new CartConflictError(cart.restaurant_id, itemDetails.restaurantId, cart.restaurant_id);
    }
    
    // 4. Update cart
    cart.restaurant_id = itemDetails.restaurantId;
    
    const existingItem = cart.items.find(i => i.menu_item_id === menuItemId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ menu_item_id: menuItemId, quantity });
    }
    
    cart.subtotal_snapshot = 0; 
    
    // 6. Save
    await cartRepo.saveCart(cart);
    
    // 7. Publish Domain Event
    eventPublisher.publish('ItemAddedToCart', { userId, menuItemId, quantity, traceId });
    
    return this.getCart(userId, traceId);
  }

  async updateItemQuantity(userId, menuItemId, quantity, traceId) {
    let cart = await cartRepo.getCart(userId);
    if (!cart) throw new NotFoundError('Cart not found');
    
    const existingItem = cart.items.find(i => i.menu_item_id === menuItemId);
    if (!existingItem) throw new NotFoundError('Item not in cart');
    
    existingItem.quantity = quantity;
    await cartRepo.saveCart(cart);
    
    eventPublisher.publish('CartItemQuantityUpdated', { userId, menuItemId, quantity, traceId });
    return this.getCart(userId, traceId);
  }

  async removeItem(userId, menuItemId, traceId) {
    let cart = await cartRepo.getCart(userId);
    if (!cart) return null;
    
    cart.items = cart.items.filter(i => i.menu_item_id !== menuItemId);
    
    if (cart.items.length === 0) {
      await cartRepo.clearCart(userId);
      eventPublisher.publish('CartCleared', { userId, traceId });
      return { user_id: userId, items: [], subtotal: 0, restaurant_id: null, version: cart.version + 1 };
    }
    
    await cartRepo.saveCart(cart);
    eventPublisher.publish('ItemRemovedFromCart', { userId, menuItemId, traceId });
    return this.getCart(userId, traceId);
  }

  async clearCart(userId, traceId) {
    await cartRepo.clearCart(userId);
    eventPublisher.publish('CartCleared', { userId, traceId });
  }
}
