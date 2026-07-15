import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { calculateSubtotal } from '../constants/pricing';
import type { Food } from '../services/food.api';
import { CartAPI, type BackendCart, type CartItem } from '../services/cart.api';
import { RestaurantAPI } from '../services/restaurant.api';
import { useAuthStore } from './useAuthStore';

// Re-export CartItem so existing consumers (pricing.ts was the old importer) remain unaffected
// if any component still imports it from here.
export type { CartItem };

// ─── State Shape ─────────────────────────────────────────────────────────────

interface CartSummary {
  totalItems: number;
  totalPrice: number;
}

export interface CartState {
  items: CartItem[];
  restaurant: { id: string | null; name: string | null };
  summary: CartSummary;
  /** Comes ONLY from backend. Never incremented locally. */
  version: number | null;
  /** True while GET /cart or DELETE /cart is in-flight. */
  isLoadingCart: boolean;
  /** IDs of food items whose individual mutation is in-flight. */
  pendingItemIds: string[];
  actions: {
    /** Fetch cart from backend, enrich items, hydrate store. */
    loadCart: () => Promise<void>;
    /** Returns true on success, false if restaurant conflict (triggers Dialog). Throws on API error. */
    addItem: (food: Food, quantity: number, restaurant: { id: string; name: string }) => Promise<boolean>;
    removeItem: (foodId: string) => Promise<void>;
    updateQuantity: (foodId: string, quantity: number) => Promise<void>;
    /** Calls DELETE /cart on backend, then resets store. */
    clearCart: () => Promise<void>;
    /** Immediately resets all cart state — used by logout (no API call). */
    reset: () => void;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const calculateSummary = (items: CartItem[]): CartSummary => ({
  totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  totalPrice: calculateSubtotal(items),
});

const EMPTY_STATE = {
  items: [] as CartItem[],
  restaurant: { id: null, name: null },
  summary: { totalItems: 0, totalPrice: 0 },
  version: null,
};

/**
 * Rebuild CartItem[] from a backend cart response using a Map of known items.
 * Backend is always the source of truth for quantities and which items exist.
 *
 * Returns needsRefresh = true if any backend menu_item_id cannot be resolved
 * from the existing Map (item was added externally or store is stale).
 */
function rebuildFromResponse(
  backendItems: BackendCart['items'],
  knownItems: CartItem[]
): { newItems: CartItem[]; needsRefresh: boolean } {
  if (backendItems.length === 0) return { newItems: [], needsRefresh: false };

  const existingMap = new Map<string, CartItem>(knownItems.map((i) => [i.id, i]));
  const newItems: CartItem[] = [];

  for (const b of backendItems) {
    const known = existingMap.get(b.menu_item_id);
    if (!known) return { newItems: [], needsRefresh: true };
    // Backend quantity is always authoritative — never use local value
    newItems.push({ ...known, quantity: b.quantity });
  }

  return { newItems, needsRefresh: false };
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...EMPTY_STATE,
      isLoadingCart: false,
      pendingItemIds: [],

      actions: {
        // ── loadCart ──────────────────────────────────────────────────────────
        loadCart: async () => {
          if (get().isLoadingCart) return; // prevent concurrent loads
          set({ isLoadingCart: true });
          try {
            const { backendCart, enrichedItems, droppedCount } = await CartAPI.getWithEnrichment();

            if (droppedCount > 0) {
              toast.warning('Some items are no longer available and were removed from your cart.');
            }

            // Fetch restaurant name only when necessary
            let restaurantName: string | null = null;
            if (backendCart.restaurant_id) {
              const current = get().restaurant;
              if (current.id === backendCart.restaurant_id && current.name) {
                restaurantName = current.name; // reuse cached name — no extra request
              } else {
                const r = await RestaurantAPI.getRestaurantById(backendCart.restaurant_id);
                restaurantName = r.name;
              }
            }

            set({
              items: enrichedItems,
              restaurant: { id: backendCart.restaurant_id, name: restaurantName },
              summary: calculateSummary(enrichedItems),
              version: backendCart.version,
              isLoadingCart: false,
            });
          } catch (err: unknown) {
            set({ isLoadingCart: false });
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 401) {
              // Session expired — reset cart immediately and logout
              set(EMPTY_STATE);
              localStorage.removeItem('foodiego-auth-token');
              useAuthStore.getState().logout('customer');
            } else {
              // Network / 500 — keep current (persisted) state, show toast
              toast.error('Could not sync cart. Showing last known state.');
            }
          }
        },

        // ── addItem ───────────────────────────────────────────────────────────
        addItem: async (food, quantity, restaurant) => {
          if (food.status !== 'AVAILABLE') return false;

          const { restaurant: currentRestaurant } = get();
          // Frontend conflict check — returns false to trigger Dialog in caller
          if (currentRestaurant.id && currentRestaurant.id !== restaurant.id) return false;

          set((s) => ({ pendingItemIds: [...s.pendingItemIds, food.id] }));
          try {
            const backendCart = await CartAPI.addItem(food.id, quantity);

            // Build Map of known items, including the item just added
            const knownItems: CartItem[] = [
              ...get().items.filter((i) => i.id !== food.id),
              { ...food, quantity: 0 }, // placeholder — backend quantity overwrites
            ];

            const { newItems, needsRefresh } = rebuildFromResponse(backendCart.items, knownItems);

            if (needsRefresh) {
              // An unresolvable item means the store is stale — do a full re-fetch
              await get().actions.loadCart();
            } else {
              set({
                items: newItems,
                restaurant: { id: restaurant.id, name: restaurant.name },
                summary: calculateSummary(newItems),
                version: backendCart.version,
              });
            }
            return true;
          } finally {
            set((s) => ({ pendingItemIds: s.pendingItemIds.filter((id) => id !== food.id) }));
          }
        },

        // ── removeItem ────────────────────────────────────────────────────────
        removeItem: async (foodId) => {
          set((s) => ({ pendingItemIds: [...s.pendingItemIds, foodId] }));
          try {
            const backendCart = await CartAPI.removeItem(foodId);

            if (backendCart.items.length === 0) {
              set({ ...EMPTY_STATE, version: backendCart.version });
              return;
            }

            // Known items excluding the removed one
            const knownItems = get().items.filter((i) => i.id !== foodId);
            const { newItems, needsRefresh } = rebuildFromResponse(backendCart.items, knownItems);

            if (needsRefresh) {
              await get().actions.loadCart();
            } else {
              set({
                items: newItems,
                summary: calculateSummary(newItems),
                version: backendCart.version,
              });
            }
          } finally {
            set((s) => ({ pendingItemIds: s.pendingItemIds.filter((id) => id !== foodId) }));
          }
        },

        // ── updateQuantity ────────────────────────────────────────────────────
        updateQuantity: async (foodId, quantity) => {
          if (quantity <= 0) {
            await get().actions.removeItem(foodId);
            return;
          }

          set((s) => ({ pendingItemIds: [...s.pendingItemIds, foodId] }));
          try {
            const backendCart = await CartAPI.updateItem(foodId, quantity);

            const { newItems, needsRefresh } = rebuildFromResponse(backendCart.items, get().items);

            if (needsRefresh) {
              await get().actions.loadCart();
            } else {
              set({
                items: newItems,
                summary: calculateSummary(newItems),
                version: backendCart.version,
              });
            }
          } finally {
            set((s) => ({ pendingItemIds: s.pendingItemIds.filter((id) => id !== foodId) }));
          }
        },

        // ── clearCart ─────────────────────────────────────────────────────────
        clearCart: async () => {
          set({ isLoadingCart: true });
          try {
            await CartAPI.clearCart();
            set({ ...EMPTY_STATE, isLoadingCart: false });
          } catch (err) {
            set({ isLoadingCart: false });
            throw err; // caller handles and shows toast
          }
        },

        // ── reset ─────────────────────────────────────────────────────────────
        /** Immediate local reset for logout — no API call. */
        reset: () => {
          set({ ...EMPTY_STATE, isLoadingCart: false, pendingItemIds: [] });
        },
      },
    }),
    {
      name: 'foodiego-cart-storage',
      // Transient fields (isLoadingCart, pendingItemIds, actions) are NOT persisted.
      partialize: (state) => ({
        items: state.items,
        restaurant: state.restaurant,
        summary: state.summary,
        version: state.version,
      }),
    }
  )
);
