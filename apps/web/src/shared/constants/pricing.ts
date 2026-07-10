import { CartItem } from '../stores/useCartStore';

export const PRICING = {
  DELIVERY_FEE: 15000,
  FREE_DELIVERY_THRESHOLD: 300000,
  VAT_RATE: 0
};

export const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const calculateDeliveryFee = (subtotal: number): number => {
  return subtotal >= PRICING.FREE_DELIVERY_THRESHOLD ? 0 : PRICING.DELIVERY_FEE;
};

export const calculateTotal = (subtotal: number, deliveryFee: number): number => {
  return subtotal + deliveryFee;
};
