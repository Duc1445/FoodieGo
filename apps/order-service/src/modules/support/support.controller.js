import * as supportRepo from './support.repository.js';

export const createTicketHandler = async (req, res, next) => {
  try {
    const { order_id, restaurant_id, merchant_id, shipper_id, issue_type, description, priority } =
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
      shipper_id,
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
    const { status, priority, assigned_admin, internal_notes } = req.body;
    const ticket = await supportRepo.updateTicket(req.params.id, {
      status,
      priority,
      assigned_admin,
      internal_notes,
    });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
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
