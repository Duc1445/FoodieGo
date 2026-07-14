export async function seedAddresses(pool, data) {
  console.log('[Demo] Seeding Addresses...');
  for (const item of data) {
    await pool.query(
      `INSERT INTO addresses (id, user_id, address, phone, is_default)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET 
         address = EXCLUDED.address,
         phone = EXCLUDED.phone`,
      [item.id, item.user_id, item.address, item.phone, item.is_default]
    );
  }
}

export async function seedPromotions(pool, data) {
  console.log('[Demo] Seeding Promotions...');
  for (const item of data) {
    await pool.query(
      `INSERT INTO promotions (id, code, discount_type, discount_value, min_order_value, valid_from, valid_until, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (code) DO UPDATE SET 
         discount_value = EXCLUDED.discount_value,
         is_active = EXCLUDED.is_active`,
      [item.id, item.code, item.discount_type, item.discount_value, item.min_order_value, item.valid_from, item.valid_until, item.is_active]
    );
  }
}

export async function seedSupportTickets(pool, data) {
  console.log('[Demo] Seeding Support Tickets...');
  for (const item of data) {
    await pool.query(
      `INSERT INTO support_tickets (id, ticket_number, customer_id, merchant_id, driver_id, issue_type, description, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (ticket_number) DO UPDATE SET 
         status = EXCLUDED.status,
         description = EXCLUDED.description`,
      [item.id, item.ticket_number, item.customer_id, item.merchant_id, item.driver_id, item.issue_type, item.description, item.priority, item.status]
    );
  }
}

export async function seedPromotionUsages(pool, data) {
  if (!data) return;
  console.log('[Demo] Seeding Promotion Usages...');
  for (const item of data) {
    await pool.query(
      `INSERT INTO promotion_usages (id, promotion_id, user_id, order_id, discount_value, used_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [item.id, item.promotion_id, item.user_id, item.order_id, item.discount_value, item.used_at]
    );
  }
}
