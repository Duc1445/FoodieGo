import { CheckoutService } from '../services/checkout.service.js';
import { successResponse } from '@foodiego/core';

const checkoutService = new CheckoutService();

export class CheckoutController {
  async processCheckout(req, res, next) {
    try {
      const userId = req.user.id;
      const traceId = req.headers['x-trace-id'] || 'trace-mock';
      const payload = req.body;
      
      // Basic idempotency key extraction from header or body
      const idempotencyKey = req.headers['idempotency-key'] || payload.idempotencyKey;
      if (!idempotencyKey) {
        return res.status(400).json({ success: false, message: 'Idempotency-Key header is required' });
      }
      
      payload.idempotencyKey = idempotencyKey;

      const result = await checkoutService.processCheckout(userId, payload, traceId);
      return successResponse(res, result, 'Order checkout processed successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}
