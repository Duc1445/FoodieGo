import { Router } from 'express';
import express from 'express';
import { WebhookController } from './webhook.controller.js';

export function setupWebhookRoutes(repository, webhookSecret) {
  const router = Router();
  const webhookController = new WebhookController(repository, webhookSecret);

  // We need the raw body for HMAC signature verification
  // We use express.raw to get exactly what was sent over the wire.
  router.post(
    '/payment',
    express.raw({ type: 'application/json' }),
    webhookController.handlePaymentWebhook.bind(webhookController),
  );

  return router;
}
