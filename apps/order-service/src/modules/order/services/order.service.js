import { OrderRepository } from '../repositories/order.repository.js';
import { NotFoundError, AuthorizationError, ValidationError } from '@foodiego/core';
import { OrderStateMachine, OrderStatus } from '../../checkout/state/order.state.js';
import * as deliveryRepository from '../../delivery/repositories/delivery.repository.js';
import { CheckoutRepository } from '../../checkout/repositories/checkout.repository.js';

const orderRepository = new OrderRepository();
const checkoutRepo = new CheckoutRepository();

function extractTraceMetadata(event) {
  return {
    traceId: event.payload?.traceId,
    correlationId: event.metadata?.correlationId || event.metadata?.correlation_id || event.eventId,
    causationId: event.eventId,
  };
}

export class OrderService {
  async getUserOrders(userId) {
    return await orderRepository.findOrdersByUserId(userId);
  }

  async getMerchantOrders(restaurantId) {
    return await orderRepository.findOrdersByRestaurantId(restaurantId);
  }

  async getMerchantStats(restaurantId) {
    return await orderRepository.getMerchantStats(restaurantId);
  }

  async getOrderDetail(orderId, userId) {
    const order = await orderRepository.findOrderDetailById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Customer data isolation (skip if userId is null, for internal access)
    if (userId !== null && order.userId !== userId) {
      throw new AuthorizationError('Access denied to this order');
    }

    return order;
  }

  async changeOrderStatus(orderId, newStatus, context = {}, outboxEvent = null, trx = null) {
    const {
      role = 'system',
      actorId = null,
      actionType = null,
      ipAddress = null,
      userAgent = null,
      note = null,
    } = context;

    if (role !== 'system' && role !== 'merchant' && role !== 'admin' && role !== 'driver') {
      throw new AuthorizationError('Only merchants, drivers, and admins can update order status');
    }

    const order = await orderRepository.findOrderDetailById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (role === 'merchant') {
      const allowedMerchantStates = [
        OrderStatus.PENDING,
        OrderStatus.MERCHANT_ACCEPTED,
        OrderStatus.PREPARING,
        OrderStatus.READY_FOR_PICKUP,
        OrderStatus.CANCELLED,
      ];
      if (!allowedMerchantStates.includes(newStatus)) {
        throw new AuthorizationError(`Merchants cannot transition to ${newStatus}`);
      }
    }

    if (role === 'driver') {
      const allowedDriverStates = [
        OrderStatus.READY_FOR_PICKUP,
        OrderStatus.DRIVER_ACCEPTED,
        OrderStatus.PICKED_UP,
        OrderStatus.DELIVERING,
        OrderStatus.COMPLETED,
      ];
      if (!allowedDriverStates.includes(newStatus)) {
        throw new AuthorizationError(`Drivers cannot transition to ${newStatus}`);
      }
    }

    const stateMachine = new OrderStateMachine(order.status);

    try {
      stateMachine.transitionTo(newStatus);
    } catch (err) {
      throw new ValidationError(err.message);
    }

    // Persist status + optional outbox event atomically
    await checkoutRepo.updateOrderStatus(
      orderId,
      newStatus,
      order.status, // previousStatus
      actorId,
      role,
      actionType,
      outboxEvent,
      trx,
    );

    // Idempotent delivery creation: only when transitioning to READY_FOR_PICKUP.
    // Checks for existing delivery first so duplicate READY events are safe.
    if (newStatus === OrderStatus.READY_FOR_PICKUP) {
      const existingDelivery = await deliveryRepository.findByOrderId(orderId);
      if (!existingDelivery) {
        await deliveryRepository.create(orderId);
      }
    }

    return { id: orderId, status: newStatus };
  }

  // --- SAGA CONSUMERS ---

  async processInventoryReserved(event, trx) {
    const orderId = event.payload.orderId;
    const order = await orderRepository.findByIdForUpdate(trx, orderId);

    if (!order) throw new NotFoundError('Order not found');

    // Business Idempotency: Ignore if already at target state or further
    if (
      order.status === OrderStatus.RESERVED ||
      order.status === OrderStatus.READY_FOR_PAYMENT ||
      order.status === OrderStatus.CONFIRMED
    ) {
      return;
    }

    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.FAILED) {
      // Late arrival on a cancelled/failed order. Compensate immediately.
      const metadata = extractTraceMetadata(event);
      await this._emitReleaseInventory(trx, orderId, 'LATE_ARRIVAL_ON_CANCELLED', metadata);
      return;
    }

    // Mutate state atomically (uses StateMachine internally to guard transitions)
    await this.changeOrderStatus(
      orderId,
      OrderStatus.RESERVED,
      { role: 'system', actionType: 'SAGA_SUCCESS' },
      null,
      trx,
    );

    // In a full saga, we would emit PaymentRequested here
    // For now, since payment isn't fully separated, we just stay at RESERVED
  }

  async processFailure(event, trx, type) {
    const orderId = event.payload.orderId;
    const order = await orderRepository.findByIdForUpdate(trx, orderId);

    if (!order) throw new NotFoundError('Order not found');

    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.FAILED) {
      return; // Business Idempotency: Already failed/cancelled
    }

    const metadata = extractTraceMetadata(event);

    if (type === 'InventoryFailed') {
      // Advance to FAILED
      // We pass the OrderFailed outbox event to changeOrderStatus to be atomic!
      await this.changeOrderStatus(
        orderId,
        OrderStatus.FAILED,
        { role: 'system', actionType: 'SAGA_FAILURE' },
        {
          eventType: 'OrderFailed',
          payload: { orderId, reason: event.payload.reason },
          correlationId: metadata.correlationId,
          traceId: metadata.traceId,
        },
        trx,
      );
      return;
    }

    // Default cancellation for other types
    await this.changeOrderStatus(
      orderId,
      OrderStatus.CANCELLED,
      { role: 'system', actionType: 'SAGA_FAILURE' },
      {
        eventType: 'OrderCancelled',
        payload: { orderId, reason: type || 'Unknown failure' },
        correlationId: metadata.correlationId,
        traceId: metadata.traceId,
      },
      trx,
    );

    // Emit compensations for completed branches if needed
    if (order.status === OrderStatus.RESERVED || order.status === OrderStatus.CONFIRMED) {
      await this._emitReleaseInventory(trx, orderId, event.payload.reason, metadata);
    }
  }

  // --- INTERNAL EMITTERS ---

  async _emitOrderConfirmed(trx, orderId, metadata) {
    await this._insertOutbox(trx, 'OrderConfirmed', { orderId }, metadata);
  }

  async _emitReleaseInventory(trx, orderId, reason, metadata) {
    await this._insertOutbox(trx, 'ReleaseInventoryCommand', { orderId, reason }, metadata);
  }

  async _emitRefundPayment(trx, orderId, reason, metadata) {
    await this._insertOutbox(trx, 'RefundPaymentCommand', { orderId, reason }, metadata);
  }

  async _emitOrderCancelled(trx, orderId, reason, metadata) {
    await this._insertOutbox(trx, 'OrderCancelled', { orderId, reason }, metadata);
  }

  async _insertOutbox(trx, eventType, payload, metadata) {
    const { context, propagation } = await import('@opentelemetry/api');
    const traceHeaders = {};
    propagation.inject(context.active(), traceHeaders);

    await trx.query(
      `
      INSERT INTO outbox_events (
        event_type, event_version, aggregate_type, aggregate_id, payload, metadata, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
    `,
      [
        eventType,
        1,
        'Order',
        payload.orderId,
        JSON.stringify({ ...payload, traceId: metadata.traceId }),
        JSON.stringify({
          ...traceHeaders,
          traceId: metadata.traceId,
          correlationId: metadata.correlationId,
          causationId: metadata.causationId,
        }),
      ],
    );
  }
}
