# Payment State Machine: Webhook Transition Matrix

This document defines the **complete validation rules** for incoming gateway webhooks.
A state transition is only permitted when **both** the sequence check **and** the state transition check pass.

> [!IMPORTANT]
> `gateway_sequence` alone does not authorize a transition. The current state must also allow it.
> A webhook with a newer sequence that tries to transition from a terminal state is still **rejected**.

---

## State Transition Diagram

```
PENDING
  │
  ├──[AUTHORIZED]──► AUTHORIZED ──[CAPTURED]──► CAPTURED
  │                      │                           │
  │                      └──[REFUND_PENDING]──► REFUND_PENDING ──[REFUNDED]──► REFUNDED ✓
  │
  ├──[FAILED]──► FAILED ✓
  │
  └──[UNKNOWN] (gateway did not respond within timeout)
       │
       └──[Reconciliation]──► AUTHORIZED | FAILED | REFUNDED
```

---

## Webhook Transition Matrix

| Current Status   | Incoming Gateway Status | Sequence Check Passes | Allowed? | Result           | Reason                                                  |
|------------------|-------------------------|-----------------------|----------|------------------|---------------------------------------------------------|
| `PENDING`        | `AUTHORIZED`            | ✅ Yes                 | ✅ YES    | → `AUTHORIZED`   | Normal authorization flow                               |
| `PENDING`        | `AUTHORIZED`            | ❌ No (stale seq)      | ❌ NO     | Dropped          | Sequence guard: `G-1`                                   |
| `PENDING`        | `FAILED`                | ✅ Yes                 | ✅ YES    | → `FAILED`       | Payment declined by gateway                             |
| `PENDING`        | `REFUNDED`              | ✅ Yes                 | ❌ NO     | Dropped          | Cannot refund before authorization; violates `I-8`      |
| `AUTHORIZED`     | `AUTHORIZED`            | ✅ Yes                 | ❌ NO     | Dropped          | Already authorized; `I-5`: at most one authorization    |
| `AUTHORIZED`     | `CAPTURED`              | ✅ Yes                 | ✅ YES    | → `CAPTURED`     | Normal capture flow                                     |
| `AUTHORIZED`     | `FAILED`                | ✅ Yes                 | ❌ NO     | Dropped          | Cannot fail after authorization (gateway reordering)    |
| `AUTHORIZED`     | `REFUNDED`              | ✅ Yes                 | ✅ YES    | → `REFUNDED`     | Direct refund without explicit capture (e.g. Stripe)    |
| `CAPTURED`       | `AUTHORIZED`            | ✅ Yes                 | ❌ NO     | Dropped          | AUTHORIZED < CAPTURED; state machine forbids regression |
| `CAPTURED`       | `REFUNDED`              | ✅ Yes                 | ✅ YES    | → `REFUNDED`     | Normal refund after capture                             |
| `REFUND_PENDING` | `REFUNDED`              | ✅ Yes                 | ✅ YES    | → `REFUNDED`     | Reconciliation confirms refund                          |
| `REFUND_PENDING` | `AUTHORIZED`            | ✅ Yes                 | ❌ NO     | Dropped          | Cannot re-authorize after refund was requested          |
| `REFUND_PENDING` | `PENDING`               | ✅ Yes                 | ❌ NO     | Dropped (backoff) | Gateway processing; reconciliation schedules retry     |
| `FAILED`         | *any*                   | Any                   | ❌ NO     | Dropped          | `FAILED` is terminal; violates `I-2`                    |
| `REFUNDED`       | *any*                   | Any                   | ❌ NO     | Dropped          | `REFUNDED` is terminal; violates `I-3`                  |
| `EXPIRED`        | *any*                   | Any                   | ❌ NO     | Dropped          | `EXPIRED` is terminal; violates `I-4`                   |
| `UNKNOWN`        | `AUTHORIZED`            | ✅ Yes                 | ✅ YES    | → `AUTHORIZED`   | Reconciliation path only                                |
| `UNKNOWN`        | `FAILED`                | ✅ Yes                 | ✅ YES    | → `FAILED`       | Reconciliation path only                                |
| `UNKNOWN`        | `REFUNDED`              | ✅ Yes                 | ✅ YES    | → `REFUNDED`     | Reconciliation path only                                |
| `UNKNOWN`        | `PENDING`               | ✅ Yes                 | ❌ NO     | Dropped (backoff) | Gateway still processing; exponential backoff applied  |

---

## Sequence Validation Rule

```
Incoming webhook is accepted if and only if:

  incoming_sequence > stored_gateway_sequence  (strictly greater)
  OR stored_gateway_sequence IS NULL           (first webhook for this payment)
```

This is enforced atomically in `tryTransitionStatus`:

```sql
UPDATE payments
SET status = $newStatus,
    gateway_sequence = $incomingSequence,
    ...
WHERE id = $paymentId
  AND status = ANY($expectedStatuses)
  AND (
    $incomingSequence IS NULL
    OR gateway_sequence IS NULL
    OR gateway_sequence < $incomingSequence
  )
RETURNING *
```

If `rowCount = 0`, the event is either stale (sequence guard) or the state transition is forbidden (state machine guard) — either way the event is dropped with no side effects.

---

## Handling Out-of-Order Delivery

Because the `UPDATE ... WHERE ... RETURNING` is atomic, even concurrent webhook deliveries are safe:

1. Thread A (seq=10) and Thread B (seq=9) arrive simultaneously.
2. Both `BEGIN` a transaction.
3. Thread A wins the `UPDATE` first (seq > null), commits, sets `gateway_sequence = 10`.
4. Thread B's `UPDATE` sees `gateway_sequence = 10 >= 9`, matches zero rows, commits with no change.
5. **Result**: exactly one state transition, exactly one Outbox event.
