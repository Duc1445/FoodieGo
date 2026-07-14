import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://foodiego:foodiego123@localhost:5432/foodiego',
});

async function verify() {
  console.log('\n=== Starting Demo Data Verification ===');
  let hasError = false;

  const assert = (condition, message) => {
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      hasError = true;
    } else {
      console.log(`✅ PASSED: ${message}`);
    }
  };

  try {
    // 1. Basic Counts
    const { rows: users } = await pool.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    let adminCount = 0, customerCount = 0, merchantCount = 0, driverCount = 0;
    users.forEach(u => {
      if (u.role === 'admin') adminCount = parseInt(u.count);
      if (u.role === 'customer') customerCount = parseInt(u.count);
      if (u.role === 'merchant') merchantCount = parseInt(u.count);
      if (u.role === 'driver') driverCount = parseInt(u.count);
    });
    
    const totalUsers = adminCount + customerCount + merchantCount + driverCount;
    assert(totalUsers === 20, `Total Users = 20 (Actual: ${totalUsers})`);
    assert(adminCount === 1, `Admins = 1 (Actual: ${adminCount})`);
    assert(customerCount === 10, `Customers = 10 (Actual: ${customerCount})`);
    assert(merchantCount === 6, `Merchants = 6 (Actual: ${merchantCount})`);
    assert(driverCount === 3, `Drivers = 3 (Actual: ${driverCount})`);

    const { rows: restaurants } = await pool.query('SELECT COUNT(*) FROM restaurants');
    assert(parseInt(restaurants[0].count) === 6, `Restaurants = 6 (Actual: ${restaurants[0].count})`);

    const { rows: menus } = await pool.query('SELECT COUNT(*) FROM menu_items');
    assert(parseInt(menus[0].count) >= 30, `Menu Items >= 30 (Actual: ${menus[0].count})`);

    const { rows: orders } = await pool.query('SELECT COUNT(*) FROM orders');
    assert(parseInt(orders[0].count) >= 100, `Orders >= 100 (Actual: ${orders[0].count})`);

    // 2. Merchant Isolation Check (Will be enforced by backend logic)
    // We just verify that all orders belong to restaurants owned by merchants
    const { rows: invalidOrders } = await pool.query(`
      SELECT o.id FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      LEFT JOIN user_restaurants ur ON ur.restaurant_id = r.id
      WHERE ur.user_id IS NULL
    `);
    assert(invalidOrders.length === 0, `All orders belong to a restaurant owned by a merchant`);

    // 3. All restaurants have orders
    const { rows: emptyRestaurants } = await pool.query(`
      SELECT r.id FROM restaurants r
      LEFT JOIN orders o ON o.restaurant_id = r.id
      WHERE o.id IS NULL
    `);
    assert(emptyRestaurants.length === 0, `All restaurants have orders`);

    // 4. All drivers have completed deliveries
    const { rows: driverDeliveries } = await pool.query(`
      SELECT driver_id, COUNT(*) FROM delivery WHERE status = 'delivered' GROUP BY driver_id
    `);
    assert(driverDeliveries.length === 3, `All 3 drivers have completed deliveries (Actual drivers with completed: ${driverDeliveries.length})`);

    // 5. Completed deliveries == completed orders
    const { rows: completedOrders } = await pool.query(`SELECT COUNT(*) FROM orders WHERE status = 'COMPLETED'`);
    const { rows: completedDeliveries } = await pool.query(`SELECT COUNT(*) FROM delivery WHERE status = 'delivered'`);
    assert(
      parseInt(completedOrders[0].count) === parseInt(completedDeliveries[0].count),
      `Completed Deliveries (${completedDeliveries[0].count}) == Completed Orders (${completedOrders[0].count})`
    );

    // 6. All menu category_id valid
    const { rows: invalidMenus } = await pool.query(`
      SELECT m.id FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE c.id IS NULL
    `);
    assert(invalidMenus.length === 0, `All menu items have valid category_id`);

    // 7. All coordinates inside Da Nang bounds
    // Da Nang approx bounds: Lat 15.9 to 16.2, Lng 107.8 to 108.4
    const { rows: invalidLocs } = await pool.query(`
      SELECT name, latitude, longitude FROM restaurants 
      WHERE latitude < 15.9 OR latitude > 16.2 OR longitude < 107.8 OR longitude > 108.4
    `);
    assert(invalidLocs.length === 0, `All restaurants coordinates inside Da Nang bounds`);

  } catch (err) {
    console.error('Verification failed due to error:', err);
    hasError = true;
  } finally {
    await pool.end();
  }

  console.log('=======================================');
  if (hasError) {
    console.error('❌ Verification FAILED.');
    process.exit(1);
  } else {
    console.log('✅ Verification PASSED perfectly.');
    process.exit(0);
  }
}

verify();
