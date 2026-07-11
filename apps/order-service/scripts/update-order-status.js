// DEVELOPMENT ONLY
// DO NOT USE IN PRODUCTION
// This script is a developer tool to safely simulate order status transitions.
// It reuses the OrderService to validate state machine rules.

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables for the database connection
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { OrderService } from '../src/modules/order/services/order.service.js';
import pool from '../src/config/database.js';

// Parse CLI arguments
const args = process.argv.slice(2);
let orderId = null;
let newStatus = null;

args.forEach((arg) => {
  if (arg.startsWith('--order=')) {
    orderId = arg.split('=')[1];
  } else if (arg.startsWith('--status=')) {
    newStatus = arg.split('=')[1];
  }
});

if (!orderId || !newStatus) {
  console.error('Usage: node update-order-status.js --order=<ORDER_ID> --status=<STATUS>');
  process.exit(1);
}

const run = async () => {
  console.log('\n================================');
  console.log('FoodieGo Order Status Update');
  console.log('================================\n');

  console.log(`Order ID:\n${orderId}\n`);

  const orderService = new OrderService();

  try {
    // We will bypass the initial role check by calling changeOrderStatus with 'merchant' role
    // First, let's get current status to print it
    const orderRepo = new (
      await import('../src/modules/order/repositories/order.repository.js')
    ).OrderRepository();
    const currentOrder = await orderRepo.findOrderDetailById(orderId);

    if (!currentOrder) {
      console.log(`Error: Order not found\n================================\n`);
      process.exit(1);
    }

    console.log(`Current Status:\n${currentOrder.status}\n`);
    console.log(`New Status:\n${newStatus}\n`);
    console.log(`Transition:\n${currentOrder.status} -> ${newStatus}\n`);

    // Using the official service method that respects OrderStateMachine
    await orderService.changeOrderStatus(orderId, newStatus, 'merchant');

    console.log(`Result:\nSUCCESS\n`);
    console.log(`================================\n`);
  } catch (error) {
    console.error(`Result:\nFAILED - ${error.message}\n`);
    console.log(`================================\n`);
    process.exit(1);
  } finally {
    await pool.end(); // close db connection
  }
};

run();
