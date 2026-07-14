import pool from '../../config/database.js';

// ─────────────────────────────────────────────
// SUPPORT TICKET REPOSITORY
// ─────────────────────────────────────────────

export const createTicket = async ({
  ticket_number,
  customer_id,
  order_id,
  restaurant_id,
  merchant_id,
  driver_id,
  issue_type,
  description,
  priority,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO support_tickets
      (ticket_number, customer_id, order_id, restaurant_id, merchant_id, driver_id, issue_type, description, priority)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      ticket_number,
      customer_id,
      order_id || null,
      restaurant_id || null,
      merchant_id || null,
      driver_id || null,
      issue_type,
      description,
      priority || 'MEDIUM',
    ],
  );
  return rows[0];
};

export const getAllTickets = async ({
  status,
  priority,
  customer_id,
  page = 1,
  limit = 50,
} = {}) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  let i = 1;

  if (status) {
    conditions.push(`t.status = $${i++}`);
    params.push(status);
  }
  if (priority) {
    conditions.push(`t.priority = $${i++}`);
    params.push(priority);
  }
  if (customer_id) {
    conditions.push(`t.customer_id = $${i++}`);
    params.push(customer_id);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT
       t.*,
       c.full_name  AS customer_name, c.email AS customer_email,
       r.name       AS restaurant_name,
       o.status     AS order_status, o.total AS order_total,
       aa.full_name AS assigned_admin_name
     FROM support_tickets t
     LEFT JOIN users c   ON t.customer_id = c.id
     LEFT JOIN restaurants r ON t.restaurant_id = r.id
     LEFT JOIN orders o  ON t.order_id = o.id
     LEFT JOIN users aa  ON t.assigned_admin = aa.id
     ${where}
     ORDER BY
       CASE t.priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END,
       t.created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset],
  );
  return rows;
};

export const findTicketById = async (id) => {
  const { rows } = await pool.query(
    `SELECT
       t.*,
       c.full_name  AS customer_name, c.email AS customer_email,
       r.name       AS restaurant_name,
       o.status     AS order_status, o.total AS order_total, o.subtotal AS order_subtotal,
       sh.full_name AS driver_name, sh.email AS driver_email,
       aa.full_name AS assigned_admin_name
     FROM support_tickets t
     LEFT JOIN users c    ON t.customer_id = c.id
     LEFT JOIN restaurants r ON t.restaurant_id = r.id
     LEFT JOIN orders o   ON t.order_id = o.id
     LEFT JOIN users sh   ON t.driver_id = sh.id
     LEFT JOIN users aa   ON t.assigned_admin = aa.id
     WHERE t.id = $1`,
    [id],
  );
  return rows[0] || null;
};

export const updateTicket = async (id, { status, priority, assigned_admin, internal_notes }) => {
  const { rows } = await pool.query(
    `UPDATE support_tickets
     SET
       status         = COALESCE($1, status),
       priority       = COALESCE($2, priority),
       assigned_admin = COALESCE($3, assigned_admin),
       internal_notes = COALESCE($4, internal_notes),
       updated_at     = NOW()
     WHERE id = $5
     RETURNING *`,
    [status, priority, assigned_admin, internal_notes, id],
  );
  return rows[0] || null;
};

export const getTicketStats = async () => {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*)                                          AS total_tickets,
      COUNT(*) FILTER (WHERE status = 'OPEN')          AS open_tickets,
      COUNT(*) FILTER (WHERE status = 'IN_PROGRESS')   AS in_progress_tickets,
      COUNT(*) FILTER (WHERE status = 'RESOLVED')      AS resolved_tickets,
      COUNT(*) FILTER (WHERE priority = 'URGENT')      AS urgent_tickets
    FROM support_tickets
  `);
  return rows[0];
};

export const generateTicketNumber = async () => {
  const { rows } = await pool.query(
    `SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 'TK-(\\d+)') AS INTEGER)), 0) + 1 AS next_num FROM support_tickets`,
  );
  const num = String(rows[0].next_num).padStart(6, '0');
  return `TK-${num}`;
};
