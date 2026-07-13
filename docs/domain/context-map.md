# Context Map

This document outlines how the Bounded Contexts interact with each other.

## Architectural Styles
*   **Upstream/Downstream (U/D):** One context provides an API/events that the other consumes.
*   **Customer/Supplier (C/S):** Upstream teams cater to downstream needs.
*   **Conformist (CF):** Downstream rigidly adheres to the Upstream's model.
*   **Anti-Corruption Layer (ACL):** Downstream translates Upstream models to its own domain language.

## Relationships

| Upstream Context | Downstream Context | Relationship Type | Communication Method |
| :--- | :--- | :--- | :--- |
| **Identity** | All Others | Conformist | JWT Parsing via API Gateway / SDK |
| **Merchant** | Order | Customer/Supplier | Sync REST (Menu validation) |
| **Order** | Payment | Upstream/Downstream | Async Events (`OrderCreated`) |
| **Order** | Inventory | Upstream/Downstream | Async Events (`OrderCreated`) |
| **Payment** | Order | Upstream/Downstream | Async Events (`PaymentAuthorized`, `PaymentFailed`) |
| **Inventory** | Order | Upstream/Downstream | Async Events (`InventoryReserved`, `InventoryFailed`) |
| **Order** | Delivery/Driver | Upstream/Downstream | Async Events (`OrderReady`) |
| **Delivery/Driver** | Order | Upstream/Downstream | Async Events (`DriverAssigned`, `OrderDelivered`) |

## Dependency Rules
1. Core domains (Order, Merchant, Delivery) must NEVER depend synchronously on each other for writing data.
2. Reads spanning multiple contexts must be done via API Composition (GraphQL/Gateway) or CQRS views.
