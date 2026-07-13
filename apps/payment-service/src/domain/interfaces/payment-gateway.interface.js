/**
 * @interface IPaymentGateway
 * Abstract interface for Payment Gateway adapters (Stripe, VNPay, Mock, etc.).
 */
export class IPaymentGateway {
  /**
   * @param {Object} params
   * @param {string} params.paymentId
   * @param {number} params.amount
   * @param {string} params.currency
   * @param {string} params.paymentMethod
   * @param {string} params.idempotencyKey
   * @returns {Promise<{ status: string, gatewayTxId: string, errorReason?: string }>}
   */
  async authorize(params) { throw new Error('Not implemented'); }

  /**
   * @param {Object} params
   * @param {string} params.paymentId
   * @param {string} params.gatewayTxId
   * @param {number} params.amount
   * @returns {Promise<{ status: string, errorReason?: string }>}
   */
  async capture(params) { throw new Error('Not implemented'); }

  /**
   * @param {Object} params
   * @param {string} params.paymentId
   * @param {string} params.gatewayTxId
   * @param {number} params.amount
   * @param {string} params.idempotencyKey
   * @returns {Promise<{ status: string, errorReason?: string }>}
   */
  async refund(params) { throw new Error('Not implemented'); }

  /**
   * @param {Object} params
   * @param {string} params.paymentId
   * @param {string} params.gatewayTxId
   * @returns {Promise<{ status: string, gatewayTxId: string, errorReason?: string }>}
   */
  async getPayment(params) { throw new Error('Not implemented'); }
}
