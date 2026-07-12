import { PaymentDomainService } from '../src/domain/payment.service.js';
import { PaymentStatus } from '../src/domain/payment.state.js';
import { jest } from '@jest/globals';

describe('PaymentDomainService', () => {
  let paymentService;
  let mockRepository;
  let mockGatewayRegistry;
  let mockGateway;

  beforeEach(() => {
    mockRepository = {
      createPayment: jest.fn(),
      getPaymentById: jest.fn(),
      getPaymentByOrderId: jest.fn(),
      updatePaymentStatus: jest.fn(),
      updatePaymentAfterWebhook: jest.fn(),
    };

    mockGateway = {
      authorize: jest.fn(),
      capture: jest.fn(),
      refund: jest.fn(),
    };

    mockGatewayRegistry = {
      resolve: jest.fn().mockReturnValue(mockGateway),
    };

    paymentService = new PaymentDomainService(mockRepository, mockGatewayRegistry);
  });

  describe('refundPayment', () => {
    it('should resolve gateway based on gateway_provider and process refund successfully', async () => {
      const orderId = 'test-order-id';
      const reason = 'Customer requested refund';
      const traceId = 'test-trace-id';

      mockRepository.getPaymentByOrderId.mockResolvedValue({
        id: 'test-payment-id',
        order_id: orderId,
        gateway_provider: 'vnpay',
        gateway_tx_id: 'vnpay_123',
        status: PaymentStatus.CAPTURED,
        amount: 100,
        idempotency_key: 'orig-idemp-key',
      });

      mockGateway.refund.mockResolvedValue({ status: 'REFUNDED' });

      await paymentService.refundPayment(orderId, reason, traceId);

      expect(mockGatewayRegistry.resolve).toHaveBeenCalledWith('vnpay');
      expect(mockGateway.refund).toHaveBeenCalledWith({
        paymentId: 'test-payment-id',
        gatewayTxId: 'vnpay_123',
        amount: 100,
        idempotencyKey: 'test-payment-id_Customer requested refund_v1',
      });
      expect(mockRepository.updatePaymentAfterWebhook).toHaveBeenCalled();
    });

    it('should default to mock gateway if gateway_provider is missing', async () => {
      const orderId = 'test-order-id';

      mockRepository.getPaymentByOrderId.mockResolvedValue({
        id: 'test-payment-id',
        order_id: orderId,
        gateway_tx_id: 'unknown_123',
        status: PaymentStatus.CAPTURED,
        amount: 100,
        idempotency_key: 'orig-idemp-key',
      });

      mockGateway.refund.mockResolvedValue({ status: 'REFUNDED' });

      await paymentService.refundPayment(orderId, 'test', 'trace-id');

      expect(mockGatewayRegistry.resolve).toHaveBeenCalledWith('mock');
    });

    it('should not process refund if payment is already refunded', async () => {
      mockRepository.getPaymentByOrderId.mockResolvedValue({
        id: 'test-payment-id',
        order_id: 'test-order-id',
        status: PaymentStatus.REFUNDED,
      });

      await paymentService.refundPayment('test-order-id', 'test', 'trace-id');

      expect(mockGateway.refund).not.toHaveBeenCalled();
    });
  });
});
