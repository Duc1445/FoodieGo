import redis from '../../../config/redis.js';
import pool from '../../../config/database.js';

export class CartRepository {
  /**
   * Retrieves cart from Redis. If missing, retrieves from DB and populates Redis.
   */
  async getCart(userId) {
    const redisKey = `cart:${userId}`;
    const cachedCart = await redis.get(redisKey);

    if (cachedCart) {
      return JSON.parse(cachedCart);
    }

    // Cache Miss: Fetch from DB
    const cartResult = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
    if (cartResult.rows.length === 0) {
      return null;
    }

    const cart = cartResult.rows[0];
    const itemsResult = await pool.query('SELECT * FROM cart_items WHERE cart_id = $1', [cart.id]);
    cart.items = itemsResult.rows;

    // Save to Redis (TTL 7 days)
    await redis.set(redisKey, JSON.stringify(cart), 'EX', 7 * 24 * 60 * 60);
    return cart;
  }

  /**
   * Updates or Creates the cart in both Postgres and Redis
   */
  async saveCart(cart) {
    const redisKey = `cart:${cart.user_id}`;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Upsert cart
      const cartQuery = `
        INSERT INTO carts (id, user_id, restaurant_id, currency, subtotal_snapshot)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO UPDATE 
        SET restaurant_id = EXCLUDED.restaurant_id, 
            subtotal_snapshot = EXCLUDED.subtotal_snapshot,
            updated_at = NOW()
        RETURNING *;
      `;
      // Generate ID if missing
      const cartId = cart.id || undefined;

      // If it's an insert without ID, let Postgres generate it (we don't supply $1 if we use default, but here we expect ID or default). Let's fetch ID after upsert.
      // Wait, we need to handle ID gracefully.
      // A better upsert:
      // Calculate expires_at based on env TTL or default 14 days
      const ttlDays = parseInt(process.env.CART_TTL_DAYS || '14', 10);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + ttlDays);

      const upsertCart = await client.query(
        `
        INSERT INTO carts (user_id, restaurant_id, currency, subtotal_snapshot, version, updated_by, expires_at)
        VALUES ($1, $2, 'VND', $3, 1, $4, $5)
        ON CONFLICT (user_id) DO UPDATE 
        SET restaurant_id = EXCLUDED.restaurant_id, 
            subtotal_snapshot = EXCLUDED.subtotal_snapshot, 
            version = carts.version + 1,
            updated_by = EXCLUDED.updated_by,
            expires_at = EXCLUDED.expires_at,
            updated_at = NOW()
        RETURNING id, version;
      `,
        [
          cart.user_id,
          cart.restaurant_id,
          cart.subtotal_snapshot || 0,
          cart.updated_by || cart.user_id,
          expiresAt,
        ],
      );

      cart.id = upsertCart.rows[0].id;
      cart.version = upsertCart.rows[0].version;
      cart.expires_at = expiresAt;

      // Delete existing items
      await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);

      // Insert new items
      if (cart.items && cart.items.length > 0) {
        for (const item of cart.items) {
          await client.query(
            `
            INSERT INTO cart_items (cart_id, menu_item_id, quantity)
            VALUES ($1, $2, $3)
          `,
            [cart.id, item.menu_item_id, item.quantity],
          );
        }
      }

      await client.query('COMMIT');

      // Update Cache
      await redis.set(redisKey, JSON.stringify(cart), 'EX', 7 * 24 * 60 * 60);

      return cart;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Deletes cart
   */
  async clearCart(userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM carts WHERE user_id = $1', [userId]);
      await client.query('COMMIT');

      await redis.del(`cart:${userId}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
