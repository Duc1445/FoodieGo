import { api } from '../api/api';
import type { Food } from './food.api';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Shape returned by the order-service cart endpoints. */
export interface BackendCart {
  user_id: string;
  restaurant_id: string | null;
  items: { menu_item_id: string; quantity: number }[];
  subtotal: number;
  version: number;
}

/** Enriched cart item — a Food object augmented with a backend quantity. */
export interface CartItem extends Food {
  quantity: number;
}

// ─── API ────────────────────────────────────────────────────────────────────

export const CartAPI = {
  /**
   * GET /cart → enriches items with live restaurant menu.
   * Returns droppedCount = number of backend items whose menu_item_id was not
   * found in the restaurant menu (item removed from menu since cart was saved).
   */
  getWithEnrichment: async (): Promise<{
    backendCart: BackendCart;
    enrichedItems: CartItem[];
    droppedCount: number;
  }> => {
    const res = await api.get<{ data: BackendCart }>('/cart');
    const backendCart = res.data.data;

    if (!backendCart.restaurant_id || backendCart.items.length === 0) {
      return { backendCart, enrichedItems: [], droppedCount: 0 };
    }

    // One menu fetch per loadCart — no per-item requests.
    const menuRes = await api.get<{ data: { items?: Food[] }[] }>(
      `/restaurants/${backendCart.restaurant_id}/menu`
    );
    const allFoods: Food[] = menuRes.data.data.flatMap((cat) => cat.items ?? []);
    const foodMap = new Map<string, Food>(allFoods.map((f) => [f.id, f]));

    const enrichedItems: CartItem[] = [];
    let droppedCount = 0;

    for (const item of backendCart.items) {
      const food = foodMap.get(item.menu_item_id);
      if (!food) {
        droppedCount++;
        continue; // item no longer in restaurant menu
      }
      enrichedItems.push({ ...food, quantity: item.quantity });
    }

    return { backendCart, enrichedItems, droppedCount };
  },

  /** PUT /cart/items — returns updated BackendCart. */
  addItem: async (menuItemId: string, quantity: number): Promise<BackendCart> => {
    const res = await api.put<{ data: BackendCart }>('/cart/items', {
      menuItemId: menuItemId,
      quantity,
    });
    return res.data.data;
  },

  /** PATCH /cart/items/:id — returns updated BackendCart. */
  updateItem: async (menuItemId: string, quantity: number): Promise<BackendCart> => {
    const res = await api.patch<{ data: BackendCart }>(`/cart/items/${menuItemId}`, { quantity });
    return res.data.data;
  },

  /** DELETE /cart/items/:id — returns updated BackendCart. */
  removeItem: async (menuItemId: string): Promise<BackendCart> => {
    const res = await api.delete<{ data: BackendCart }>(`/cart/items/${menuItemId}`);
    return res.data.data;
  },

  /** DELETE /cart — best-effort, returns void. */
  clearCart: async (): Promise<void> => {
    await api.delete('/cart');
  },
};
