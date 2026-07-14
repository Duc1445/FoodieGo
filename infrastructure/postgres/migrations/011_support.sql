-- ─────────────────────────────────────────────
-- SUPPORT TICKETS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number   VARCHAR(50) UNIQUE NOT NULL,
  customer_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
  restaurant_id   UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  merchant_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  shipper_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  
  issue_type      VARCHAR(50) NOT NULL,
  description     TEXT NOT NULL,
  priority        VARCHAR(20) DEFAULT 'MEDIUM'
                  CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
                  
  status          VARCHAR(30) DEFAULT 'OPEN'
                  CHECK (status IN ('OPEN', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED')),
                  
  assigned_admin  UUID REFERENCES users(id) ON DELETE SET NULL,
  internal_notes  TEXT,
  
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_customer ON support_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_order ON support_tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_admin ON support_tickets(assigned_admin);

-- ─────────────────────────────────────────────
-- SUPPORT TICKET MESSAGES (Optional/Future proof)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id       UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  message         TEXT NOT NULL,
  is_internal     BOOLEAN DEFAULT false,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_ticket_messages(ticket_id);
