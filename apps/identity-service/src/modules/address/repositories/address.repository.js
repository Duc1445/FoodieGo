import pool from '../../../config/database.js';
import { AddressEntity } from '../entities/address.entity.js';
import { InfrastructureError } from '@foodiego/core';

export class AddressRepository {
  async findByUserId(userId) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT * FROM addresses 
        WHERE user_id = $1 AND is_active = true 
        ORDER BY is_default DESC, created_at DESC
      `;
      const result = await client.query(query, [userId]);
      return result.rows.map((row) => new AddressEntity(row));
    } finally {
      client.release();
    }
  }

  async countActiveByUserId(userId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT COUNT(*) FROM addresses WHERE user_id = $1 AND is_active = true',
        [userId],
      );
      return parseInt(result.rows[0].count, 10);
    } finally {
      client.release();
    }
  }

  async create(userId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // If setting as default, unset others
      if (data.isDefault) {
        await client.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
      } else {
        // If it's the first active address, make it default automatically
        const count = await this.countActiveByUserId(userId);
        if (count === 0) data.isDefault = true;
      }

      const query = `
        INSERT INTO addresses (user_id, address, phone, is_default)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const result = await client.query(query, [
        userId,
        data.address,
        data.phone,
        data.isDefault || false,
      ]);

      await client.query('COMMIT');
      return new AddressEntity(result.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw new InfrastructureError(`Failed to create address: ${err.message}`);
    } finally {
      client.release();
    }
  }

  async update(addressId, userId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify ownership AND active status
      const checkResult = await client.query(
        'SELECT id FROM addresses WHERE id = $1 AND user_id = $2 AND is_active = true',
        [addressId, userId],
      );
      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null; // Not found or unauthorized
      }

      // If setting as default, unset others
      if (data.isDefault) {
        await client.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
      }

      const updates = [];
      const values = [];
      let idx = 1;

      if (data.address !== undefined) {
        updates.push(`address = $${idx++}`);
        values.push(data.address);
      }
      if (data.phone !== undefined) {
        updates.push(`phone = $${idx++}`);
        values.push(data.phone);
      }
      if (data.isDefault !== undefined) {
        updates.push(`is_default = $${idx++}`);
        values.push(data.isDefault);
      }

      updates.push(`updated_at = NOW()`);

      values.push(addressId);
      values.push(userId);

      const query = `
        UPDATE addresses 
        SET ${updates.join(', ')}
        WHERE id = $${idx} AND user_id = $${idx + 1} AND is_active = true
        RETURNING *
      `;
      const result = await client.query(query, values);

      await client.query('COMMIT');
      return new AddressEntity(result.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw new InfrastructureError(`Failed to update address: ${err.message}`);
    } finally {
      client.release();
    }
  }

  async softDelete(addressId, userId) {
    const client = await pool.connect();
    try {
      const query = `
        UPDATE addresses 
        SET is_active = false, is_default = false, updated_at = NOW()
        WHERE id = $1 AND user_id = $2 AND is_active = true
        RETURNING id
      `;
      const result = await client.query(query, [addressId, userId]);
      return result.rows.length > 0;
    } finally {
      client.release();
    }
  }
}
