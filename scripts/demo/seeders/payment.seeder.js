import { PaymentMapper } from '../mappers/payment.mapper.js';

export async function seedPayments(pool, data) {
  console.log('[Demo] Seeding Payments...');
  for (const payment of data) {
    const values = PaymentMapper.toDb(payment);
    await pool.query(
      `INSERT INTO payments (id, order_id, amount, currency, payment_method, status, idempotency_key, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET 
         status = EXCLUDED.status`,
      values
    );
  }
}
