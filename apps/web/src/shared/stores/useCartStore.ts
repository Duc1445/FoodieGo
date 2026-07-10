import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Food } from '../services/food.api';

export interface CartItem extends Food {
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  restaurant: {
    id: string | null;
    name: string | null;
  };
  summary: {
    totalItems: number;
    totalPrice: number;
  };
  version: number | null;
  actions: {
    addItem: (food: Food, quantity: number, restaurant: { id: string; name: string }) => boolean;
    removeItem: (foodId: string) => void;
    updateQuantity: (foodId: string, quantity: number) => void;
    clearCart: () => void;
  };
}

const calculateSummary = (items: CartItem[]) => ({
  totalItems: items.reduce((total, item) => total + item.quantity, 0),
  totalPrice: items.reduce((total, item) => total + item.price * item.quantity, 0),
});

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurant: {
        id: null,
        name: null,
      },
      summary: {
        totalItems: 0,
        totalPrice: 0,
      },
      version: null,
      actions: {
        addItem: (food, quantity, restaurant) => {
          if (food.is_available === false) {
            return false;
          }

          const state = get();
          const { id: currentRestaurantId } = state.restaurant;
          const { items } = state;
          
          if (currentRestaurantId && currentRestaurantId !== restaurant.id) {
            return false;
          }

          const existingItem = items.find((item) => item.id === food.id);
          let newItems: CartItem[];
          
          if (existingItem) {
            newItems = items.map((item) =>
              item.id === food.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newItems = [...items, { ...food, quantity }];
          }

          set({
            items: newItems,
            restaurant: {
              id: restaurant.id,
              name: restaurant.name,
            },
            summary: calculateSummary(newItems),
          });
          
          return true;
        },

        removeItem: (foodId) => {
          const { items } = get();
          const newItems = items.filter((item) => item.id !== foodId);
          if (newItems.length === 0) {
            set({ 
              items: [],
              restaurant: { id: null, name: null },
              summary: { totalItems: 0, totalPrice: 0 }
            });
          } else {
            set({ 
              items: newItems,
              summary: calculateSummary(newItems)
            });
          }
        },

        updateQuantity: (foodId, quantity) => {
          if (quantity <= 0) {
            get().actions.removeItem(foodId);
            return;
          }
          const newItems = get().items.map((item) =>
            item.id === foodId ? { ...item, quantity } : item
          );
          set({
            items: newItems,
            summary: calculateSummary(newItems)
          });
        },

        clearCart: () => set({ 
          items: [],
          restaurant: { id: null, name: null },
          summary: { totalItems: 0, totalPrice: 0 },
          version: null
        }),
      }
    }),
    {
      name: 'foodiego-cart-storage',
      partialize: (state) => ({
        items: state.items,
        restaurant: state.restaurant,
        summary: state.summary,
        version: state.version,
      }),
    }
  )
);
