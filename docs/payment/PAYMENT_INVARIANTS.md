# Payment Aggregate: Domain Invariants

This document captures the **inviolable invariants** of the Payment Aggregate.
These invariants exist at the domain level — independent of any implementation.
Every implementation (service, repository, worker) must enforce and preserve them.

> [!IMPORTANT]
> These invariants are the source of truth. If code contradicts an invariant, the code is wrong — not the invariant.

---

## 1. State Invariants

| # | Invariant |
|---|-----------|
| I-1 | A payment aggregate has exactly one status at any point in time. |
| I-2 | `FAILED` is a terminal state. No transition out of `FAILED` is permitted. |
| I-3 | `REFUNDED` is a terminal state. No transition out of `REFUNDED` is permitted. |
| I-4 | `EXPIRED` is a terminal state. No transition out of `EXPIRED` is permitted. |
| I-5 | Authorization (`PENDING → AUTHORIZED`) can occur at most once. |
| I-6 | Capture (`AUTHORIZED → CAPTURED`) can occur at most once. |
| I-7 | Refund (`AUTHORIZED/CAPTURED/REFUND_PENDING → REFUNDED`) can occur at most once. |
| I-8 | A refund may only occur after a successful authorization (`AUTHORIZED` or `CAPTURED`). |
| I-9 | A payment may only enter `REFUND_PENDING` if `is_refund_requested = false` at the time of the atomic ownership acquisition. |
| I-10 | Once `is_refund_requested = true`, no other process may initiate a refund for the same payment. |

---

## 2. Event Emission Invariants

| # | Invariant |
|---|-----------|
| E-1 | `PaymentAuthorized` is emitted **at most once** per payment aggregate lifetime. |
| E-2 | `PaymentFailed` is emitted **at most once** per payment aggregate lifetime. |
| E-3 | `PaymentRefunded` is emitted **at most once** per payment aggregate lifetime. |
| E-4 | Every emitted integration event corresponds to exactly one **committed** aggregate state transition. If the transaction rolls back, no event is emitted. |
| E-5 | If `PaymentRefunded` is emitted, then `is_refund_requested = true` and `status = 'REFUNDED'` are both persisted in the same transaction. |

---

## 3. Gateway Sequence Invariants

| # | Invariant |
|---|-----------|
| G-1 | `gateway_sequence` is monotonically non-decreasing. A webhook with a lower or equal sequence number than the stored value is dropped. |
| G-2 | A higher `gateway_sequence` alone does not authorize a state transition. The transition must also be valid per the state machine (see `PAYMENT_STATE_MACHINE.md`). |
| G-3 | `gateway_sequence` is stored atomically in the same `UPDATE ... RETURNING` that transitions the state. |

---

## 4. Idempotency Invariants

| # | Invariant |
|---|-----------|
| P-1 | **Technical idempotency**: A webhook `event_id` can be inserted into the Inbox at most once (`ON CONFLICT DO NOTHING`). |
| P-2 | **Business idempotency**: If the payment is already in a terminal state (`AUTHORIZED`, `CAPTURED`, `FAILED`, `REFUNDED`), no state transition occurs regardless of the incoming webhook content. |
| P-3 | The `idempotency_key` for gateway calls is derived deterministically from `payment_id`, ensuring the gateway de-duplicates requests independently of the Inbox. |

---

## 5. Atomicity Invariants

| # | Invariant |
|---|-----------|
| A-1 | Aggregate state persistence, Outbox event insertion, and marking the Inbox event as `PROCESSED` occur within a single database transaction. |
| A-2 | The HTTP gateway call occurs **outside** any database transaction to prevent long-held locks. |
| A-3 | `tryLockForRefund` is implemented as an **atomic ownership acquisition** (`UPDATE ... WHERE is_refund_requested = false RETURNING *`), not a pessimistic row lock. The database transaction commits before the HTTP gateway call. Safety relies on the `is_refund_requested = true` flag, not an open lock. |

---

## 6. Reconciliation Invariants

| # | Invariant |
|---|-----------|
| R-1 | The reconciliation worker only processes payments where `next_retry_at <= NOW()` (or `IS NULL`) and `manual_review_required = false`. |
| R-2 | Each reconciliation attempt increments `reconciliation_attempts` atomically. |
| R-3 | When the gateway returns `PENDING`, the worker schedules the next retry using exponential backoff: `next_retry_at = NOW() + min(5 * 2^(attempt-1), 60) minutes`. |
| R-4 | When `reconciliation_attempts >= 6` or `age > 2 hours`, the payment is escalated: `manual_review_required = true`, a structured log at ERROR level is emitted, and a `payment_reconciliation_failed_total` metric is incremented. |
| R-5 | Upon successful reconciliation, `reconciliation_attempts` resets to 0 and `next_retry_at` is set to NULL. |
