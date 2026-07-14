import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

import { seedUsers } from './seeders/user.seeder.js';
import { seedRestaurants } from './seeders/restaurant.seeder.js';
import { seedMenu } from './seeders/menu.seeder.js';
import { seedOrders } from './seeders/order.seeder.js';
import { seedPayments } from './seeders/payment.seeder.js';
import { seedDeliveries } from './seeders/delivery.seeder.js';
import { seedAddresses, seedPromotions, seedSupportTickets, seedPromotionUsages } from './seeders/misc.seeder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://foodiego:foodiego123@localhost:5432/foodiego',
});

function loadJson(filename) {
  const filepath = path.join(__dirname, 'data', 'v1', filename);
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

async function runDemoSeed() {
  try {
    console.log('=== Starting Demo Seed ===');
    
    // Load Data
    const usersData = loadJson('users.json');
    const addressesData = loadJson('addresses.json');
    const restaurantsData = loadJson('restaurants.json');
    const userRestaurantsData = loadJson('user_restaurants.json');
    const categoriesData = loadJson('categories.json');
    const menuItemsData = loadJson('menu_items.json');
    const promotionsData = loadJson('promotions.json');
    const ordersData = loadJson('orders.json');
    const paymentsData = loadJson('payments.json');
    const deliveriesData = loadJson('deliveries.json');
    const supportTicketsData = loadJson('support_tickets.json');
    let promoUsagesData = [];
    try {
      promoUsagesData = loadJson('promotion_usages.json');
    } catch(e) {}

    // Execute in Dependency Order
    await seedUsers(pool, usersData);
    await seedAddresses(pool, addressesData);
    await seedRestaurants(pool, restaurantsData, userRestaurantsData);
    await seedMenu(pool, categoriesData, menuItemsData);
    await seedPromotions(pool, promotionsData);
    await seedOrders(pool, ordersData);
    await seedPayments(pool, paymentsData);
    await seedDeliveries(pool, deliveriesData);
    await seedSupportTickets(pool, supportTicketsData);
    await seedPromotionUsages(pool, promoUsagesData);

    console.log('\n========================');
    console.log('ADMIN');
    console.log('admin@foodiego.com');
    console.log('password: 123456');
    console.log('========================');
    console.log('MERCHANTS');
    console.log('merchant1@foodiego.com - Cơm Gà Nhà Mộc');
    console.log('merchant2@foodiego.com - Mì Quảng Bếp Trang');
    console.log('merchant3@foodiego.com - Hải Sản Biển Đông');
    console.log('merchant4@foodiego.com - Bún Bò Bà Diệu');
    console.log('merchant5@foodiego.com - Bê Thui Cầu Mống');
    console.log('merchant6@foodiego.com - Bánh Xèo Tôm Nhảy');
    console.log('========================');
    console.log('CUSTOMERS');
    console.log('customer1-10@foodiego.com');
    console.log('password: 123456');
    console.log('========================');
    console.log('DRIVERS');
    console.log('driver1@foodiego.com - Nguyễn Văn An');
    console.log('driver2@foodiego.com - Trần Minh Khoa');
    console.log('driver3@foodiego.com - Lê Quốc Huy');
    console.log('========================');

    console.log('\n=== Demo Seed Completed Successfully ===');
  } catch (err) {
    console.error('Demo seed failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runDemoSeed();
