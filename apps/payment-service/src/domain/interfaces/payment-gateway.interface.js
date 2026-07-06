/**
 * @interface IPaymentGateway
 * Abstract interface for Payment Gateway adapters (Stripe, PayPal, Mock, etc.).
 */
export class IPaymentGateway {
  /**
   * Initiates a payment process.
   * @param {Object} params
   * @param {string} params.paymentId
   * @param {number} params.amount
   * @param {string} params.currency
   * @param {string} params.paymentMethod
   * @param {string} params.idempotencyKey
   * @returns {Promise<{ gatewayTxId: string, status: string, authUrl?: string }>}
   */
  async processPayment(params) {
    throw new Error('Method not implemented.');
  }

  /**
   * Refonds a payment.
   * @param {Object} params
   * @param {string} params.gatewayTxId
   * @param {number} params.amount
   * @param {string} params.reason
   * @returns {Promise<{ status: string }>}
   */
  async refundPayment(params) {
    throw new Error('Method not implemented.');
  }
}
