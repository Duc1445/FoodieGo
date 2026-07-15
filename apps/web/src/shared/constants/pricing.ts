export const PRICING = {
  DELIVERY_FEE: 15000,
  FREE_DELIVERY_THRESHOLD: 300000,
  VAT_RATE: 0
};

export const calculateSubtotal = (items: { price: number; quantity: number }[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const calculateDeliveryFee = (subtotal: number): number => {
  return subtotal >= PRICING.FREE_DELIVERY_THRESHOLD ? 0 : PRICING.DELIVERY_FEE;
};

export const calculateTotal = (subtotal: number, deliveryFee: number): number => {
  return subtotal + deliveryFee;
};

export const formatVnd = (value: number): string => {
  return `${Math.round(value).toLocaleString('en-US')} VND`;
};
