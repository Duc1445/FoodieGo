# Domain Event Catalog

This is the central registry of all RabbitMQ events.

## Format
*   **Topic Exchange:** `foodiego.events`
*   **Routing Key:** `[domain].[entity].[action]`

## Event Registry

### Order Events
| Routing Key | Producer | Payload | Consumers | Description |
| :--- | :--- | :--- | :--- | :--- |
| `order.created` | `order-service` | `orderId`, `items`, `total`, `merchantId` | Payment, Inventory | Triggers Saga. |
| `order.cancelled` | `order-service` | `orderId`, `reason` | Payment, Inventory | Triggers Refund and Restock. |
| `order.preparing` | `order-service` | `orderId`, `merchantId` | Notification | Merchant accepted. |
| `order.ready` | `order-service` | `orderId`, `merchantId` | Driver | Ready for pickup. |

### Inventory Events
| Routing Key | Producer | Payload | Consumers | Description |
| :--- | :--- | :--- | :--- | :--- |
| `inventory.reserved` | `inventory-service` | `orderId`, `status: SUCCESS` | Order | Saga step success. |
| `inventory.failed` | `inventory-service` | `orderId`, `reason` | Order | Saga step failure. |

### Payment Events
| Routing Key | Producer | Payload | Consumers | Description |
| :--- | :--- | :--- | :--- | :--- |
| `payment.authorized` | `payment-service` | `orderId`, `transactionId` | Order | Saga step success. |
| `payment.failed` | `payment-service` | `orderId`, `reason` | Order | Saga step failure. |
| `payment.refunded` | `payment-service` | `orderId`, `amount` | Order | Compensation success. |

### Driver Events (Sprint 4)
| Routing Key | Producer | Payload | Consumers | Description |
| :--- | :--- | :--- | :--- | :--- |
| `driver.assigned` | `driver-service` | `orderId`, `driverId` | Order, Notification | |
| `driver.arrived` | `driver-service` | `orderId`, `driverId` | Order, Notification | |
| `driver.picked_up`| `driver-service` | `orderId`, `driverId` | Order, Notification | |
| `driver.delivered`| `driver-service` | `orderId`, `driverId` | Order, Notification | |
