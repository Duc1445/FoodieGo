import { PaymentDomainService } from '../src/domain/payment.service.js';
import { PaymentStatus } from '../src/domain/payment.state.js';
import { jest } from '@jest/globals';
import pool from '../src/config/database.js';

describe('PaymentDomainService', () => {
  let paymentService;
  let mockRepository;
  let mockGatewayRegistry;
  let mockGateway;
  let mockClient;

  beforeEach(() => {
    // Mock DB transaction client
    mockClient = {
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      release: jest.fn(),
    };
    jest.spyOn(pool, 'connect').mockResolvedValue(mockClient);

    mockGateway = {
      authorize: jest.fn(),
      capture: jest.fn(),
      refund: jest.fn(),
    };

    mockGatewayRegistry = {
      resolve: jest.fn().mockReturnValue(mockGateway),
    };

    // Repository mock including PR-004 methods
    mockRepository = {
      createPayment: jest.fn(),
      getPaymentById: jest.fn(),
      getPaymentByOrderId: jest.fn(),
      updatePaymentStatus: jest.fn(),
      updatePaymentAfterWebhook: jest.fn(),
      tryLockForRefund: jest.fn().mockResolvedValue({
        id: 'test-payment-id',
        order_id: 'test-order-id',
        gateway_provider: 'vnpay',
        gateway_tx_id: 'vnpay_123',
        status: PaymentStatus.CAPTURED,
        amount: '100.00',
        idempotency_key: 'orig-idemp-key',
        is_refund_requested: true,
      }),
      tryTransitionStatus: jest.fn().mockResolvedValue({ id: 'test-payment-id', status: 'REFUNDED' }),
      _insertOutboxEvent: jest.fn().mockResolvedValue(undefined),
    };

    paymentService = new PaymentDomainService(mockRepository, mockGatewayRegistry);
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
        status: PaymentStatus.AUTHORIZED,
        amount: '100.00',
        idempotency_key: 'orig-idemp-key',
        is_refund_requested: false,
      });
      mockGateway.refund.mockResolvedValue({ status: 'REFUNDED' });
      mockRepository.tryTransitionStatus
        .mockResolvedValueOnce({ id: 'test-payment-id', status: 'REFUND_PENDING' }) // markRefundPending
        .mockResolvedValueOnce({ id: 'test-payment-id', status: 'REFUNDED' });      // refund complete

      await paymentService.refundPayment(orderId, reason, traceId);

      expect(mockGatewayRegistry.resolve).toHaveBeenCalledWith('vnpay');
      expect(mockGateway.refund).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentId: 'test-payment-id',
          gatewayTxId: 'vnpay_123',
        })
      );
      expect(mockRepository.tryLockForRefund).toHaveBeenCalled();
    });

    it('should default to mock gateway if gateway_provider is missing', async () => {
      const orderId = 'test-order-id';

      const payment = {
        id: 'test-payment-id',
        order_id: orderId,
        gateway_tx_id: 'unknown_123',
        gateway_provider: null,
        status: PaymentStatus.AUTHORIZED,
        amount: '100.00',
        idempotency_key: 'orig-idemp-key',
        is_refund_requested: false,
      };
      mockRepository.getPaymentByOrderId.mockResolvedValue(payment);
      mockRepository.tryLockForRefund.mockResolvedValue({ ...payment, is_refund_requested: true });
      mockGateway.refund.mockResolvedValue({ status: 'REFUNDED' });
      mockRepository.tryTransitionStatus.mockResolvedValue({ id: 'test-payment-id', status: 'REFUNDED' });

      await paymentService.refundPayment(orderId, 'test', 'trace-id');

      expect(mockGatewayRegistry.resolve).toHaveBeenCalledWith('mock');
    });

    it('should not process refund if atomic ownership acquisition fails (already refunded)', async () => {
      // tryLockForRefund returns null when is_refund_requested is already true
      mockRepository.tryLockForRefund.mockResolvedValue(null);

      await paymentService.refundPayment('test-order-id', 'test', 'trace-id');

      expect(mockGateway.refund).not.toHaveBeenCalled();
    });
  });
});
