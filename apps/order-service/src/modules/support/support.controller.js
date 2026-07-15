import * as supportRepo from './support.repository.js';

export const createTicketHandler = async (req, res, next) => {
  try {
    const { order_id, restaurant_id, merchant_id, driver_id, issue_type, description, priority } =
      req.body;
    const customer_id = req.user?.id || req.body.customer_id;

    if (!issue_type || !description) {
      return res
        .status(400)
        .json({ success: false, message: 'issue_type and description are required' });
    }

    const VALID_TYPES = [
      'ORDER_CANCELLED',
      'LATE_DELIVERY',
      'MISSING_ITEM',
      'WRONG_ITEM',
      'PAYMENT_ISSUE',
      'REFUND_REQUEST',
      'RESTAURANT_COMPLAINT',
      'SHIPPER_COMPLAINT',
      'OTHER',
    ];
    if (!VALID_TYPES.includes(issue_type)) {
      return res.status(400).json({ success: false, message: 'Invalid issue_type' });
    }

    const ticket_number = await supportRepo.generateTicketNumber();
    const ticket = await supportRepo.createTicket({
      ticket_number,
      customer_id,
      order_id,
      restaurant_id,
      merchant_id,
      driver_id,
      issue_type,
      description,
      priority,
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

// ─── Admin-only handlers ────────────────────────────────────────────────────

export const getAllTicketsHandler = async (req, res, next) => {
  try {
    const { status, priority, customer_id, page = 1, limit = 50 } = req.query;
    const tickets = await supportRepo.getAllTickets({
      status,
      priority,
      customer_id,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
};

export const getTicketByIdHandler = async (req, res, next) => {
  try {
    const ticket = await supportRepo.findTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

export const updateTicketHandler = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const existingTicket = await supportRepo.findTicketById(ticketId);

    if (!existingTicket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const { status, priority, assigned_admin, internal_notes } = req.body;

    if (existingTicket.status === 'CLOSED') {
      return res.status(403).json({ success: false, message: 'CLOSED tickets are read-only' });
    }

    if (status && status !== existingTicket.status) {
      const transitions = {
        OPEN: ['IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED'],
        IN_PROGRESS: ['WAITING_USER', 'RESOLVED', 'CLOSED'],
        WAITING_USER: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        RESOLVED: ['CLOSED', 'IN_PROGRESS'], // Re-open support
      };

      const allowed = transitions[existingTicket.status] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot transition ticket from ${existingTicket.status} to ${status}`,
        });
      }
    }
    const ticket = await supportRepo.updateTicket(ticketId, {
      status,
      priority,
      assigned_admin,
      internal_notes,
    });
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

export const getTicketStatsHandler = async (req, res, next) => {
  try {
    const stats = await supportRepo.getTicketStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};
