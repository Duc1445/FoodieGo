import { Router } from 'express';
import { param, body, query } from 'express-validator';
import { authenticate, authorize } from '@foodiego/shared-auth';
import { validate } from '../../middlewares/validate.middleware.js';
import * as supportController from './support.controller.js';

const router = Router();

// ─── Customer: create ticket ────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  body('issue_type').notEmpty().withMessage('issue_type is required'),
  body('description').notEmpty().withMessage('description is required'),
  validate,
  supportController.createTicketHandler,
);

// ─── Admin: read & manage tickets ───────────────────────────────────────────
router.get(
  '/',
  authenticate,
  authorize('admin'),
  query('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED']),
  query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  supportController.getAllTicketsHandler,
);

router.get('/stats', authenticate, authorize('admin'), supportController.getTicketStatsHandler);

router.get(
  '/:id',
  authenticate,
  authorize('admin'),
  param('id').notEmpty(),
  validate,
  supportController.getTicketByIdHandler,
);

router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  param('id').notEmpty(),
  body('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('assigned_admin').optional(),
  body('internal_notes').optional().isString(),
  validate,
  supportController.updateTicketHandler,
);

export default router;
