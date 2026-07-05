import pool from '../config/database.js';

export const EmployeeModel = {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT * FROM employees ORDER BY created_at DESC`
    );
    return rows;
  },

  async create({ name, role, salary }) {
    const { rows } = await pool.query(
      `INSERT INTO employees (id, name, role, salary)
       VALUES (gen_random_uuid(), $1, $2, $3)
       RETURNING *`,
      [name, role, salary || 0]
    );
    return rows[0];
  },

  async update(id, { name, role, salary }) {
    const { rows } = await pool.query(
      `UPDATE employees
       SET name = COALESCE($1, name),
           role = COALESCE($2, role),
           salary = COALESCE($3, salary),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, role, salary, id]
    );
    return rows[0] || null;
  },

  async remove(id) {
    const { rowCount } = await pool.query(
      'DELETE FROM employees WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }
};
