import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Food } from '../services/food.api';

export interface CartItem extends Food {
  quantity: number;
}

export interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
  cartVersion: number;
  addItem: (food: Food, quantity: number, restaurant: { id: string; name: string }) => boolean;
  removeItem: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: null,
      items: [],
      cartVersion: 1,
      
      addItem: (food, quantity, restaurant) => {
        if (food.is_available === false) {
          return false;
        }

        const { restaurantId, items } = get();
        
        // Check if adding from a different restaurant
        if (restaurantId && restaurantId !== restaurant.id) {
          return false;
        }

        const existingItem = items.find((item) => item.id === food.id);
        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === food.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            items: [...items, { ...food, quantity }],
          });
        }
        return true;
      },

      removeItem: (foodId) => {
        const { items } = get();
        const newItems = items.filter((item) => item.id !== foodId);
        if (newItems.length === 0) {
          set({ restaurantId: null, restaurantName: null, items: [] });
        } else {
          set({ items: newItems });
        }
      },

      updateQuantity: (foodId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(foodId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === foodId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ restaurantId: null, restaurantName: null, items: [], cartVersion: 1 }),
      
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      
      getTotalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'foodiego-cart-storage',
    }
  )
);
