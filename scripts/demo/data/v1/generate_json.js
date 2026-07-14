import fs from 'fs';
import { randomUUID } from 'crypto';

const customerId = '00000000-0000-4000-0000-222222222222';
const restaurantId = '00000000-0000-4000-1111-000000000001';
const driverId = '00000000-0000-4000-0000-444444444444';
const addressId = '00000000-0000-4000-9999-000000000001';

const menuItems = [
  { id: '00000000-0000-4000-3333-000000000001', name: 'Pho Beef Special', price: 60000 },
  { id: '00000000-0000-4000-3333-000000000002', name: 'Iced Milk Coffee', price: 25000 }
];

const statuses = [
  'CREATED', 'CREATED',
  'CONFIRMED', 'CONFIRMED',
  'PREPARING', 'PREPARING',
  'READY', 'READY',
  'ASSIGNED', 'ASSIGNED',
  'PICKED_UP', 'PICKED_UP',
  'DELIVERING', 'DELIVERING',
  'DELIVERED', 'DELIVERED', 'DELIVERED', 'DELIVERED', 'DELIVERED', 'DELIVERED', 'DELIVERED', 'DELIVERED',
  'CANCELLED', 'CANCELLED',
  'PAYMENT_FAILED', 'PAYMENT_FAILED'
];

const orders = [];
const deliveries = [];
const payments = [];

statuses.forEach((status, i) => {
  const orderId = randomUUID();
  
  // Decide items
  const items = [];
  let subtotal = 0;
  if (i % 2 === 0) {
    items.push({ id: randomUUID(), order_id: orderId, menu_item_id: menuItems[0].id, name: menuItems[0].name, quantity: 2, unit_price: menuItems[0].price, total_price: menuItems[0].price * 2 });
    subtotal += menuItems[0].price * 2;
  } else {
    items.push({ id: randomUUID(), order_id: orderId, menu_item_id: menuItems[0].id, name: menuItems[0].name, quantity: 1, unit_price: menuItems[0].price, total_price: menuItems[0].price });
    items.push({ id: randomUUID(), order_id: orderId, menu_item_id: menuItems[1].id, name: menuItems[1].name, quantity: 1, unit_price: menuItems[1].price, total_price: menuItems[1].price });
    subtotal += menuItems[0].price + menuItems[1].price;
  }

  const deliveryFee = 15000;
  const total = subtotal + deliveryFee;

  // Fake timestamp over the last 30 days
  const date = new Date();
  date.setDate(date.getDate() - (i % 30));

  orders.push({
    id: orderId,
    user_id: customerId,
    restaurant_id: restaurantId,
    status: status,
    subtotal: subtotal,
    delivery_fee: deliveryFee,
    total: total,
    created_at: date.toISOString(),
    items
  });

  // Payments
  if (status !== 'CREATED' && status !== 'PAYMENT_FAILED') {
    payments.push({
      id: randomUUID(),
      order_id: orderId,
      amount: total,
      method: 'credit_card',
      status: 'completed',
      idempotency_key: randomUUID(),
      created_at: date.toISOString()
    });
  } else if (status === 'PAYMENT_FAILED') {
    payments.push({
      id: randomUUID(),
      order_id: orderId,
      amount: total,
      method: 'credit_card',
      status: 'failed',
      idempotency_key: randomUUID(),
      created_at: date.toISOString()
    });
  }

  // Deliveries
  const deliveryStatusMap = {
    'READY': 'waiting',
    'ASSIGNED': 'accepted',
    'PICKED_UP': 'delivering',
    'DELIVERING': 'delivering',
    'DELIVERED': 'delivered'
  };

  if (deliveryStatusMap[status]) {
    const dStatus = deliveryStatusMap[status];
    deliveries.push({
      id: randomUUID(),
      order_id: orderId,
      driver_id: dStatus !== 'waiting' ? driverId : null,
      status: dStatus,
      pickup_address: '123 Restaurant St',
      delivery_address: '456 Customer Ave',
      created_at: date.toISOString(),
      updated_at: date.toISOString()
    });
  }
});

fs.writeFileSync('d:/CMU-SE 433/Group Project/foodiego_update/FoodieGo/scripts/demo/data/v1/orders.json', JSON.stringify(orders, null, 2));
fs.writeFileSync('d:/CMU-SE 433/Group Project/foodiego_update/FoodieGo/scripts/demo/data/v1/payments.json', JSON.stringify(payments, null, 2));
fs.writeFileSync('d:/CMU-SE 433/Group Project/foodiego_update/FoodieGo/scripts/demo/data/v1/deliveries.json', JSON.stringify(deliveries, null, 2));

console.log('JSON data generated!');
