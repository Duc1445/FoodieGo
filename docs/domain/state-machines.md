# State Machines

Visual state diagrams for core entities. All state transitions must be strictly validated.

## Order State Machine
```mermaid
stateDiagram-v2
    [*] --> CREATED: Checkout
    CREATED --> PENDING_PAYMENT: Inventory Reserved
    PENDING_PAYMENT --> PAID: Payment Authorized
    PAID --> ACCEPTED: Merchant Accepts
    ACCEPTED --> PREPARING: Kitchen Starts
    PREPARING --> READY: Kitchen Finishes
    READY --> ASSIGNED: Driver Found
    ASSIGNED --> PICKED_UP: Driver Collects
    PICKED_UP --> DELIVERING: En Route
    DELIVERING --> DELIVERED: Handed to Customer
    DELIVERED --> COMPLETED: Customer Confirms
    
    CREATED --> CANCELLED: Inventory/Payment Fails
    PAID --> CANCELLED: Merchant Rejects
    CANCELLED --> [*]
    COMPLETED --> [*]
```

## Payment State Machine
```mermaid
stateDiagram-v2
    [*] --> PENDING: Order Created
    PENDING --> AUTHORIZED: Webhook Success
    PENDING --> FAILED: Webhook Failure / Insufficient Funds
    AUTHORIZED --> CAPTURED: Delivery Complete
    AUTHORIZED --> REFUNDING: Order Cancelled
    REFUNDING --> REFUNDED: Refund Success
    REFUNDING --> REFUND_FAILED: API Error
```

## Delivery Lifecycle (Driver Service)
```mermaid
stateDiagram-v2
    [*] --> WAITING: Order Ready
    WAITING --> ASSIGNED: Dispatcher matches
    ASSIGNED --> ACCEPTED: Driver Accepts
    ASSIGNED --> WAITING: Driver Rejects/Timeout
    ACCEPTED --> AT_MERCHANT: Driver Arrives
    AT_MERCHANT --> PICKED_UP: Driver Collects
    PICKED_UP --> DELIVERING: En Route
    DELIVERING --> DELIVERED: Handed to Customer
```

## Driver Status
```mermaid
stateDiagram-v2
    [*] --> OFFLINE
    OFFLINE --> ONLINE: Clock In
    ONLINE --> BUSY: Accepts Job
    BUSY --> ONLINE: Completes Job
    ONLINE --> OFFLINE: Clock Out
```
