import { DeliveryMapper } from '../mappers/delivery.mapper.js';

export async function seedDeliveries(pool, data) {
  console.log('[Demo] Seeding Deliveries...');
  for (const delivery of data) {
    const values = DeliveryMapper.toDb(delivery);
    await pool.query(
      `INSERT INTO delivery (id, order_id, driver_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET 
         driver_id = EXCLUDED.driver_id,
         status = EXCLUDED.status,
         updated_at = EXCLUDED.updated_at`,
      values
    );
  }
}
