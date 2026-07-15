export const PaymentMapper = {
  toDb: (json) => [
    json.id,
    json.order_id,
    json.amount,
    json.currency || 'VND',
    json.method,
    json.status,
    json.idempotency_key,
    json.created_at,
  ],
};
